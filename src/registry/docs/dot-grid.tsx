import type { ComponentDoc } from "../types";
import DotGridDemo from "../examples/dot-grid/demo";
import DotGridRipples from "../examples/dot-grid/ripples";
import DotGridTiles from "../examples/dot-grid/tiles";
import DotGridSettings from "../examples/dot-grid/settings";

export const doc: ComponentDoc = {
  usage: `import { DotGrid } from "@/components/ui/dot-grid"

<section className="relative overflow-hidden bg-[#05060a]">
  <DotGrid />
  <h1 className="relative">Every request, traced to the line</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "LED panel",
      description: "Move the pointer over it. Dots near it light up with a soft falloff and fade slowly when it leaves, so a short trail follows the pointer.",
      component: DotGridDemo,
    },
    {
      name: "ripples",
      title: "Ripples only",
      description: "radius={0} turns off the pointer light. Every few seconds a ring rolls out from somewhere on the panel and fades as it spreads.",
      component: DotGridRipples,
    },
    {
      name: "tiles",
      title: "Inside cards",
      description: "It fills any positioned box, so it works behind a stat as well as a hero. Turn off fade when the card's edge already frames it.",
      component: DotGridTiles,
    },
    {
      name: "settings",
      title: "Spacing and size",
      description: "spacing sets the pitch, size the dot diameter and radius how far the light reaches.",
      component: DotGridSettings,
    },
  ],
  api: [
    {
      name: "DotGrid",
      description: "Two canvases that fill the nearest positioned parent: unlit dots, drawn once per resize, and the lit ones, drawn only while something changes. Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the lit dots. Their cores burn whiter than the halo." },
        { prop: "spacing", type: "number", default: "22", description: "Distance between dots, in pixels. The grid is centered so the margins match." },
        { prop: "size", type: "number", default: "1.5", description: "Dot diameter, in pixels." },
        { prop: "radius", type: "number", default: "170", description: "How far the pointer's light reaches, in pixels. 0 turns it off." },
        { prop: "ripples", type: "boolean", default: "true", description: "Rings of light that roll across the panel every few seconds." },
        { prop: "fade", type: "boolean", default: "true", description: "Fade the panel out toward its edges with a radial mask." },
        { prop: "intensity", type: "number", default: "1", description: "Brightness of the lit dots, 0 to 1." },
        { prop: "speed", type: "number", default: "1", description: "Speed multiplier for the ripples. 0 stops them." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none, so it never blocks clicks on the content above it.",
    "The loop sleeps once every dot has settled and wakes on the next pointer move or ripple, so a resting panel costs nothing.",
    "It pauses offscreen and in hidden tabs. Under prefers-reduced-motion it draws one still pool of light and ignores the pointer.",
  ],
};
