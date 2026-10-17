import type { ComponentDoc } from "../types";
import PowerButtonDemo from "../examples/power-button/demo";
import PowerButtonRack from "../examples/power-button/rack";
import PowerButtonSetting from "../examples/power-button/setting";
import PowerButtonSizes from "../examples/power-button/sizes";

export const doc: ComponentDoc = {
  usage: `import { PowerButton } from "@/components/ui/power-button"

<PowerButton pressed={on} onPressedChange={setOn} aria-label="Monitor power" />`,
  examples: [
    {
      name: "demo",
      title: "Illuminated power key",
      description: "Press it: the ring strikes and stutters like a real tube, the glyph catches once the ring holds, and the light reaches the panel last.",
      component: PowerButtonDemo,
    },
    {
      name: "rack",
      title: "Colors and glyphs",
      description: "Give each key its own color and swap the power glyph for any icon. It lights with the ring.",
      component: PowerButtonRack,
    },
    {
      name: "setting",
      title: "In a settings row",
      description: "Controlled, named by the row title with aria-labelledby.",
      component: PowerButtonSetting,
    },
    {
      name: "sizes",
      title: "Sizes",
      description: "sm, md and lg match Button's heights; xl is a 72px feature key.",
      component: PowerButtonSizes,
    },
  ],
  api: [
    {
      name: "PowerButton",
      description: "Also accepts native button attributes except children. The ref points at the button.",
      props: [
        { prop: "pressed", type: "boolean", description: "On or off, when controlled." },
        { prop: "defaultPressed", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onPressedChange", type: "(pressed: boolean) => void", description: "Called with the new state when the key is pressed." },
        { prop: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"md"', description: "Diameter: 32, 40, 48 or 72px." },
        { prop: "icon", type: "ReactNode", default: "power glyph", description: "Replaces the glyph on the cap. It inherits the tube color through currentColor and is drawn a step larger with a 2.25 stroke so it reads inside the cap." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "name", type: "string", description: "Submits value under this name while on, like a native checkbox." },
        { prop: "value", type: "string", default: '"on"', description: "Submitted with name while on." },
        { prop: "disabled", type: "boolean", default: "false", description: "Dims the key and blocks presses." },
      ],
    },
  ],
  notes: [
    "A toggle button: aria-pressed reflects the state, and Enter or Space toggles it.",
    'Without aria-label or aria-labelledby it is named "Power". Name it after what it powers when there is more than one.',
    "The ignition plays only when the key turns on; a key that is already on when it mounts stays steady.",
    "Under prefers-reduced-motion the ring fades on without flickering.",
  ],
};
