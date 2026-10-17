import type { ComponentDoc } from "../types";
import PopoverDemo from "../examples/popover/demo";
import PopoverFilters from "../examples/popover/filters";
import PopoverConfirm from "../examples/popover/confirm";
import PopoverPlacement from "../examples/popover/placement";

export const doc: ComponentDoc = {
  usage: `import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

<Popover>
  <PopoverTrigger asChild>
    <Button>Share</Button>
  </PopoverTrigger>
  <PopoverContent>…</PopoverContent>
</Popover>`,
  examples: [
    {
      name: "demo",
      title: "Share",
      description: "Focus lands on the link field, which selects itself, so ⌘C copies straight away.",
      component: PopoverDemo,
    },
    {
      name: "filters",
      title: "Filters",
      description: "Control open to apply a draft on submit and throw it away on Escape or Cancel.",
      component: PopoverFilters,
    },
    {
      name: "confirm",
      title: "Inline confirm",
      description: "Without a color, the panel takes the trigger's. Here it's red, and so is the Delete button inside.",
      component: PopoverConfirm,
    },
    {
      name: "placement",
      title: "Placement",
      description: "side and align set the preferred position. It flips and shifts to stay on screen.",
      component: PopoverPlacement,
    },
  ],
  api: [
    {
      name: "Popover",
      description: "Holds the open state. Renders no element of its own.",
      props: [
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        {
          prop: "onOpenChange",
          type: "(open: boolean) => void",
          description: "Called when the trigger, a close button, Escape, Tab or a press outside asks to change state.",
        },
      ],
    },
    {
      name: "PopoverTrigger",
      description: "Renders a button that toggles the popover. Also accepts every native button attribute.",
      props: [
        {
          prop: "asChild",
          type: "boolean",
          default: "false",
          description: "Merges trigger behaviour, ARIA and ref onto its single child element. The child's own handlers run first.",
        },
      ],
    },
    {
      name: "PopoverContent",
      description:
        "The panel, rendered in a portal with role=\"dialog\". Other props go to the panel. It's w-72 p-4 by default; override with className.",
      props: [
        { prop: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Preferred side. Flips when there isn't room." },
        { prop: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment along the trigger." },
        { prop: "sideOffset", type: "number", default: "8", description: "Gap from the trigger in pixels." },
        { prop: "arrow", type: "boolean", default: "false", description: "Shows an arrow that tracks the trigger, lit where the light leaks in." },
        {
          prop: "initialFocus",
          type: '"first" | "content"',
          default: '"first"',
          description: "On open, focus the first focusable element (or one marked data-autofocus), or the panel itself.",
        },
        {
          prop: "color",
          type: "NeonColor",
          default: "trigger's",
          description: "Palette name or hex. Falls back to the trigger's --neon, then --neon-accent, then cyan.",
        },
      ],
    },
    {
      name: "PopoverClose",
      description: "Renders a button that closes the popover. Also accepts every native button attribute.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Merges close behaviour onto its single child element." },
      ],
    },
    {
      name: "PopoverAnchor",
      description: "Optional. Positions the panel against this element instead of the trigger, e.g. a whole field.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Merges onto its single child element instead of rendering a div." },
      ],
    },
    {
      name: "CSS variables",
      description: "Set on the positioned wrapper, so the panel and its children can size against the space available.",
      props: [
        { prop: "--popover-trigger-width", type: "px", description: "Width of the trigger (or anchor), e.g. w-[var(--popover-trigger-width)]." },
        { prop: "--popover-available-height", type: "px", description: "Room left on the chosen side. Cap tall panels with max-h-[var(--popover-available-height)]." },
        { prop: "--popover-available-width", type: "px", description: "Room left across. The panel's max width already uses it." },
      ],
    },
  ],
  notes: [
    "The panel has role=\"dialog\" and is labelled by its trigger, which gets aria-haspopup, aria-expanded and aria-controls.",
    "Opening moves focus into the panel. Escape, a press outside or a PopoverClose closes it and puts focus back on the trigger.",
    "Tab past the last element closes the panel and continues to whatever follows the trigger; Shift+Tab from the first returns to the trigger.",
    "It's non-modal: the rest of the page stays interactive, and moving focus elsewhere closes it.",
    "Inside a Dialog or Sheet the panel renders into that <dialog>, so it stays on the top layer and clickable.",
    "Without a visible trigger label, pass aria-label to PopoverContent.",
  ],
};
