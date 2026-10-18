import type { ComponentDoc } from "../types";
import SeparatorDemo from "../examples/separator/demo";
import SeparatorVariants from "../examples/separator/variants";
import SeparatorVertical from "../examples/separator/vertical";
import SeparatorSignIn from "../examples/separator/sign-in";

export const doc: ComponentDoc = {
  usage: `import { Separator } from "@/components/ui/separator"

<Separator variant="tube" label="2 new messages" decorative={false} />`,
  examples: [
    {
      name: "demo",
      title: "Unread marker",
      description:
        "The tube is for the one line that matters: here, where unread messages start. With decorative={false} it is announced, named by its label.",
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
      name: "sign-in",
      title: "Label on a hairline",
      description: "Most dividers should stay quiet. The label breaks the line and centers itself.",
      component: SeparatorSignIn,
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
