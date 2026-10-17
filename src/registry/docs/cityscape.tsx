import type { ComponentDoc } from "../types";
import CityscapeDemo from "../examples/cityscape/demo";
import CityscapeSigns from "../examples/cityscape/signs";
import CityscapeHours from "../examples/cityscape/hours";
import CityscapeSeeds from "../examples/cityscape/seeds";
import CityscapeFooter from "../examples/cityscape/footer";

export const doc: ComponentDoc = {
  usage: `import { Cityscape } from "@/components/ui/cityscape"

<section className="relative overflow-hidden bg-[#05060a]">
  <Cityscape signs={["HOTEL", "24H"]} />
  <h1 className="relative">Still up? So is the city.</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "2am",
      description:
        "Three rows of buildings fade into haze. A few windows switch on and off, a TV flickers blue, red beacons blink on the masts, and the rooftop signs stutter now and then.",
      component: CityscapeDemo,
    },
    {
      name: "signs",
      title: "Your own signs",
      description: "Up to three rooftop signs, each with its own color. The first stands on scaffolding; the others get a tube frame.",
      component: CityscapeSigns,
    },
    {
      name: "hours",
      title: "Time of night",
      description: "lights sets the share of lit windows. Same seed, same skyline: only the hour changes.",
      component: CityscapeHours,
    },
    {
      name: "seeds",
      title: "Seeds",
      description: "Every seed builds a different skyline, and the same one every time.",
      component: CityscapeSeeds,
    },
    {
      name: "footer",
      title: "Footer with parallax",
      description: "With parallax on, the back rows drift as the page scrolls. Scroll this page to see it.",
      component: CityscapeFooter,
    },
  ],
  api: [
    {
      name: "Cityscape",
      description:
        "Stacked SVG layers that fill the nearest positioned parent. The skyline is a 1600 by 400 scene anchored to the bottom edge: narrow boxes crop the sides, and buildings scale with the box height. To keep the city low in a tall hero, size the layer, for example className=\"top-auto h-64\". Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Sky glow, haze, crown lighting and the first sign. The second sign takes a contrasting hue mixed from it." },
        { prop: "seed", type: "number", default: "7", description: "Which skyline to build. The same seed always gives the same city." },
        { prop: "lights", type: "number", default: "0.16", description: "Share of windows lit, 0 to 1. The default reads as two in the morning." },
        { prop: "signs", type: "(string | { text: string; color?: NeonColor })[]", default: '["HOTEL", "24H"]', description: "Up to three rooftop signs, placed near the middle so they survive narrow crops. Pass [] for none." },
        { prop: "flicker", type: "boolean", default: "true", description: "Windows switch on and off, TVs flicker, beacons blink and signs stutter." },
        { prop: "stars", type: "boolean", default: "true", description: "Faint stars above the skyline." },
        { prop: "parallax", type: "boolean | number", default: "false", description: "Back rows lag behind as the page scrolls. A number sets the far row's travel in pixels (default 28)." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none.",
    "Sign lettering inherits the font of the layer. It looks best with a monoline face such as Tilt Neon: set it with className or style on the Cityscape.",
    "The skyline is generated in the browser after hydration (it's tens of kilobytes of path data you don't want in your HTML), then fades in.",
    "Lit windows share one path per color, so the whole city is a few dozen nodes. Flicker runs on a slow timer with direct style writes: no animation frames and no re-renders. It pauses offscreen and in hidden tabs.",
    "Under prefers-reduced-motion the city is a still frame: no flicker, no fade and no parallax.",
  ],
};
