# svgcraft-core

Professional zero-dependency SVG utilities for Node.js.

`svgcraft-core` is a small npm-ready package for common SVG cleanup and transformation work. It is designed for lightweight build scripts, icon pipelines, dashboards, and internal tooling where you do not want a large dependency tree.

## Features

- Validate SVG strings
- Read root SVG attributes
- Extract width, height, viewBox, element types, and IDs
- Remove comments, scripts, event handlers, `javascript:` links, and `foreignObject`
- Minify SVG strings with safe whitespace cleanup
- Replace fill or stroke colors
- Prefix IDs and `url(#id)` references
- Add or replace `<title>`
- Convert SVG to and from data URI format
- Use as ESM, CommonJS, or CLI
- Zero dependencies

## Install

```bash
npm i svgcraft-core
```

For local development from this folder:

```bash
npm install
npm test
```

## ESM Usage

```js
import {
  getMetadata,
  normalizeSvg,
  toDataUri
} from "svgcraft-core";

const svg = `
<svg width="120" height="80" viewBox="0 0 120 80">
  <rect id="bg" width="120" height="80" fill="red" />
</svg>
`;

console.log(getMetadata(svg));

const cleanSvg = normalizeSvg(svg, {
  title: "Brand Icon",
  prefix: "brand",
  fill: "#111827"
});

console.log(toDataUri(cleanSvg));
```

## CommonJS Usage

```js
const { sanitizeSvg, minifySvg } = require("svgcraft-core");

const clean = minifySvg(sanitizeSvg(svg));
console.log(clean);
```

## CLI Usage

```bash
svgcraft logo.svg --inspect
svgcraft logo.svg --sanitize --minify --out logo.clean.svg
svgcraft icon.svg --fill "#111827" --prefix app --out icon.ready.svg
svgcraft icon.svg --data-uri
```

## API

### `isSvg(input)`

Returns `true` when the input is a valid SVG string containing `<svg>...</svg>`.

### `getMetadata(svg)`

Returns width, height, viewBox, xmlns, title/description state, element types, and length.

### `sanitizeSvg(svg, options)`

Removes unsafe or noisy SVG content. Default behavior removes comments, scripts, event handlers, `javascript:` links, and `foreignObject`.

```js
sanitizeSvg(svg, {
  removeComments: true,
  removeScripts: true,
  removeForeignObject: true,
  removeEventHandlers: true,
  removeJavascriptLinks: true
});
```

### `minifySvg(svg, options)`

Removes comments and collapses safe whitespace.

### `setColor(svg, color, options)`

Replaces color attributes. By default it updates `fill` and preserves `fill="none"` and `fill="url(#id)"`.

```js
setColor(svg, "#000", {
  attributes: ["fill", "stroke"],
  preserveNone: true,
  preserveUrl: true
});
```

### `prefixIds(svg, prefix)`

Prefixes IDs and matching references.

```js
prefixIds(svg, "brand");
```

Turns:

```xml
<linearGradient id="accent" />
<rect fill="url(#accent)" />
```

Into:

```xml
<linearGradient id="brand-accent" />
<rect fill="url(#brand-accent)" />
```

### `normalizeSvg(svg, options)`

One-call production cleanup.

```js
const output = normalizeSvg(svg, {
  sanitize: true,
  minify: true,
  title: "Company Mark",
  prefix: "company",
  fill: "#111827",
  stroke: "#111827"
});
```

## Project Structure

```text
svgcraft-core/
  bin/svgcraft.mjs
  src/index.mjs
  src/index.cjs
  src/index.d.ts
  examples/sample.svg
  examples/basic.mjs
  test/index.test.mjs
  package.json
  README.md
  CHANGELOG.md
  LICENSE
```

## Notes

This package uses regex-based SVG transforms. It is excellent for common icon and asset workflows. For full XML-level editing of complex SVG documents, use a dedicated XML parser.

## License

MIT
