import type { ComponentDoc } from "../types";
import ParticlesDemo from "../examples/particles/demo";
import ParticlesDust from "../examples/particles/dust";
import ParticlesSettings from "../examples/particles/settings";
import ParticlesColors from "../examples/particles/colors";

export const doc: ComponentDoc = {
  usage: `import { Particles } from "@/components/ui/particles"

<section className="relative overflow-hidden bg-[#05060a]">
  <Particles connect />
  <h1 className="relative">Every edge, one mesh</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "Mesh",
      description: "With connect, nearby particles link up, and the cursor joins the mesh as a node while it pushes particles out of its way.",
      component: ParticlesDemo,
    },
    {
      name: "dust",
      title: "Dust",
      description: "Dense, slow and unlinked, it reads as dust in the air. Here the cursor gathers it instead of pushing it away.",
      component: ParticlesDust,
    },
    {
      name: "settings",
      title: "Interaction and links",
      description: "repel pushes, attract pulls particles into a loose orbit, and none ignores the cursor.",
      component: ParticlesSettings,
    },
    {
      name: "colors",
      title: "Colors",
      component: ParticlesColors,
    },
  ],
  api: [
    {
      name: "Particles",
      description: "A canvas that fills its nearest positioned parent. Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Particle and link color. Cores are whitened so each particle reads as lit." },
        { prop: "density", type: "number", default: "1.4", description: "Particles per 10,000 square pixels, capped at 420." },
        { prop: "speed", type: "number", default: "1", description: "Drift speed. 0 holds them still, but the cursor still moves them." },
        { prop: "interaction", type: '"repel" | "attract" | "none"', default: '"repel"', description: "How the cursor moves nearby particles." },
        { prop: "radius", type: "number", default: "140", description: "Reach of the cursor, in pixels." },
        { prop: "connect", type: "boolean | number", default: "false", description: "Link close particles with lines. A number sets the link distance in pixels (true is 110)." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none. The cursor is tracked on the window, so content on top stays clickable.",
    "Links are batched by strength into six paths per frame instead of one stroke per line.",
    "It pauses offscreen and in hidden tabs, ignores the cursor under prefers-reduced-motion, and draws a still frame there instead.",
    "On touch screens a drag acts as the cursor; lifting the finger lets the particles settle.",
  ],
};
