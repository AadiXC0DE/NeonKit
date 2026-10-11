import type { ComponentDoc } from "../types";
import TimeInputDemo from "../examples/time-input/demo";
import TimeInputHourCycle from "../examples/time-input/hour-cycle";
import TimeInputStepAndSeconds from "../examples/time-input/step-and-seconds";
import TimeInputStates from "../examples/time-input/states";

export const doc: ComponentDoc = {
  usage: `import { TimeInput } from "@/components/ui/time-input"

const [time, setTime] = React.useState("09:30")

<TimeInput label="Alarm" value={time} onValueChange={setTime} />`,
  examples: [
    {
      name: "demo",
      title: "Quiet hours",
      description:
        "Type digits and focus moves on by itself, or use the arrow keys, or drag a segment up and down. The lit tube follows the active segment.",
      component: TimeInputDemo,
    },
    {
      name: "hour-cycle",
      title: "12 and 24 hours",
      description: "The clock follows the locale by default. hourCycle forces one. The value is 24-hour either way.",
      component: TimeInputHourCycle,
    },
    {
      name: "step-and-seconds",
      title: "Steps and seconds",
      description: "minuteStep sets how far the arrow keys move minutes. showSeconds adds a seconds segment.",
      component: TimeInputStepAndSeconds,
    },
    {
      name: "states",
      title: "In a form",
      description: "With a name, the value submits through a hidden input. Enter in a segment submits the form.",
      component: TimeInputStates,
    },
  ],
  api: [
    {
      name: "TimeInput",
      description:
        "Also accepts native div attributes, and the ref points at the field (role=\"group\"). className and style go to the field box.",
      props: [
        { prop: "value", type: "string", description: 'Controlled value, "HH:mm" or "HH:mm:ss" in 24-hour time. "" for no time.' },
        { prop: "defaultValue", type: "string", description: "Initial value when uncontrolled." },
        {
          prop: "onValueChange",
          type: "(value: string) => void",
          description: 'Called with the 24-hour value once every segment is filled, and with "" when a filled value is cleared.',
        },
        { prop: "hourCycle", type: "12 | 24", default: "from locale", description: "12 adds an AM/PM segment. Defaults to the locale's clock." },
        { prop: "locale", type: "string", default: "browser", description: "BCP 47 tag for the default clock, the AM/PM labels and their order." },
        { prop: "showSeconds", type: "boolean", default: "false", description: "Adds a seconds segment and includes seconds in the value." },
        { prop: "minuteStep", type: "number", default: "1", description: "How far the arrow keys and scrubbing move minutes. Typed minutes can be anything." },
        { prop: "name", type: "string", description: "Submits the value with a surrounding form." },
        { prop: "leading", type: "ReactNode", default: "clock icon", description: "Shown before the time. Pass null to remove it." },
        { prop: "label", type: "ReactNode", description: "Visible label. Names the group, and clicking it focuses the first segment." },
        { prop: "description", type: "ReactNode", description: "Helper text under the field." },
        {
          prop: "error",
          type: "ReactNode",
          description: "Red invalid state and message. Replaces description. Pass true for the state without a message.",
        },
        { prop: "disabled", type: "boolean", default: "false", description: "Blocks editing and leaves the value out of form data." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Field height: 32, 40 or 48px, matching Input." },
        { prop: "containerClassName", type: "string", description: "Classes for the outer block with the label and message." },
      ],
    },
  ],
  notes: [
    "The field is a group named by its label, and each part is a spinbutton with aria-valuenow, aria-valuemin, aria-valuemax and a spoken aria-valuetext (\"Empty\" when blank).",
    "Every segment is a Tab stop. Arrow Left and Right also move between them.",
    "Arrow Up and Down step with wrap-around, Home and End jump to the ends, Backspace clears a segment and then steps back, and Delete clears in place.",
    "Digits fill a segment and move on as soon as no second digit could follow. A separator like : moves on early, and A or P sets the period.",
    "Pasting a time such as 2:30 pm or 14:30 fills every segment at once.",
    "Segments are contenteditable with a numeric inputmode, so phones open the number pad.",
    "Without a visible label, pass aria-label to name the group.",
  ],
};
