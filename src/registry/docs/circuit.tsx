import type { ComponentDoc } from "../types";
import CircuitDemo from "../examples/circuit/demo";
import CircuitStatus from "../examples/circuit/status";
import CircuitSeeds from "../examples/circuit/seeds";
import CircuitQuiet from "../examples/circuit/quiet";

export const doc: ComponentDoc = {
  usage: `import { Circuit } from "@/components/ui/circuit"

<section className="relative overflow-hidden bg-[#05060a]">
  <Circuit seed={7} />
  <h1 className="relative">Boots Linux in 1.8 seconds</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "Board",
      description: "Chips sit away from the middle, with buses of parallel traces that jog at 45° and end on vias or run off the board. Pulses travel in toward the chips; a pin lights when one arrives, and a busy chip warms up.",
      component: CircuitDemo,
    },
    {
      name: "status",
      title: "Busy",
      description: "pulses={2.5} for a board under load. Sometimes a whole bus fires at once, a word of data crossing in parallel.",
      component: CircuitStatus,
    },
    {
      name: "seeds",
      title: "Seed and density",
      description: "The same seed at the same size always routes the same board. density adds chips, bottom-layer traces and small parts.",
      component: CircuitSeeds,
    },
    {
      name: "quiet",
      title: "Quiet",
      description: "Few pulses, slow and dim, for a notice that shouldn't compete with its button.",
      component: CircuitQuiet,
    },
  ],
  api: [
    {
      name: "Circuit",
      description: "Two canvases that fill the nearest positioned parent: the board, drawn once per size, and the pulses on top. Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the pulses, lit pins and warm chips. The copper takes a trace of it too." },
        { prop: "seed", type: "number", default: "7", description: "Same seed and size, same board." },
        { prop: "density", type: "number", default: "0.6", description: "How busy the board is, 0 to 1." },
        { prop: "pulses", type: "number", default: "1", description: "How often pulses set off, as a multiplier. 0 sends none." },
        { prop: "speed", type: "number", default: "1", description: "Speed multiplier for the pulses. 0 holds a still frame." },
        { prop: "intensity", type: "number", default: "0.85", description: "Brightness of the pulses and the board, 0 to 1." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none.",
    "Routing is deterministic: a seeded generator lays out chips and buses, and an occupancy grid keeps top-layer traces from crossing. Nothing random runs during render, so it's safe to server-render.",
    "It pauses offscreen and in hidden tabs. Under prefers-reduced-motion it draws one still frame with a few pulses mid-flight.",
  ],
};
