import type { ComponentDoc } from "../types";
import OTPInputDemo from "../examples/otp-input/demo";
import OTPInputGrouped from "../examples/otp-input/grouped";
import OTPInputPin from "../examples/otp-input/pin";
import OTPInputInvalid from "../examples/otp-input/invalid";
import OTPInputAlphanumeric from "../examples/otp-input/alphanumeric";

export const doc: ComponentDoc = {
  usage: `import { OTPInput } from "@/components/ui/otp-input"

<OTPInput onComplete={(code) => verify(code)} />`,
  examples: [
    {
      name: "demo",
      title: "Verification",
      description: "onComplete fires once every slot is filled. Try pasting a code.",
      component: OTPInputDemo,
    },
    {
      name: "grouped",
      title: "Grouped",
      description: "groupSize splits the slots with a dash, so long codes are easier to read back.",
      component: OTPInputGrouped,
    },
    {
      name: "pin",
      title: "Masked PIN",
      description: "mask shows dots instead of digits.",
      component: OTPInputPin,
    },
    {
      name: "invalid",
      title: "Invalid code",
      description: "The row shakes and turns red each time invalid switches on.",
      component: OTPInputInvalid,
    },
    {
      name: "alphanumeric",
      title: "Letters and numbers",
      description: 'mode="alphanumeric" accepts letters too and brings up the full keyboard on phones.',
      component: OTPInputAlphanumeric,
    },
  ],
  api: [
    {
      name: "OTPInput",
      description: "Other props and the ref go to the wrapping group element.",
      props: [
        { prop: "length", type: "number", default: "6", description: "Number of slots." },
        { prop: "value", type: "string", description: "Controlled code." },
        { prop: "defaultValue", type: "string", description: "Initial code when uncontrolled." },
        { prop: "onValueChange", type: "(code: string) => void", description: "Called on every change." },
        { prop: "onComplete", type: "(code: string) => void", description: "Called when the last empty slot is filled." },
        { prop: "mode", type: '"numeric" | "alphanumeric"', default: '"numeric"', description: "Characters accepted. Also picks the mobile keyboard." },
        { prop: "groupSize", type: "number", description: "Puts a dash after every groupSize slots." },
        { prop: "mask", type: "boolean", default: "false", description: "Shows dots instead of characters." },
        { prop: "invalid", type: "boolean", default: "false", description: "Red state. Shakes the row when it switches on." },
        { prop: "disabled", type: "boolean", default: "false", description: "Disables every slot." },
        { prop: "autoFocus", type: "boolean", default: "false", description: "Focuses the first empty slot on mount." },
        { prop: "name", type: "string", description: "Submits the code with a surrounding form. A form reset empties the slots." },
        { prop: "required", type: "boolean", default: "false", description: "Stops the submit until every slot is filled, with a message that says how many are needed." },
        { prop: "aria-label", type: "string", default: '"One-time code"', description: "Names the group of slots." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Slot size and text size." },
      ],
    },
  ],
  notes: [
    "When the browser rejects the field on submit (required, type, pattern), it turns red until it's edited or the form resets. The browser shows its own message.",
    'Each slot is a native input labelled "Digit 2 of 6" inside a named group.',
    "The first slot uses autocomplete=\"one-time-code\", so codes from SMS can fill every slot in one tap.",
    "Pasting fills from the focused slot. A full-length code always fills from the start, and spaces or dashes are dropped.",
    "Only the next slot to fill is in the tab order. Arrow keys, Home and End move between slots.",
    "Backspace clears the focused slot, or steps back and clears the previous one when the focused slot is empty.",
    "Link an error message with aria-describedby when invalid is on. The shake is skipped when reduced motion is on.",
  ],
};
