import { readFileSync, writeFileSync } from "node:fs";
import { getMetadata, normalizeSvg } from "../src/index.mjs";

const svg = readFileSync(new URL("./sample.svg", import.meta.url), "utf8");

console.log(getMetadata(svg));

const ready = normalizeSvg(svg, {
  title: "Production SVG",
  prefix: "asset",
  fill: "#111827"
});

writeFileSync(new URL("./sample.ready.svg", import.meta.url), ready, "utf8");
