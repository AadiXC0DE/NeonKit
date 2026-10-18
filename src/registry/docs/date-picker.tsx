import type { ComponentDoc } from "../types";
import DatePickerDemo from "../examples/date-picker/demo";
import DatePickerSingle from "../examples/date-picker/single";
import DatePickerRelativePresets from "../examples/date-picker/relative-presets";
import DatePickerStates from "../examples/date-picker/states";

export const doc: ComponentDoc = {
  usage: `import { DatePicker } from "@/components/ui/date-picker"

const [date, setDate] = React.useState<Date>()

<DatePicker label="Departure" value={date ?? null} onValueChange={setDate} />`,
  examples: [
    {
      name: "demo",
      title: "Campaign dates",
      description:
        "Range mode with a preset column. Two months show from the sm breakpoint up, and the panel closes once the last day is picked.",
      component: DatePickerDemo,
    },
    {
      name: "single",
      title: "A single day in a form",
      description: "formatOptions sets how the value reads, isDateDisabled blocks weekends, and name submits yyyy-mm-dd.",
      component: DatePickerSingle,
    },
    {
      name: "relative-presets",
      title: "Relative presets",
      description: "Presets are plain values, so build them from today. The one that matches the value is marked.",
      component: DatePickerRelativePresets,
    },
    { name: "states", title: "Sizes, error and disabled", component: DatePickerStates },
  ],
  api: [
    {
      name: "DatePicker",
      description:
        "Also accepts native button attributes, and the ref points at the trigger. className and style go to the field box.",
      props: [
        { prop: "mode", type: '"single" | "range"', default: '"single"', description: "One day, or a first and last day." },
        { prop: "value", type: "Date | DateRange | null", description: "Controlled value, shaped by mode. Pass null for controlled with nothing picked." },
        { prop: "defaultValue", type: "Date | DateRange", description: "Initial value when uncontrolled." },
        {
          prop: "onValueChange",
          type: "(value: Date | DateRange | undefined) => void",
          description: "Called with the picked day, a complete { from, to }, or undefined when cleared. A half-picked range is never reported.",
        },
        { prop: "presets", type: "{ label: string; value: Date | DateRange }[]", description: "Shortcuts shown in a column beside the calendar (a row on phones)." },
        { prop: "placeholder", type: "ReactNode", default: '"Pick a date"', description: 'Shown while nothing is picked. Range mode defaults to "Pick a date range".' },
        {
          prop: "formatOptions",
          type: "Intl.DateTimeFormatOptions",
          default: "{ month: \"short\", day: \"numeric\", year: \"numeric\" }",
          description: "How the value reads in the field. Ranges use formatRange, so shared parts collapse: Oct 12 – 16, 2026.",
        },
        { prop: "locale", type: "string", default: '"en-US"', description: "BCP 47 tag for the field text and the calendar." },
        { prop: "minDate", type: "Date", description: "Earlier days can't be picked." },
        { prop: "maxDate", type: "Date", description: "Later days can't be picked." },
        { prop: "isDateDisabled", type: "(date: Date) => boolean", description: "Return true for days that can't be picked. A range can't run across one." },
        { prop: "weekStartsOn", type: "0 | 1 | 2 | 3 | 4 | 5 | 6", default: "from locale", description: "First column of the calendar, 0 for Sunday." },
        { prop: "numberOfMonths", type: "number", default: "2 for ranges on sm+, else 1", description: "Months in the calendar." },
        { prop: "name", type: "string", description: "Submits yyyy-mm-dd, or yyyy-mm-dd/yyyy-mm-dd for a range, with a surrounding form. A form reset puts back the starting date." },
        { prop: "required", type: "boolean", default: "false", description: "Stops an empty submit with the browser's own message and turns the field red until a date is picked." },
        { prop: "label", type: "ReactNode", description: "Visible label. Names the trigger together with the value." },
        { prop: "description", type: "ReactNode", description: "Helper text under the field." },
        {
          prop: "error",
          type: "ReactNode",
          description: "Red invalid state and message. Replaces description. The calendar keeps its own color.",
        },
        { prop: "disabled", type: "boolean", default: "false", description: "Blocks opening and leaves the value out of form data." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Carried into the popover." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Field height: 32, 40 or 48px, matching Input." },
        { prop: "containerClassName", type: "string", description: "Classes for the outer block with the label and message." },
      ],
    },
  ],
  notes: [
    "When the browser rejects the field on submit (required, type, pattern), it turns red until it's edited or the form resets. The browser shows its own message.",
    "The trigger is a button with aria-haspopup=\"dialog\" and aria-expanded, named by the label plus the current value, so a screen reader hears \"Departure, Oct 14, 2026\".",
    "Click, Enter, Space or Arrow Down opens the calendar with focus on the picked day. Escape or a click outside closes it and focus returns to the trigger.",
    "Inside, the calendar keeps its full keyboard grid. Tab moves between the presets, the month buttons and the active day, and tabbing past the end closes the panel.",
    "In range mode the panel says which end you're picking, and a polite live region announces it.",
    "The clear button is a separate button after the trigger, labelled \"Clear date\" or \"Clear dates\".",
    "Without a visible label, pass aria-label.",
  ],
};
