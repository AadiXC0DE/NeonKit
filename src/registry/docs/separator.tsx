import type { ComponentDoc } from "../types";
import SeparatorDemo from "../examples/separator/demo";
import SeparatorVariants from "../examples/separator/variants";
import SeparatorVertical from "../examples/separator/vertical";
import SeparatorUnread from "../examples/separator/unread";

export const doc: ComponentDoc = {
  usage: `import { Separator } from "@/components/ui/separator"

<Separator variant="tube" label="or" />`,
  examples: [
    {
      name: "demo",
      title: "Tube with a label",
      description: "The tube breaks around the label, and each half gets its own end caps.",
      component: SeparatorDemo,
    },
    {
      name: "variants",
      title: "Variants",
      description: "Hairline is the default. Dashed uses a gradient so the dashes match in every browser.",
      component: SeparatorVariants,
    },
    {
      name: "vertical",
      title: "Vertical",
      description: "In a flex row a vertical separator stretches to the row's height.",
      component: SeparatorVertical,
    },
    {
      name: "unread",
      title: "Section labels",
      description:
        "With decorative={false} the separator is announced, named by its label. Here the tube marks where unread messages start.",
      component: SeparatorUnread,
    },
  ],
  api: [
    {
      name: "Separator",
      description: "Also accepts native div attributes. Without a label, hairline and dashed render a single element, so className restyles the line itself.",
      props: [
        { prop: "variant", type: '"hairline" | "tube" | "dashed"', default: '"hairline"', description: "A quiet line, a lit tube with end caps, or 4px dashes." },
        { prop: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Horizontal fills the width. Vertical stretches to the height of a flex row." },
        { prop: "label", type: "ReactNode", description: "Text centered in the line. The line breaks around it." },
        {
          prop: "decorative",
          type: "boolean",
          default: "true",
          description: "Hidden from assistive tech when true. Set false when it separates real sections.",
        },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the tube and its label. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "Decorative separators render role=\"none\", so screen readers skip the line but still read a label as plain text.",
    "With decorative={false} it renders role=\"separator\" with aria-orientation, and a label becomes its accessible name through aria-labelledby.",
    "A vertical separator needs a flex row to stretch in. Anywhere else, give it a height with className.",
  ],
};
