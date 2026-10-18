import type { ComponentDoc } from "../types";
import CyberButtonDemo from "../examples/cyber-button/demo";
import CyberButtonVariants from "../examples/cyber-button/variants";
import CyberButtonSizes from "../examples/cyber-button/sizes";
import CyberButtonColors from "../examples/cyber-button/colors";
import CyberButtonAsLink from "../examples/cyber-button/as-link";

export const doc: ComponentDoc = {
  usage: `import { CyberButton } from "@/components/ui/cyber-button"

<CyberButton variant="solid">Connect</CyberButton>`,
  examples: [
    {
      name: "demo",
      title: "Uplink panel",
      description: "A scan line sweeps the face now and then. Hover for a short RGB-split glitch.",
      component: CyberButtonDemo,
    },
    { name: "variants", title: "Outline and solid", component: CyberButtonVariants },
    {
      name: "sizes",
      title: "Sizes",
      description: "32, 40 and 48px tall like Button; the chamfer grows with the size.",
      component: CyberButtonSizes,
    },
    {
      name: "colors",
      title: "Colors",
      description: "colorAlt sets the second channel of the glitch.",
      component: CyberButtonColors,
    },
    { name: "as-link", title: "As a link", component: CyberButtonAsLink },
  ],
  api: [
    {
      name: "CyberButton",
      description: "Also accepts every native button attribute. The ref points at the button (or the asChild element).",
      props: [
        { prop: "variant", type: '"outline" | "solid"', default: '"outline"', description: "Dark face with a lit frame, or a lit face." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "32, 40 or 48px tall, with a 7, 9 or 11px chamfer." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "colorAlt", type: "NeonColor", default: '"magenta"', description: "Second channel of the RGB split on hover." },
        { prop: "scanDuration", type: "number", default: "3.6", description: "Seconds between passes of the scan line. 0 turns it off." },
        { prop: "asChild", type: "boolean", default: "false", description: "Render the child element (a link, say) with the frame and merge props onto it." },
        { prop: "disabled", type: "boolean", default: "false", description: "Dims the button and blocks clicks. With asChild it sets aria-disabled and removes it from the tab order." },
      ],
    },
  ],
  notes: [
    "Labels render uppercase with wide tracking. Screen readers get the text as written; the glitch copies are aria-hidden.",
    "The focus ring follows the chamfer: same width, offset and color as Button's ring.",
    "The glitch plays once per hover, only on devices that can hover, and never under prefers-reduced-motion. The scan line is hidden there too.",
    "The chamfer is a clip-path, so put shadows on a wrapper with filter: drop-shadow rather than box-shadow on the button.",
  ],
};
