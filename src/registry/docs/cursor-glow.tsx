import type { ComponentDoc } from "../types";
import CursorGlowDemo from "../examples/cursor-glow/demo";
import CursorGlowSettings from "../examples/cursor-glow/settings";
import CursorGlowWindow from "../examples/cursor-glow/window";

export const doc: ComponentDoc = {
  usage: `import { CursorGlow } from "@/components/ui/cursor-glow"

<section className="relative">
  <CursorGlow trail />
  …
</section>`,
  examples: [
    {
      name: "demo",
      title: "Comet trail",
      description:
        "Move the pointer over the panel. The light lags a touch behind it, fast moves leave a tail, and the dots under it burn neon through reveal.",
      component: CursorGlowDemo,
    },
    {
      name: "settings",
      title: "Size and tail",
      description: "A small light with a long tail, and a wide, dim one without.",
      component: CursorGlowSettings,
    },
    {
      name: "window",
      title: "Whole page",
      description: 'target="window" covers the viewport and follows the pointer everywhere.',
      component: CursorGlowWindow,
    },
  ],
  api: [
    {
      name: "CursorGlow",
      description:
        "A light layer. With the default target it fills its parent, which needs position: relative. Also accepts div attributes.",
      props: [
        { prop: "target", type: '"parent" | "window"', default: '"parent"', description: "Follow the pointer over the parent element, or over the whole window (a fixed layer)." },
        { prop: "size", type: "number", default: "360", description: "Diameter of the light in pixels." },
        { prop: "intensity", type: "number", default: "1", description: "Brightness of the light and tail, 0 to 1." },
        { prop: "trail", type: "boolean", default: "false", description: "A comet tail that streams behind fast movement." },
        { prop: "trailLength", type: "number", default: "260", description: "How long the tail lingers, in milliseconds." },
        {
          prop: "reveal",
          type: "ReactNode",
          description: "Content shown only under the light, fading toward its edge. It fills the layer, so a pattern lines up with the same pattern on the parent.",
        },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "Decorative: aria-hidden and pointer-events none, so nothing under it changes.",
    "Touch input is ignored. A finger has no hover, and a light left where it lifted looks broken.",
    "It blends with screen. Place it before your content to light only the background, or after it to light the content too.",
    "Positions are written straight to transforms from one animation frame loop, which stops as soon as the light settles; React never re-renders while the pointer moves.",
    "The tail is a canvas sized with ResizeObserver at up to 2x pixel density; it reads the neon color each time the light appears, so accent changes reach it.",
    "With reduced motion the light follows the pointer without easing and the tail is off.",
  ],
};
