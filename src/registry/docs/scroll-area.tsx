import type { ComponentDoc } from "../types";
import ScrollAreaDemo from "../examples/scroll-area/demo";
import ScrollAreaTags from "../examples/scroll-area/tags";
import ScrollAreaBuildLog from "../examples/scroll-area/build-log";
import ScrollAreaScrollbarModes from "../examples/scroll-area/scrollbar-modes";

export const doc: ComponentDoc = {
  usage: `import { ScrollArea } from "@/components/ui/scroll-area"

<ScrollArea aria-label="Changelog" className="h-80 rounded-xl border border-white/10">
  …
</ScrollArea>`,
  examples: [
    {
      name: "demo",
      title: "Changelog",
      description:
        "Give the root a height or max-height. Fades appear only on edges with more content past them and grow as you scroll away from an edge.",
      component: ScrollAreaDemo,
    },
    {
      name: "tags",
      title: "Horizontal",
      description: "The bar overlays the content, so leave a little padding under it. Wheel input over the bar scrolls sideways.",
      component: ScrollAreaTags,
    },
    {
      name: "build-log",
      title: "Both axes",
      description: "Long lines scroll sideways while the log scrolls down.",
      component: ScrollAreaBuildLog,
    },
    {
      name: "scrollbar-modes",
      title: "Scrollbar visibility",
      component: ScrollAreaScrollbarModes,
    },
  ],
  api: [
    {
      name: "ScrollArea",
      description:
        "Also accepts native div attributes, which go to the root along with ref. Size the root with className.",
      props: [
        { prop: "orientation", type: '"vertical" | "horizontal" | "both"', default: '"vertical"', description: "Which axes scroll." },
        {
          prop: "scrollbar",
          type: '"hover" | "always" | "auto"',
          default: '"hover"',
          description: "hover: while the pointer is over it or it's scrolling. auto: whenever the content overflows. always: the track stays visible even without overflow.",
        },
        { prop: "fade", type: "boolean | number", default: "true", description: "Mask the edges that have more content past them. A number sets the fade length in pixels (default 24)." },
        { prop: "viewportClassName", type: "string", description: "Classes for the scrolling viewport." },
        { prop: "viewportRef", type: "Ref<HTMLDivElement>", description: "The scrolling element, for scrollTo() and scroll position." },
        { prop: "onScroll", type: "UIEventHandler<HTMLDivElement>", description: "Fires when the viewport scrolls." },
        {
          prop: "aria-label",
          type: "string",
          description: "Names the viewport and gives it role=\"region\". aria-labelledby works the same way.",
        },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Thumb glow on hover and drag. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "Scrolling stays native: the viewport is a real overflow container, so wheel, trackpad, touch and keyboard scrolling behave exactly as the browser does.",
    "When the content overflows and has nothing focusable inside, the viewport joins the tab order so keyboard users can scroll it with the arrow keys, Page Up and Page Down, Home and End.",
    "The custom thumb is hidden from assistive tech, as native scrollbars are. Drag it, or press the track to jump there and keep dragging.",
    "Pass aria-label when the content needs a name, such as a changelog or a log viewer. The viewport becomes a named region.",
  ],
};
