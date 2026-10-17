import type { ComponentDoc } from "../types";
import ImageCompareDemo from "../examples/image-compare/demo";
import ImageCompareVertical from "../examples/image-compare/vertical";
import ImageCompareHover from "../examples/image-compare/hover";
import ImageCompareControlled from "../examples/image-compare/controlled";

export const doc: ComponentDoc = {
  usage: `import { ImageCompare } from "@/components/ui/image-compare"

<ImageCompare
  className="aspect-[3/2]"
  beforeLabel="Raw"
  afterLabel="Graded"
  before={<img src="/raw.jpg" alt="" />}
  after={<img src="/graded.jpg" alt="Shibuya at night" />}
/>`,
  examples: [
    {
      name: "demo",
      title: "Raw and graded",
      description:
        "The divider is a lit tube with a handle riding on it; the tube stops short of the handle on both sides, like blockout paint. Press anywhere to glide it there, then drag.",
      component: ImageCompareDemo,
    },
    {
      name: "vertical",
      title: "Vertical",
      description: "Any children work, here a grain overlay drawn in SVG. Labels fade as the divider covers them.",
      component: ImageCompareVertical,
    },
    {
      name: "hover",
      title: "Scrub on hover",
      description: "With hover, a mouse moves the divider without pressing. Touch still drags.",
      component: ImageCompareHover,
    },
    {
      name: "controlled",
      title: "Controlled",
      description: "value and onValueChange, with presets driving it from outside.",
      component: ImageCompareControlled,
    },
  ],
  api: [
    {
      name: "ImageCompare",
      description: "Give the root a size or an aspect ratio, or let the after layer set it. Images inside fill and cover their layer.",
      props: [
        { prop: "before", type: "ReactNode", description: "Shown on the left (or top), up to the divider." },
        { prop: "after", type: "ReactNode", description: "Shown on the right (or bottom). Its alt text is the one read; leave the before image's alt empty." },
        { prop: "beforeLabel", type: "ReactNode", description: "Caption on the before side. Strings also name the slider." },
        { prop: "afterLabel", type: "ReactNode", description: "Caption on the after side." },
        { prop: "value", type: "number", description: "Controlled divider position, 0 to 100." },
        { prop: "defaultValue", type: "number", default: "50", description: "Initial position when uncontrolled." },
        { prop: "onValueChange", type: "(value: number) => void", description: "Called on every move." },
        { prop: "onValueCommit", type: "(value: number) => void", description: "Called once a drag or key press ends." },
        { prop: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Vertical splits top from bottom." },
        { prop: "hover", type: "boolean", default: "false", description: "A mouse moves the divider without pressing." },
        { prop: "step", type: "number", default: "1", description: "Percent per arrow key. Page Up and Page Down move ten steps." },
        { prop: "disabled", type: "boolean", default: "false", description: "Blocks input and takes the handle out of the tab order." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "The handle is a slider with aria-valuetext like \"42% Raw, 58% Graded\".",
    "Arrows move by step (Right and Down increase in both orientations), Page Up and Page Down by ten steps, Home and End go to the edges.",
    "Horizontal compares keep vertical touch scrolling for the page, and vertical ones keep horizontal.",
    "With reduced motion the divider never glides; it goes straight to the press.",
  ],
};
