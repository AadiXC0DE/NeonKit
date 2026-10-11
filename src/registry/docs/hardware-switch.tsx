import type { ComponentDoc } from "../types";
import HardwareSwitchDemo from "../examples/hardware-switch/demo";
import HardwareSwitchVariants from "../examples/hardware-switch/variants";
import HardwareSwitchForm from "../examples/hardware-switch/form";
import HardwareSwitchSizes from "../examples/hardware-switch/sizes";

export const doc: ComponentDoc = {
  usage: `import { HardwareSwitch } from "@/components/ui/hardware-switch"

<HardwareSwitch variant="flip" label="Arm" />`,
  examples: [
    {
      name: "demo",
      title: "Cockpit toggle bank",
      description:
        "Guarded toggles feed a DC bus. Switch on the fuel pump and the key unlocks; turn it to start the engine.",
      component: HardwareSwitchDemo,
    },
    {
      name: "variants",
      title: "Variants",
      description:
        "rocker lights its I. flip lifts a hinged guard, then throws the lever; turning off reverses the order. key turns a quarter turn and lights the ring around the lock.",
      component: HardwareSwitchVariants,
    },
    {
      name: "form",
      title: "In a form",
      description: "With a name, each switch submits value (\"on\" by default) only while it is on, like a checkbox.",
      component: HardwareSwitchForm,
    },
    {
      name: "sizes",
      title: "Sizes, colors and disabled",
      description: "The hardware is drawn in em, so size scales every part together.",
      component: HardwareSwitchSizes,
    },
  ],
  api: [
    {
      name: "HardwareSwitch",
      description:
        "className and style go on the outer element. The ref and every other button attribute go on the button, which has role=\"switch\".",
      props: [
        { prop: "variant", type: '"rocker" | "flip" | "key"', default: '"rocker"', description: "A lit I/O rocker, a toggle under a safety guard, or a key switch." },
        { prop: "checked", type: "boolean", description: "Controlled state." },
        { prop: "defaultChecked", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onCheckedChange", type: "(checked: boolean) => void", description: "Called with the new state on every flip." },
        { prop: "label", type: "ReactNode", description: "Engraved legend under the switch. Names it, and clicking it flips the switch." },
        { prop: "name", type: "string", description: "Submits value under this name while on, through a hidden checkbox." },
        { prop: "value", type: "string", default: '"on"', description: "Value submitted while on." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex for the lamp, guard tint and ring." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Scales the hardware: 12, 16 or 20px to the em." },
        { prop: "disabled", type: "boolean", default: "false", description: "Locks the switch and keeps its lamp dark." },
      ],
    },
  ],
  notes: [
    "Renders a native button with role=\"switch\" and aria-checked, so Space and Enter flip it.",
    "A visible label names the switch through aria-labelledby; without one, pass aria-label.",
    "The guard and lever, the key and the rocker all move with transforms only, and stand still under reduced motion.",
  ],
};
