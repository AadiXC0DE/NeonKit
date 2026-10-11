import type { ComponentDoc } from "../types";
import ProgressDemo from "../examples/progress/demo";
import ProgressIndeterminate from "../examples/progress/indeterminate";
import ProgressCircular from "../examples/progress/circular";
import ProgressSizes from "../examples/progress/sizes";

export const doc: ComponentDoc = {
  usage: `import { Progress } from "@/components/ui/progress"

<Progress value={64} label="Uploading brand-assets.zip" showValue />`,
  examples: [
    {
      name: "demo",
      title: "Upload list",
      description: "The sheen stops once a bar is full, so finished work goes quiet.",
      component: ProgressDemo,
    },
    {
      name: "indeterminate",
      title: "Indeterminate",
      description: "Leave value undefined when you can't measure the work yet.",
      component: ProgressIndeterminate,
    },
    {
      name: "circular",
      title: "Circular",
      description: "CircularProgress renders children in the center, or the percentage with showValue.",
      component: ProgressCircular,
    },
    { name: "sizes", title: "Sizes", component: ProgressSizes },
  ],
  api: [
    {
      name: "Progress",
      description: "Also accepts every native div attribute.",
      props: [
        { prop: "value", type: "number", description: "Current value. Undefined renders an indeterminate bar." },
        { prop: "max", type: "number", default: "100", description: "Value that counts as complete." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Track height: 4, 8 or 12px." },
        { prop: "indeterminate", type: "boolean", default: "false", description: "Slides a segment of light instead of showing the value." },
        { prop: "label", type: "ReactNode", description: "Text above the track, also used as the accessible name." },
        { prop: "showValue", type: "boolean", default: "false", description: "Shows the rounded percentage at the right of the label row." },
      ],
    },
    {
      name: "CircularProgress",
      description: "Also accepts every native div attribute.",
      props: [
        { prop: "value", type: "number", description: "Current value. Undefined renders a spinning arc." },
        { prop: "max", type: "number", default: "100", description: "Value that counts as complete." },
        { prop: "size", type: "number", default: "64", description: "Diameter in pixels." },
        { prop: "thickness", type: "number", default: "6", description: "Stroke width in pixels." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "showValue", type: "boolean", default: "false", description: "Renders the percentage in the center." },
        { prop: "indeterminate", type: "boolean", default: "false", description: "Spins a fixed arc instead of showing the value." },
        { prop: "children", type: "ReactNode", description: "Custom center content. Replaces the percentage." },
      ],
    },
  ],
  notes: [
    "Both components render role=\"progressbar\" with aria-valuemin, aria-valuemax and aria-valuenow, and drop aria-valuenow while indeterminate.",
    "label becomes the accessible name through aria-labelledby; without one, pass aria-label or it falls back to \"Progress\".",
    "The sheen is hidden and the indeterminate animations slow down when the user prefers reduced motion.",
  ],
};
