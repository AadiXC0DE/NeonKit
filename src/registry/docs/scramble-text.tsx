import type { ComponentDoc } from "../types";
import ScrambleTextDemo from "../examples/scramble-text/demo";
import ScrambleTextHover from "../examples/scramble-text/hover";
import ScrambleTextCharsets from "../examples/scramble-text/charsets";

export const doc: ComponentDoc = {
  usage: `import { ScrambleText } from "@/components/ui/scramble-text"

<ScrambleText text="ACCESS GRANTED" charset="symbols" />`,
  examples: [
    {
      name: "demo",
      title: "Status line",
      description: "Change text and it scrambles into the new value.",
      component: ScrambleTextDemo,
    },
    { name: "hover", title: "On hover", component: ScrambleTextHover },
    {
      name: "charsets",
      title: "Charsets",
      description: "Four presets, or pass your own string of glyphs.",
      component: ScrambleTextCharsets,
    },
  ],
  api: [
    {
      name: "ScrambleText",
      description: "Also accepts native attributes for the element it renders.",
      props: [
        { prop: "text", type: "string", description: "The text it decodes into." },
        { prop: "trigger", type: '"mount" | "hover" | "inView"', default: '"inView"', description: "When the decode runs. hover replays it on every pointer enter." },
        { prop: "duration", type: "number", default: "900", description: "Milliseconds from the start to the last character locking in." },
        { prop: "charset", type: '"upper" | "hex" | "binary" | "symbols" | string', default: '"upper"', description: "Glyphs it scrambles through." },
        { prop: "as", type: '"span" | "p" | "div" | "h1" | "h2" | "h3" | "h4"', default: '"span"', description: "Element to render." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the unresolved glyphs and the lock-in flash." },
      ],
    },
  ],
  notes: [
    "Screen readers get the real text once from a visually hidden copy; the scrambling cells are aria-hidden.",
    "Every character keeps the width of its final glyph while it scrambles, so nothing on the line shifts. Monospace faces decode most cleanly; in a proportional face a wide glyph can briefly overlap its neighbours.",
    "The decode runs on requestAnimationFrame and writes attributes directly, without React re-renders per frame.",
    "Under reduced motion the final text shows straight away.",
  ],
};
