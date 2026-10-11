import type { ComponentDoc } from "../types";
import RatingDemo from "../examples/rating/demo";
import RatingHalfSteps from "../examples/rating/half-steps";
import RatingReadOnly from "../examples/rating/read-only";
import RatingIcons from "../examples/rating/icons";
import RatingSizes from "../examples/rating/sizes";

export const doc: ComponentDoc = {
  usage: `import { Rating } from "@/components/ui/rating"

<Rating label="Your rating" defaultValue={4} />`,
  examples: [
    {
      name: "demo",
      title: "Review prompt",
      description:
        "Hover previews a value and onHoverChange lets the caption follow it. Clicking the current value clears it.",
      component: RatingDemo,
    },
    {
      name: "half-steps",
      title: "Half steps",
      description: "With allowHalf, the left half of an icon picks the half value and the arrow keys move by 0.5.",
      component: RatingHalfSteps,
    },
    {
      name: "read-only",
      title: "Read-only average",
      description: "Read-only ratings show fractional values exactly and are announced as an image.",
      component: RatingReadOnly,
    },
    { name: "icons", title: "Icons and colors", component: RatingIcons },
    { name: "sizes", title: "Sizes", component: RatingSizes },
  ],
  api: [
    {
      name: "Rating",
      description:
        "Also accepts native div attributes, and the ref points at the icon row. className and style go to the icon row.",
      props: [
        { prop: "value", type: "number", description: "Controlled value, from 0 (unrated) to max." },
        { prop: "defaultValue", type: "number", default: "0", description: "Initial value when uncontrolled." },
        { prop: "onValueChange", type: "(value: number) => void", description: "Called on click or key press. Clicking the current value sends 0." },
        { prop: "max", type: "number", default: "5", description: "Number of icons." },
        { prop: "allowHalf", type: "boolean", default: "false", description: "Half values from the pointer and in 0.5 keyboard steps." },
        { prop: "icon", type: '"star" | "bolt" | "heart"', default: '"star"', description: "The icon shape." },
        { prop: "readOnly", type: "boolean", default: "false", description: "Display only. Not focusable, announced as an image with the value." },
        { prop: "disabled", type: "boolean", default: "false", description: "Dims the icons and ignores input." },
        { prop: "label", type: "ReactNode", description: "Visible label above the icons. Names the control." },
        {
          prop: "formatValue",
          type: "(value: number, max: number) => string",
          default: '"3.5 of 5"',
          description: "Text read to screen readers for the value.",
        },
        { prop: "onHoverChange", type: "(value: number | null) => void", description: "The previewed value while the pointer is over the icons, then null." },
        { prop: "name", type: "string", description: "Submits the value with a surrounding form." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Icon size: 16, 24 or 32px." },
        { prop: "containerClassName", type: "string", description: "Classes for the outer block when a label is set." },
      ],
    },
  ],
  notes: [
    "The icon row is a role=\"slider\" with aria-valuetext such as \"3.5 of 5\", or \"No rating\" at 0.",
    "Right and Up raise the value, Left and Down lower it, Home clears and End sets the maximum. Number keys jump straight to a value.",
    "Without a visible label, pass aria-label.",
    "Newly lit icons flicker on in sequence. With reduced motion they switch on without the flicker.",
  ],
};
