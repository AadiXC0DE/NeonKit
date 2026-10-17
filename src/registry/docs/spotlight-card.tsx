import type { ComponentDoc } from "../types";
import SpotlightCardDemo from "../examples/spotlight-card/demo";
import SpotlightCardProfile from "../examples/spotlight-card/profile";

export const doc: ComponentDoc = {
  usage: `import { SpotlightCard } from "@/components/ui/spotlight-card"

<SpotlightCard className="p-6">Hover me</SpotlightCard>`,
  examples: [
    { name: "demo", title: "Stats", description: "Each card keeps its own light; the border catches it nearest the pointer.", component: SpotlightCardDemo },
    { name: "profile", title: "Wider light", description: "radius sets the size of the pool of light.", component: SpotlightCardProfile },
  ],
  api: [
    {
      name: "SpotlightCard",
      description: "Also accepts every div attribute.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Light color." },
        { prop: "radius", type: "number", default: "360", description: "Diameter of the light in pixels." },
      ],
    },
  ],
  notes: [
    "The pointer position is written to CSS variables directly, so moving the cursor never re-renders React.",
    "The light also appears when something inside the card has keyboard focus.",
  ],
};
