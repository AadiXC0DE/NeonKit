import type { ComponentDoc } from "../types";
import IconsGallery from "../examples/icons/demo";
import IconsLit from "../examples/icons/lit";
import IconsSizes from "../examples/icons/sizes";

export const doc: ComponentDoc = {
  usage: `import { Check, ChevronDown, Search } from "@/components/ui/icons"

<Search className="size-4" aria-hidden />
<Check size={20} strokeWidth={2} />`,
  examples: [
    {
      name: "demo",
      title: "Every icon",
      description: "Filter by name and click one to copy its JSX.",
      component: IconsGallery,
    },
    {
      name: "lit",
      title: "Lit and unlit",
      description: "Icons draw in currentColor. A tight white core plus a soft colored drop-shadow makes one look switched on.",
      component: IconsLit,
    },
    {
      name: "sizes",
      title: "Sizes and stroke",
      description: "Drawn on a 24px grid. absoluteStrokeWidth keeps the tube the same thickness at any size.",
      component: IconsSizes,
    },
  ],
  api: [
    {
      name: "Every icon",
      description: "Each named export renders an svg and accepts every native svg attribute. Names match lucide-react.",
      props: [
        { prop: "size", type: "number | string", default: "24", description: "Width and height." },
        { prop: "strokeWidth", type: "number | string", default: "1.75", description: "Tube thickness in viewBox units." },
        { prop: "absoluteStrokeWidth", type: "boolean", default: "false", description: "Keeps the stroke at strokeWidth pixels whatever the size." },
        { prop: "color", type: "string", default: '"currentColor"', description: "Stroke color." },
        { prop: "title", type: "string", description: "Accessible name. Without it, or an aria-label, the icon is aria-hidden." },
      ],
    },
  ],
  notes: [
    "Every glyph is bent tube: few continuous runs, real bend radii, and a small blockout gap wherever one tube passes behind another, the way a sign maker paints out a crossing.",
    "Names and props follow lucide-react, so switching is a find and replace on the import path. Common lucide aliases (Loader2, AlertTriangle, Trash2, Home) are exported too.",
    "Named exports only and no side effects, so bundlers keep just the icons you import.",
    "Decorative by default. Give an icon a title or aria-label when it is the only content of a control, or label the control instead.",
  ],
};
