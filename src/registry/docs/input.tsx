import type { ComponentDoc } from "../types";
import InputDemo from "../examples/input/demo";
import InputSearch from "../examples/input/search";
import InputValidation from "../examples/input/validation";
import InputStates from "../examples/input/states";
import InputSizes from "../examples/input/sizes";

export const doc: ComponentDoc = {
  usage: `import { Input } from "@/components/ui/input"

<Input label="Email" type="email" placeholder="you@company.com" />`,
  examples: [
    { name: "demo", title: "Sign in", component: InputDemo },
    {
      name: "search",
      title: "Search with a shortcut",
      description: "trailing holds hints and small buttons. Press / to focus this one.",
      component: InputSearch,
    },
    {
      name: "validation",
      title: "Validation",
      description:
        "error turns the field red, sets aria-invalid and takes the description's place. leading also takes text addons.",
      component: InputValidation,
    },
    {
      name: "states",
      title: "Read-only and disabled",
      description: "Read-only fields keep a quieter focus state so they don't read as editable.",
      component: InputStates,
    },
    {
      name: "sizes",
      title: "Sizes",
      description: "Heights match Button: 32, 40 and 48px.",
      component: InputSizes,
    },
  ],
  api: [
    {
      name: "Input",
      description:
        "Also accepts every native input attribute, and the ref points at the <input>. className and style go to the field box around it.",
      props: [
        { prop: "label", type: "ReactNode", description: "Visible label, linked to the input." },
        { prop: "description", type: "ReactNode", description: "Helper text under the field." },
        {
          prop: "error",
          type: "ReactNode",
          description: "Red invalid state and message. Replaces description. Pass true for the state without a message.",
        },
        { prop: "leading", type: "ReactNode", description: "Icon or text addon before the value. Icons light up on focus." },
        { prop: "trailing", type: "ReactNode", description: "Icon, hint or small button after the value." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Height, padding and text size." },
        { prop: "className", type: "string", description: "Classes for the field box: border, background, height." },
        { prop: "containerClassName", type: "string", description: "Classes for the outer block with the label and message. Use it for width and margins." },
      ],
    },
  ],
  notes: [
    "required shows the neon dot after the label and stays a native attribute, so the browser validates it.",
    "When the browser rejects the field on submit (required, type, pattern), it turns red until it's edited or the form resets. The browser shows its own message.",
    "The label is a native <label>, and the description or error is linked with aria-describedby.",
    "Clicking the padding or the leading icon focuses the input, like a native field.",
    "Fields without a visible label need an aria-label.",
    "Buttons inside trailing need their own aria-label and stay in the tab order after the input.",
  ],
};
