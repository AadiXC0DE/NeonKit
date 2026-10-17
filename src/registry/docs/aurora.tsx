import type { ComponentDoc } from "../types";
import AuroraDemo from "../examples/aurora/demo";
import AuroraColors from "../examples/aurora/colors";
import AuroraNewsletter from "../examples/aurora/newsletter";
import AuroraSettings from "../examples/aurora/settings";

export const doc: ComponentDoc = {
  usage: `import { Aurora } from "@/components/ui/aurora"

<section className="relative overflow-hidden bg-[#05060a]">
  <Aurora />
  <h1 className="relative">Quiet light for loud ideas</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "Hero background",
      description: "Three curtains of light drift and ripple behind the headline. Every tint comes from --neon, so the accent picker re-colors the whole sky.",
      component: AuroraDemo,
    },
    {
      name: "colors",
      title: "Custom colors",
      description: "Pass up to three colors, front curtain first. Without them, the curtains use --neon, a violet fringe mixed from it, and a paler core.",
      component: AuroraColors,
    },
    {
      name: "newsletter",
      title: "Behind a card",
      description: "Turn opacity down behind forms and body copy so text keeps its contrast.",
      component: AuroraNewsletter,
    },
    {
      name: "settings",
      title: "Opacity and speed",
      description: "speed scales every drift at once. 0 holds the curtains in place.",
      component: AuroraSettings,
    },
  ],
  api: [
    {
      name: "Aurora",
      description: "Fills its nearest positioned parent, so give the parent position: relative. Content placed after it with relative positioning sits on top. Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Main curtain color. The other two default tints are mixed from it." },
        { prop: "colors", type: "NeonColor[]", description: "Up to three curtain colors, front to back. Each one replaces the matching default tint." },
        { prop: "speed", type: "number", default: "1", description: "Speed multiplier for the drift and the ripple. 0 holds still." },
        { prop: "opacity", type: "number", default: "0.85", description: "Overall strength of the light, 0 to 1." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none, so it never takes focus or clicks.",
    "Pure CSS. Every layer animates transform or opacity with literal keyframes, so the compositor runs it without repaints or JavaScript.",
    "Under prefers-reduced-motion the curtains hold still in their resting arrangement.",
  ],
};
