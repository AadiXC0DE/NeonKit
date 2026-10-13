import type { ComponentDoc } from "../types";
import RadioGroupDemo from "../examples/radio-group/demo";
import RadioGroupPlanPicker from "../examples/radio-group/plan-picker";
import RadioGroupHorizontal from "../examples/radio-group/horizontal";
import RadioGroupDisabled from "../examples/radio-group/disabled";

export const doc: ComponentDoc = {
  usage: `import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

<RadioGroup defaultValue="express" aria-label="Shipping speed">
  <RadioGroupItem value="standard" label="Standard" />
  <RadioGroupItem value="express" label="Express" />
</RadioGroup>`,
  examples: [
    { name: "demo", title: "With descriptions", component: RadioGroupDemo },
    {
      name: "plan-picker",
      title: "Card variant",
      description: "variant=\"card\" turns each option into a tile. icon sits above the label and children render below it.",
      component: RadioGroupPlanPicker,
    },
    { name: "horizontal", title: "Horizontal", component: RadioGroupHorizontal },
    {
      name: "disabled",
      title: "Disabled option",
      description: "Disabled options are skipped by arrow keys.",
      component: RadioGroupDisabled,
    },
  ],
  api: [
    {
      name: "RadioGroup",
      description: "Renders a div with role=\"radiogroup\" and accepts its attributes.",
      props: [
        { prop: "value", type: "string", description: "Controlled selected value." },
        { prop: "defaultValue", type: "string", description: "Initial value when uncontrolled." },
        { prop: "onValueChange", type: "(value: string) => void", description: "Called when the selection changes." },
        { prop: "name", type: "string", default: "generated", description: "Shared name of the native radios. Set it to submit the value with a form." },
        { prop: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Stacks options or lays them out in a row (a responsive grid for cards)." },
        { prop: "variant", type: '"default" | "card"', default: '"default"', description: "Classic radios, or bordered tiles with a corner indicator." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Radio, text and card padding." },
        { prop: "disabled", type: "boolean", default: "false", description: "Disables every option." },
        { prop: "required", type: "boolean", default: "false", description: "Requires a selection before a form can submit." },
      ],
    },
    {
      name: "RadioGroupItem",
      description:
        "className and style go to the outer label; other native input attributes go to the radio input, which also receives the ref.",
      props: [
        { prop: "value", type: "string", description: "Value reported when this option is selected. Required." },
        { prop: "label", type: "ReactNode", description: "Option name, used as the accessible name." },
        { prop: "description", type: "ReactNode", description: "Secondary text, linked with aria-describedby." },
        { prop: "icon", type: "ReactNode", description: "Card variant only. Shown above the label and lit when selected." },
        { prop: "children", type: "ReactNode", description: "Extra content below the description, such as a price. Also announced as a description." },
        { prop: "disabled", type: "boolean", default: "false", description: "Disables this option only." },
      ],
    },
  ],
  notes: [
    "A form reset moves the selection back to where it started and calls onValueChange.",
    "Options are native radio inputs sharing one name, so the group is a single tab stop and arrow keys move and select.",
    "Give the group an accessible name with aria-label or aria-labelledby.",
    "Each label is wired with aria-labelledby, so descriptions and card content are read as descriptions, not as part of the name.",
  ],
};
