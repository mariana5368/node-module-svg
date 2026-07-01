import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isSvg,
  getMetadata,
  listElements,
  extractIds,
  sanitizeSvg,
  minifySvg,
  setColor,
  prefixIds,
  toDataUri,
  fromDataUri,
  normalizeSvg,
  createSvg
} from "../src/index.mjs";

const sample = readFileSync(new URL("../examples/sample.svg", import.meta.url), "utf8");

assert.equal(isSvg(sample), true);

const metadata = getMetadata(sample);
assert.equal(metadata.width, "120");
assert.equal(metadata.height, "80");
assert.equal(metadata.viewBox, "0 0 120 80");
assert.ok(metadata.elementTypes.includes("svg"));
assert.ok(listElements(sample).includes("path"));

assert.deepEqual(extractIds(sample).sort(), ["accent", "bg", "dot", "mark"].sort());

const unsafe = `<svg><script>alert(1)</script><rect onclick="x()" href="javascript:bad()" /></svg>`;
const sanitized = sanitizeSvg(unsafe);
assert.equal(sanitized.includes("script"), false);
assert.equal(sanitized.includes("onclick"), false);
assert.equal(sanitized.includes("javascript:"), false);

const minified = minifySvg(sample);
assert.equal(minified.includes("\n"), false);
assert.equal(minified.includes("<!--"), false);

const colored = setColor(sample, "#000000", { attributes: ["fill"] });
assert.equal(colored.includes('fill="#000000"'), true);
assert.equal(colored.includes('fill="url(#accent)"'), true);

const prefixed = prefixIds(sample, "brand");
assert.equal(prefixed.includes('id="brand-accent"'), true);
assert.equal(prefixed.includes('url(#brand-accent)'), true);

const uri = toDataUri(sample);
assert.equal(uri.startsWith("data:image/svg+xml,"), true);
assert.equal(isSvg(fromDataUri(uri)), true);

const normalized = normalizeSvg(sample, { title: "Clean Icon", prefix: "x", fill: "#111827" });
assert.equal(normalized.includes("Clean Icon"), true);
assert.equal(normalized.includes('id="x-accent"'), true);

const made = createSvg('<circle cx="12" cy="12" r="8" />');
assert.equal(isSvg(made), true);

console.log("All svgcraft-core tests passed.");
