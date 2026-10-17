import type { ComponentDoc } from "../types";
import TubeDividerDemo from "../examples/tube-divider/demo";
import TubeDividerShapes from "../examples/tube-divider/shapes";
import TubeDividerSizes from "../examples/tube-divider/sizes";
import TubeDividerColors from "../examples/tube-divider/colors";

export const doc: ComponentDoc = {
  usage: `import { TubeDivider } from "@/components/ui/tube-divider"

<TubeDivider shape="wave" />`,
  examples: [
    {
      name: "demo",
      title: "Mounted on the wall",
      description:
        "A bent tube between two electrodes, held by clips, throwing light on the wall behind it. Switch the lights off to see the bare glass; switching on replays the ignition flicker.",
      component: TubeDividerDemo,
    },
    {
      name: "shapes",
      title: "Shapes",
      description:
        "The bends are regenerated for the width, so a wave keeps its wavelength instead of stretching. Clips sit where the tube crosses its midline.",
      component: TubeDividerShapes,
    },
    {
      name: "sizes",
      title: "Sizes and flow",
      description: "Size sets the tube thickness and how far it bends. flow sends a pulse of current along the glass.",
      component: TubeDividerSizes,
    },
    { name: "colors", title: "Colors", description: "Any palette name or hex. clips={false} leaves a bare tube.", component: TubeDividerColors },
  ],
  api: [
    {
      name: "TubeDivider",
      description: "Also accepts native div attributes. It fills the width of its container; the height follows the shape and size.",
      props: [
        { prop: "shape", type: '"straight" | "wave" | "zigzag" | "loop"', default: '"straight"', description: "How the glass is bent." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Tube thickness (2, 3 or 4px) and the depth of the bends." },
        { prop: "on", type: "boolean", default: "true", description: "Lit or dark. Turning it on replays the ignition flicker; off leaves the glass visible." },
        { prop: "clips", type: "boolean", default: "true", description: "Metal clips holding the tube to the wall. They catch a little of its light." },
        { prop: "flow", type: "boolean", default: "false", description: "A brighter pulse travels along the tube every few seconds." },
        {
          prop: "decorative",
          type: "boolean",
          default: "true",
          description: "Hidden from assistive tech when true. Set false when it separates real sections, to expose role=\"separator\".",
        },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Tube color. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "Decorative dividers render role=\"none\" and an aria-hidden SVG, so screen readers skip them.",
    "With decorative={false} it renders role=\"separator\" with aria-orientation=\"horizontal\"; name it with aria-label if the sections need one.",
    "The ignition flicker and the flow pulse are off when the user prefers reduced motion.",
  ],
};
