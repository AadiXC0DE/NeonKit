import type { ComponentDoc } from "../types";
import TextareaDemo from "../examples/textarea/demo";
import TextareaAutoResize from "../examples/textarea/auto-resize";
import TextareaLimit from "../examples/textarea/limit";
import TextareaStates from "../examples/textarea/states";

export const doc: ComponentDoc = {
  usage: `import { Textarea } from "@/components/ui/textarea"

<Textarea label="Feedback" maxLength={280} showCount />`,
  examples: [
    { name: "demo", title: "Feedback", component: TextareaDemo },
    {
      name: "auto-resize",
      title: "Auto-resize",
      description: "The field grows with its content between minRows and maxRows, then scrolls.",
      component: TextareaAutoResize,
    },
    {
      name: "limit",
      title: "Character limit",
      description: "With maxLength, the count turns amber in the last 10% and red at the limit.",
      component: TextareaLimit,
    },
    { name: "states", title: "Error and disabled", component: TextareaStates },
  ],
  api: [
    {
      name: "Textarea",
      description:
        "Also accepts every native textarea attribute, and the ref points at the <textarea>. className and style go to the field box around it.",
      props: [
        { prop: "label", type: "ReactNode", description: "Visible label, linked to the textarea." },
        { prop: "description", type: "ReactNode", description: "Helper text under the field." },
        {
          prop: "error",
          type: "ReactNode",
          description: "Red invalid state and message. Replaces description. Pass true for the state without a message.",
        },
        { prop: "autoResize", type: "boolean", default: "true", description: "Grow with the content. When off, rows applies and the field resizes by hand." },
        { prop: "minRows", type: "number", default: "3", description: "Starting height in lines." },
        { prop: "maxRows", type: "number", default: "10", description: "Height in lines before the field scrolls." },
        { prop: "showCount", type: "boolean", default: "false", description: "Character count in the corner, as count / maxLength when maxLength is set." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Padding, text size and line height." },
        { prop: "className", type: "string", description: "Classes for the field box: border, background, radius." },
        { prop: "containerClassName", type: "string", description: "Classes for the outer block with the label and message." },
      ],
    },
  ],
  notes: [
    "required shows the neon dot after the label. A form reset re-counts and re-sizes the field.",
    "When the browser rejects the field on submit (required, type, pattern), it turns red until it's edited or the form resets. The browser shows its own message.",
    "The count is linked with aria-describedby, so screen readers read it when the field gets focus.",
    "maxLength is the native attribute, so typing and pasting stop at the limit.",
    "Auto-resize re-measures when the value changes and when the field's width changes.",
  ],
};
