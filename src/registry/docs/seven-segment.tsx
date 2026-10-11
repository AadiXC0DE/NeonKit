import type { ComponentDoc } from "../types";
import SevenSegmentDemo from "../examples/seven-segment/demo";
import SevenSegmentScoreboard from "../examples/seven-segment/scoreboard";
import SevenSegmentStopwatch from "../examples/seven-segment/stopwatch";
import SevenSegmentCharacters from "../examples/seven-segment/characters";

export const doc: ComponentDoc = {
  usage: `import { SevenSegment } from "@/components/ui/seven-segment"

<SevenSegment value="12:45" colonBlink />`,
  examples: [
    {
      name: "demo",
      title: "Clock",
      description:
        "Dashes until the first tick, so server and browser render the same thing. The dark leading digit is a space: unlit segments stay faintly visible, like a real display.",
      component: SevenSegmentDemo,
    },
    {
      name: "scoreboard",
      title: "Scoreboard",
      description: "digits={2} pads scores with unlit digits so the layout never shifts.",
      component: SevenSegmentScoreboard,
    },
    {
      name: "stopwatch",
      title: "Stopwatch",
      description: "A point belongs to the digit before it, as on hardware, so 00:00.00 still has six digit cells.",
      component: SevenSegmentStopwatch,
    },
    {
      name: "characters",
      title: "Characters and options",
      description: "Hex digits, a few extra letters, padding, skew={0} and a brighter unlit level.",
      component: SevenSegmentCharacters,
    },
  ],
  api: [
    {
      name: "SevenSegment",
      description: "Renders a <span role=\"img\"> labelled with the value, holding two stacked SVGs: unlit glass and lit segments.",
      props: [
        {
          prop: "value",
          type: "string | number",
          description: "0–9, A–F, minus, colon, dot and space, plus H, J, L, P, U, n, o, r, t, u and y. Unknown characters render as a blank digit.",
        },
        { prop: "digits", type: "number", default: "0", description: "Pads on the left with unlit digits up to this count. Colons and dots don't count." },
        {
          prop: "size",
          type: '"sm" | "md" | "lg" | number',
          default: '"md"',
          description: "Digit height: 32, 48 or 72px, or any pixel value. It sets --segment-h, so responsive classes like lg:[--segment-h:96px] work too.",
        },
        { prop: "skew", type: "number", default: "8", description: "Forward lean in degrees. 0 stands the digits upright." },
        { prop: "unlit", type: "number", default: "0.08", description: "Opacity of unlit segments, from 0 (invisible) to 1." },
        { prop: "colonBlink", type: "boolean", default: "false", description: "Blink colons once a second. Holds steady with reduced motion." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "The display is role=\"img\" labelled with the value as written. Pass aria-label for something more natural, like \"12 minutes 48 seconds left\".",
    "Decimal-point slots only appear when the value contains a point, so clocks and scores stay tight.",
    "Segments switch on in 50ms and fade out over 160ms, like phosphor. Both are instant with reduced motion.",
  ],
};
