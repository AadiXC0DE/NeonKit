import type { ComponentDoc } from "../types";
import LasersDemo from "../examples/lasers/demo";
import LasersCrossfire from "../examples/lasers/crossfire";
import LasersHeavyHaze from "../examples/lasers/heavy-haze";
import LasersStill from "../examples/lasers/still";

export const doc: ComponentDoc = {
  usage: `import { Lasers } from "@/components/ui/lasers"

<section className="relative overflow-hidden bg-[#05060a]">
  <Lasers origin="bottom" />
  <h1 className="relative">Twelve hours, one room, no phones</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "Stage lasers",
      description: "A fan of beams from a projector at the bottom edge sweeps and opens slowly. Each beam is a hot core with a soft sheath that only shows where it passes through smoke.",
      component: LasersDemo,
    },
    {
      name: "crossfire",
      title: "Several projectors",
      description: "sources={3} spaces projectors along the edge. Neighbors sweep in opposite directions, so their beams scissor through each other.",
      component: LasersCrossfire,
    },
    {
      name: "heavy-haze",
      title: "Haze",
      description: "haze sets how patchy the smoke is: at 1 the beams come and go through clouds, at 0 they're clean lines.",
      component: LasersHeavyHaze,
    },
    {
      name: "still",
      title: "Still",
      description: "speed={0} holds one frame. Position the layer with style or className to aim it off-center.",
      component: LasersStill,
    },
  ],
  api: [
    {
      name: "Lasers",
      description: "One canvas that fills the nearest positioned parent. Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Beam color. Cores and the source flare burn whiter." },
        { prop: "origin", type: '"top" | "bottom"', default: '"bottom"', description: "Which edge the projectors sit on." },
        { prop: "beams", type: "number", default: "8", description: "Beams per projector." },
        { prop: "spread", type: "number", default: "76", description: "Width of each fan, in degrees." },
        { prop: "sources", type: "number", default: "1", description: "Projectors spaced along the edge, up to 5." },
        { prop: "speed", type: "number", default: "1", description: "Speed multiplier for the sweep. 0 holds still." },
        { prop: "intensity", type: "number", default: "0.85", description: "Brightness of the beams and the flare, 0 to 1." },
        { prop: "haze", type: "number", default: "0.7", description: "How much the smoke breaks the beams up, 0 to 1." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none.",
    "The smoke is a small noise field sampled along each beam into gradient stops, so there's no full-screen blur or composite per frame.",
    "It pauses offscreen and in hidden tabs, and draws one still frame under prefers-reduced-motion.",
  ],
};
