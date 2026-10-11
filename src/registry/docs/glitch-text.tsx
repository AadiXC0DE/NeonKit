import type { ComponentDoc } from "../types";
import GlitchTextDemo from "../examples/glitch-text/demo";
import GlitchTextIntensity from "../examples/glitch-text/intensity";
import GlitchTextNav from "../examples/glitch-text/nav";
import GlitchTextNotFound from "../examples/glitch-text/not-found";

export const doc: ComponentDoc = {
  usage: `import { GlitchText } from "@/components/ui/glitch-text"

<GlitchText as="h1" intensity="heavy">SIGNAL LOST</GlitchText>`,
  examples: [
    {
      name: "demo",
      title: "Bursts",
      description: "trigger=\"always\" fires a 200–400ms burst every few seconds, and pauses while off screen.",
      component: GlitchTextDemo,
    },
    { name: "intensity", title: "Intensity", component: GlitchTextIntensity },
    {
      name: "nav",
      title: "Driven by a link",
      description: "trigger=\"manual\" with active wired to the link's hover and keyboard focus.",
      component: GlitchTextNav,
    },
    {
      name: "not-found",
      title: "In view",
      description: "One burst each time it scrolls into view.",
      component: GlitchTextNotFound,
    },
  ],
  api: [
    {
      name: "GlitchText",
      description: "Also accepts native attributes for the element it renders.",
      props: [
        { prop: "as", type: '"span" | "p" | "div" | "h1" | "h2" | "h3" | "h4"', default: '"span"', description: "Element to render." },
        { prop: "trigger", type: '"hover" | "always" | "inView" | "manual"', default: '"always"', description: "Glitch while hovered, in periodic bursts, once per scroll into view, or while active." },
        { prop: "active", type: "boolean", default: "false", description: "With trigger=\"manual\", glitches while true." },
        { prop: "intensity", type: '"subtle" | "medium" | "heavy"', default: '"medium"', description: "How far the slices jump. Medium adds a skew; heavy also tears a band out of the text." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "First split layer. Falls back to --neon-accent, then cyan." },
        { prop: "colorAlt", type: "NeonColor", description: "Second split layer. Defaults to the neon hue turned 150°, so it always contrasts." },
      ],
    },
  ],
  notes: [
    "The text is rendered once for screen readers; the two colored copies are aria-hidden.",
    "Bursts are skipped entirely under reduced motion, leaving plain text.",
    "The base text keeps its inherited color, so it reads as normal copy between bursts.",
  ],
};
