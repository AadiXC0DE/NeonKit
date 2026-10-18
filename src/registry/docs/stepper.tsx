import type { ComponentDoc } from "../types";
import StepperDemo from "../examples/stepper/demo";
import StepperVertical from "../examples/stepper/vertical";
import StepperIcons from "../examples/stepper/icons";

export const doc: ComponentDoc = {
  usage: `import { Step, Stepper } from "@/components/ui/stepper"

<Stepper value={step} onValueChange={setStep}>
  <Step title="Cart" />
  <Step title="Shipping" description="Address and speed" />
  <Step title="Payment" />
</Stepper>`,
  examples: [
    {
      name: "demo",
      title: "Checkout",
      description:
        "Each connector fills with light as you advance, the finished step draws its check, and the next one lights up as the light reaches it. Steps you have reached stay clickable.",
      component: StepperDemo,
    },
    {
      name: "vertical",
      title: "Vertical with an error",
      description: 'status="error" turns a step red with a cross. Retry and watch the tube run down to the deploy.',
      component: StepperVertical,
    },
    {
      name: "icons",
      title: "Icons and optional steps",
      description: "An icon replaces the number until the step is done. optional adds a caption under the title.",
      component: StepperIcons,
    },
  ],
  api: [
    {
      name: "Stepper",
      description: "Renders an ol and accepts every native attribute. Its children should be Step elements.",
      props: [
        {
          prop: "value",
          type: "number",
          description: "Index of the current step when controlled. Earlier steps are complete; pass the step count to complete them all.",
        },
        { prop: "defaultValue", type: "number", default: "0", description: "Initial current step when uncontrolled." },
        { prop: "onValueChange", type: "(index: number) => void", description: "Called when a clickable step is picked." },
        { prop: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Horizontal centers labels under the markers and hides descriptions below sm." },
        { prop: "clickable", type: "boolean", default: "false", description: "Render each step as a button that moves the stepper to it." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "Step",
      description: "Renders an li.",
      props: [
        { prop: "title", type: "ReactNode", description: "Step name." },
        { prop: "description", type: "ReactNode", description: "Second line under the title." },
        { prop: "icon", type: "ReactNode", description: "Shown in the marker instead of the number until the step is complete." },
        { prop: "status", type: '"error"', description: "Marks the step as failed: red marker, cross and title." },
        { prop: "optional", type: "boolean", default: "false", description: 'Shows an "Optional" caption under the title.' },
        { prop: "disabled", type: "boolean", default: "false", description: "With a clickable stepper, blocks jumping to this step." },
      ],
    },
  ],
  notes: [
    'The steps are an ordered list, and the current one has aria-current="step".',
    'Completed and failed steps add hidden text (", completed" or ", failed") so the state is not conveyed by color alone.',
    "With clickable, each step is a native button: Tab moves between them and Enter or Space selects. Disabled steps are skipped.",
    "Markers and connectors are decorative and hidden from screen readers.",
    "The connector fill and the check are CSS transitions, so they reverse cleanly when interrupted; with reduced motion they switch instantly.",
  ],
};
