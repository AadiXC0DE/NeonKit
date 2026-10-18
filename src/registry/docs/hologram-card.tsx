import type { ComponentDoc } from "../types";
import HologramCardDemo from "../examples/hologram-card/demo";
import HologramCardFoils from "../examples/hologram-card/foils";
import HologramCardMemberPass from "../examples/hologram-card/member-pass";
import HologramCardReleaseLink from "../examples/hologram-card/release-link";

export const doc: ComponentDoc = {
  usage: `import { HologramCard } from "@/components/ui/hologram-card"

<HologramCard className="aspect-[5/7] w-64 p-5">
  <h3>Kowloon Nights</h3>
</HologramCard>`,
  examples: [
    {
      name: "demo",
      title: "Trading card",
      description:
        "Move the pointer across it. The card tilts toward you, a rainbow sweeps through the foil, a glare follows the light and the edge catches it. Let go and it springs back flat.",
      component: HologramCardDemo,
    },
    {
      name: "foils",
      title: "Foils",
      description: "The texture the sheen catches on: fine lines, a dot screen or glitter. Smooth drops the texture.",
      component: HologramCardFoils,
    },
    {
      name: "member-pass",
      title: "Member pass",
      description: "A gentler maxTilt suits wide cards.",
      component: HologramCardMemberPass,
    },
    {
      name: "release-link",
      title: "As a link",
      description: "Put a link inside. Tabbing to it tilts the card to a still pose and lights the foil.",
      component: HologramCardReleaseLink,
    },
  ],
  api: [
    {
      name: "HologramCard",
      description:
        "Also accepts div attributes, and the ref points at the card. className and style go to the card face, so size, padding, radius and background all work as usual.",
      props: [
        { prop: "maxTilt", type: "number", default: "12", description: "Largest tilt in degrees, reached at the card's edges." },
        { prop: "foil", type: '"lines" | "dots" | "glitter" | "smooth"', default: '"lines"', description: "Texture the rainbow sheen catches on." },
        { prop: "intensity", type: "number", default: "1", description: "Strength of the sheen and glare, 0 to 1." },
        { prop: "glare", type: "boolean", default: "true", description: "A soft spot of light that follows the pointer." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Tints the foil, the edge light and the glow around the card." },
      ],
    },
  ],
  notes: [
    "Every light layer is aria-hidden and ignores the pointer, so links, buttons and text inside behave normally.",
    "Keyboard focus inside the card (focus-visible only) tilts it a few degrees to a fixed pose; it settles when focus leaves.",
    "Mouse, pen and touch all tilt it. On touch the page can still scroll, and the card settles when the finger lifts.",
    "With reduced motion the card never tilts or tracks the pointer; the foil keeps a still sheen.",
    "Tilt, glare and sheen move with transforms driven by springs, without re-rendering React while the pointer moves.",
    "Don't put overflow-hidden on the card itself: it clips the light the card throws around it. The foil layers already clip to the rounded corners.",
  ],
};
