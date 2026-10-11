import type { ComponentDoc } from "../types";
import BorderBeamDemo from "../examples/border-beam/demo";
import BorderBeamButton from "../examples/border-beam/button";
import BorderBeamSettings from "../examples/border-beam/settings";

export const doc: ComponentDoc = {
  usage: `import { BorderBeam } from "@/components/ui/border-beam"

<BorderBeam colorTo="magenta" className="rounded-2xl border border-white/10 p-6">
  Anything
</BorderBeam>`,
  examples: [
    { name: "demo", title: "Card", component: BorderBeamDemo },
    {
      name: "button",
      title: "Around a button",
      description: "The beam takes its radius from the wrapper, so round it to match.",
      component: BorderBeamButton,
    },
    { name: "settings", title: "Speed, length, direction", component: BorderBeamSettings },
  ],
  api: [
    {
      name: "BorderBeam",
      description: "A div wrapper. Give it the same rounding as your content.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Head of the beam." },
        { prop: "colorTo", type: "NeonColor", default: "color", description: "Tail of the beam." },
        { prop: "duration", type: "number", default: "6", description: "Seconds per lap." },
        { prop: "size", type: "number", default: "90", description: "Beam length in degrees." },
        { prop: "borderWidth", type: "number", default: "1", description: "Thickness in pixels." },
        { prop: "reverse", type: "boolean", default: "false", description: "Run counter-clockwise." },
      ],
    },
  ],
  notes: [
    "The beam is decorative and hidden from assistive tech.",
    "Uses CSS @property, supported in every current browser. With reduced motion the beam holds still.",
  ],
};
