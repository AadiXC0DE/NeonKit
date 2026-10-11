import type { ComponentDoc } from "../types";
import LightRaysDemo from "../examples/light-rays/demo";
import LightRaysOrigins from "../examples/light-rays/origins";
import LightRaysEmptyState from "../examples/light-rays/empty-state";
import LightRaysWarm from "../examples/light-rays/warm";

export const doc: ComponentDoc = {
  usage: `import { LightRays } from "@/components/ui/light-rays"

<section className="relative overflow-hidden bg-[#05060a]">
  <LightRays origin="top" />
  <h1 className="relative">Lights up at nine</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "Stage light",
      description: "Soft beams fan out from a source just above the frame and sway slowly. Dust is nearly invisible in the dark and sparkles only where a beam catches it.",
      component: LightRaysDemo,
    },
    {
      name: "origins",
      title: "Origins",
      description: "The source sits just outside the box: top, top-left, top-right, left, right or bottom. The fan always aims at the lower middle of the box.",
      component: LightRaysOrigins,
    },
    {
      name: "empty-state",
      title: "Empty state",
      description: "A few narrow beams and extra dust make a quiet 404.",
      component: LightRaysEmptyState,
    },
    {
      name: "warm",
      title: "Warm light",
      description: "Set color for a different kind of light. Amber with little sway reads as late sun through a window.",
      component: LightRaysWarm,
    },
  ],
  api: [
    {
      name: "LightRays",
      description: "Two canvases that fill the nearest positioned parent: soft beams at half resolution, and dust at full resolution. Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Beam and dust color. The source glows whiter than the beams." },
        { prop: "origin", type: '"top" | "top-left" | "top-right" | "left" | "right" | "bottom"', default: '"top"', description: "Where the light comes from." },
        { prop: "rays", type: "number", default: "7", description: "Number of beams." },
        { prop: "spread", type: "number", default: "64", description: "Width of the fan, in degrees." },
        { prop: "sway", type: "number", default: "4", description: "How far each beam swings, in degrees. 0 holds them still." },
        { prop: "speed", type: "number", default: "1", description: "Speed multiplier for the sway and the dust. 0 stops the animation." },
        { prop: "intensity", type: "number", default: "0.7", description: "Brightness of the beams, 0 to 1." },
        { prop: "dust", type: "boolean | number", default: "true", description: "Dust motes. A number scales how many (2 is twice as many)." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none.",
    "Beams render at half resolution, which costs a quarter of the pixels; they're soft, so the browser's upscale does the blurring for free.",
    "It pauses offscreen and in hidden tabs, and draws one still frame under prefers-reduced-motion.",
  ],
};
