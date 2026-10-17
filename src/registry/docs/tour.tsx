import type { ComponentDoc } from "../types";
import TourDemo from "../examples/tour/demo";
import TourControlled from "../examples/tour/controlled";
import TourCoachmark from "../examples/tour/coachmark";

export const doc: ComponentDoc = {
  usage: `import { Tour } from "@/components/ui/tour"

const [open, setOpen] = React.useState(false)

<Tour
  open={open}
  onOpenChange={setOpen}
  steps={[
    { target: "#deploy", title: "Ship from main", body: "Builds the latest commit in about two minutes." },
    { target: logsRef, title: "Logs stay for 14 days", side: "right" },
  ]}
/>`,
  examples: [
    {
      name: "demo",
      title: "Onboarding a dashboard",
      description:
        "Press Take the tour. The page dims except a lit outline around each target, and the outline glides from one to the next. container keeps the dimming inside the dashboard.",
      component: TourDemo,
    },
    {
      name: "controlled",
      title: "Controlled, whole page",
      description:
        "step and open are both controlled, so the links above jump to any step. The first step has no target, so its card sits in the middle of the screen.",
      component: TourControlled,
    },
    {
      name: "coachmark",
      title: "One-step coachmark",
      description: "A single step drops the count and Skip, and labels renames Done.",
      component: TourCoachmark,
    },
  ],
  api: [
    {
      name: "Tour",
      description: "Renders nothing until open. Accepts div attributes for the card; the ref points at it.",
      props: [
        { prop: "steps", type: "TourStep[]", description: "The stops, in order." },
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Starting open state when uncontrolled." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called on Skip, Escape and Done." },
        { prop: "step", type: "number", description: "Controlled step, zero-based." },
        { prop: "defaultStep", type: "number", default: "0", description: "Where an uncontrolled tour starts. It starts there again each time it opens." },
        { prop: "onStepChange", type: "(step: number) => void", description: "Called on Next, Back and the arrow keys." },
        { prop: "onComplete", type: "() => void", description: "Next on the last step. The tour then closes." },
        { prop: "onSkip", type: "(step: number) => void", description: "Skip or Escape, with the step it was on." },
        { prop: "container", type: "RefObject<HTMLElement> | HTMLElement", description: "Dims only this element instead of the page. Give it position: relative. The card still renders in the body, so it's never clipped." },
        { prop: "labels", type: "{ next?, back?, skip?, done? }", default: "Next, Back, Skip tour, Done", description: "Button text." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Outline and button color. Falls back to the color where the tour was opened, then cyan." },
      ],
    },
    {
      name: "TourStep",
      props: [
        {
          prop: "target",
          type: "string | RefObject | HTMLElement | () => HTMLElement",
          description: "A selector, ref, element or function. Leave it out, or point at a hidden element, for a centered card with no cutout.",
        },
        { prop: "title", type: "ReactNode", description: "Labels the dialog." },
        { prop: "body", type: "ReactNode", description: "Describes the dialog." },
        { prop: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Where the card sits. It flips, then falls back to the other axis, when there isn't room." },
        { prop: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment along that side." },
        { prop: "padding", type: "number", default: "6", description: "Space between the target and the outline, in px." },
        { prop: "radius", type: "number", default: "target's radius + padding", description: "Corner radius of the outline." },
      ],
    },
  ],
  notes: [
    "The card is a modal dialog labelled by the step's title and described by its body. A polite live region says \"Step 2 of 5\" as you move.",
    "Focus moves to Next when the tour opens, stays inside the card (Tab wraps), and returns to where it was when the tour closes.",
    "Escape skips. Left and Right go back and forward, unless focus is in a text field inside the card.",
    "Targets scroll into view when they're near an edge, and the outline follows them through scrolling and resizing. A target that mounts a frame late is waited for.",
    "The outline and the dimmed page are one SVG whose geometry is written straight to the DOM each frame of a glide, so stepping never re-renders the page or animates layout. The card is placed with floating-ui on the same frame.",
    "The outline strikes once when the tour opens. With reduced motion it appears without the flicker and jumps between steps.",
  ],
};
