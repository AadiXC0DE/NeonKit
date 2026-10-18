import type { ComponentDoc } from "../types";
import ShimmerButtonDemo from "../examples/shimmer-button/demo";
import ShimmerButtonVariants from "../examples/shimmer-button/variants";
import ShimmerButtonSizes from "../examples/shimmer-button/sizes";
import ShimmerButtonTempo from "../examples/shimmer-button/tempo";
import ShimmerButtonAsLink from "../examples/shimmer-button/as-link";

export const doc: ComponentDoc = {
  usage: `import { ShimmerButton } from "@/components/ui/shimmer-button"

<ShimmerButton size="lg">Claim your handle</ShimmerButton>`,
  examples: [
    {
      name: "demo",
      title: "Waitlist call to action",
      description: "A beam runs the border at one steady speed while a soft sheen crosses the glass every few seconds.",
      component: ShimmerButtonDemo,
    },
    {
      name: "variants",
      title: "Outline and solid",
      description: "Outline is dark glass with a lit edge. Solid lights the whole face and turns the beam white.",
      component: ShimmerButtonVariants,
    },
    {
      name: "sizes",
      title: "Sizes",
      description: "Heights and radii match Button, so the two share a row.",
      component: ShimmerButtonSizes,
    },
    {
      name: "tempo",
      title: "Tempo",
      description: "beamDuration sets seconds per lap; shimmerDuration sets the gap between sweeps.",
      component: ShimmerButtonTempo,
    },
    {
      name: "as-link",
      title: "As a link",
      description: "asChild hands the shimmer to its child, so a link stays a link.",
      component: ShimmerButtonAsLink,
    },
  ],
  api: [
    {
      name: "ShimmerButton",
      description: "Also accepts every native button attribute. The ref points at the button (or the asChild element).",
      props: [
        { prop: "variant", type: '"outline" | "solid"', default: '"outline"', description: "Dark glass with a lit edge, or a lit face." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "32, 40 or 48px tall, like Button." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "beamDuration", type: "number", default: "4", description: "Seconds for the beam to run once around the border." },
        { prop: "shimmerDuration", type: "number", default: "3.2", description: "Seconds from one sweep across the face to the next." },
        { prop: "asChild", type: "boolean", default: "false", description: "Render the child element (a link, say) with the shimmer and merge props onto it." },
        { prop: "disabled", type: "boolean", default: "false", description: "Dims the button and blocks clicks. With asChild it sets aria-disabled and removes it from the tab order." },
      ],
    },
  ],
  notes: [
    "It is a native button, so Enter and Space activate it and the focus ring matches Button.",
    "The beam and the sweep are decoration: aria-hidden and pointer-events: none.",
    "The beam is drawn as dashes on an SVG rect, so it travels at a constant speed on wide buttons instead of racing along the long edges.",
    "Under prefers-reduced-motion the beam parks at a fixed spot and the sweep is hidden.",
  ],
};
