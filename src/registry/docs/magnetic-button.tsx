import type { ComponentDoc } from "../types";
import MagneticButtonDemo from "../examples/magnetic-button/demo";
import MagneticButtonIcons from "../examples/magnetic-button/icons";
import MagneticButtonStrength from "../examples/magnetic-button/strength";
import MagneticButtonAsLink from "../examples/magnetic-button/as-link";

export const doc: ComponentDoc = {
  usage: `import { MagneticButton } from "@/components/ui/magnetic-button"

<MagneticButton variant="solid" size="lg">Start a conversation</MagneticButton>`,
  examples: [
    {
      name: "demo",
      title: "Contact call to action",
      description: "Bring the pointer near: the button leans toward it on a spring, the label leads a little further, and the glow warms up.",
      component: MagneticButtonDemo,
    },
    {
      name: "icons",
      title: "Icon links",
      description: "Round icon buttons rendered as links with asChild.",
      component: MagneticButtonIcons,
    },
    {
      name: "strength",
      title: "Strength and reach",
      description: "radius is how far beyond the edge the pull starts; strength is how much of the pointer's offset the button follows.",
      component: MagneticButtonStrength,
    },
    { name: "as-link", title: "As a link", component: MagneticButtonAsLink },
  ],
  api: [
    {
      name: "MagneticButton",
      description: "Also accepts every native button attribute. The ref points at the button (or the asChild element).",
      props: [
        { prop: "radius", type: "number", default: "56", description: "Pixels beyond the button's edge where the pull begins. It eases in from zero at that distance." },
        { prop: "strength", type: "number", default: "0.2", description: "Share of the pointer's offset from center the button follows, capped at about a third of its height." },
        { prop: "labelStrength", type: "number", default: "0.3", description: "How much further the label travels than the button, as a share of the button's offset." },
        { prop: "variant", type: '"outline" | "solid" | "ghost"', default: '"outline"', description: "The same faces as Button." },
        { prop: "size", type: '"sm" | "md" | "lg" | "icon"', default: '"md"', description: "32, 40 or 48px tall like Button; icon is a 40px circle." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "asChild", type: "boolean", default: "false", description: "Render the child element (a link, say) as the magnet and merge props onto it." },
        { prop: "disabled", type: "boolean", default: "false", description: "Dims the button, blocks clicks and switches the pull off." },
      ],
    },
  ],
  notes: [
    "The pull only runs for a mouse or pen on devices that can hover. Touch gets a plain button.",
    "Under prefers-reduced-motion the button stays put.",
    "The offset uses the CSS translate property, so it never fights the press scale or your own transforms.",
    "Motion runs on a small spring in requestAnimationFrame with direct style writes; React does not re-render while it moves.",
  ],
};
