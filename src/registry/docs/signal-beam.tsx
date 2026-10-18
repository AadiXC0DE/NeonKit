import type { ComponentDoc } from "../types";
import SignalBeamDemo from "../examples/signal-beam/demo";
import SignalBeamDirections from "../examples/signal-beam/directions";
import SignalBeamStates from "../examples/signal-beam/states";

export const doc: ComponentDoc = {
  usage: `import { SignalBeam } from "@/components/ui/signal-beam"

const container = useRef(null)
const from = useRef(null)
const to = useRef(null)

<div ref={container} className="relative flex justify-between">
  <span ref={from}>…</span>
  <span ref={to}>…</span>
  <SignalBeam containerRef={container} fromRef={from} toRef={to} curvature={30} />
</div>`,
  examples: [
    {
      name: "demo",
      title: "Integrations hub",
      description: "Five sources feed one hub. The paused one keeps its tube but carries nothing.",
      component: SignalBeamDemo,
    },
    {
      name: "directions",
      title: "Reverse and both ways",
      description: "A request goes out and a response comes back on the same tube, half a cycle apart.",
      component: SignalBeamDirections,
    },
    {
      name: "states",
      title: "Live, slow and dark",
      description: "Glow marks a link that's carrying traffic; a dark tube is dashed and unlit.",
      component: SignalBeamStates,
    },
  ],
  api: [
    {
      name: "SignalBeam",
      description: "An SVG that fills its positioned parent. Render it inside the container, after or before the nodes. Also accepts native SVG attributes.",
      props: [
        { prop: "fromRef", type: "RefObject<HTMLElement>", description: "Where the tube starts." },
        { prop: "toRef", type: "RefObject<HTMLElement>", description: "Where the tube ends." },
        { prop: "containerRef", type: "RefObject<HTMLElement>", default: "parent", description: "Watched for resizes along with both nodes." },
        { prop: "curvature", type: "number", default: "0", description: "Bow at the middle in pixels. Positive bends left of the direction of travel." },
        { prop: "duration", type: "number", default: "2.4", description: "Seconds for a pulse to cross." },
        { prop: "delay", type: "number", default: "0", description: "Seconds before the first pulse. Stagger beams with it." },
        { prop: "repeatDelay", type: "number", default: "0.8", description: "Seconds of dark between pulses." },
        { prop: "reverse", type: "boolean", default: "false", description: "Run from `to` back to `from`." },
        { prop: "bidirectional", type: "boolean", default: "false", description: "Pulses both ways, half a cycle apart." },
        { prop: "pulseLength", type: "number", default: "0.3", description: "Pulse length as a share of the tube, 0.05 to 1." },
        { prop: "width", type: "number", default: "2", description: "Tube thickness in pixels." },
        { prop: "active", type: "boolean", default: "true", description: "False leaves a dashed, unlit tube with no pulse." },
        { prop: "gap", type: "number", default: "4", description: "Pixels between a node's edge and the tube's end." },
        { prop: "fromOffset", type: "[number, number]", description: "Nudges the start point, in pixels." },
        { prop: "toOffset", type: "[number, number]", description: "Nudges the end point, in pixels." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the tube and its light." },
      ],
    },
  ],
  notes: [
    "Decorative: the SVG is aria-hidden. Describe the connection in text if it carries meaning.",
    "Ends leave each node along the tube's tangent, from the edge of a box or the rim of a round node, so the tube never starts under a card.",
    "The pulse is CSS animating a dash offset on a path with pathLength 1. No script runs per frame, and a resize only rewrites the path.",
    "Pulses pause off screen and in background tabs. With reduced motion each pulse holds still, partway along its tube.",
    "Inside a scaled parent (a zoomed preview) the geometry is corrected for the scale.",
  ],
};
