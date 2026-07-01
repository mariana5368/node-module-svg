const SVG_ROOT_RE = /<svg\b[^>]*>[\s\S]*?<\/svg>/i;
const TAG_RE = /<\/?([A-Za-z][\w:-]*)\b[^>]*>/g;
const ATTR_RE = /([A-Za-z_:][\w:.-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;

function assertSvg(svg) {
  if (!isSvg(svg)) {
    throw new TypeError("Expected a valid SVG string containing <svg>...</svg>.");
  }
}

function assertString(value, name) {
  if (typeof value !== "string") {
    throw new TypeError(`${name} must be a string.`);
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeAttr(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getSvgOpenTag(svg) {
  const match = svg.match(/<svg\b[^>]*>/i);
  return match ? match[0] : null;
}

function parseAttributesFromTag(tag) {
  const attributes = {};
  if (!tag) return attributes;

  let match;
  while ((match = ATTR_RE.exec(tag)) !== null) {
    attributes[match[1]] = match[3] ?? match[4] ?? "";
  }

  return attributes;
}

export function isSvg(input) {
  return typeof input === "string" && SVG_ROOT_RE.test(input.trim());
}

export function readAttributes(svg) {
  assertSvg(svg);
  return parseAttributesFromTag(getSvgOpenTag(svg));
}

export function getMetadata(svg) {
  assertSvg(svg);

  const attributes = readAttributes(svg);
  const tags = listElements(svg);

  return {
    width: attributes.width ?? null,
    height: attributes.height ?? null,
    viewBox: attributes.viewBox ?? null,
    xmlns: attributes.xmlns ?? null,
    hasTitle: /<title\b[^>]*>[\s\S]*?<\/title>/i.test(svg),
    hasDescription: /<desc\b[^>]*>[\s\S]*?<\/desc>/i.test(svg),
    elementTypes: tags,
    elementTypeCount: tags.length,
    characterLength: svg.length
  };
}

export function listElements(svg) {
  assertSvg(svg);

  const found = new Set();
  let match;
  while ((match = TAG_RE.exec(svg)) !== null) {
    found.add(match[1]);
  }

  return [...found];
}

export function extractIds(svg) {
  assertSvg(svg);

  const ids = [];
  const re = /\bid\s*=\s*("([^"]+)"|'([^']+)')/gi;
  let match;

  while ((match = re.exec(svg)) !== null) {
    ids.push(match[2] ?? match[3]);
  }

  return [...new Set(ids)];
}

export function setRootAttribute(svg, name, value) {
  assertSvg(svg);
  assertString(name, "name");

  const safeName = name.trim();
  if (!/^[A-Za-z_:][\w:.-]*$/.test(safeName)) {
    throw new Error(`Invalid SVG attribute name: ${name}`);
  }

  const openTag = getSvgOpenTag(svg);
  const safeValue = escapeAttr(value);
  const existing = new RegExp(`\\s${escapeRegExp(safeName)}\\s*=\\s*("[^"]*"|'[^']*')`, "i");

  const nextOpenTag = existing.test(openTag)
    ? openTag.replace(existing, ` ${safeName}="${safeValue}"`)
    : openTag.replace(/>$/, ` ${safeName}="${safeValue}">`);

  return svg.replace(openTag, nextOpenTag);
}

export function injectTitle(svg, title) {
  assertSvg(svg);
  assertString(title, "title");

  const cleanTitle = escapeAttr(title.trim());
  if (!cleanTitle) return svg;

  const titleTag = `<title>${cleanTitle}</title>`;
  const openTag = getSvgOpenTag(svg);

  if (/<title\b[^>]*>[\s\S]*?<\/title>/i.test(svg)) {
    return svg.replace(/<title\b[^>]*>[\s\S]*?<\/title>/i, titleTag);
  }

  return svg.replace(openTag, `${openTag}${titleTag}`);
}

export function removeComments(svg) {
  assertString(svg, "svg");
  return svg.replace(/<!--[\s\S]*?-->/g, "");
}

export function sanitizeSvg(svg, options = {}) {
  assertSvg(svg);

  const {
    removeComments: shouldRemoveComments = true,
    removeScripts = true,
    removeForeignObject = true,
    removeEventHandlers = true,
    removeJavascriptLinks = true
  } = options;

  let output = svg;

  if (shouldRemoveComments) output = removeComments(output);
  if (removeScripts) output = output.replace(/<script\b[\s\S]*?<\/script>/gi, "");
  if (removeForeignObject) output = output.replace(/<foreignObject\b[\s\S]*?<\/foreignObject>/gi, "");

  if (removeEventHandlers) {
    output = output.replace(/\s+on[A-Za-z]+\s*=\s*("[^"]*"|'[^']*')/g, "");
  }

  if (removeJavascriptLinks) {
    output = output.replace(/\s+(?:href|xlink:href)\s*=\s*("\s*javascript:[^"]*"|'\s*javascript:[^']*')/gi, "");
  }

  return output;
}

export function minifySvg(svg, options = {}) {
  assertSvg(svg);

  const {
    removeComments: shouldRemoveComments = true,
    collapseWhitespace = true,
    removeSpaceBetweenTags = true
  } = options;

  let output = svg;

  if (shouldRemoveComments) output = removeComments(output);
  if (removeSpaceBetweenTags) output = output.replace(/>\s+</g, "><");
  if (collapseWhitespace) output = output.replace(/\s{2,}/g, " ");

  return output.trim();
}

export function setColor(svg, color, options = {}) {
  assertSvg(svg);
  assertString(color, "color");

  const {
    attributes = ["fill"],
    preserveNone = true,
    preserveUrl = true
  } = options;

  let output = svg;
  const safeColor = escapeAttr(color);

  for (const attr of attributes) {
    const attrRe = new RegExp(`\\b${escapeRegExp(attr)}\\s*=\\s*("([^"]*)"|'([^']*)')`, "gi");
    output = output.replace(attrRe, (full, _quoted, doubleValue, singleValue) => {
      const current = doubleValue ?? singleValue ?? "";
      if (preserveNone && current.trim().toLowerCase() === "none") return full;
      if (preserveUrl && /^url\(/i.test(current.trim())) return full;
      return `${attr}="${safeColor}"`;
    });
  }

  return output;
}

export function prefixIds(svg, prefix) {
  assertSvg(svg);
  assertString(prefix, "prefix");

  const cleanPrefix = prefix.trim().replace(/[^A-Za-z0-9_-]/g, "-");
  if (!cleanPrefix) return svg;

  const ids = extractIds(svg);
  let output = svg;

  for (const id of ids) {
    const nextId = `${cleanPrefix}-${id}`;
    output = output.replace(new RegExp(`(\\bid\\s*=\\s*["'])${escapeRegExp(id)}(["'])`, "g"), `$1${nextId}$2`);
    output = output.replace(new RegExp(`url\\(#${escapeRegExp(id)}\\)`, "g"), `url(#${nextId})`);
    output = output.replace(new RegExp(`(["'])#${escapeRegExp(id)}(["'])`, "g"), `$1#${nextId}$2`);
  }

  return output;
}

export function toDataUri(svg) {
  assertSvg(svg);

  const encoded = encodeURIComponent(minifySvg(svg))
    .replace(/%20/g, " ")
    .replace(/%3D/g, "=")
    .replace(/%3A/g, ":")
    .replace(/%2F/g, "/");

  return `data:image/svg+xml,${encoded}`;
}

export function fromDataUri(dataUri) {
  assertString(dataUri, "dataUri");

  const prefix = "data:image/svg+xml,";
  const utf8Prefix = "data:image/svg+xml;utf8,";

  if (dataUri.startsWith(prefix)) {
    return decodeURIComponent(dataUri.slice(prefix.length));
  }

  if (dataUri.startsWith(utf8Prefix)) {
    return decodeURIComponent(dataUri.slice(utf8Prefix.length));
  }

  throw new Error("Expected a data:image/svg+xml data URI.");
}

export function normalizeSvg(svg, options = {}) {
  assertSvg(svg);

  const {
    sanitize = true,
    minify = true,
    title,
    fill,
    stroke,
    prefix
  } = options;

  let output = svg;

  if (sanitize) output = sanitizeSvg(output);
  if (typeof title === "string") output = injectTitle(output, title);
  if (typeof fill === "string") output = setColor(output, fill, { attributes: ["fill"] });
  if (typeof stroke === "string") output = setColor(output, stroke, { attributes: ["stroke"] });
  if (typeof prefix === "string") output = prefixIds(output, prefix);
  if (minify) output = minifySvg(output);

  return output;
}

export function createSvg(content, options = {}) {
  const {
    width = 24,
    height = 24,
    viewBox = `0 0 ${width} ${height}`,
    xmlns = "http://www.w3.org/2000/svg"
  } = options;

  assertString(content, "content");

  return `<svg width="${escapeAttr(width)}" height="${escapeAttr(height)}" viewBox="${escapeAttr(viewBox)}" xmlns="${escapeAttr(xmlns)}">${content}</svg>`;
}

const api = {
  isSvg,
  readAttributes,
  getMetadata,
  listElements,
  extractIds,
  setRootAttribute,
  injectTitle,
  removeComments,
  sanitizeSvg,
  minifySvg,
  setColor,
  prefixIds,
  toDataUri,
  fromDataUri,
  normalizeSvg,
  createSvg
};

export default api;
