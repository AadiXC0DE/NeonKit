import type { ComponentDoc } from "../types";
import NavigationMenuDemo from "../examples/navigation-menu/demo";
import NavigationMenuDocs from "../examples/navigation-menu/docs";
import NavigationMenuLinks from "../examples/navigation-menu/links";

export const doc: ComponentDoc = {
  usage: `import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"

<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuTrigger>Product</NavigationMenuTrigger>
      <NavigationMenuContent className="w-96 p-2">
        <NavigationMenuLink href="/edge" className="p-3">Edge Functions</NavigationMenuLink>
      </NavigationMenuContent>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <NavigationMenuLink href="/docs">Docs</NavigationMenuLink>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>`,
  examples: [
    {
      name: "demo",
      title: "Marketing header",
      description:
        "One panel serves every menu: it morphs to the next size and the content slides in from the direction you moved. A lit tube glides under the hovered item.",
      component: NavigationMenuDemo,
    },
    {
      name: "docs",
      title: "Compact panels",
      description: "Plain link lists, and active on the current page's link.",
      component: NavigationMenuDocs,
    },
    {
      name: "links",
      title: "Links only",
      description: "Without panels it's a section bar. Wire active to your router; here clicks swap it client-side.",
      component: NavigationMenuLinks,
    },
  ],
  api: [
    {
      name: "NavigationMenu",
      description: "The <nav> landmark. It also hosts the shared panel, so keep it position: relative. Accepts native nav attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "value", type: "string", description: "Controlled open item, matched against NavigationMenuItem value. \"\" when closed." },
        { prop: "defaultValue", type: "string", default: '""', description: "Initially open item when uncontrolled." },
        { prop: "onValueChange", type: "(value: string) => void", description: "Called when a panel opens, switches or closes." },
        { prop: "aria-label", type: "string", default: '"Main"', description: "Names the landmark. Change it when a page has more than one nav." },
      ],
    },
    {
      name: "NavigationMenuList",
      description: "The <ul> of top-level items, with the gliding indicator. Accepts native ul attributes.",
      props: [],
    },
    {
      name: "NavigationMenuItem",
      description: "An <li>. Holds either a trigger with its content, or a link.",
      props: [{ prop: "value", type: "string", description: "Identifies the item for value and onValueChange. Generated when omitted." }],
    },
    {
      name: "NavigationMenuTrigger",
      description: "A button with a chevron that opens the item's panel. Accepts native button attributes.",
      props: [],
    },
    {
      name: "NavigationMenuContent",
      description:
        "The item's panel content. It renders inside the shared panel, not in place, and accepts native div attributes. Give it a width such as w-[min(600px,calc(100vw-48px))].",
      props: [],
    },
    {
      name: "NavigationMenuLink",
      description:
        "A link. At the top level it's styled like a trigger; inside a panel it's a bare block for your own layout. Clicking it closes the panel.",
      props: [
        { prop: "active", type: "boolean", default: "false", description: "Marks the current page with aria-current=\"page\" and a softly lit label." },
        { prop: "asChild", type: "boolean", default: "false", description: "Renders the single child, e.g. your router's Link, with the link's behaviour and styles." },
      ],
    },
  ],
  notes: [
    "Opens on hover after a 150ms intent delay, then switches between menus instantly. Clicking toggles; clicking a menu that just opened on hover keeps it open.",
    "Enter, Space and ArrowDown open a panel and move focus into it. ArrowUp and ArrowDown move inside the panel, Shift+Tab from its first link returns to the trigger, and Tab from its last link continues along the bar.",
    "ArrowLeft and ArrowRight move between top-level items, and swap panels while one is open. Escape closes and returns focus to the trigger.",
    "Triggers carry aria-expanded and aria-controls; each panel is labelled by its trigger.",
    "Below the sm breakpoint the bar scrolls sideways and panels cap their width to the screen. For a full mobile menu, swap it for a Sheet.",
  ],
};
