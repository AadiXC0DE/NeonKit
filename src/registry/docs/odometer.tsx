import type { ComponentDoc } from "../types";
import OdometerDemo from "../examples/odometer/demo";
import OdometerVariants from "../examples/odometer/variants";
import OdometerCarry from "../examples/odometer/carry";
import OdometerLatency from "../examples/odometer/latency";

export const doc: ComponentDoc = {
  usage: `import { Odometer } from "@/components/ui/odometer"

<Odometer value={48213} />`,
  examples: [
    {
      name: "demo",
      title: "Running total",
      description:
        "Each digit is a ten-faced drum. A long jump spins the low drums into a motion blur while the high ones roll visibly, then everything settles on its detent.",
      component: OdometerDemo,
    },
    {
      name: "variants",
      title: "Lit, backlit and cream",
      description:
        "Lit glows the digits on dark drums. Backlit prints dark ink on drums lit from behind. Cream is a car odometer, with the tenths drum in the neon color.",
      component: OdometerVariants,
    },
    {
      name: "carry",
      title: "Carrying",
      description: "A drum only turns while every drum to its right rolls from 9 to 0, so 999 to 1000 turns four drums at once. Leading drums stay dim until the count reaches them.",
      component: OdometerCarry,
    },
    {
      name: "latency",
      title: "Small, with units",
      description: "A suffix is printed on the faceplate. Color can follow the value.",
      component: OdometerLatency,
    },
  ],
  api: [
    {
      name: "Odometer",
      props: [
        { prop: "value", type: "number", description: "The reading. Negative values show as zero." },
        { prop: "from", type: "number", description: "Starts here and rolls to value once the counter scrolls into view." },
        { prop: "decimals", type: "number", default: "0", description: "Fixed decimal places, each on its own drum." },
        { prop: "minDigits", type: "number", default: "1", description: "Fewest whole-number drums. Unused ones show a dim zero." },
        { prop: "locale", type: "string", default: '"en-US"', description: "Separators and digits. Fixed by default so server and client render the same." },
        { prop: "grouping", type: "boolean", default: "true", description: "Prints group separators." },
        { prop: "prefix", type: "ReactNode", description: 'Printed before the drums, like "$".' },
        { prop: "suffix", type: "ReactNode", description: 'Printed after the drums, like "km" or "ms".' },
        { prop: "variant", type: '"lit" | "backlit" | "cream"', default: '"lit"', description: "Glowing digits, ink on a backlit drum, or ivory drums with black ink." },
        { prop: "size", type: '"sm" | "md" | "lg" | number', default: "40px", description: "Window height of 28, 40 or 64px, or any pixel value. Also settable with a --odo-h class." },
        { prop: "duration", type: "number", description: "Milliseconds per roll. By default it grows with the distance, from about 0.5s to 2.4s." },
        { prop: "housing", type: "boolean", default: "true", description: "Draws the housing around the drums." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "A polite live region holds the final formatted value, prefix and suffix included. It never reads the rolling digits.",
    "With reduced motion the drums jump straight to the new value.",
    "Drums are moved by one rAF loop that writes transforms directly, so a rolling counter never re-renders React.",
  ],
};
