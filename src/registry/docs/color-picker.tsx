import type { ComponentDoc } from "../types";
import ColorPickerDemo from "../examples/color-picker/demo";
import ColorPickerLabelColors from "../examples/color-picker/label-colors";
import ColorPickerInAForm from "../examples/color-picker/in-a-form";

export const doc: ComponentDoc = {
  usage: `import { ColorPicker } from "@/components/ui/color-picker"

<ColorPicker label="Brand neon" defaultValue="#ff5fa2" onValueChange={(hex) => console.log(hex)} />`,
  examples: [
    {
      name: "demo",
      title: "Brand neon",
      description:
        "Turn the hue knob, tune saturation and lightness, or pick a gel. Anything that takes a NeonColor accepts the hex directly.",
      component: ColorPickerDemo,
    },
    {
      name: "label-colors",
      title: "Custom swatches",
      description: "Pass your own gels with labels, and hide the hex field for a compact picker.",
      component: ColorPickerLabelColors,
    },
    {
      name: "in-a-form",
      title: "In a form",
      description: "Give it a name and the hex submits with the form through a hidden input.",
      component: ColorPickerInAForm,
    },
  ],
  api: [
    {
      name: "ColorPicker",
      description:
        "Also accepts native div attributes. The ref, className and style go to the panel.",
      props: [
        { prop: "value", type: "string", description: "Controlled hex color, like \"#22d3ee\". Three-digit hex works too." },
        { prop: "defaultValue", type: "string", default: '"#22d3ee"', description: "Initial color when uncontrolled." },
        { prop: "onValueChange", type: "(hex: string) => void", description: "Called with a lowercase six-digit hex while dragging, and on every pick." },
        {
          prop: "swatches",
          type: "(NeonColor | { value: NeonColor; label?: string })[]",
          default: "the neon palette",
          description: "Gel presets as palette names or hex strings. Labels name them for screen readers and tooltips.",
        },
        { prop: "showInput", type: "boolean", default: "true", description: "Show the hex field." },
        {
          prop: "eyeDropper",
          type: "boolean",
          default: "true",
          description: "Offer the screen color sampler. Only shown where the browser supports window.EyeDropper.",
        },
        { prop: "label", type: "ReactNode", description: "Visible label above the panel. Names the group." },
        { prop: "name", type: "string", description: "Submits the hex value with a surrounding form." },
        { prop: "disabled", type: "boolean", default: "false", description: "Dims the panel and ignores input." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Knob, strips, gels and field scale together." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Accent for focus rings and the hex field, not the picked color." },
        { prop: "containerClassName", type: "string", description: "Classes for the outer block with the label and panel." },
      ],
    },
  ],
  notes: [
    "The hue knob and the saturation and lightness strips are each a role=\"slider\". Arrow keys step by 1, Shift by 10, Home and End jump to the ends.",
    "Drag around the knob to point it at a hue, or scroll on it.",
    "Gels form a radio group with one tab stop. Arrow keys move through them and select as they go.",
    "The hex field applies six digits as you type and three on Enter or blur. Invalid input shows a message; Escape restores the current color.",
    "The preview tube is decorative and hidden from assistive tech; the value is in the hex field and the sliders.",
  ],
};
