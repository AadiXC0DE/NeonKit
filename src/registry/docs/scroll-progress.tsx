import type { ComponentDoc } from "../types";
import ScrollProgressDemo from "../examples/scroll-progress/demo";
import ScrollProgressRing from "../examples/scroll-progress/ring";
import ScrollProgressLog from "../examples/scroll-progress/log";
import ScrollProgressPage from "../examples/scroll-progress/page";

export const doc: ComponentDoc = {
  usage: `import { ScrollProgress } from "@/components/ui/scroll-progress"

// Follows the page, pinned to the top of the window
<ScrollProgress />

// Follows a scroll container
<ScrollProgress target={articleRef} />`,
  examples: [
    {
      name: "demo",
      title: "Article with back to top",
      description: "A bar for the container, and a ring inside the back-to-top button that appears after 12%.",
      component: ScrollProgressDemo,
    },
    {
      name: "ring",
      title: "Ring with a reading",
      description: "onProgressChange reports whole percentages, so the label renders only when the number changes.",
      component: ScrollProgressRing,
    },
    { name: "log", title: "Thin, on a log", component: ScrollProgressLog },
    {
      name: "page",
      title: "This page",
      description: "Without a target it follows the window. This one is pinned to the bottom edge.",
      component: ScrollProgressPage,
    },
  ],
  api: [
    {
      name: "ScrollProgress",
      description: "A progressbar. Also accepts div attributes; children render in the middle of the ring.",
      props: [
        { prop: "target", type: "RefObject<HTMLElement>", default: "the page", description: "A scroll container to follow." },
        { prop: "variant", type: '"bar" | "ring"', default: '"bar"', description: "A tube along an edge, or a ring." },
        { prop: "fixed", type: "boolean", default: "!target", description: "Pin the bar to the viewport edge." },
        { prop: "position", type: '"top" | "bottom"', default: '"top"', description: "Edge a fixed bar sits on." },
        { prop: "thickness", type: "number", default: "3 (bar), 2 (ring)", description: "Tube thickness in pixels." },
        { prop: "size", type: "number", default: "44", description: "Ring diameter in pixels." },
        { prop: "onProgressChange", type: "(percent: number) => void", description: "Whole-number percentage, 0 to 100, when it changes." },
        { prop: "aria-label", type: "string", default: '"Reading progress"', description: "Name of the progressbar." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the tube." },
      ],
    },
  ],
  notes: [
    "It's a progressbar with aria-valuenow in whole percent, updated only when the number changes.",
    "Scroll writes go straight to the DOM once per frame: a translate on the lit tube for the bar, a dash and a rotation for the ring. Nothing lays out per frame and React doesn't re-render while you scroll.",
    "The lit tube is translated rather than scaled, so its white-hot tip and halo never stretch. At 100% the whole tube burns a little brighter.",
    "A ResizeObserver catches content that grows or shrinks without a scroll, such as images loading.",
    "Inside a button the ring's children are the button's content; give the button its own aria-label.",
  ],
};
