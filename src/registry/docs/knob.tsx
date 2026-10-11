import type { ComponentDoc } from "../types";
import KnobDemo from "../examples/knob/demo";
import KnobDetents from "../examples/knob/detents";
import KnobForm from "../examples/knob/form";
import KnobSizes from "../examples/knob/sizes";

export const doc: ComponentDoc = {
  usage: `import { Knob } from "@/components/ui/knob"

<Knob label="Cutoff" defaultValue={62} />`,
  examples: [
    {
      name: "demo",
      title: "Synth panel",
      description:
        "Drag up and down, scroll, or use the keys. formatValue maps the 0–100 travel onto hertz and milliseconds, and the bipolar Env amt knob lights from its center detent.",
      component: KnobDemo,
    },
    {
      name: "detents",
      title: "Detents and steps",
      description:
        "Detents catch the cap while you drag or scroll, with a small spring as it lands. A knob with a dozen steps or fewer prints a mark at each one; arc narrows the sweep.",
      component: KnobDetents,
    },
    {
      name: "form",
      title: "In a form",
      description: "Each knob with a name submits its value through a hidden input. Double-click returns a knob to its defaultValue.",
      component: KnobForm,
    },
    {
      name: "sizes",
      title: "Sizes, colors and disabled",
      description: "Three sizes share one drawing. Disabled knobs go dark and leave the tab order.",
      component: KnobSizes,
    },
  ],
  api: [
    {
      name: "Knob",
      description:
        "className and style go on the outer element. The ref and every other div attribute go on the dial, which has role=\"slider\".",
      props: [
        { prop: "value", type: "number", description: "Controlled value." },
        { prop: "defaultValue", type: "number", default: "min", description: "Initial value when uncontrolled, and where a double-click returns to." },
        { prop: "onValueChange", type: "(value: number) => void", description: "Called on every change while dragging, scrolling or pressing keys." },
        { prop: "onValueCommit", type: "(value: number) => void", description: "Called once a drag, key press or scroll gesture ends." },
        { prop: "min", type: "number", default: "0", description: "Lowest value. When min is below zero and max above it, the ring lights outward from zero." },
        { prop: "max", type: "number", default: "100", description: "Highest value." },
        { prop: "step", type: "number", default: "1", description: "Values snap to multiples of step from min." },
        { prop: "detents", type: "number[]", description: "Values the cap clicks into while dragging or scrolling, within 3% of the range." },
        { prop: "arc", type: "number", default: "270", description: "Degrees of rotation from min to max, between 30 and 340." },
        { prop: "label", type: "ReactNode", description: "Engraved legend under the dial. Names the slider unless aria-label is set." },
        { prop: "showValue", type: "boolean", default: "false", description: "Prints the formatted value under the label." },
        { prop: "formatValue", type: "(value: number) => string", description: "Formats the printed value and aria-valuetext." },
        { prop: "name", type: "string", description: "Submits the value with a form through a hidden input." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Dial of 56, 80 or 112px." },
        { prop: "disabled", type: "boolean", default: "false", description: "Darkens the ring, blocks input and removes the dial from the tab order." },
      ],
    },
  ],
  notes: [
    "The dial has role=\"slider\" with aria-valuemin, aria-valuemax, aria-valuenow, and aria-valuetext when formatValue is set.",
    "Arrow keys move by one step, Shift+Arrow and Page Up/Down by a tenth of the range, Home and End jump to the ends.",
    "Drag vertically to turn it; hold Shift for fine control or Alt for coarse.",
    "The wheel turns the knob only when the scroll starts over it, so a page scroll passing across a knob keeps scrolling the page.",
    "A visible label names the slider through aria-labelledby; pass aria-label when the legend is an abbreviation, like A, D, S and R.",
  ],
};
