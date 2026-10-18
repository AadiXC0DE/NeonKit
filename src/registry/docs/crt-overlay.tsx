import type { ComponentDoc } from "../types";
import CrtOverlayDemo from "../examples/crt-overlay/demo";
import CrtOverlayPhosphor from "../examples/crt-overlay/phosphor";
import CrtOverlayTestCard from "../examples/crt-overlay/test-card";
import CrtOverlaySignIn from "../examples/crt-overlay/sign-in";

export const doc: ComponentDoc = {
  usage: `import { CrtOverlay } from "@/components/ui/crt-overlay"

<CrtOverlay curvature className="aspect-[4/3]">
  <p>Insert coin</p>
</CrtOverlay>`,
  examples: [
    {
      name: "demo",
      title: "Arcade monitor",
      description:
        "The screen powers on when it mounts. Press the power key: the picture collapses to a white line, then a dot that fades. Press again and it opens back up.",
      component: CrtOverlayDemo,
    },
    {
      name: "phosphor",
      title: "Monochrome phosphor",
      description: "phosphor tints everything in one color, like an amber or green terminal.",
      component: CrtOverlayPhosphor,
    },
    {
      name: "test-card",
      title: "Effects",
      description: "Each effect can be switched off on its own.",
      component: CrtOverlayTestCard,
    },
    {
      name: "sign-in",
      title: "Anything inside",
      description: "The overlays ignore the pointer, so forms and buttons on the screen still work.",
      component: CrtOverlaySignIn,
    },
  ],
  api: [
    {
      name: "CrtOverlay",
      description:
        "Also accepts div attributes, and the ref points at the screen. className and style go to the screen; give it a size or aspect ratio when the content doesn't set one.",
      props: [
        { prop: "on", type: "boolean", default: "true", description: "Power. Off collapses the picture to a line and a dot; on reverses it." },
        { prop: "animateOnMount", type: "boolean", default: "false", description: "Play the power-on animation when the screen first mounts lit." },
        { prop: "onPowerComplete", type: "(on: boolean) => void", description: "Called when a power-on or power-off animation finishes." },
        { prop: "scanlines", type: "boolean", default: "true", description: "Horizontal scanlines and a faint aperture grille." },
        { prop: "flicker", type: "boolean", default: "true", description: "A slow refresh bar and the odd faint brightness dip." },
        { prop: "chromatic", type: "boolean", default: "true", description: "Red and blue fringes on text, like a slightly misconverged tube." },
        { prop: "glow", type: "boolean", default: "true", description: "Text blooms in the phosphor color." },
        { prop: "curvature", type: "boolean", default: "false", description: "Rounded, bulging glass with darker edges and a curved reflection." },
        { prop: "phosphor", type: "boolean", default: "false", description: "Tints the whole picture in the phosphor color." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Phosphor color for the glow, the tint and the light the screen throws." },
      ],
    },
  ],
  notes: [
    "Scanlines, glass and glow are aria-hidden and ignore the pointer; the content stays readable and interactive.",
    "While off, the content is inert and hidden from assistive tech, and it comes back when the screen powers on.",
    "Flicker is a slow refresh bar plus a few faint dips in brightness every few seconds, never a strobe.",
    "With reduced motion there's no flicker or refresh bar, and power on and off become a short fade.",
    "Chromatic fringes and glow are text-shadows that the content inherits; text that sets its own text-shadow keeps it.",
  ],
};
