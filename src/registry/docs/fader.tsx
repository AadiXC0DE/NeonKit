import type { ComponentDoc } from "../types";
import FaderDemo from "../examples/fader/demo";
import FaderEqualizer from "../examples/fader/equalizer";
import FaderHorizontal from "../examples/fader/horizontal";
import FaderColors from "../examples/fader/colors";

export const doc: ComponentDoc = {
  usage: `import { Fader } from "@/components/ui/fader"

<Fader label="Vox" defaultValue={70} level={0.6} />`,
  examples: [
    {
      name: "demo",
      title: "Mixing desk",
      description:
        "Six channels and a main bus. Each fader runs −60 to +10 dB on a printed scale, and level drives the LED meter beside it from a fake 120 BPM groove. Double-click a cap to return it to 0 dB.",
      component: FaderDemo,
    },
    {
      name: "equalizer",
      title: "Graphic EQ",
      description: "Ticks with a null label print the line without a number. Controlled values let presets move every band at once.",
      component: FaderEqualizer,
    },
    {
      name: "horizontal",
      title: "Crossfader",
      description: 'orientation="horizontal" lays the strip on its side; the scale prints below and the meter, if any, above.',
      component: FaderHorizontal,
    },
    {
      name: "colors",
      title: "Sizes, colors and disabled",
      description: "The meter's top segments stay amber and red whatever the color.",
      component: FaderColors,
    },
  ],
  api: [
    {
      name: "Fader",
      description:
        "className and style go on the outer element, where a height (or a width when horizontal) sets the travel. The ref and every other span attribute go on the cap, which has role=\"slider\".",
      props: [
        { prop: "value", type: "number", description: "Controlled value." },
        { prop: "defaultValue", type: "number", default: "min", description: "Initial value when uncontrolled, and where a double-click on the cap returns to." },
        { prop: "onValueChange", type: "(value: number) => void", description: "Called on every change while dragging or pressing keys." },
        { prop: "onValueCommit", type: "(value: number) => void", description: "Called once the cap is let go or a key is released." },
        { prop: "min", type: "number", default: "0", description: "Lowest value." },
        { prop: "max", type: "number", default: "100", description: "Highest value." },
        { prop: "step", type: "number", default: "1", description: "Values snap to multiples of step from min." },
        { prop: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Direction of travel. Up and right increase the value." },
        { prop: "ticks", type: "number | (number | { value: number; label?: ReactNode | null })[]", default: "11", description: "A count of evenly spaced marks, or exact marks. A null or empty label prints the line only; 0 hides the scale." },
        { prop: "level", type: "number", description: "Signal from 0 to 1. Shows an LED meter beside the track when set." },
        { prop: "label", type: "ReactNode", description: "Engraved legend under the strip. Names the slider unless aria-label is set." },
        { prop: "showValue", type: "boolean", default: "false", description: "Prints the formatted value under the label." },
        { prop: "formatValue", type: "(value: number) => string", description: "Formats the printed value and aria-valuetext." },
        { prop: "name", type: "string", description: "Submits the value with a form through a hidden input." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Lights the cap's line and the meter's lower segments." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Scales the cap, slot, scale and meter." },
        { prop: "disabled", type: "boolean", default: "false", description: "Darkens the line and meter, blocks input and removes the cap from the tab order." },
      ],
    },
  ],
  notes: [
    "The cap has role=\"slider\" with aria-orientation, aria-valuemin, aria-valuemax, aria-valuenow, and aria-valuetext when formatValue is set.",
    "Arrow keys move by one step, Shift+Arrow and Page Up/Down by a tenth of the range, Home and End jump to the ends.",
    "Grabbing the cap never makes it jump; pressing the slot glides the cap there and keeps dragging. Hold Shift while dragging for fine control.",
    "The LED meter is decorative and hidden from screen readers. Announce levels elsewhere if they matter.",
  ],
};
