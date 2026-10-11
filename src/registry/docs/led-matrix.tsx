import type { ComponentDoc } from "../types";
import LedMatrixDemo from "../examples/led-matrix/demo";
import LedMatrixDestinationSign from "../examples/led-matrix/destination-sign";
import LedMatrixMessage from "../examples/led-matrix/message";
import LedMatrixDotSizes from "../examples/led-matrix/dot-sizes";

export const doc: ComponentDoc = {
  usage: `import { LedMatrix } from "@/components/ui/led-matrix"

<LedMatrix text="Next train to Odawara · 3 min" />`,
  examples: [
    {
      name: "demo",
      title: "Platform sign",
      description: "A held line over a scrolling one. On narrow screens the top line scrolls too, because static text is cut at the edge.",
      component: LedMatrixDemo,
    },
    {
      name: "destination-sign",
      title: "Static",
      description: "speed={0} centers the text. columns fixes the width in dots; rows adds unlit rows around the 7-row font.",
      component: LedMatrixDestinationSign,
    },
    {
      name: "message",
      title: "Live message",
      description: "Changing the text restarts the scroll from the edge. direction flips which way it travels.",
      component: LedMatrixMessage,
    },
    {
      name: "dot-sizes",
      title: "Dot sizes",
      description: "Big dots for a sign across the room, small ones for a dense ticker.",
      component: LedMatrixDotSizes,
    },
  ],
  api: [
    {
      name: "LedMatrix",
      description: "A canvas inside a dark bezel. Renders a <div role=\"img\"> labelled with the text; className styles the bezel.",
      props: [
        { prop: "text", type: "string", description: "The message. A–Z, 0–9 and common punctuation, plus · ° → ← ▲ ▼. Lowercase shows as uppercase; other characters are blank." },
        { prop: "speed", type: "number", default: "60", description: "Scroll speed in pixels per second. 0 holds the text still and centers it when it fits." },
        { prop: "direction", type: '"left" | "right"', default: '"left"', description: "Which way the text travels." },
        { prop: "rows", type: "number", default: "7", description: "Dot rows. The font is centered vertically in taller displays and cropped in shorter ones." },
        { prop: "columns", type: "number", description: "Fixed width in dots. Leave unset to fill the parent's width." },
        { prop: "dotSize", type: "number", default: "6", description: "Dot diameter in pixels." },
        { prop: "gap", type: "number", default: "2", description: "Space between dots in pixels." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "Screen readers get the whole message once from the role=\"img\" label; the canvas is aria-hidden. Pass aria-label to override.",
    "It's one canvas, not a node per dot. The text steps a whole column at a time like real LEDs, and the canvas only redraws when it moves.",
    "The canvas follows the neon color live, including a color inherited from an ancestor's --neon-accent.",
    "Scrolling pauses offscreen and in background tabs. With reduced motion it draws one still frame.",
  ],
};
