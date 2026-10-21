/** Anchor id for a block category on the gallery page. Kept apart from index.ts so client code can import it without the registry. */
export const blockCategoryId = (category: string) => `blocks-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

/** Gallery screenshots, written by scripts/thumbs.mjs as `<path>-1280.webp` and `<path>-2560.webp`. */
export const blockShot = (slug: string) => `/previews/${slug}`;
export const templateShot = (slug: string, route = "") => `/previews/templates/${slug}${route.replace(/\//g, "_")}`;

/** Social card for one page of a template, written by scripts/thumbs.mjs. */
export const templateThumb = (slug: string, route = "") => `/thumbs/templates/${slug}${route.replace(/\//g, "_")}.jpg`;
