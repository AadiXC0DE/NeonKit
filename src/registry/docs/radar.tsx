import type { ComponentDoc } from "../types";
import RadarDemo from "../examples/radar/demo";
import RadarContactColors from "../examples/radar/contact-colors";
import RadarNearbyDevices from "../examples/radar/nearby-devices";
import RadarTracking from "../examples/radar/tracking";

export const doc: ComponentDoc = {
  usage: `import { Radar } from "@/components/ui/radar"

<Radar blips={[{ angle: 40, distance: 0.6, label: "BAW 117" }]} />`,
  examples: [
    {
      name: "demo",
      title: "Approach radar",
      description:
        "Each blip flares as the beam crosses it, then decays until the next pass. A new contact stays dark until the beam first finds it.",
      component: RadarDemo,
    },
    {
      name: "tracking",
      title: "Moving contacts",
      description: "Update the blips as often as you like. Each one stays in step with the sweep at its new bearing.",
      component: RadarTracking,
    },
    {
      name: "contact-colors",
      title: "Contact colors",
      description: "Give a blip its own color to classify it.",
      component: RadarContactColors,
    },
    {
      name: "nearby-devices",
      title: "Device scan",
      description: "A small scope with unlabeled blips makes a friendly scanning state.",
      component: RadarNearbyDevices,
    },
  ],
  api: [
    {
      name: "Radar",
      description: "Renders a div with role=\"img\" and accepts its attributes; the ref points at it.",
      props: [
        { prop: "blips", type: "RadarBlip[]", default: "[]", description: "Contacts on the scope." },
        { prop: "speed", type: "number", default: "4", description: "Seconds per revolution." },
        { prop: "rings", type: "number", default: "4", description: "Range rings, evenly spaced." },
        { prop: "size", type: '"sm" | "md" | "lg" | number', default: '"md"', description: "200, 280 or 360px across, or a diameter in pixels. It stays square and shrinks to fit a narrower container; a w-* class also works." },
        { prop: "label", type: "string", default: '"Radar"', description: "Accessible name. The contact count and labeled contacts are appended." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Phosphor color. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "RadarBlip",
      props: [
        { prop: "angle", type: "number", description: "Bearing in degrees, clockwise from the top." },
        { prop: "distance", type: "number", description: "Distance from the center, 0 to 1." },
        { prop: "label", type: "string", description: "Short tag beside the blip, also read to screen readers." },
        { prop: "color", type: "NeonColor", description: "This blip's color. Defaults to the radar's." },
      ],
    },
  ],
  notes: [
    "The scope is one image to screen readers, named like \"Approach radar: 5 contacts. BAW 117 at bearing 038, 62% range…\". Pass aria-label to replace it.",
    "Everything moves with CSS animations on transform and opacity, so there is no per-frame JavaScript. The blips' clocks are pinned to the sweep's in an effect.",
    "With reduced motion, the beam stops at a fixed bearing and each blip holds the brightness it would have at that point in the sweep.",
  ],
};
