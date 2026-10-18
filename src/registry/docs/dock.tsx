import type { ComponentDoc } from "../types";
import DockDemo from "../examples/dock/demo";
import DockVertical from "../examples/dock/vertical";
import DockToolbar from "../examples/dock/toolbar";

export const doc: ComponentDoc = {
  usage: `import { Dock, DockItem, DockSeparator } from "@/components/ui/dock"

<Dock aria-label="Dock">
  <DockItem label="Mail" badge={12} running>
    <Mail />
  </DockItem>
  <DockSeparator />
  <DockItem label="Trash">
    <Trash2 />
  </DockItem>
</Dock>`,
  examples: [
    {
      name: "demo",
      title: "App dock",
      description:
        "Icons grow with the pointer's distance on a spring and the neighbours make room. Hover strikes the icon's tube; a short lit tube under an icon marks it running. Click one to launch it.",
      component: DockDemo,
    },
    {
      name: "vertical",
      title: "Vertical, with links",
      description: "asChild renders each item as a link. The running tube marks the current page, and aria-current says so to screen readers.",
      component: DockVertical,
    },
    {
      name: "toolbar",
      title: "Without magnification",
      description: "magnification={1} keeps every icon still, for a canvas toolbar.",
      component: DockToolbar,
    },
  ],
  api: [
    {
      name: "Dock",
      props: [
        { prop: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Horizontal icons grow upward; vertical ones grow to the right." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Icons of 36, 44 or 54px at rest." },
        { prop: "magnification", type: "number", default: "1.6", description: "The size of the icon under the pointer, as a multiple of its rest size. 1 turns it off." },
        { prop: "distance", type: "number", default: "140", description: "Pixels from the pointer within which icons grow." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "DockItem",
      description: "A button, or with asChild any element such as a link. Other props go on that element.",
      props: [
        { prop: "label", type: "string", description: "Accessible name and tooltip." },
        { prop: "running", type: "boolean", default: "false", description: "Lights the small tube under the icon." },
        { prop: "runningLabel", type: "string", default: '"open"', description: "What screen readers hear for running, as the item's description." },
        { prop: "badge", type: "ReactNode", description: "A count or short word in a lit pill on the corner." },
        { prop: "badgeColor", type: "NeonColor", default: '"red"', description: "Color of the badge." },
        { prop: "asChild", type: "boolean", default: "false", description: "Renders the child element as the item. Base UI's render prop works too." },
        { prop: "disabled", type: "boolean", default: "false", description: "Dims the item and skips it in keyboard navigation." },
      ],
    },
    {
      name: "DockSeparator",
      description: "A hairline between groups of items.",
      props: [],
    },
  ],
  notes: [
    "The dock is a toolbar with one tab stop. Arrow keys along its axis move focus, Home and End jump to the ends, and keyboard moves never magnify.",
    "Touch input never magnifies, and neither does anything under reduced motion.",
    "Give the dock an aria-label. Badges and the running state are read as each item's description.",
  ],
};
