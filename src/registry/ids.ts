/** Anchor id for a block category on the gallery page. Kept apart from index.ts so client code can import it without the registry. */
export const blockCategoryId = (category: string) => `blocks-${category.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
