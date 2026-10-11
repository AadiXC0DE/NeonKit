import type { ComponentDoc } from "../types";
import TooltipDemo from "../examples/tooltip/demo";
import TooltipSides from "../examples/tooltip/sides";
import TooltipColors from "../examples/tooltip/colors";
import TooltipDisabled from "../examples/tooltip/disabled";
import TooltipWrapping from "../examples/tooltip/wrapping";

export const doc: ComponentDoc = {
  usage: `import { Tooltip } from "@/components/ui/tooltip"

<Tooltip content="Bold ⌘B">
  <Button size="icon" aria-label="Bold"><Bold /></Button>
</Tooltip>`,
  examples: [
    {
      name: "demo",
      title: "Toolbar",
      description: "After the first tooltip opens, moving to a neighbour shows its tooltip instantly.",
      component: TooltipDemo,
    },
    { name: "sides", title: "Sides", component: TooltipSides },
    {
      name: "colors",
      title: "Colors",
      description: "Pass a palette name or any hex value to color.",
      component: TooltipColors,
    },
    {
      name: "disabled",
      title: "On a disabled button",
      description: "Disabled buttons get no pointer or focus events, so wrap them in a focusable span.",
      component: TooltipDisabled,
    },
    {
      name: "wrapping",
      title: "Longer text",
      description: "Tooltips stay on one line by default. Set a max width and whitespace-normal through className to wrap.",
      component: TooltipWrapping,
    },
  ],
  api: [
    {
      name: "Tooltip",
      description: "Other props, including className, go to the tooltip bubble.",
      props: [
        { prop: "content", type: "ReactNode", description: "What the tooltip says. Keep it short and non-interactive." },
        { prop: "children", type: "ReactElement", description: "The trigger. A single element that accepts focus and aria-describedby." },
        { prop: "side", type: '"top" | "right" | "bottom" | "left"', default: '"top"', description: "Side of the trigger the tooltip appears on." },
        { prop: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment along that side." },
        { prop: "delay", type: "number", default: "300", description: "Milliseconds before opening on hover. Focus opens immediately and closing is always immediate." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "disabled", type: "boolean", default: "false", description: "Never opens." },
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called when the tooltip wants to open or close." },
      ],
    },
  ],
  notes: [
    "The trigger gets aria-describedby pointing at the tooltip while it's open.",
    "Opens on mouse hover and keyboard focus, never on touch, so don't put anything essential in a tooltip.",
    "Escape, blur, pointer down and leaving the trigger all close it; you can move the pointer onto the tooltip without it closing.",
    "Flips to the opposite side and shifts along the edge to stay on screen, and isn't clipped by overflow-hidden ancestors.",
  ],
};
