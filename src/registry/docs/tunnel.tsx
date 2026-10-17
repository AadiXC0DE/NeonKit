import type { ComponentDoc } from "../types";
import TunnelDemo from "../examples/tunnel/demo";
import TunnelSquare from "../examples/tunnel/square";
import TunnelNotFound from "../examples/tunnel/not-found";
import TunnelColors from "../examples/tunnel/colors";

export const doc: ComponentDoc = {
  usage: `import { Tunnel } from "@/components/ui/tunnel"

<section className="relative overflow-hidden bg-[#05060a]">
  <Tunnel />
  <h1 className="relative">Lap one starts at 19:00 UTC</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "Tunnel",
      description: "Rings of neon rush toward you down a winding tube. Rails join the rings so the bends read as one shape, and every eighth ring burns brighter so the speed shows.",
      component: TunnelDemo,
    },
    {
      name: "square",
      title: "Corridor",
      description: 'shape="square" draws frames in the box\'s proportions, joined at the corners.',
      component: TunnelSquare,
    },
    {
      name: "not-found",
      title: "Straight and slow",
      description: "curve={0} keeps the far end centered; a low speed and intensity let it sit behind an error page.",
      component: TunnelNotFound,
    },
    {
      name: "colors",
      title: "Colors and shapes",
      description: "Set color per tunnel. White reads as a cold, clinical light.",
      component: TunnelColors,
    },
  ],
  api: [
    {
      name: "Tunnel",
      description: "Two canvases that fill the nearest positioned parent: soft halos at half resolution and crisp tubes at the device ratio. Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Tube color. Brighter gates burn whiter." },
        { prop: "shape", type: '"circle" | "square"', default: '"circle"', description: "Round rings, or rectangular frames shaped like a corridor." },
        { prop: "rings", type: "number", default: "22", description: "Rings in view at once." },
        { prop: "curve", type: "number", default: "0.5", description: "How far the tunnel winds, 0 (straight) to 1." },
        { prop: "speed", type: "number", default: "1", description: "Speed multiplier. 0 holds still." },
        { prop: "intensity", type: "number", default: "0.85", description: "Brightness of the tubes, 0 to 1." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none.",
    "The camera follows the tunnel's own heading, so only the curvature ahead shows and the nearest rings stay centered.",
    "It pauses offscreen and in hidden tabs, and draws one still frame under prefers-reduced-motion.",
  ],
};
