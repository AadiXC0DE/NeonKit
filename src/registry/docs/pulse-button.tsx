import type { ComponentDoc } from "../types";
import PulseButtonDemo from "../examples/pulse-button/demo";
import PulseButtonAcknowledge from "../examples/pulse-button/acknowledge";
import PulseButtonIcon from "../examples/pulse-button/icon";
import PulseButtonVariants from "../examples/pulse-button/variants";
import PulseButtonRings from "../examples/pulse-button/rings";

export const doc: ComponentDoc = {
  usage: `import { PulseButton } from "@/components/ui/pulse-button"

<PulseButton pulse={!seen} onClick={() => setSeen(true)}>Join the call</PulseButton>`,
  examples: [
    {
      name: "demo",
      title: "Live session",
      description: "Rings ping outward from the edge, keeping the button's corner radius as they grow.",
      component: PulseButtonDemo,
    },
    {
      name: "acknowledge",
      title: "Stop once seen",
      description: "Turn pulse off after the user acts. The rings freeze where they are and fade out instead of vanishing.",
      component: PulseButtonAcknowledge,
    },
    {
      name: "icon",
      title: "Icon buttons",
      description: 'size="icon" is a round 40px button. A shorter period reads as more urgent.',
      component: PulseButtonIcon,
    },
    { name: "variants", title: "Variants", component: PulseButtonVariants },
    {
      name: "rings",
      title: "Rings and period",
      description: "Up to three rings in flight at once, spread evenly across the period.",
      component: PulseButtonRings,
    },
  ],
  api: [
    {
      name: "PulseButton",
      description: "Also accepts every native button attribute. The ref points at the button (or the asChild element).",
      props: [
        { prop: "pulse", type: "boolean", default: "true", description: "Rings keep pulsing while true. Disabled buttons never pulse." },
        { prop: "period", type: "number", default: "2.2", description: "Seconds per pulse." },
        { prop: "rings", type: "1 | 2 | 3", default: "2", description: "Rings in flight at once, staggered across the period." },
        { prop: "variant", type: '"solid" | "outline" | "soft"', default: '"solid"', description: "The same faces as Button." },
        { prop: "size", type: '"sm" | "md" | "lg" | "icon"', default: '"md"', description: "32, 40 or 48px tall like Button; icon is a 40px circle." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "asChild", type: "boolean", default: "false", description: "Render the child element (a link, say) with the pulse and merge props onto it." },
        { prop: "disabled", type: "boolean", default: "false", description: "Dims the button, blocks clicks and stops the pulse." },
      ],
    },
  ],
  notes: [
    "The pulse is purely visual. If it signals something new (unread messages, a live session), say so in the label or aria-label too.",
    "Pulse sparingly: one per screen, and switch it off once the user has responded.",
    "Under prefers-reduced-motion a single still ring stays around the button instead of the animation.",
  ],
};
