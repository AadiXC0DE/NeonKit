import data from "./registry.json";
import type { RegistryBlock, RegistryItem, RegistryTemplate } from "./types";

/** The release being built. */
export const currentVersion = "1.7";
/** Items added in these releases get a "new" badge. */
export const newVersions = ["1.6", "1.7"];

export const categories = data.categories;
export const registry: RegistryItem[] = data.items;

export const isNew = (item: Pick<RegistryItem, "addedIn">) => newVersions.includes(item.addedIn);

export const blockCategories = data.blockCategories;
export const blocks: RegistryBlock[] = data.blocks;

export function getBlock(slug: string) {
  return blocks.find((block) => block.slug === slug);
}

/** Blocks in gallery order: by category, then registry order within each. */
export const orderedBlocks: RegistryBlock[] = blockCategories.flatMap((category) =>
  blocks.filter((block) => block.category === category),
);

export function getBlockNeighbours(slug: string) {
  const index = orderedBlocks.findIndex((block) => block.slug === slug);
  return {
    prev: index > 0 ? orderedBlocks[index - 1] : undefined,
    next: index >= 0 && index < orderedBlocks.length - 1 ? orderedBlocks[index + 1] : undefined,
  };
}

export { blockCategoryId, templateThumb } from "./ids";

export const templates: RegistryTemplate[] = data.templates;

export function getTemplate(slug: string) {
  return templates.find((template) => template.slug === slug);
}

/** Where a template is previewed on this site. Installed, it lives at `/<slug>`. */
export const templatePreviewPath = (slug: string, route = "") => `/preview/${slug}${route}`;

export function getTemplateNeighbours(slug: string) {
  const index = templates.findIndex((template) => template.slug === slug);
  return {
    prev: index > 0 ? templates[index - 1] : undefined,
    next: index >= 0 && index < templates.length - 1 ? templates[index + 1] : undefined,
  };
}

export const blockPath = (slug: string) => `src/components/blocks/${slug}.tsx`;

export function getItem(slug: string) {
  return registry.find((item) => item.slug === slug);
}

export function getNeighbours(slug: string) {
  const index = registry.findIndex((item) => item.slug === slug);
  return {
    prev: index > 0 ? registry[index - 1] : undefined,
    next: index < registry.length - 1 ? registry[index + 1] : undefined,
  };
}

export const componentPath = (slug: string) => `src/components/ui/${slug}.tsx`;
export const examplePath = (slug: string, name: string) =>
  `src/registry/examples/${slug}/${name}.tsx`;
