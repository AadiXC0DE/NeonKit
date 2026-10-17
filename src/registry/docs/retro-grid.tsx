import type { ComponentDoc } from "../types";
import RetroGridDemo from "../examples/retro-grid/demo";
import RetroGridSettings from "../examples/retro-grid/settings";

export const doc: ComponentDoc = {
  usage: `import { RetroGrid } from "@/components/ui/retro-grid"

<section className="relative overflow-hidden">
  <RetroGrid color="magenta" />
  <h1 className="relative">Hello</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "Hero background",
      description: "The floor is one long plane in real perspective, so rows compress toward the horizon and the nearest squares draw at twice cellSize.",
      component: RetroGridDemo,
    },
    { name: "settings", title: "Angle, cell size and speed", component: RetroGridSettings },
  ],
  api: [
    {
      name: "RetroGrid",
      description: "Fills its nearest positioned parent. The horizon sits halfway down.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Line color." },
        { prop: "angle", type: "number", default: "70", description: "Floor tilt in degrees, 20 to 88. Higher is a flatter, longer floor." },
        { prop: "cellSize", type: "number", default: "56", description: "Grid square size in pixels on the floor; the row nearest the viewer draws at twice this." },
        { prop: "speed", type: "number", default: "1.2", description: "Seconds to travel one cell. 0 stops it." },
        { prop: "opacity", type: "number", default: "0.55", description: "Line opacity." },
        { prop: "horizon", type: "boolean", default: "true", description: "Glowing horizon line." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and no pointer events. Stops moving under reduced motion.",
    "The horizon is computed from the angle with container query units, so it stays on the glowing line at any height. Needs container units (every browser since 2023).",
  ],
};
