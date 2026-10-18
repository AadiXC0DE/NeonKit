import type { ComponentDoc } from "../types";
import PasswordInputDemo from "../examples/password-input/demo";
import PasswordInputField from "../examples/password-input/field";
import PasswordInputGenerate from "../examples/password-input/generate";
import PasswordInputRules from "../examples/password-input/rules";

export const doc: ComponentDoc = {
  usage: `import { PasswordInput } from "@/components/ui/password-input"

<PasswordInput label="New password" strength rules />`,
  examples: [
    {
      name: "demo",
      title: "New password",
      description:
        "The meter lights one to four segments, red to amber to the neon color, and the checklist ticks off as you type. Save stays off until it reads Good.",
      component: PasswordInputDemo,
    },
    {
      name: "field",
      title: "Sign in, inside Field",
      description: "Field supplies the label, the error and aria-describedby. Hold Caps Lock while typing to see the warning.",
      component: PasswordInputField,
    },
    {
      name: "generate",
      title: "Controlled",
      description: "value and visible are both controlled here: Generate fills a 20-character password and reveals it.",
      component: PasswordInputGenerate,
    },
    {
      name: "rules",
      title: "Your own policy",
      description: "Pass rules for the checklist and evaluate to score by them instead of the built-in estimate.",
      component: PasswordInputRules,
    },
  ],
  api: [
    {
      name: "PasswordInput",
      description:
        "Built on Input, so label, description, size, leading and the other Input props work. The ref points at the input element.",
      props: [
        { prop: "value", type: "string", description: "Controlled value." },
        { prop: "defaultValue", type: "string", default: '""', description: "Starting value when uncontrolled. A form reset goes back to it." },
        { prop: "onValueChange", type: "(value: string) => void", description: "Called on every edit. onChange still works." },
        { prop: "visible", type: "boolean", description: "Controlled reveal. Shown as text, the value is set in mono so l, 1, I, O and 0 differ." },
        { prop: "defaultVisible", type: "boolean", default: "false", description: "Starting reveal state when uncontrolled." },
        { prop: "onVisibleChange", type: "(visible: boolean) => void", description: "Called when the eye button is pressed." },
        { prop: "strength", type: "boolean", default: "false", description: "Shows the four-segment meter and a Weak, Fair, Good or Strong label." },
        {
          prop: "rules",
          type: "boolean | PasswordRule[]",
          default: "false",
          description: "Shows a checklist. true uses length, a number, upper and lower case, and a symbol.",
        },
        { prop: "minLength", type: "number", default: "12", description: "Length the default rule and the estimate ask for. Set on the input (and so checked by the browser) only when you pass it." },
        {
          prop: "evaluate",
          type: "(value: string, passed: Record<string, boolean>) => PasswordStrength",
          description: "Replaces the built-in estimate. passed says which rules pass, by id.",
        },
        { prop: "capsLockWarning", type: "boolean", default: "true", description: "Shows a Caps Lock badge in the field while it's on, and announces it." },
        { prop: "error", type: "ReactNode", description: "Turns the field red and shows the message under the checklist. true for the red state alone." },
        { prop: "autoComplete", type: "string", default: '"current-password"', description: '"new-password" when strength or rules is on, so password managers offer to generate one.' },
      ],
    },
    {
      name: "PasswordRule",
      props: [
        { prop: "id", type: "string", description: "Key in the passed record." },
        { prop: "label", type: "ReactNode", description: "Checklist text." },
        { prop: "test", type: "(value: string) => boolean", description: "True when the rule is met." },
      ],
    },
    {
      name: "PasswordStrength",
      description: "evaluatePassword(value, minLength?) is exported too, for gating a submit button.",
      props: [
        { prop: "score", type: "0 | 1 | 2 | 3 | 4", description: "Segments lit. 0 is empty." },
        { prop: "label", type: "string", description: "Shown next to the meter and announced when it changes." },
      ],
    },
  ],
  notes: [
    "The eye button is a toggle with aria-pressed and a fixed name, Show password. Clicking it keeps focus and the caret in the field.",
    "The input's aria-describedby lists the Caps Lock status, the strength label, the checklist and the message, so a screen reader reads them after the label. Field's own ids are kept.",
    "The strength label is a polite live region, so it speaks when the label changes, not on every key.",
    "The estimate scores length times character variety and takes off for runs (abc, 321), repeats and about 25 common passwords, leetspeak included. It runs on every keystroke and never leaves the page.",
    "Inside Field, the field turns red with Field's error, because Field marks it aria-invalid.",
  ],
};
