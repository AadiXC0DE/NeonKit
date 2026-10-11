import type { ComponentDoc } from "../types";
import BadgeDemo from "../examples/badge/demo";
import BadgeVariants from "../examples/badge/variants";
import BadgeRemovable from "../examples/badge/removable";

export const doc: ComponentDoc = {
  usage: `import { Badge } from "@/components/ui/badge"

<Badge color="green" pulse>Live</Badge>`,
  examples: [
    {
      name: "demo",
      title: "Deployment status",
      description: "dot adds a status light; pulse makes it ping.",
      component: BadgeDemo,
    },
    {
      name: "variants",
      title: "Variants and sizes",
      description: "Soft is the default. Outline and solid carry more light.",
      component: BadgeVariants,
    },
    {
      name: "removable",
      title: "Removable",
      description: "onRemove renders a small close button after the label.",
      component: BadgeRemovable,
    },
  ],
  api: [
    {
      name: "Badge",
      description: "Renders a span and accepts every native span attribute.",
      props: [
        { prop: "variant", type: '"soft" | "outline" | "solid"', default: '"soft"', description: "Visual style." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md"', default: '"md"', description: "Height, padding and type size." },
        { prop: "dot", type: "boolean", default: "false", description: "Shows a glowing status dot before the label." },
        { prop: "pulse", type: "boolean", default: "false", description: "Adds a ping ring to the dot. Implies dot." },
        { prop: "onRemove", type: "() => void", description: "Renders a remove button and calls this when it is pressed." },
        { prop: "removeLabel", type: "string", default: '"Remove"', description: "Accessible name for the remove button." },
      ],
    },
  ],
  notes: [
    "The dot is decorative, so the label text has to carry the status on its own.",
    "Give each remove button a specific removeLabel, such as \"Remove TypeScript filter\", when several badges sit together.",
    "The ping animation stops when the user prefers reduced motion.",
  ],
};
