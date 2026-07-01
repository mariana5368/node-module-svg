#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import { basename } from "node:path";
import {
  getMetadata,
  normalizeSvg,
  sanitizeSvg,
  minifySvg,
  setColor,
  prefixIds,
  toDataUri
} from "../src/index.mjs";

const USAGE = `
svgcraft - zero-dependency SVG toolkit

Usage:
  svgcraft <input.svg> [options]

Options:
  --inspect                 Print SVG metadata as JSON
  --sanitize                Remove scripts, event handlers, javascript links, comments
  --minify                  Remove comments and collapse whitespace
  --fill <color>            Replace fill attributes, preserving fill="none" and url(#id)
  --stroke <color>          Replace stroke attributes, preserving stroke="none" and url(#id)
  --prefix <name>           Prefix IDs and matching references
  --title <text>            Add or replace the SVG <title>
  --data-uri                Print a compact data:image/svg+xml URI
  --out <file>              Write transformed SVG to a file
  -h, --help                Show help

Examples:
  svgcraft logo.svg --inspect
  svgcraft logo.svg --sanitize --minify --out logo.clean.svg
  svgcraft icon.svg --fill "#111827" --prefix brand --out icon.ready.svg
`;

function readArgs(argv) {
  const args = { input: null, flags: {} };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];

    if (token === "-h" || token === "--help") {
      args.flags.help = true;
      continue;
    }

    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      const valueFlags = new Set(["fill", "stroke", "prefix", "title", "out"]);

      if (valueFlags.has(key)) {
        if (!next || next.startsWith("--")) {
          throw new Error(`Missing value for --${key}.`);
        }
        args.flags[key] = next;
        i += 1;
      } else {
        args.flags[key] = true;
      }
      continue;
    }

    if (!args.input) {
      args.input = token;
      continue;
    }

    throw new Error(`Unexpected argument: ${token}`);
  }

  return args;
}

function main() {
  const args = readArgs(process.argv.slice(2));

  if (args.flags.help || !args.input) {
    console.log(USAGE.trim());
    return;
  }

  const inputName = basename(args.input);
  let svg = readFileSync(args.input, "utf8");

  if (args.flags.inspect) {
    console.log(JSON.stringify(getMetadata(svg), null, 2));
    return;
  }

  if (args.flags.sanitize) svg = sanitizeSvg(svg);
  if (args.flags.title || args.flags.fill || args.flags.stroke || args.flags.prefix) {
    svg = normalizeSvg(svg, {
      sanitize: false,
      minify: false,
      title: args.flags.title,
      fill: args.flags.fill,
      stroke: args.flags.stroke,
      prefix: args.flags.prefix
    });
  }
  if (args.flags.minify) svg = minifySvg(svg);

  if (args.flags["data-uri"]) {
    console.log(toDataUri(svg));
    return;
  }

  if (args.flags.out) {
    writeFileSync(args.flags.out, svg, "utf8");
    console.log(`Wrote ${args.flags.out} from ${inputName}`);
    return;
  }

  process.stdout.write(svg);
}

try {
  main();
} catch (error) {
  console.error(`svgcraft error: ${error.message}`);
  process.exitCode = 1;
}
