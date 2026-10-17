import type { ComponentDoc } from "../types";
import NeonFrameDemo from "../examples/neon-frame/demo";
import NeonFrameRegions from "../examples/neon-frame/regions";
import NeonFrameCamera from "../examples/neon-frame/camera";

export const doc: ComponentDoc = {
  usage: `import { NeonFrame } from "@/components/ui/neon-frame"

<NeonFrame as="section" label="Relay KX-7" tabs={{ topRight: "Ch 04" }}>
  …
</NeonFrame>`,
  examples: [
    {
      name: "demo",
      title: "Telemetry panel",
      description:
        "When the frame scrolls into view, light runs out of each corner along the bracket glass, then the tabs settle onto the edges. The scan line sweeps every few seconds.",
      component: NeonFrameDemo,
    },
    {
      name: "regions",
      title: "Pick a target",
      description:
        "active locks the chosen frame on: its brackets tighten and brighten. active={false} parks the others in standby, as unlit glass that lights on hover and focus. Native radios keep the arrow keys.",
      component: NeonFrameRegions,
    },
    {
      name: "camera",
      title: "Tabs on every corner",
      description:
        "As a figure, the label names it. Tabs take any content, like a recording dot. A small amber frame inside marks a detection.",
      component: NeonFrameCamera,
    },
  ],
  api: [
    {
      name: "NeonFrame",
      description:
        "Also accepts the native attributes of the element it renders. Corners are square so the brackets meet them; padding comes from className.",
      props: [
        { prop: "as", type: '"div" | "section" | "article" | "aside" | "figure"', default: '"div"', description: "Element to render." },
        {
          prop: "label",
          type: "ReactNode",
          description: "The frame's name, on a lit tab at the top-left edge. On anything but a div it also labels the element.",
        },
        {
          prop: "tabs",
          type: "{ topRight?: ReactNode; bottomLeft?: ReactNode; bottomRight?: ReactNode }",
          description: "Quieter tabs on the other corners, for a channel, a status or a reading.",
        },
        { prop: "scanline", type: "boolean", default: "false", description: "A slow scan line sweeps down over the content." },
        { prop: "bracket", type: "number", default: "18", description: "Length of each bracket arm in pixels." },
        {
          prop: "active",
          type: "boolean",
          description: "Leave undefined for a frame that is always lit. true locks on (brackets tighten and brighten); false parks it in standby until hovered or focused.",
        },
        { prop: "animate", type: "boolean", default: "true", description: "Draw the brackets in from the corners when the frame scrolls into view." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Bracket and label color. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "Brackets, the scan line and the corner light are aria-hidden; tabs are plain text, read in order around the content.",
    "Rendered as a section, article, aside or figure, the frame is named by its label through aria-labelledby, unless you pass aria-label or aria-labelledby.",
    "Focus inside the frame brightens the brackets, the same as hover, and lights a standby frame.",
    "With reduced motion the brackets and tabs appear at once and there is no scan line.",
  ],
};
