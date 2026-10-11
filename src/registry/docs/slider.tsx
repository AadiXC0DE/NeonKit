import type { ComponentDoc } from "../types";
import SliderDemo from "../examples/slider/demo";
import SliderPriceRange from "../examples/slider/price-range";
import SliderSteps from "../examples/slider/steps";
import SliderColors from "../examples/slider/colors";

export const doc: ComponentDoc = {
  usage: `import { Slider } from "@/components/ui/slider"

<Slider defaultValue={[64]} aria-label="Volume" />`,
  examples: [
    {
      name: "demo",
      title: "Volume",
      description: "showValue=\"hover\" reveals the value while hovering, dragging or focused.",
      component: SliderDemo,
    },
    {
      name: "price-range",
      title: "Range",
      description: "Pass two values for two thumbs. They stop at each other instead of crossing.",
      component: SliderPriceRange,
    },
    {
      name: "steps",
      title: "Named steps",
      description: "Map a small integer range to labels with formatValue, which is also what screen readers hear.",
      component: SliderSteps,
    },
    {
      name: "colors",
      title: "Colors",
      description: "Pass a palette name or any hex value to color.",
      component: SliderColors,
    },
  ],
  api: [
    {
      name: "Slider",
      description: "Accepts every div attribute; the ref points at the root.",
      props: [
        { prop: "value", type: "number[]", description: "Controlled values. One number for a single thumb, two for a range." },
        { prop: "defaultValue", type: "number[]", default: "[min]", description: "Initial values when uncontrolled." },
        { prop: "onValueChange", type: "(value: number[]) => void", description: "Called on every change while dragging or pressing keys." },
        { prop: "onValueCommit", type: "(value: number[]) => void", description: "Called once when the pointer or key is released." },
        { prop: "min", type: "number", default: "0", description: "Lowest value." },
        { prop: "max", type: "number", default: "100", description: "Highest value." },
        { prop: "step", type: "number", default: "1", description: "Values snap to multiples of step from min." },
        { prop: "showValue", type: 'boolean | "hover"', default: "false", description: "Value bubble above each thumb, always or only on hover, drag and focus." },
        { prop: "formatValue", type: "(value: number) => string", description: "Formats the bubble and aria-valuetext." },
        { prop: "thumbLabels", type: "string[]", description: 'Accessible name per thumb. Ranges default to "Minimum" and "Maximum".' },
        { prop: "name", type: "string", description: "Submits the values with a form, as name[] for ranges." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Track of 4, 6 or 8px high." },
        { prop: "disabled", type: "boolean", default: "false", description: "Blocks interaction and removes thumbs from the tab order." },
      ],
    },
  ],
  notes: [
    "Each thumb has role=\"slider\" with aria-valuemin, aria-valuemax and aria-valuenow.",
    "Arrow keys move by one step, Shift+Arrow and Page Up/Down by ten, Home and End jump to the ends.",
    "A single slider takes its name from aria-label or aria-labelledby; a range uses them to label the group and thumbLabels to name each thumb.",
    "Pressing the track jumps the nearest thumb there and keeps dragging; grabbing a thumb never makes it jump.",
  ],
};
