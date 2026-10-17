import type { ComponentDoc } from "../types";
import StarfieldDemo from "../examples/starfield/demo";
import StarfieldDeploy from "../examples/starfield/deploy";
import StarfieldLayered from "../examples/starfield/layered";
import StarfieldSettings from "../examples/starfield/settings";

export const doc: ComponentDoc = {
  usage: `import { Starfield } from "@/components/ui/starfield"

<section className="relative overflow-hidden bg-[#05060a]">
  <Starfield />
  <h1 className="relative">Far from everything</h1>
</section>`,
  examples: [
    {
      name: "demo",
      title: "Warp",
      description: "Stars drift toward you, with the nearest ones shifting toward the pointer. Engage warp and they stretch into streaks; drop out and they settle back.",
      component: StarfieldDemo,
    },
    {
      name: "deploy",
      title: "Warp as a loading state",
      description: "Tie warp to a long-running task. Here it runs while a deploy rolls through regions, and the status line is a polite live region.",
      component: StarfieldDeploy,
    },
    {
      name: "layered",
      title: "Layered with Aurora",
      description: "Background layers stack. Put the stars first and the aurora over them.",
      component: StarfieldLayered,
    },
    {
      name: "settings",
      title: "Density, tint and speed",
      component: StarfieldSettings,
    },
  ],
  api: [
    {
      name: "Starfield",
      description: "A canvas that fills its nearest positioned parent. Accepts native div attributes.",
      props: [
        { prop: "color", type: "NeonColor", default: "inherited", description: "Tint for some of the stars and for the warp streaks." },
        { prop: "warp", type: "boolean", default: "false", description: "Hyperspace. The jump spools up over about a second, and dropping out eases back to cruising." },
        { prop: "density", type: "number", default: "7", description: "Stars per 10,000 square pixels, capped at 1,400 stars." },
        { prop: "speed", type: "number", default: "1", description: "Cruising speed toward the viewer. 0 holds still." },
        { prop: "parallax", type: "number", default: "24", description: "Pixels the nearest stars shift toward the pointer. 0 turns it off." },
        { prop: "tint", type: "number", default: "0.18", description: "Share of stars that take the neon color, 0 to 1." },
        { prop: "twinkle", type: "boolean", default: "true", description: "Small stars shimmer." },
      ],
    },
  ],
  notes: [
    "Decorative: rendered with aria-hidden and pointer-events: none. If warp means something (like a loading state), say so in text as well; the deploy example uses a live region.",
    "The canvas sizes itself with a ResizeObserver, caps the pixel ratio at 2, and stops drawing when it scrolls offscreen or the tab is hidden.",
    "Under prefers-reduced-motion it draws one still frame: no drift, no parallax and no warp.",
    "It reads --neon from the page, so a color set on an ancestor (or the accent picker) re-tints it live.",
  ],
};
