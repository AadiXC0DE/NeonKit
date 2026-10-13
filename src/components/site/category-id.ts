/** Anchor id for a component category on /components, e.g. "Data Display" → "data-display". */
export const componentCategoryId = (category: string) =>
  category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
