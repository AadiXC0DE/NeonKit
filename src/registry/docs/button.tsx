import type { ComponentDoc } from "../types";
import ButtonDemo from "../examples/button/demo";
import ButtonColors from "../examples/button/colors";
import ButtonSizes from "../examples/button/sizes";
import ButtonLoading from "../examples/button/loading";
import ButtonAsLink from "../examples/button/as-link";

export const doc: ComponentDoc = {
  usage: `import { Button } from "@/components/ui/button"

<Button color="magenta" variant="solid">Ship it</Button>`,
  examples: [
    { name: "demo", title: "Variants", component: ButtonDemo },
    {
      name: "colors",
      title: "Colors",
      description: "Pass a palette name or any hex value to color.",
      component: ButtonColors,
    },
    { name: "sizes", title: "Sizes", component: ButtonSizes },
    {
      name: "loading",
      title: "Loading and disabled",
      description: "loading swaps in a spinner and blocks clicks until it clears.",
      component: ButtonLoading,
    },
    {
      name: "as-link",
      title: "As a link",
      description: "asChild hands the styles to its child, so links keep their semantics.",
      component: ButtonAsLink,
    },
  ],
  api: [
    {
      name: "Button",
      description: "Also accepts every native button attribute.",
      props: [
        { prop: "variant", type: '"solid" | "outline" | "soft" | "ghost" | "link"', default: '"outline"', description: "Visual style." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg" | "icon"', default: '"md"', description: "Height and padding." },
        { prop: "loading", type: "boolean", default: "false", description: "Shows a spinner and disables the button." },
        { prop: "asChild", type: "boolean", default: "false", description: "Merges props onto the single child element instead of rendering a button." },
      ],
    },
  ],
  notes: [
    "Icon-only buttons need an aria-label.",
    "loading sets aria-busy so screen readers announce the pending state.",
  ],
};
