/** Anchor id for a block category on the gallery page. Kept apart from index.ts so client code can import it without the registry. */
export const blockCategoryId = (category: string) => `blocks-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

/** Gallery thumbnail for one page of a template, written by scripts/thumbs.mjs. */
export const templateThumb = (slug: string, route = "") => `/thumbs/templates/${slug}${route.replace(/\//g, "_")}.jpg`;
