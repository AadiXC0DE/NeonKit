import type { ComponentDoc } from "../types";
import CopyButtonDemo from "../examples/copy-button/demo";
import CopyButtonWithLabel from "../examples/copy-button/with-label";
import CopyButtonShareLink from "../examples/copy-button/share-link";
import CopyButtonCodeBlock from "../examples/copy-button/code-block";
import CopyButtonSizes from "../examples/copy-button/sizes";

export const doc: ComponentDoc = {
  usage: `import { CopyButton } from "@/components/ui/copy-button"

<CopyButton value="npx shadcn@latest add …" aria-label="Copy install command" />`,
  examples: [
    {
      name: "demo",
      title: "Install command",
      description: "Copy, and a check draws on as a lit tube while a small bubble confirms.",
      component: CopyButtonDemo,
    },
    {
      name: "with-label",
      title: "With a label",
      description: "Children make it a text button. value can be a function, even an async one, for values fetched on demand.",
      component: CopyButtonWithLabel,
    },
    {
      name: "share-link",
      title: "Share link",
      description: "side places the bubble where it has room.",
      component: CopyButtonShareLink,
    },
    { name: "code-block", title: "Code block", component: CopyButtonCodeBlock },
    {
      name: "sizes",
      title: "Sizes",
      description: "Square icon buttons by default; text buttons share Button's heights.",
      component: CopyButtonSizes,
    },
  ],
  api: [
    {
      name: "CopyButton",
      description: "Also accepts native button attributes except value and the native onCopy. The ref points at the button.",
      props: [
        { prop: "value", type: "string | (() => string | Promise<string>)", description: "Text to copy, or a function that returns it when clicked." },
        { prop: "onCopy", type: "(text: string) => void", description: "Called after the text reaches the clipboard." },
        { prop: "onCopyError", type: "(error: unknown) => void", description: "Called when the clipboard refuses or value throws." },
        { prop: "timeout", type: "number", default: "1600", description: "Milliseconds the confirmation stays up." },
        { prop: "copiedLabel", type: "string", default: '"Copied"', description: "Bubble text and announcement on success." },
        { prop: "errorLabel", type: "string", default: '"Couldn\'t copy"', description: "Bubble text and announcement on failure." },
        { prop: "side", type: '"top" | "right" | "bottom" | "left"', default: '"top"', description: "Where the bubble appears." },
        { prop: "bubble", type: "boolean", default: "true", description: "Show the bubble. The check and the announcement happen either way." },
        { prop: "variant", type: '"ghost" | "outline"', default: '"ghost"', description: "Quiet icon button, or a neon-edged one." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Square 32, 40 or 48px; with children, the same heights as Button." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    'Icon-only buttons are named "Copy" unless you pass aria-label. Say what gets copied: "Copy install command".',
    "The result is announced through a polite live region next to the button; the bubble itself is aria-hidden.",
    "Uses the async Clipboard API on secure pages and falls back to a hidden textarea elsewhere. Failures show the error label in red.",
    "The bubble is positioned inside the button, so an ancestor with overflow: hidden can clip it. Pick a side with room.",
  ],
};
