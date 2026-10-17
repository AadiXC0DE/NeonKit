import type { ComponentDoc } from "../types";
import RotatingTextDemo from "../examples/rotating-text/demo";
import RotatingTextControlled from "../examples/rotating-text/controlled";
import RotatingTextSign from "../examples/rotating-text/sign";
import RotatingTextFade from "../examples/rotating-text/fade";

export const doc: ComponentDoc = {
  usage: `import { RotatingText } from "@/components/ui/rotating-text"

<h1>
  Wire up <RotatingText words={["billing", "search", "auth"]} /> in an afternoon.
</h1>`,
  examples: [
    {
      name: "demo",
      title: "Headline",
      description: "The old insert powers off and slides out, the width follows, and the new tube strikes. Hover the headline to hold a word.",
      component: RotatingTextDemo,
    },
    {
      name: "controlled",
      title: "Controlled",
      description: "index and onIndexChange keep the price in step; picking a plan pins it.",
      component: RotatingTextControlled,
    },
    { name: "sign", title: "Sign insert", component: RotatingTextSign },
    {
      name: "fade",
      title: "In a sentence",
      description: "flicker={false} fades the new word up instead of striking it.",
      component: RotatingTextFade,
    },
  ],
  api: [
    {
      name: "RotatingText",
      description: "An inline span. It takes its font from the text around it. Also accepts span attributes.",
      props: [
        { prop: "words", type: "string[]", description: "The inserts it cycles through." },
        { prop: "interval", type: "number", default: "2600", description: "Milliseconds each word stays lit." },
        { prop: "index", type: "number", description: "The lit word, controlled." },
        { prop: "defaultIndex", type: "number", default: "0", description: "The first lit word, uncontrolled." },
        { prop: "onIndexChange", type: "(index: number) => void", description: "Fires when the timer moves on." },
        { prop: "paused", type: "boolean", default: "false", description: "Hold the current word." },
        { prop: "flicker", type: "boolean", default: "true", description: "Strike the new word like a tube. Off, it fades up." },
        { prop: "live", type: "boolean", default: "false", description: "Announce each new word in a polite live region." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the lit word." },
      ],
    },
  ],
  notes: [
    "By default screen readers get every word once, in place, so the sentence reads 'Wire up billing, search, auth in an afternoon' and nothing interrupts later. live announces each new word through aria-live='polite' instead; use it when the word is news, not decoration.",
    "It holds while the pointer is over the line, while focus is inside it, while the tab is hidden and while it's off screen, so nobody is reading a word as it leaves.",
    "Each word's width is measured once (and again if the font loads late); the box eases between widths so the rest of the line glides instead of jumping.",
    "With reduced motion words cross-fade with no flicker, slide or width animation.",
  ],
};
