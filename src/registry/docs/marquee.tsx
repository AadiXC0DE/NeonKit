import type { ComponentDoc } from "../types";
import MarqueeDemo from "../examples/marquee/demo";
import MarqueeLogos from "../examples/marquee/logos";
import MarqueeVertical from "../examples/marquee/vertical";
import MarqueePauseControl from "../examples/marquee/pause-control";

export const doc: ComponentDoc = {
  usage: `import { Marquee } from "@/components/ui/marquee"

<Marquee speed={40} gap={32}>
  <span>Open late</span>
  <span>Karaoke</span>
  <span>Noodles</span>
</Marquee>`,
  examples: [
    {
      name: "demo",
      title: "Sign strip",
      description: "Two rows running in opposite directions at different speeds. Hover to ease them to a stop.",
      component: MarqueeDemo,
    },
    {
      name: "logos",
      title: "Logo wall",
      description: "A longer fade lets names drift in and out of the dark.",
      component: MarqueeLogos,
    },
    {
      name: "vertical",
      title: "Vertical",
      description: "A vertical marquee needs a height.",
      component: MarqueeVertical,
    },
    {
      name: "pause-control",
      title: "Pause button",
      description: "For content that keeps moving, give people a visible way to stop it with paused.",
      component: MarqueePauseControl,
    },
  ],
  api: [
    {
      name: "Marquee",
      description: "Also accepts div attributes, and the ref points at the outer element. Children are the items in one run.",
      props: [
        { prop: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Scroll sideways, or up and down." },
        { prop: "reverse", type: "boolean", default: "false", description: "Run left to right (or downward) instead." },
        { prop: "speed", type: "number", default: "40", description: "Speed in pixels per second. 0 holds it still." },
        { prop: "gap", type: "number | string", default: "32", description: "Space between items and between copies. A number is pixels." },
        { prop: "pauseOnHover", type: "boolean", default: "true", description: "Ease to a stop while the pointer is over it." },
        { prop: "paused", type: "boolean", default: "false", description: "Hold it still, for a visible pause button." },
        { prop: "fade", type: "boolean | number", default: "true", description: "Fade the leading and trailing edges. A number sets the fade length in pixels (default 48)." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Sets --neon for glowing content inside." },
      ],
    },
  ],
  notes: [
    "The loop is made of copies, but only one is exposed: the others are aria-hidden and inert, so screen readers read each item once and Tab visits each link once.",
    "Keyboard focus inside stops it at once, and if the focused item had drifted out of view or under a fade, the row glides it to the middle.",
    "Hover eases the row to a stop instead of freezing it mid-frame, and leaving eases it back up.",
    "With reduced motion there's no animation and no copies: the row becomes an ordinary scrollable strip.",
    "Moving content that runs for more than five seconds needs a way to pause it (WCAG 2.2.2). Hover and focus cover pointer and keyboard users; for long-running marquees, add a button wired to paused.",
    "The edges clip, so give items that glow some vertical padding. Avoid ids inside: the hidden copies repeat them.",
  ],
};
