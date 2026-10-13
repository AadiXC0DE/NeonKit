import type { ComponentDoc } from "../types";
import CheckboxDemo from "../examples/checkbox/demo";
import CheckboxSelectAll from "../examples/checkbox/select-all";
import CheckboxSizes from "../examples/checkbox/sizes";
import CheckboxColors from "../examples/checkbox/colors";
import CheckboxDisabled from "../examples/checkbox/disabled";

export const doc: ComponentDoc = {
  usage: `import { Checkbox } from "@/components/ui/checkbox"

<Checkbox label="Accept terms and conditions" />`,
  examples: [
    { name: "demo", title: "With description", component: CheckboxDemo },
    {
      name: "select-all",
      title: "Select all",
      description: "indeterminate shows a dash on the parent while only some children are checked.",
      component: CheckboxSelectAll,
    },
    { name: "sizes", title: "Sizes", component: CheckboxSizes },
    {
      name: "colors",
      title: "Colors",
      description: "Pass a palette name or any hex value to color.",
      component: CheckboxColors,
    },
    { name: "disabled", title: "Disabled", component: CheckboxDisabled },
  ],
  api: [
    {
      name: "Checkbox",
      description:
        "Renders a native checkbox input. className and style go to the outer label; every other native input attribute goes to the input, which also receives the ref.",
      props: [
        { prop: "checked", type: "boolean", description: "Controlled checked state." },
        { prop: "defaultChecked", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onCheckedChange", type: "(checked: boolean) => void", description: "Called with the new state on every toggle." },
        { prop: "indeterminate", type: "boolean", default: "false", description: "Shows a dash and reports a mixed state. Takes priority over checked visually." },
        { prop: "label", type: "ReactNode", description: "Text beside the box. Clicking anywhere on the row toggles it." },
        { prop: "description", type: "ReactNode", description: "Secondary text under the label, linked with aria-describedby." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Box of 16, 20 or 24px with matching text." },
        { prop: "disabled", type: "boolean", default: "false", description: "Blocks interaction and dims the row." },
      ],
    },
  ],
  notes: [
    "A form reset puts the box back to where it started and calls onCheckedChange, so a controlled parent stays in sync.",
    "The native input reaches 6px past the box, so a bare checkbox in a dense table is easier to hit.",
    "It is a real input, so Space toggles it, forms submit it and name, value and required work as usual.",
    "The label is wired with aria-labelledby, so the description is announced as a description rather than as part of the name.",
    "Indeterminate sets the native indeterminate property, which screen readers announce as mixed.",
    "Without a label, pass an aria-label.",
  ],
};
