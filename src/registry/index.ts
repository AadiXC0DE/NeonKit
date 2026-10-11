import data from "./registry.json";
import type { RegistryBlock, RegistryItem } from "./types";

/** The release being built. Items added in it get a "new" badge. */
export const currentVersion = "1.1";

export const categories = data.categories;
export const registry: RegistryItem[] = data.items;

export const isNew = (item: Pick<RegistryItem, "addedIn">) => item.addedIn === currentVersion;

export const blockCategories = data.blockCategories;
export const blocks: RegistryBlock[] = data.blocks;

export function getBlock(slug: string) {
  return blocks.find((block) => block.slug === slug);
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
