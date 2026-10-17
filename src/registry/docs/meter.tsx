import type { ComponentDoc } from "../types";
import MeterDemo from "../examples/meter/demo";
import MeterMicCheck from "../examples/meter/mic-check";
import MeterServerLoad from "../examples/meter/server-load";
import MeterZones from "../examples/meter/zones";

export const doc: ComponentDoc = {
  usage: `import { Meter } from "@/components/ui/meter"

<Meter label="L" value={0.72} />`,
  examples: [
    {
      name: "demo",
      title: "Stereo bus",
      description:
        "Two vertical meters fed from a simulated mix. Segments strike instantly and decay over a few frames, and the peak segment lingers before it falls.",
      component: MeterDemo,
    },
    {
      name: "mic-check",
      title: "Microphone check",
      description: "Drive it from a real input: the example reads microphone loudness with Web Audio after you click.",
      component: MeterMicCheck,
    },
    {
      name: "server-load",
      title: "Not just audio",
      description: "Any 0 to 1 level works. A longer peakHold keeps the recent high visible between updates.",
      component: MeterServerLoad,
    },
    {
      name: "zones",
      title: "Zones and colors",
      description:
        "Zones without a color use the meter's neon color, so color restyles the safe range. Pass your own bands for anything else.",
      component: MeterZones,
    },
  ],
  api: [
    {
      name: "Meter",
      description: "Renders a div with role=\"meter\" and accepts its attributes; the ref points at it.",
      props: [
        { prop: "value", type: "number", description: "Level from 0 to 1. Out-of-range values are clamped." },
        {
          prop: "peak",
          type: "boolean | number",
          default: "true",
          description: "true holds the highest recent segment, then lets it fall. A number (0 to 1) places the peak marker yourself. false hides it.",
        },
        { prop: "peakHold", type: "number", default: "900", description: "Milliseconds the automatic peak lingers before falling, one segment every 40ms." },
        { prop: "segments", type: "number", default: "24", description: "Number of LED segments." },
        { prop: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Vertical meters fill from the bottom." },
        {
          prop: "zones",
          type: "MeterZone[]",
          default: "neon → amber 72% → red 90%",
          description: "Color bands from low to high. Each segment takes the last zone that starts at or below it.",
        },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Segment thickness and the default length (144, 208 or 272px). Override the length with a w-* or h-* class." },
        { prop: "label", type: "ReactNode", description: "Short caption at the start of the meter. Also names it for screen readers." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of zones without their own. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "MeterZone",
      props: [
        { prop: "from", type: "number", description: "Where the zone starts, 0 to 1." },
        { prop: "color", type: "NeonColor", description: "Palette name or hex. Leave it out to use the meter's neon color." },
      ],
    },
  ],
  notes: [
    "role=\"meter\" reports the level as aria-valuenow from 0 to 100 with a percentage in aria-valuetext. Pass aria-valuetext to read something else, such as decibels.",
    "Without a label, pass aria-label or aria-labelledby.",
    "Values can change every frame: segments are plain spans, and the falling peak runs on its own clock and writes to the DOM, so it never re-renders the meter.",
    "With reduced motion, segments switch without the decay and the peak drops straight to the level once its hold ends.",
  ],
};
