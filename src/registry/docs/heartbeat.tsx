import type { ComponentDoc } from "../types";
import HeartbeatDemo from "../examples/heartbeat/demo";
import HeartbeatLiveRate from "../examples/heartbeat/live-rate";
import HeartbeatRates from "../examples/heartbeat/rates";
import HeartbeatServiceStatus from "../examples/heartbeat/service-status";

export const doc: ComponentDoc = {
  usage: `import { Heartbeat } from "@/components/ui/heartbeat"

<Heartbeat bpm={72} />`,
  examples: [
    {
      name: "demo",
      title: "Patient monitor",
      description:
        "The trace sweeps left to right behind a bright leading dot and fades out along its tail. onBeat fires on every R peak; here it thumps the heart icon.",
      component: HeartbeatDemo,
    },
    {
      name: "rates",
      title: "Rates",
      description: "The sweep fits a whole number of beats on screen, so the rhythm stays true to bpm at any width.",
      component: HeartbeatRates,
    },
    {
      name: "live-rate",
      title: "Changing rate",
      description: "Change bpm on the fly and the dot carries on from where it was.",
      component: HeartbeatLiveRate,
    },
    {
      name: "service-status",
      title: "Service health",
      description: "A small strip as an is-it-alive signal. bpm={0} flatlines.",
      component: HeartbeatServiceStatus,
    },
  ],
  api: [
    {
      name: "Heartbeat",
      description: "Renders a div with role=\"img\" and accepts its attributes; the ref points at it. It fills its container's width.",
      props: [
        { prop: "bpm", type: "number", default: "72", description: "Beats per minute. 0 draws a flat line." },
        { prop: "height", type: "number", default: "96", description: "Height in pixels." },
        { prop: "onBeat", type: "() => void", description: "Called as each R peak passes the leading dot. Not called under reduced motion." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "Screen readers hear \"Heart rate 72 beats per minute\". Pass aria-label for other meanings, such as a service being up.",
    "The strip is one SVG path drawn once; each frame only moves a gradient window and the dot, so nothing re-renders while it runs.",
    "It pauses while off screen or in a hidden tab, and keeps its place when it resumes.",
    "With reduced motion, the trace holds still with the dot near the right edge.",
  ],
};
