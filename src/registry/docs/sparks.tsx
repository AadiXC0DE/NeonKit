import type { ComponentDoc } from "../types";
import SparksDemo from "../examples/sparks/demo";
import SparksHold from "../examples/sparks/hold";
import SparksRating from "../examples/sparks/rating";
import SparksWrapper from "../examples/sparks/wrapper";

export const doc: ComponentDoc = {
  usage: `import { useSparks } from "@/components/ui/sparks"

const { ref, fire } = useSparks({ count: 48, spread: 150 })

<Button ref={ref} onClick={() => fire()}>Deploy</Button>`,
  examples: [
    {
      name: "demo",
      title: "On a deploy",
      description: "The burst waits for the deploy to land, not the click.",
      component: SparksDemo,
    },
    {
      name: "hold",
      title: "Hold to confirm",
      description: "Fired from Hold Button's onComplete, in every direction.",
      component: SparksHold,
    },
    {
      name: "rating",
      title: "Five stars only",
      description: "fireSparks takes any element as its origin, here the star that was picked.",
      component: SparksRating,
    },
    {
      name: "wrapper",
      title: "Wrapper",
      description: "<Sparks> fires on any click inside it, from the pointer, or from the button when it's pressed with the keyboard.",
      component: SparksWrapper,
    },
  ],
  api: [
    {
      name: "useSparks",
      description: "Returns { ref, fire }. Put ref on an element and fire() bursts from its centre in its --neon color.",
      props: [
        { prop: "defaults", type: "SparksOptions", default: "{}", description: "Options for every burst; options passed to fire() win." },
      ],
    },
    {
      name: "SparksOptions",
      description: "Also accepted by fireSparks(options), which needs no hook.",
      props: [
        { prop: "origin", type: "Element | DOMRect", description: "Fires from its centre. An element also lends its --neon and --neon-glow." },
        { prop: "x, y", type: "number", description: "Viewport coordinates, instead of the origin's centre." },
        { prop: "color", type: "NeonColor", description: "Overrides the origin's color." },
        { prop: "count", type: "number", default: "40", description: "Number of sparks." },
        { prop: "angle", type: "number", default: "-90", description: "Direction in degrees; -90 is straight up." },
        { prop: "spread", type: "number", default: "360", description: "Width of the cone in degrees." },
        { prop: "velocity", type: "number", default: "520", description: "Launch speed in pixels per second." },
        { prop: "gravity", type: "number", default: "900", description: "Pull in pixels per second squared." },
        { prop: "drag", type: "number", default: "2.4", description: "Air drag per second." },
        { prop: "life", type: "number", default: "0.9", description: "Seconds a spark burns, give or take 40%." },
      ],
    },
    {
      name: "Sparks",
      description: "A wrapper with no box of its own (display: contents). Takes every SparksOptions field except origin, x and y, plus span attributes.",
      props: [
        { prop: "disabled", type: "boolean", default: "false", description: "Stop firing without unwrapping." },
        { prop: "color", type: "NeonColor", default: "clicked element", description: "Otherwise the clicked element's --neon." },
      ],
    },
  ],
  notes: [
    "Sparks draw on one canvas fixed over the viewport, added on the first burst and removed when the last spark dies. It's aria-hidden and ignores the pointer.",
    "Each spark is a short streak whose length follows its speed, white-hot at birth, the neon color through most of its life and a flickering ember at the end. Slow embers drift on less gravity.",
    "The canvas is capped at 2× pixel density, holds at most 900 sparks, and drops everything when the tab is hidden.",
    "With reduced motion nothing flies: a single soft bloom of the color fades where the burst would have been.",
    "Bursts are decoration. Announce the event itself (a toast, a live region) as you would without them.",
  ],
};
