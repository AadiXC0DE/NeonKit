import type { ComponentDoc } from "../types";
import SkeletonDemo from "../examples/skeleton/demo";
import SkeletonTable from "../examples/skeleton/table";
import SkeletonLoaded from "../examples/skeleton/loaded";

export const doc: ComponentDoc = {
  usage: `import { Skeleton } from "@/components/ui/skeleton"

<Skeleton variant="circle" className="size-10" />
<Skeleton variant="text" className="w-40" />`,
  examples: [
    {
      name: "demo",
      title: "Profile card",
      description: "Mirror the real layout so nothing jumps when the content arrives.",
      component: SkeletonDemo,
    },
    {
      name: "table",
      title: "Table rows",
      description: "Vary the widths. Identical bars look like a wireframe, not data.",
      component: SkeletonTable,
    },
    {
      name: "loaded",
      title: "Loading and loaded",
      description: "Swap the skeleton for content of the same height.",
      component: SkeletonLoaded,
    },
  ],
  api: [
    {
      name: "Skeleton",
      description: "Size it with className. Also accepts every native div attribute.",
      props: [
        { prop: "variant", type: '"rect" | "circle" | "text"', default: '"rect"', description: "rect is rounded-md, circle keeps a square ratio, text is a 12px pill." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Tints the shimmer. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "Skeletons are aria-hidden. Put aria-busy=\"true\" and a visually hidden \"Loading…\" on the container they stand in for.",
    "The shimmer is removed when the user prefers reduced motion; the placeholder shapes stay.",
  ],
};
