import type { ComponentDoc } from "../types";
import ReasoningDemo from "../examples/reasoning/demo";
import ReasoningFollow from "../examples/reasoning/follow";
import ReasoningHistory from "../examples/reasoning/history";

export const doc: ComponentDoc = {
  usage: `import { Reasoning } from "@/components/ui/reasoning"

<Reasoning streaming={thinking} duration={seconds}>
  {trace}
</Reasoning>`,
  examples: [
    {
      name: "demo",
      title: "A live trace",
      description:
        "While it thinks, the filament is hot, the header shows the sentence being written and a timer runs. When it stops, the coil cools to a dim wire and the row folds to Thought for 9s. Open it for the whole trace.",
      component: ReasoningDemo,
    },
    {
      name: "follow",
      title: "Open while thinking",
      description:
        "followStreaming opens the trace when thinking starts and folds it away when it ends. Toggle it by hand and it stays where you left it.",
      component: ReasoningFollow,
    },
    {
      name: "history",
      title: "In a transcript",
      description: "Finished traces sit above the answer they led to, folded unless they're worth reading.",
      component: ReasoningHistory,
    },
  ],
  api: [
    {
      name: "Reasoning",
      description: "A disclosure. A string child is split into paragraphs and renders `code` and **bold**.",
      props: [
        { prop: "streaming", type: "boolean", default: "false", description: "Hot filament, running timer and the live line." },
        { prop: "duration", type: "number", description: "Seconds spent. Measured while streaming when omitted." },
        { prop: "status", type: "ReactNode", description: "The live line. Defaults to the sentence being written when the trace is a string." },
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial open state. With followStreaming, defaults to streaming." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called on toggle, and when followStreaming opens or folds it." },
        { prop: "followStreaming", type: "boolean", default: "false", description: "Open while thinking and fold when done, until toggled by hand." },
        { prop: "label", type: "ReactNode", default: '"Thinking"', description: "Header while streaming." },
        { prop: "doneLabel", type: "ReactNode", default: '"Thought for 12s"', description: "Header when done." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "The header is a button with aria-expanded and aria-controls; a closed trace is hidden from assistive tech, not just collapsed.",
    "A polite live region says Thinking when it starts and Thought for 12 seconds when it ends. Nothing is announced per token, and the live line and timer are hidden from screen readers.",
    "Under prefers-reduced-motion the filament doesn't waver and the panel opens without animating; the coil still cools from lit to dim.",
  ],
};
