import type * as React from "react";

export type RegistryItem = {
  slug: string;
  name: string;
  category: string;
  description: string;
  /** npm packages the component imports, besides react. */
  dependencies: string[];
  /** Other NeonKit components this one imports from `@/components/ui/<slug>`. */
  registryDependencies?: string[];
  /** Library version that introduced it, e.g. "1.1". */
  addedIn: string;
};

export type RegistryBlock = {
  slug: string;
  name: string;
  category: string;
  description: string;
  dependencies: string[];
  /** NeonKit components the block is built from. */
  registryDependencies: string[];
  addedIn: string;
  /** Initial preview height in pixels before the frame reports its own. */
  height?: number;
};

export type ComponentExample = {
  /** Kebab-case id, also the file name in src/registry/examples/<slug>/. */
  name: string;
  title: string;
  description?: string;
  component: React.ComponentType;
};

export type PropRow = {
  prop: string;
  type: string;
  default?: string;
  description: string;
};

export type ComponentDoc = {
  /** Shortest useful snippet: the import plus one JSX usage. */
  usage: string;
  /** The first example is the hero preview at the top of the page. */
  examples: ComponentExample[];
  api: { name: string; description?: string; props: PropRow[] }[];
  /** Accessibility and keyboard notes, one sentence each. */
  notes?: string[];
};
