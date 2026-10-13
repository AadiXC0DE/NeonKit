import type { ComponentDoc } from "../types";
import PromptInputDemo from "../examples/prompt-input/demo";
import PromptInputAttachments from "../examples/prompt-input/attachments";
import PromptInputLimit from "../examples/prompt-input/limit";
import PromptInputDisabled from "../examples/prompt-input/disabled";

export const doc: ComponentDoc = {
  usage: `import { PromptInput } from "@/components/ui/prompt-input"

<PromptInput onSubmit={({ text, attachments }) => send(text, attachments)} streaming={streaming} onStop={stop} />`,
  examples: [
    {
      name: "demo",
      title: "Composer",
      description:
        "The edge brightens while you type and settles when you pause. The send button lights once there's something to send, and turns into Stop while a reply arrives.",
      component: PromptInputDemo,
    },
    {
      name: "attachments",
      title: "Attachments",
      description:
        "Attach with the clip, by pasting a screenshot or by dropping files on the box. accept, maxFiles and maxFileSize filter them and onRejectFiles says why.",
      component: PromptInputAttachments,
    },
    {
      name: "limit",
      title: "Character limit",
      description: "A counter that turns amber at 90% and red past the limit, where send switches off. submitOn=\"mod-enter\" for longer writing.",
      component: PromptInputLimit,
    },
    {
      name: "disabled",
      title: "Disabled",
      description: "Everything switches off together. Say why next to it.",
      component: PromptInputDisabled,
    },
  ],
  api: [
    {
      name: "PromptInput",
      description: "Renders a form; extra props go on it. The ref points at the textarea so you can focus it.",
      props: [
        { prop: "value", type: "string", description: "Controlled text." },
        { prop: "defaultValue", type: "string", default: '""', description: "Initial text when uncontrolled." },
        { prop: "onValueChange", type: "(value: string) => void", description: "Called on every edit." },
        {
          prop: "onSubmit",
          type: "(message: { text, attachments }) => void",
          description: "Text is trimmed. Uncontrolled text and attachments clear afterwards.",
        },
        { prop: "placeholder", type: "string", default: '"Write a message"', description: "Placeholder text." },
        { prop: "label", type: "string", default: '"Message"', description: "Accessible name of the textarea." },
        { prop: "minRows / maxRows", type: "number", default: "1 / 8", description: "The textarea grows between these, then scrolls." },
        {
          prop: "submitOn",
          type: '"enter" | "mod-enter"',
          default: '"enter"',
          description: "Enter sends and Shift+Enter breaks the line, or ⌘/Ctrl+Enter sends and Enter breaks it.",
        },
        { prop: "streaming", type: "boolean", default: "false", description: "Send becomes Stop; Escape stops too." },
        { prop: "onStop", type: "() => void", description: "Called by Stop and by Escape while streaming." },
        { prop: "disabled", type: "boolean", default: "false", description: "Disables the field, the buttons, paste and drop." },
        { prop: "attachments", type: "PromptAttachment[]", description: "Controlled attachments: { id, name, size?, type?, url?, file? }." },
        { prop: "defaultAttachments", type: "PromptAttachment[]", default: "[]", description: "Initial attachments when uncontrolled." },
        { prop: "onAttachmentsChange", type: "(attachments) => void", description: "Called when files are added or removed." },
        { prop: "allowAttachments", type: "boolean", default: "true", description: "The clip button, paste and drop." },
        { prop: "accept", type: "string", description: "Allowed types, as in <input accept>." },
        { prop: "maxFiles", type: "number", description: "Files past this are rejected with reason \"count\"." },
        { prop: "maxFileSize", type: "number", description: "Bytes per file." },
        { prop: "onRejectFiles", type: '(files: File[], reason: "type" | "size" | "count") => void', description: "Called with the files that didn't make it." },
        { prop: "toolbar", type: "ReactNode", description: "Controls after the clip: a model picker, tool toggles." },
        { prop: "counter", type: '"characters" | "tokens"', description: "Show a running count next to send." },
        { prop: "limit", type: "number", description: "Upper bound for the counter. Over it, send is disabled." },
        { prop: "countTokens", type: "(text: string) => number", default: "length / 4", description: "Swap in a real tokenizer for exact counts." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "Enter is ignored while an IME composition is open, so confirming Japanese, Chinese or Korean input never sends half a word.",
    "The textarea is labelled and points at the counter with aria-describedby; going over the limit sets aria-invalid.",
    "Send is a real submit button; it's disabled until there's text or a file. Stop is a separate button named Stop.",
    "Each attachment chip has a Remove button named after the file. Removing one returns focus to the textarea.",
    "Image previews use object URLs that are revoked when the chip is removed or the composer unmounts; sent ones are left for you to show.",
    "Under prefers-reduced-motion the send button lights without the flicker.",
  ],
};
