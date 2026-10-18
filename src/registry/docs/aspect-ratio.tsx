import type { ComponentDoc } from "../types";
import AspectRatioDemo from "../examples/aspect-ratio/demo";
import AspectRatioRatios from "../examples/aspect-ratio/ratios";
import AspectRatioSelection from "../examples/aspect-ratio/selection";

export const doc: ComponentDoc = {
  usage: `import { AspectRatio } from "@/components/ui/aspect-ratio"

<AspectRatio ratio={16 / 9}>
  <img src="/talk.jpg" alt="Main stage" className="h-full w-full object-cover" />
</AspectRatio>`,
  examples: [
    {
      name: "demo",
      title: "Video with a frame",
      description: "frame draws a hairline with a lit corner tick. The player inside sizes itself in cqw, so it scales with the box.",
      component: AspectRatioDemo,
    },
    {
      name: "ratios",
      title: "Common shapes",
      description: "ratio takes a number or a string: 1, 16 / 9, \"4:5\" or \"9/16\".",
      component: AspectRatioRatios,
    },
    {
      name: "selection",
      title: "Lit corner as selection",
      description:
        "The tick marks the picked tile. Inside each, a second AspectRatio letterboxes the screenshot at its real shape; portrait ones are sized by height with h-full w-auto.",
      component: AspectRatioSelection,
    },
  ],
  api: [
    {
      name: "AspectRatio",
      description: "Renders a div and accepts its attributes; the ref points at it. Children fill an inner box clipped to the corners.",
      props: [
        { prop: "ratio", type: "number | string", default: "1", description: "Width over height. Strings like \"16:9\" or \"21/9\" work too. Anything invalid falls back to 1." },
        {
          prop: "frame",
          type: 'boolean | "top-left" | "top-right" | "bottom-right" | "bottom-left"',
          default: "false",
          description: "Adds a 12px radius, a white/10 hairline and a lit tick on one corner. true puts it top left.",
        },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the tick. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "It uses the CSS aspect-ratio property. Set a width (it fills its parent by default) or, for a box sized by height, h-full w-auto.",
    "Children are positioned inside an absolute box, so media should be h-full w-full with object-cover or object-contain.",
    "The frame is decoration and is hidden from assistive tech. Give images their own alt text.",
  ],
};
