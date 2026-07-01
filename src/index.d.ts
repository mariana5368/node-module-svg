export interface SvgMetadata {
  width: string | null;
  height: string | null;
  viewBox: string | null;
  xmlns: string | null;
  hasTitle: boolean;
  hasDescription: boolean;
  elementTypes: string[];
  elementTypeCount: number;
  characterLength: number;
}

export interface SanitizeOptions {
  removeComments?: boolean;
  removeScripts?: boolean;
  removeForeignObject?: boolean;
  removeEventHandlers?: boolean;
  removeJavascriptLinks?: boolean;
}

export interface MinifyOptions {
  removeComments?: boolean;
  collapseWhitespace?: boolean;
  removeSpaceBetweenTags?: boolean;
}

export interface SetColorOptions {
  attributes?: string[];
  preserveNone?: boolean;
  preserveUrl?: boolean;
}

export interface NormalizeOptions {
  sanitize?: boolean;
  minify?: boolean;
  title?: string;
  fill?: string;
  stroke?: string;
  prefix?: string;
}

export interface CreateSvgOptions {
  width?: string | number;
  height?: string | number;
  viewBox?: string;
  xmlns?: string;
}

export function isSvg(input: unknown): input is string;
export function readAttributes(svg: string): Record<string, string>;
export function getMetadata(svg: string): SvgMetadata;
export function listElements(svg: string): string[];
export function extractIds(svg: string): string[];
export function setRootAttribute(svg: string, name: string, value: string | number): string;
export function injectTitle(svg: string, title: string): string;
export function removeComments(svg: string): string;
export function sanitizeSvg(svg: string, options?: SanitizeOptions): string;
export function minifySvg(svg: string, options?: MinifyOptions): string;
export function setColor(svg: string, color: string, options?: SetColorOptions): string;
export function prefixIds(svg: string, prefix: string): string;
export function toDataUri(svg: string): string;
export function fromDataUri(dataUri: string): string;
export function normalizeSvg(svg: string, options?: NormalizeOptions): string;
export function createSvg(content: string, options?: CreateSvgOptions): string;

declare const svgcraft: {
  isSvg: typeof isSvg;
  readAttributes: typeof readAttributes;
  getMetadata: typeof getMetadata;
  listElements: typeof listElements;
  extractIds: typeof extractIds;
  setRootAttribute: typeof setRootAttribute;
  injectTitle: typeof injectTitle;
  removeComments: typeof removeComments;
  sanitizeSvg: typeof sanitizeSvg;
  minifySvg: typeof minifySvg;
  setColor: typeof setColor;
  prefixIds: typeof prefixIds;
  toDataUri: typeof toDataUri;
  fromDataUri: typeof fromDataUri;
  normalizeSvg: typeof normalizeSvg;
  createSvg: typeof createSvg;
};

export default svgcraft;
