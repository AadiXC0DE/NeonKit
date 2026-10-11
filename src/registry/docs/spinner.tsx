import type { ComponentDoc } from "../types";
import SpinnerDemo from "../examples/spinner/demo";
import SpinnerSizes from "../examples/spinner/sizes";
import SpinnerButton from "../examples/spinner/button";
import SpinnerInline from "../examples/spinner/inline";

export const doc: ComponentDoc = {
  usage: `import { Spinner } from "@/components/ui/spinner"

<Spinner variant="orbit" label="Loading invoices" />`,
  examples: [
    { name: "demo", title: "Variants", component: SpinnerDemo },
    { name: "sizes", title: "Sizes", component: SpinnerSizes },
    {
      name: "button",
      title: "In a button",
      description: "The spinner picks up the button's color. Hide it from assistive tech and set aria-busy on the button.",
      component: SpinnerButton,
    },
    {
      name: "inline",
      title: "Inline status",
      description: "Next to visible text, the wrapper carries role=\"status\" and the spinner is aria-hidden.",
      component: SpinnerInline,
    },
  ],
  api: [
    {
      name: "Spinner",
      description: "Also accepts every native span attribute.",
      props: [
        { prop: "variant", type: '"ring" | "dots" | "bars" | "orbit"', default: '"ring"', description: "Shape of the loader." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "16, 24 or 36px square." },
        { prop: "label", type: "string", default: '"Loading"', description: "Visually hidden text announced to screen readers." },
      ],
    },
  ],
  notes: [
    "Spinner renders role=\"status\" with a visually hidden label, so screen readers announce it once when it appears.",
    "When the spinner sits beside text that already says what is happening, pass aria-hidden so the message isn't read twice.",
    "With reduced motion, every variant runs three times slower instead of stopping, so it still reads as busy.",
  ],
};
