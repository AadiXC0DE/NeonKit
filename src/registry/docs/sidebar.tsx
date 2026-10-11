import type { ComponentDoc } from "../types";
import SidebarDemo from "../examples/sidebar/demo";
import SidebarRail from "../examples/sidebar/rail";
import SidebarSettings from "../examples/sidebar/settings";

export const doc: ComponentDoc = {
  usage: `import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarInset,
  SidebarItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

<SidebarProvider className="min-h-svh">
  <Sidebar>
    <SidebarContent>
      <SidebarGroup label="Workspace">
        <SidebarItem icon={<Inbox />} href="/inbox" badge={3} active>
          Inbox
        </SidebarItem>
        <SidebarItem icon={<Folder />} href="/projects">Projects</SidebarItem>
      </SidebarGroup>
    </SidebarContent>
  </Sidebar>
  <SidebarInset>
    <SidebarTrigger />
    …
  </SidebarInset>
</SidebarProvider>`,
  examples: [
    {
      name: "demo",
      title: "App shell",
      description:
        "Click around and the lit tube glides to the active item. Press ⌘B or Ctrl+B to collapse to the rail, then hover an icon for its label.",
      component: SidebarDemo,
    },
    {
      name: "rail",
      title: "Starts as a rail",
      description:
        "defaultCollapsed opens on the 56px rail. Badges turn into a dot on the icon, and the hover label carries the count.",
      component: SidebarRail,
    },
    {
      name: "settings",
      title: "Settings navigation",
      description: 'collapsible="none" keeps the sidebar open on wide screens. Below md it is still a drawer.',
      component: SidebarSettings,
    },
  ],
  api: [
    {
      name: "SidebarProvider",
      description:
        "Holds the state and renders a flex row: put Sidebar and SidebarInset inside. Give it min-h-svh for a page shell, or a fixed height for a framed panel.",
      props: [
        { prop: "collapsed", type: "boolean", description: "Rail state when controlled." },
        { prop: "defaultCollapsed", type: "boolean", default: "false", description: "Initial rail state when uncontrolled." },
        { prop: "onCollapsedChange", type: "(collapsed: boolean) => void", description: "Called when the rail is toggled." },
        {
          prop: "shortcut",
          type: "string | false",
          default: '"b"',
          description: "⌘ or Ctrl plus this key toggles the sidebar. Ignored inside contenteditable. Pass false to turn it off.",
        },
      ],
    },
    {
      name: "Sidebar",
      description:
        "The panel. From md up it sits in the layout, sticky, as tall as the viewport or the provider, whichever is smaller. Below md it is an off-canvas drawer. It sets data-state=\"collapsed\" | \"expanded\" and the group/sidebar class for styling your own content.",
      props: [
        { prop: "side", type: '"left" | "right"', default: '"left"', description: "Which edge it sits on. For the right, render it after SidebarInset." },
        { prop: "collapsible", type: '"rail" | "none"', default: '"rail"', description: "Allow collapsing to the 56px icon rail." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "SidebarHeader / SidebarFooter",
      description:
        "Fixed rows at the top and bottom. They clip their content to the rail; fade your own text with useSidebar().collapsed, e.g. collapsed && \"md:opacity-0\".",
      props: [{ prop: "className", type: "string", description: "Classes for the row." }],
    },
    {
      name: "SidebarContent",
      description: 'The scrolling middle. Renders a nav labelled "Sidebar".',
      props: [{ prop: "aria-label", type: "string", default: '"Sidebar"', description: "Name of the navigation landmark." }],
    },
    {
      name: "SidebarGroup",
      description: "A list of items with an optional heading. Items must live in a group, including in the footer.",
      props: [{ prop: "label", type: "ReactNode", description: "Heading above the items. In the rail it becomes a short divider." }],
    },
    {
      name: "SidebarItem",
      description: "A row in a group. Renders a link with href, a button without, or your own element with asChild.",
      props: [
        { prop: "icon", type: "ReactNode", description: "16px icon. It stays put while the sidebar collapses." },
        { prop: "href", type: "string", description: "Renders an a instead of a button." },
        { prop: "active", type: "boolean", default: "false", description: 'Marks the current page: aria-current="page" and the lit tube.' },
        { prop: "badge", type: "ReactNode", description: "Count or short tag at the end of the row. In the rail it becomes a dot on the icon." },
        { prop: "tooltip", type: "ReactNode", description: "Text for the rail hover label. Defaults to the item's label." },
        { prop: "disabled", type: "boolean", default: "false", description: "Dims the row and blocks clicks." },
        { prop: "onClick", type: "(event) => void", description: "Below md, a click also closes the drawer unless you call event.preventDefault()." },
        {
          prop: "asChild",
          type: "boolean",
          default: "false",
          description: "Merge onto the single child, such as your router's Link. The child's children become the label.",
        },
      ],
    },
    {
      name: "SidebarTrigger",
      description: "An icon button that collapses or expands the sidebar, or opens the drawer below md. Children replace the icon.",
      props: [{ prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex for the focus ring." }],
    },
    {
      name: "SidebarInset",
      description: "The page next to the sidebar. A flex column that takes the remaining width. While the drawer is open it is inert.",
      props: [{ prop: "className", type: "string", description: "Classes for the page column, e.g. overflow-y-auto." }],
    },
    {
      name: "useSidebar()",
      description: "Reads the nearest SidebarProvider. Throws outside one.",
      props: [
        { prop: "collapsed", type: "boolean", description: "Whether the sidebar is on the rail (md and up)." },
        { prop: "setCollapsed", type: "(collapsed: boolean) => void", description: "Collapse or expand." },
        { prop: "toggle", type: "() => void", description: "What the trigger and the shortcut call: the rail on desktop, the drawer below md." },
        { prop: "isMobile", type: "boolean", description: "True below md, where the sidebar is a drawer. False during server rendering." },
        { prop: "openMobile", type: "boolean", description: "Whether the drawer is open." },
        { prop: "setOpenMobile", type: "(open: boolean) => void", description: "Open or close the drawer." },
      ],
    },
  ],
  notes: [
    'The trigger is a button named "Toggle sidebar" with aria-expanded, aria-controls pointing at the panel, and aria-keyshortcuts for ⌘B and Ctrl+B.',
    'The active item has aria-current="page". The tube is decorative and hidden from screen readers.',
    "On the rail the labels fade but stay in the accessibility tree, so every item keeps its name. The hover label is visual only and also appears on keyboard focus.",
    "The hover label closes on Escape, on scroll and when the pointer leaves the item.",
    "Below md the sidebar is a modal drawer: focus moves into it, Escape and the backdrop close it, the page behind is inert and stops scrolling, and focus returns to the trigger.",
    "The width animation and the glide respect reduced motion.",
  ],
};
