import type { ComponentDoc } from "../types";
import IconsBrowser from "../examples/icons/demo";
import IconsAnatomy from "../examples/icons/anatomy";
import IconsPowerOn from "../examples/icons/lit";
import IconsSizes from "../examples/icons/sizes";
import IconsInContext from "../examples/icons/in-context";

export const doc: ComponentDoc = {
  usage: `import { Check, ChevronDown, Search } from "@/components/ui/icons"

<Search className="size-4" />
<Check size={20} strokeWidth={2} />
<ChevronDown absoluteStrokeWidth />`,
  examples: [
    {
      name: "demo",
      title: "Every icon",
      description:
        "Pick one to see it lit at full size with its construction: the 24-unit grid, each bend's radius and every blockout.",
      component: IconsBrowser,
    },
    {
      name: "anatomy",
      title: "Anatomy of a tube",
      description: "Three numbers hold the set together. Shuffle shows all three.",
      component: IconsAnatomy,
    },
    {
      name: "lit",
      title: "Power on",
      description:
        "An icon draws in currentColor, so lighting one is three copies of it: a blurred halo, the colored tube and a 0.6 white core. These strike once when they scroll into view. With reduced motion they're simply on.",
      component: IconsPowerOn,
    },
    {
      name: "sizes",
      title: "Sizes and stroke",
      description:
        "Drawn on a 24px grid and tested from 12 to 48. absoluteStrokeWidth keeps the tube 1.75px whatever the size, which is what you want below 20.",
      component: IconsSizes,
    },
    {
      name: "in-context",
      title: "In use",
      description:
        "Buttons, inputs, toggle groups and command menus size their icons for you. Pass the icon as a child or a prop and leave size off.",
      component: IconsInContext,
    },
  ],
  api: [
    {
      name: "Every icon",
      description: "Each named export renders an svg and accepts every native svg attribute. Names match lucide-react.",
      props: [
        { prop: "size", type: "number | string", default: "24", description: "Width and height." },
        {
          prop: "strokeWidth",
          type: "number | string",
          default: "1.75",
          description: "Tube thickness in viewBox units.",
        },
        {
          prop: "absoluteStrokeWidth",
          type: "boolean",
          default: "false",
          description: "Keeps the stroke at strokeWidth pixels whatever the size.",
        },
        { prop: "color", type: "string", default: '"currentColor"', description: "Stroke color." },
        {
          prop: "title",
          type: "string",
          description: "Accessible name. Without it, or an aria-label, the icon is aria-hidden.",
        },
      ],
    },
    {
      name: "createIcon",
      description: "Builds an icon with the same props from your own path data, one string per tube run.",
      props: [
        { prop: "name", type: "string", description: "displayName, and the nk-icon-<kebab-name> class on the svg." },
        {
          prop: "node",
          type: "string[] | ReactElement",
          description: "Path data on the 24-unit grid, or any svg children.",
        },
      ],
    },
  ],
  notes: [
    "Every glyph is bent tube: as few continuous runs as possible, real bend radii, and a blockout gap wherever one tube passes behind another, the way a sign maker paints out a crossing.",
    "Names and props follow lucide-react, so switching is a find and replace on the import path. Common lucide aliases (Loader2, AlertTriangle, Trash2, Home) are exported too, and LucideIcon and LucideProps are type aliases.",
    "Named exports only and no side effects, so bundlers keep just the icons you import. The icons object is for pickers like the one above; importing it pulls in all of them.",
    "Decorative by default. Give an icon a title or aria-label when it is the only content of a control, or label the control instead.",
  ],
};
