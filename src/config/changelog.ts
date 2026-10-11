/** Release notes. Components added in each version are pulled from registry.json `addedIn`. */
export type Release = {
  version: string;
  date: string; // ISO
  title: string;
  notes: string[];
};

export const releases: Release[] = [
  {
    version: "1.1",
    date: "2026-10-11",
    title: "The standard set",
    notes: [
      "Menus, popovers, a command palette, sheets, date and time pickers, tables, steppers, a sidebar and more: the primitives every app needs, each with its own neon detail.",
      "Components can build on each other. The CLI installs Date Picker together with Calendar and Popover.",
      "Menus and popovers flip and shift to stay on screen and carry their color through portals.",
      "Live component gallery, collapsible sidebar and a changelog.",
    ],
  },
  {
    version: "1.0",
    date: "2026-10-11",
    title: "The revamp",
    notes: [
      "Every component rebuilt around one CSS variable, --neon. Pass a palette name or any hex, or inherit it from a parent.",
      "Installable with the shadcn CLI, plus the @neonkit namespace and the shadcn MCP server.",
      "New docs, a new landing page, llms.txt and a markdown version of every page.",
    ],
  },
];
