import data from "./registry.json";
import type { RegistryItem } from "./types";

export const categories = data.categories;
export const registry: RegistryItem[] = data.items;

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
