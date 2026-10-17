import type { ComponentDoc } from "../types";
import HoldButtonDemo from "../examples/hold-button/demo";
import HoldButtonDestructive from "../examples/hold-button/destructive";
import HoldButtonEvents from "../examples/hold-button/events";
import HoldButtonDurations from "../examples/hold-button/durations";

export const doc: ComponentDoc = {
  usage: `import { HoldButton } from "@/components/ui/hold-button"

<HoldButton completeLabel="Promoted" onComplete={promote}>Hold to promote</HoldButton>`,
  examples: [
    {
      name: "demo",
      title: "Promote to production",
      description: "Hold it: lit gas pushes through the tube behind a hot leading edge and the halo builds. Let go early and it drains; hold to the end and it flashes.",
      component: HoldButtonDemo,
    },
    {
      name: "destructive",
      title: "Destructive",
      description: "A longer hold for a bigger consequence. resetDelay={Infinity} keeps it confirmed.",
      component: HoldButtonDestructive,
    },
    {
      name: "events",
      title: "Hold events",
      description: "onHoldStart, onHoldCancel (with how far it got) and onComplete. Keyboard: focus it and hold Space or Enter.",
      component: HoldButtonEvents,
    },
    {
      name: "durations",
      title: "Durations",
      description: "Match the hold to the weight of the action.",
      component: HoldButtonDurations,
    },
  ],
  api: [
    {
      name: "HoldButton",
      description: "Also accepts every native button attribute. The ref points at the button.",
      props: [
        { prop: "duration", type: "number", default: "1500", description: "Milliseconds of holding to confirm." },
        { prop: "onComplete", type: "() => void", description: "Fires once when the tube fills." },
        { prop: "onHoldStart", type: "() => void", description: "Fires when a hold begins: pointer down, or Space/Enter down." },
        { prop: "onHoldCancel", type: "(progress: number) => void", description: "Fires when a hold is released early, with how full the tube got (0 to 1)." },
        { prop: "completeLabel", type: "ReactNode", description: "Replaces the label once confirmed. A string is also announced to screen readers." },
        { prop: "resetDelay", type: "number", default: "1200", description: "Milliseconds the tube stays lit after release before it drains and re-arms. Infinity keeps it confirmed." },
        { prop: "hint", type: "string", default: '"Press and hold to confirm."', description: "Instructions linked with aria-describedby. Pass an empty string to drop it." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "32, 40 or 48px tall, like Button." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "disabled", type: "boolean", default: "false", description: "Dims the button and ignores holds." },
      ],
    },
  ],
  notes: [
    "Keyboard: hold Space or Enter. Releasing early, pressing Escape or moving focus away drains the tube.",
    "Sliding the pointer well off the button lets go, like a native press. Touch scrolling cancels a hold too.",
    "After a confirm the tube has to drain before it re-arms, so a quick second press can't confirm twice.",
    "A click alone never confirms. Some assistive tech sends clicks instead of key holds, so for destructive actions keep another path such as a confirmation dialog or an undo.",
    "Under prefers-reduced-motion the fill still tracks the hold (it is information); the flash and burst ring are skipped.",
  ],
};
