import type { ComponentDoc } from "../types";
import SwitchDemo from "../examples/switch/demo";
import SwitchSizes from "../examples/switch/sizes";
import SwitchColors from "../examples/switch/colors";
import SwitchControlled from "../examples/switch/controlled";

export const doc: ComponentDoc = {
  usage: `import { Switch } from "@/components/ui/switch"

<Switch label="Airplane mode" />`,
  examples: [
    {
      name: "demo",
      title: "Settings list",
      description: "Turning a switch on strikes the track like a neon tube before it settles.",
      component: SwitchDemo,
    },
    { name: "sizes", title: "Sizes", component: SwitchSizes },
    {
      name: "colors",
      title: "Colors",
      description: "Pass a palette name or any hex value to color.",
      component: SwitchColors,
    },
    {
      name: "controlled",
      title: "Controlled",
      description: "Pair checked with onCheckedChange to drive other UI from the state.",
      component: SwitchControlled,
    },
  ],
  api: [
    {
      name: "Switch",
      description:
        "Renders a button with role=\"switch\" and accepts its attributes; the ref points at the button. With a label, className and style go to the wrapper around both.",
      props: [
        { prop: "checked", type: "boolean", description: "Controlled on state." },
        { prop: "defaultChecked", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onCheckedChange", type: "(checked: boolean) => void", description: "Called with the new state on every toggle." },
        { prop: "label", type: "ReactNode", description: "Clickable label after the switch, linked with aria-labelledby." },
        { prop: "name", type: "string", description: "Renders a hidden input so the switch submits with a form when on." },
        { prop: "value", type: "string", default: '"on"', description: "Value submitted under name." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Track of 28, 36 or 44px wide." },
        { prop: "disabled", type: "boolean", default: "false", description: "Blocks interaction and dims the switch." },
      ],
    },
  ],
  notes: [
    "The track has an invisible target at least 44px tall, so the small switch is still easy to tap.",
    "With name, a form reset puts the switch back to where it started.",
    "Space and Enter toggle the switch, and aria-checked reports its state.",
    "Without a label, pass an aria-label or point a label element at the switch id.",
    "The power-on flicker is skipped when the user prefers reduced motion, and never plays for switches that are already on when they mount.",
  ],
};
