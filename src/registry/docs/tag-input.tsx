import type { ComponentDoc } from "../types";
import TagInputDemo from "../examples/tag-input/demo";
import TagInputSkills from "../examples/tag-input/skills";
import TagInputTopics from "../examples/tag-input/topics";
import TagInputStates from "../examples/tag-input/states";

export const doc: ComponentDoc = {
  usage: `import { TagInput } from "@/components/ui/tag-input"

<TagInput
  label="Skills"
  placeholder="Add a skill"
  defaultValue={["TypeScript", "Rust"]}
/>`,
  examples: [
    {
      name: "demo",
      title: "Email recipients",
      description:
        "Each address powers on as it's committed. Paste a list and the valid ones become chips; anything the validator rejects shakes and stays in the input to fix.",
      component: TagInputDemo,
    },
    {
      name: "skills",
      title: "Suggestions",
      description: "suggestions opens a small list that filters as you type and skips tags already added.",
      component: TagInputSkills,
    },
    {
      name: "topics",
      title: "Custom separators",
      description: "separators takes keys or characters. Here a space commits too, and a pattern keeps topics URL-safe.",
      component: TagInputTopics,
    },
    { name: "states", title: "Sizes, error and disabled", component: TagInputStates },
  ],
  api: [
    {
      name: "TagInput",
      description:
        "Also accepts native input attributes, and the ref points at the input. className and style go to the field box.",
      props: [
        { prop: "value", type: "string[]", description: "Controlled tags." },
        { prop: "defaultValue", type: "string[]", description: "Initial tags when uncontrolled." },
        { prop: "onValueChange", type: "(value: string[]) => void", description: "Called when tags are added or removed." },
        { prop: "placeholder", type: "string", description: "Shown while there are no tags." },
        { prop: "max", type: "number", description: "Most tags allowed. Extra ones are turned away with a message." },
        {
          prop: "separators",
          type: "string[]",
          default: '[",", "Enter"]',
          description: 'Keys that commit the typed text: "Enter", "Tab", or single characters like "," and " ".',
        },
        {
          prop: "validate",
          type: "(tag: string) => true | string",
          description: "Return true to accept, or a message to show. Rejected text stays in the input.",
        },
        {
          prop: "allowDuplicates",
          type: "boolean",
          default: "false",
          description: "Accept a tag that's already there. Duplicates are compared case-insensitively.",
        },
        { prop: "suggestions", type: "string[]", description: "Offered in a list that filters as you type." },
        { prop: "name", type: "string", description: "Submits each tag under this name with a surrounding form." },
        { prop: "label", type: "ReactNode", description: "Visible label for the input." },
        { prop: "description", type: "ReactNode", description: "Helper text under the field. Replaced by any error." },
        {
          prop: "error",
          type: "ReactNode",
          description: "Red invalid state and message. Pass true for the state without a message. Validation messages take precedence.",
        },
        { prop: "disabled", type: "boolean", default: "false", description: "Blocks editing and leaves the tags out of form data." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Minimum field height and chip size." },
        { prop: "containerClassName", type: "string", description: "Classes for the outer block with the label, field and message." },
      ],
    },
  ],
  notes: [
    "A separator key commits the typed text. Pasting splits on commas, newlines and any character separators, and the field commits what's typed when you leave it.",
    "Backspace in an empty input lights up the last chip; a second Backspace removes it. Any other key cancels.",
    "ArrowLeft from the start of an empty input moves onto the chips. ArrowLeft and ArrowRight move between them, Home goes to the first, End or Escape returns to the input.",
    "On a focused chip, Backspace removes it and moves left; Delete removes it and moves right. Typing returns to the input with the character.",
    "With suggestions, the input is a combobox: ArrowUp and ArrowDown move through the list, Enter picks, Escape closes.",
    "Rejections set aria-invalid and show their reason in place of the description. Additions, removals and rejections are announced through a polite live region.",
    "The shake and the power-on flicker are skipped under prefers-reduced-motion.",
  ],
};
