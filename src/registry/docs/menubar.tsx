import type { ComponentDoc } from "../types";
import MenubarDemo from "../examples/menubar/demo";
import MenubarPlayer from "../examples/menubar/player";

export const doc: ComponentDoc = {
  usage: `import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar"

<Menubar aria-label="Editor">
  <MenubarMenu>
    <MenubarTrigger>File</MenubarTrigger>
    <MenubarContent>
      <MenubarItem shortcut="⌘N">New canvas</MenubarItem>
      <MenubarSeparator />
      <MenubarItem shortcut="⌘S">Save</MenubarItem>
    </MenubarContent>
  </MenubarMenu>
</Menubar>`,
  examples: [
    {
      name: "demo",
      title: "Editor",
      description:
        "Open one menu, then sweep across the others. The lit filament follows the open title. Submenus, checkbox and radio items come from Dropdown Menu.",
      component: MenubarDemo,
    },
    {
      name: "player",
      title: "Labels and icons",
      description: "Radio groups with a label, checkbox items with shortcuts, and icon items that depend on them.",
      component: MenubarPlayer,
    },
  ],
  api: [
    {
      name: "Menubar",
      description: "Renders a div with role=\"menubar\". Give it an aria-label.",
      props: [
        { prop: "value", type: "string | null", description: "The open menu's value. Controlled." },
        { prop: "defaultValue", type: "string | null", default: "null", description: "Initially open menu when uncontrolled." },
        { prop: "onValueChange", type: "(value: string | null) => void", description: "Called when a menu opens, another takes over, or the bar closes." },
        { prop: "loop", type: "boolean", default: "true", description: "Left and Right wrap from the last menu to the first and back." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "MenubarMenu",
      description: "One menu in the bar. Wraps a DropdownMenu whose open state the bar owns.",
      props: [{ prop: "value", type: "string", default: "generated", description: "Identifies the menu in Menubar's value." }],
    },
    {
      name: "MenubarTrigger",
      description: "The menu's title: a button with role=\"menuitem\". Accepts native button attributes.",
      props: [{ prop: "disabled", type: "boolean", default: "false", description: "Skipped by Left and Right." }],
    },
    {
      name: "MenubarContent",
      description: "The menu panel. Takes every DropdownMenuContent prop.",
      props: [
        { prop: "sideOffset", type: "number", default: "8", description: "Gap below the bar, in px." },
        { prop: "alignOffset", type: "number", default: "-4", description: "Lines the panel's edge up with the bar's." },
      ],
    },
    {
      name: "MenubarItem, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarLabel, MenubarGroup, MenubarSeparator, MenubarSub, MenubarSubTrigger, MenubarSubContent",
      description: "The Dropdown Menu parts under menubar names, with the same props: shortcut, icon, variant=\"danger\", checked, value, onSelect.",
      props: [
        { prop: "shortcut", type: "ReactNode", description: "Shown on the right. Display only: wire the key yourself." },
        { prop: "onSelect", type: "(event: Event) => void", description: "Called on click, Enter or Space. The menu closes unless you call preventDefault()." },
      ],
    },
  ],
  notes: [
    "Follows the WAI-ARIA menubar pattern: one Tab stop for the bar, Left and Right between titles, Home and End to the ends.",
    "Enter, Space or ArrowDown opens a menu on its first item; ArrowUp opens it on the last.",
    "Inside a menu, Left and Right move to the neighbouring menu, except where a submenu claims the key.",
    "Once a menu is open, hovering another title opens that one. Escape closes the menu and returns focus to its title.",
  ],
};
