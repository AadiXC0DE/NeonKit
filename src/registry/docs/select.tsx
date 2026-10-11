import type { ComponentDoc } from "../types";
import SelectDemo from "../examples/select/demo";
import SelectDeployBranch from "../examples/select/deploy-branch";
import SelectSizes from "../examples/select/sizes";
import SelectStates from "../examples/select/states";

export const doc: ComponentDoc = {
  usage: `import { Select } from "@/components/ui/select"

<Select
  label="Region"
  defaultValue="fra1"
  options={[
    { value: "fra1", label: "Frankfurt" },
    { value: "iad1", label: "Washington, D.C." },
  ]}
/>`,
  examples: [
    {
      name: "demo",
      title: "Region picker",
      description: "Options can carry a second line. Disabled options are skipped by the keyboard.",
      component: SelectDemo,
    },
    {
      name: "deploy-branch",
      title: "In a form",
      description: "Give it a name and the value submits with the form through a hidden input.",
      component: SelectDeployBranch,
    },
    { name: "sizes", title: "Sizes", component: SelectSizes },
    { name: "states", title: "Error and disabled", component: SelectStates },
  ],
  api: [
    {
      name: "Select",
      description:
        "Also accepts native button attributes, and the ref points at the trigger. className and style go to the trigger.",
      props: [
        { prop: "options", type: "SelectOption[]", description: "The choices, in order." },
        { prop: "value", type: "string", description: "Controlled value." },
        { prop: "defaultValue", type: "string", description: "Initial value when uncontrolled." },
        { prop: "onValueChange", type: "(value: string) => void", description: "Called when the user picks a different option." },
        { prop: "placeholder", type: "ReactNode", default: '"Select…"', description: "Shown while nothing is selected." },
        { prop: "name", type: "string", description: "Submits the value with a surrounding form." },
        { prop: "label", type: "ReactNode", description: "Visible label. Names both the trigger and the list." },
        { prop: "description", type: "ReactNode", description: "Helper text under the trigger." },
        {
          prop: "error",
          type: "ReactNode",
          description: "Red invalid state and message. Replaces description. Pass true for the state without a message.",
        },
        { prop: "disabled", type: "boolean", default: "false", description: "Blocks opening and leaves the value out of form data." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Trigger height and option padding." },
        { prop: "containerClassName", type: "string", description: "Classes for the outer block with the label, list and message." },
      ],
    },
    {
      name: "SelectOption",
      props: [
        { prop: "value", type: "string", description: "Unique value, also the React key." },
        { prop: "label", type: "string", description: "Shown in the list and the trigger. Typeahead matches against it." },
        { prop: "description", type: "string", description: "Second line, shown in the list only." },
        { prop: "icon", type: "ReactNode", description: "Shown before the label in the list and the trigger." },
        { prop: "disabled", type: "boolean", default: "false", description: "Visible but can't be picked." },
      ],
    },
  ],
  notes: [
    "Follows the WAI-ARIA select-only combobox pattern: focus stays on the trigger and aria-activedescendant tracks the highlighted option.",
    "Enter, Space and the arrow keys open the list. Arrows move, Home and End jump, Enter or Space picks, Escape and Tab close.",
    "Typing letters jumps to the first matching option. Pressing the same letter again cycles through matches.",
    "Without a visible label, pass aria-label. It names both the trigger and the list.",
    "The list renders in a portal, flips above the trigger near the bottom of the screen and is never clipped by overflow-hidden ancestors.",
  ],
};
