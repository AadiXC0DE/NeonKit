import type { ComponentDoc } from "../types";
import SheetDemo from "../examples/sheet/demo";
import SheetBottom from "../examples/sheet/bottom";
import SheetNavigation from "../examples/sheet/navigation";

export const doc: ComponentDoc = {
  usage: `import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

<Sheet>
  <SheetTrigger asChild>
    <Button>Environment variables</Button>
  </SheetTrigger>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Environment variables</SheetTitle>
      <SheetDescription>Changes apply to the next deployment.</SheetDescription>
    </SheetHeader>
  </SheetContent>
</Sheet>`,
  examples: [
    {
      name: "demo",
      title: "Settings panel",
      description: "A form in a right sheet. Control open to close it once the form submits.",
      component: SheetDemo,
    },
    {
      name: "bottom",
      title: "Bottom sheet",
      description: "Drag the handle or the header down to dismiss. A flick works too. The backdrop thins as you pull.",
      component: SheetBottom,
    },
    {
      name: "navigation",
      title: "Mobile navigation",
      description: "A left sheet sized with className. Links close it after navigating.",
      component: SheetNavigation,
    },
  ],
  api: [
    {
      name: "Sheet",
      description: "Holds the open state. Renders no element of its own.",
      props: [
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        {
          prop: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when the trigger, a close button, Escape, the backdrop or a drag asks to change state.",
        },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "SheetTrigger",
      description: "Renders a button that opens the sheet. Also accepts every native button attribute.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Merges trigger behaviour onto its single child element instead of rendering a button." },
      ],
    },
    {
      name: "SheetContent",
      description:
        "The backdrop and panel in a native <dialog> on the top layer. Other props go to the panel; its children scroll inside a padded body.",
      props: [
        { prop: "side", type: '"top" | "right" | "bottom" | "left"', default: '"right"', description: "The edge it slides in from. The opposite edge is the lit tube." },
        {
          prop: "size",
          type: '"sm" | "md" | "lg" | "full"',
          default: '"md"',
          description: "Width for left and right (384, 448, 672px or full), maximum height for top and bottom (40, 65, 85% or full).",
        },
        { prop: "showClose", type: "boolean", default: "true", description: "Shows the X button in the top-right corner." },
      ],
    },
    {
      name: "SheetClose",
      description: "Renders a button that closes the sheet. Also accepts every native button attribute.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Merges close behaviour onto its single child element instead of rendering a button." },
      ],
    },
    {
      name: "SheetHeader, SheetTitle, SheetDescription, SheetFooter",
      description: "Layout and text parts. Each accepts the native attributes of its element.",
      props: [
        { prop: "SheetHeader", type: "div", description: "Title block. On a bottom sheet it's also a drag handle." },
        { prop: "SheetTitle", type: "h2", description: "Labels the sheet through aria-labelledby." },
        { prop: "SheetDescription", type: "p", description: "Describes the sheet through aria-describedby, only while it's rendered." },
        { prop: "SheetFooter", type: "div", description: "Pinned to the bottom of side sheets. Stacks actions on small screens." },
      ],
    },
  ],
  notes: [
    "Opens with showModal(), so the browser makes the page inert and moves focus to the first focusable element in the sheet.",
    "Escape and clicks on the backdrop close the sheet after its exit slide. Focus returns to the element that opened it.",
    "Page scroll is locked while it's open; long content scrolls inside the panel.",
    "Dragging is a pointer shortcut only: the X button, Escape and SheetClose always work.",
    "Always include a SheetTitle, even a visually hidden one, so the sheet has an accessible name.",
    "With reduced motion the sheet fades instead of sliding, the tube doesn't flicker and dragging is off.",
  ],
};
