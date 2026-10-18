import type { ComponentDoc } from "../types";
import NeonTextDemo from "../examples/neon-text/demo";
import NeonTextPower from "../examples/neon-text/power";
import NeonTextColors from "../examples/neon-text/colors";

export const doc: ComponentDoc = {
  usage: `import { NeonText } from "@/components/ui/neon-text"

<NeonText as="h1" color="magenta" buzz>open late</NeonText>`,
  examples: [
    { name: "demo", title: "Sign", component: NeonTextDemo },
    {
      name: "power",
      title: "Power switch",
      description: "Flip on to replay the power-on flicker. Off leaves the glass tube visible.",
      component: NeonTextPower,
    },
    { name: "colors", title: "Colors", component: NeonTextColors },
  ],
  api: [
    {
      name: "NeonText",
      props: [
        { prop: "as", type: '"span" | "p" | "div" | "h1" | "h2" | "h3" | "h4"', default: '"span"', description: "Element to render." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Tube color." },
        { prop: "on", type: "boolean", default: "true", description: "Lit or dark. Turning it on replays the flicker." },
        { prop: "flicker", type: "boolean", default: "true", description: "Letters stutter on one at a time when lit." },
        { prop: "buzz", type: "boolean", default: "false", description: "A random letter buzzes every few seconds." },
      ],
    },
  ],
  notes: [
    "String children are split into letters for the flicker; screen readers get the whole word once.",
    "Flicker and buzz are skipped when the user prefers reduced motion.",
    "Only a plain string is split into letters. Other children light as one piece, without the letter-by-letter flicker.",
    "The glow is sized in em, so it stays in proportion from a caption to a headline.",
  ],
};
