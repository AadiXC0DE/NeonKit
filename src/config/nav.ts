import { categories, isNew, registry } from "@/registry";

export type NavItem = { title: string; href: string; isNew?: boolean };
export type NavSection = { title: string; items: NavItem[] };

export const docsNav: NavSection[] = [
  {
    title: "Getting started",
    items: [
      { title: "Introduction", href: "/docs" },
      { title: "Installation", href: "/docs/installation" },
      { title: "Theming", href: "/docs/theming" },
      { title: "Theme Studio", href: "/theme" },
      { title: "Use with AI", href: "/docs/ai" },
      { title: "All components", href: "/components" },
    ],
  },
  ...categories.map((category) => ({
    title: category,
    items: registry
      .filter((item) => item.category === category)
      .map((item) => ({ title: item.name, href: `/components/${item.slug}`, isNew: isNew(item) })),
  })),
];
