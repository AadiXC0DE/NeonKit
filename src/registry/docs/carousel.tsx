import type { ComponentDoc } from "../types";
import CarouselDemo from "../examples/carousel/demo";
import CarouselAutoplay from "../examples/carousel/autoplay";
import CarouselGallery from "../examples/carousel/gallery";
import CarouselVertical from "../examples/carousel/vertical";

export const doc: ComponentDoc = {
  usage: `import { Carousel, CarouselContent, CarouselDots, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

<Carousel aria-label="Releases" className="sm:[--slides:2] lg:[--slides:3]">
  <CarouselContent>
    <CarouselItem>…</CarouselItem>
  </CarouselContent>
  <CarouselDots />
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`,
  examples: [
    {
      name: "demo",
      title: "Release cards",
      description: "One card on phones, two on tablets, three on desktop, set with --slides. Drag with the mouse or swipe.",
      component: CarouselDemo,
    },
    {
      name: "autoplay",
      title: "Autoplay",
      description:
        "The active dot is a tube that fills with the timer. It pauses on hover, focus and hidden tabs, keeps its place, and never runs under reduced motion.",
      component: CarouselAutoplay,
    },
    {
      name: "gallery",
      title: "Gallery with progress",
      description: "Fractional --slides shows the next card peeking in. The lit segment tracks the scroll, drags included.",
      component: CarouselGallery,
    },
    {
      name: "vertical",
      title: "Vertical",
      description: "orientation=\"vertical\" scrolls on the y axis; give the viewport a height.",
      component: CarouselVertical,
    },
  ],
  api: [
    {
      name: "Carousel",
      description: "Renders a section with aria-roledescription=\"carousel\". Give it an aria-label. Accepts every native section attribute.",
      props: [
        { prop: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Scroll axis. Arrow keys follow it." },
        { prop: "loop", type: "boolean", default: "false", description: "Previous and next wrap around at the ends." },
        { prop: "autoplay", type: "boolean | number", default: "false", description: "Advances on a timer; a number is the delay in ms (5000 by default). Always wraps." },
        { prop: "defaultIndex", type: "number", default: "0", description: "Starting position, jumped to without animation." },
        { prop: "onSlideChange", type: "(index: number) => void", description: "Called when the snap position changes, by any means." },
        { prop: "apiRef", type: "Ref<CarouselApi>", description: "scrollTo(i), next(), prev(), getIndex(), getCount(), play() and pause()." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "CSS variables",
      description: "Set on Carousel, with responsive variants, e.g. className=\"[--slides:1] md:[--slides:3]\".",
      props: [
        { prop: "--slides", type: "number", default: "1", description: "Slides in view. Fractions let the next one peek in." },
        { prop: "--gap", type: "length", default: "16px", description: "Space between slides." },
      ],
    },
    {
      name: "CarouselContent",
      description: "The scroll-snap viewport and its track. Accepts every native div attribute for the track.",
      props: [
        { prop: "viewportClassName", type: "string", description: "Classes for the scrolling viewport. Vertical carousels need a height here." },
      ],
    },
    {
      name: "CarouselItem",
      description: "One slide: role=\"group\", aria-roledescription=\"slide\", labelled \"2 of 6\" unless you pass aria-label.",
      props: [],
    },
    {
      name: "CarouselPrevious, CarouselNext",
      description: "Icon buttons, disabled at the ends unless loop is on. Pass children to replace the chevron.",
      props: [],
    },
    {
      name: "CarouselDots, CarouselProgress, CarouselPlayToggle",
      description:
        "Dots are one button per snap position. Progress is a decorative track with a lit segment. The play toggle only renders when autoplay is on.",
      props: [],
    },
  ],
  notes: [
    "Built on native scroll snap: touch, trackpads and the mouse wheel all scroll it, and nothing is measured per frame.",
    "The viewport is a polite live region, so assistive tech hears the new slide after next or previous. It goes quiet while autoplay runs.",
    "Autoplay stops for hover, keyboard focus and hidden tabs, and the pause button stops it for good. WCAG 2.2.2 needs that button, so render it.",
    "Arrow keys move between slides when focus is on a dot, a button or the viewport.",
    "A drag never fires the click it ended on, so slides can hold links.",
    "Under prefers-reduced-motion, scrolling jumps instead of gliding and autoplay is off.",
  ],
};
