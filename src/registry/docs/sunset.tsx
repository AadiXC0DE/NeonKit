import type { ComponentDoc } from "../types";
import SunsetDemo from "../examples/sunset/demo";
import SunsetColors from "../examples/sunset/colors";
import SunsetSignup from "../examples/sunset/signup";
import SunsetAlone from "../examples/sunset/alone";

export const doc: ComponentDoc = {
  usage: `import { RetroGrid } from "@/components/ui/retro-grid"
import { Sunset } from "@/components/ui/sunset"

<section className="relative overflow-hidden bg-[#05060a]">
  <Sunset line={false} />
  <RetroGrid />
  <h1 className="relative">Midnight Drive, on tape Friday</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "With Retro Grid",
      description: "Put Sunset under a Retro Grid. Its horizon defaults to 0.5, the grid's line, and line={false} leaves that line to the grid. The sun sets behind two rim-lit ridges and its reflection runs down the floor.",
      component: SunsetDemo,
    },
    {
      name: "colors",
      title: "Colors",
      description: "The top of the sun is always near white; the color takes over toward the horizon, like a real low sun.",
      component: SunsetColors,
    },
    {
      name: "signup",
      title: "Without mountains",
      description: "mountains={false} and a low horizon leave the bare disc with its slits drifting down, widening as they go.",
      component: SunsetSignup,
    },
    {
      name: "alone",
      title: "On its own",
      description: "With its own horizon line and a shadow at the front for the copy.",
      component: SunsetAlone,
    },
  ],
  api: [
    {
      name: "Sunset",
      description: "A layer that fills the nearest positioned parent. The disc is a small canvas; sky, halo, mountains and horizon are static CSS and SVG. Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the sun's lower half, the ridges and the horizon." },
        { prop: "horizon", type: "number", default: "0.5", description: "Where the horizon sits, as a fraction of the height from the top. 0.5 lines up with Retro Grid." },
        { prop: "size", type: "number", default: "0.62", description: "Sun diameter as a fraction of the height, capped at 68% of the width." },
        { prop: "slits", type: "number", default: "7", description: "Slits cut across the lower half of the sun." },
        { prop: "speed", type: "number", default: "1", description: "Speed multiplier for the slits. 0 holds still." },
        { prop: "mountains", type: "boolean", default: "true", description: "Two ridges in front of the sun, the far one rim-lit." },
        { prop: "seed", type: "number", default: "3", description: "Same seed, same mountains. Generated without randomness, so server and client match." },
        { prop: "line", type: "boolean", default: "true", description: "The bright line along the horizon. Turn it off under a Retro Grid, which draws its own." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none.",
    "Slits are real cut-outs, so the halo and whatever is behind the layer show through them.",
    "Only the disc animates, and only while it's on screen and the tab is visible. Under prefers-reduced-motion the slits hold still.",
  ],
};
