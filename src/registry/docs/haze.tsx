import type { ComponentDoc } from "../types";
import HazeDemo from "../examples/haze/demo";
import HazeSideLight from "../examples/haze/side-light";
import HazeSignIn from "../examples/haze/sign-in";
import HazeLayered from "../examples/haze/layered";

export const doc: ComponentDoc = {
  usage: `import { Haze } from "@/components/ui/haze"

<section className="relative overflow-hidden bg-[#05060a]">
  <Haze light="bottom" />
  <h1 className="relative">Every cue, on the frame</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "Lit from below",
      description: "Three layers of smoke drift and rise at different speeds and scales, lit by a light just below the frame: whiter and thicker near it, the plain color and thin further off.",
      component: HazeDemo,
    },
    {
      name: "side-light",
      title: "Side light",
      description: 'light="left" or "right" rakes the smoke from the side and leaves the far half dark for copy.',
      component: HazeSideLight,
    },
    {
      name: "sign-in",
      title: "From above",
      description: 'light="top" with thick, dim smoke gives a quiet room for a form.',
      component: HazeSignIn,
    },
    {
      name: "layered",
      title: "Under Lasers",
      description: "Stack it under Lasers or Light Rays, and the beams sit in a room rather than on a flat background.",
      component: HazeLayered,
    },
  ],
  api: [
    {
      name: "Haze",
      description: "One canvas at half resolution that fills the nearest positioned parent. Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the light in the smoke. Near the source it runs whiter." },
        { prop: "light", type: '"bottom" | "left" | "right" | "top"', default: '"bottom"', description: "Which edge the light comes from." },
        { prop: "density", type: "number", default: "0.6", description: "How thick the smoke is, 0 to 1." },
        { prop: "intensity", type: "number", default: "0.85", description: "Brightness of the light, 0 to 1." },
        { prop: "speed", type: "number", default: "1", description: "Speed multiplier for the drift. 0 holds still." },
        { prop: "seed", type: "number", default: "1", description: "Same seed, same smoke." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none.",
    "The smoke is one seamless noise tile, built once per seed and shared by every instance. Each frame only slides three copies of it and lights them with a gradient: no blur filters.",
    "It pauses offscreen and in hidden tabs, and draws one still frame under prefers-reduced-motion.",
  ],
};
