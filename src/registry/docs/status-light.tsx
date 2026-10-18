import type { ComponentDoc } from "../types";
import StatusLightDemo from "../examples/status-light/demo";
import StatusLightPanel from "../examples/status-light/panel";
import StatusLightStates from "../examples/status-light/states";
import StatusLightLive from "../examples/status-light/live";

export const doc: ComponentDoc = {
  usage: `import { StatusLight } from "@/components/ui/status-light"

<StatusLight state="standby" label="Nightly backups" />`,
  examples: [
    {
      name: "demo",
      title: "Status page",
      description:
        "StatusLightGroup lays out one row per service with the state word on the right. Healthy lights follow the neon color; warning stays amber and error red.",
      component: StatusLightDemo,
    },
    {
      name: "panel",
      title: "Equipment panel",
      description:
        "The panel variant is an LED in a turned metal bezel: a domed lens with a hot centre, bloom on the bezel's lip and light thrown onto the panel. Standby breathes, alert blinks.",
      component: StatusLightPanel,
    },
    {
      name: "states",
      title: "States, variants and sizes",
      description: "Six states, three variants, three sizes.",
      component: StatusLightStates,
    },
    {
      name: "live",
      title: "Live",
      description: "The pulse variant rings while lit, for anything happening right now.",
      component: StatusLightLive,
    },
  ],
  api: [
    {
      name: "StatusLight",
      props: [
        { prop: "state", type: '"off" | "on" | "standby" | "alert" | "warning" | "error"', default: '"on"', description: "Standby breathes slowly and alert blinks about twice a second. Off shows the unlit lens." },
        { prop: "variant", type: '"dot" | "pulse" | "panel"', default: '"dot"', description: "A bare lamp, a lamp with a ring that pulses while lit, or an LED in a bezel." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Dots of 6, 8 or 10px; panel bezels of 14, 18 or 24px." },
        { prop: "label", type: "ReactNode", description: "What the light belongs to. Without one the light is an image named by its state." },
        { prop: "description", type: "ReactNode", description: "A second line under the label." },
        { prop: "showState", type: "boolean", default: "false (true in a group)", description: "Prints the state word. When it's hidden, screen readers still hear it after the label." },
        { prop: "stateLabel", type: "string", description: 'The word for the state, like "Degraded" or "Live".' },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Tints on, standby and alert. Warning is always amber and error always red." },
      ],
    },
    {
      name: "StatusLightGroup",
      description: "A list with one row per light. Each child goes in its own list item.",
      props: [
        { prop: "variant", type: '"dot" | "pulse" | "panel"', description: "Default variant for the lights inside." },
        { prop: "size", type: '"sm" | "md" | "lg"', description: "Default size for the lights inside." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Tints on, standby and alert lights that don't set their own color." },
      ],
    },
  ],
  notes: [
    "Color is never the only signal: a labelled light reads its state word after the label, and an unlabelled one is an image named by its state.",
    "Name an unlabelled light with aria-label when the state word alone doesn't say enough, like \"Port 2, traffic\".",
    "With reduced motion, standby holds at a steady glow, alert stays lit and the pulse ring is hidden.",
  ],
};
