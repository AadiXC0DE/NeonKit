import type { ComponentDoc } from "../types";
import SuggestionsDemo from "../examples/suggestions/demo";
import SuggestionsSend from "../examples/suggestions/send";
import SuggestionsScroll from "../examples/suggestions/scroll";

export const doc: ComponentDoc = {
  usage: `import { Suggestion, Suggestions } from "@/components/ui/suggestions"

<Suggestions onSelect={(text) => setPrompt(text)}>
  <Suggestion>Why did deploy #4127 fail?</Suggestion>
  <Suggestion>Summarize PR #482 for review</Suggestion>
</Suggestions>`,
  examples: [
    {
      name: "demo",
      title: "Under a Prompt Input",
      description:
        "A chip fills the prompt and puts the caret at the end, so it can be edited before sending. After a send the chips switch to follow-ups.",
      component: SuggestionsDemo,
    },
    {
      name: "send",
      title: "Send on click",
      description: "When a chip is the whole question, onSelect can send it. Asked ones are disabled, and arrow keys skip them.",
      component: SuggestionsSend,
    },
    {
      name: "scroll",
      title: "One scrolling row",
      description: "Without wrap the row scrolls sideways, and each edge fades only while chips are hidden past it.",
      component: SuggestionsScroll,
    },
  ],
  api: [
    {
      name: "Suggestions",
      description: "A div with role=\"toolbar\". Accepts div attributes; the ref points at it.",
      props: [
        { prop: "onSelect", type: "(value: string) => void", description: "Called with the picked chip's value, or its text. Fill an input or send it." },
        { prop: "wrap", type: "boolean", default: "false", description: "Wraps onto more lines from the sm breakpoint up. Below it the row always scrolls." },
        { prop: "size", type: '"sm" | "md"', default: '"md"', description: "28px or 32px chips." },
        { prop: "disabled", type: "boolean", default: "false", description: "Disables every chip, for example while a reply streams." },
        { prop: "aria-label", type: "string", default: '"Suggestions"', description: "Names the row. Say what the chips are for." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Hover border and icon color. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "Suggestion",
      description: "A button. Accepts button attributes; onClick runs first and can preventDefault to skip onSelect.",
      props: [
        { prop: "value", type: "string", description: "What onSelect receives. Defaults to the chip's text." },
        { prop: "icon", type: "ReactNode", description: "Shown before the text. It lights when the chip is hovered or focused." },
        { prop: "disabled", type: "boolean", default: "false", description: "Skipped by the arrow keys." },
      ],
    },
  ],
  notes: [
    "The row is one tab stop. Arrow keys move between chips (both axes, wrapping, mirrored in RTL), Home and End jump to the ends.",
    "A focused chip scrolls clear of the faded edge.",
    "A picked chip flares once. With reduced motion it doesn't.",
    "Chips are plain children, so render them from any list and swap the list as the conversation moves on.",
  ],
};
