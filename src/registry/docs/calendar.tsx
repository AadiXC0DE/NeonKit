import type { ComponentDoc } from "../types";
import CalendarDemo from "../examples/calendar/demo";
import CalendarSingle from "../examples/calendar/single";
import CalendarMultiple from "../examples/calendar/multiple";
import CalendarLocale from "../examples/calendar/locale";

const shared = [
  { prop: "month", type: "Date", description: "Controlled first visible month." },
  { prop: "defaultMonth", type: "Date", description: "First visible month at mount. Falls back to the selection's month, then today's." },
  { prop: "onMonthChange", type: "(month: Date) => void", description: "Called with the first of the month when the view pages, from the buttons or the keyboard." },
  { prop: "numberOfMonths", type: "number", default: "1", description: "Months shown side by side. They stack below the sm breakpoint." },
  { prop: "weekStartsOn", type: "0 | 1 | 2 | 3 | 4 | 5 | 6", default: "from locale", description: "First column, 0 for Sunday. Defaults to the locale's first day of the week." },
  { prop: "minDate", type: "Date", description: "Earlier days are disabled, and the previous button stops at this month." },
  { prop: "maxDate", type: "Date", description: "Later days are disabled, and the next button stops at this month." },
  { prop: "disabled", type: "(date: Date) => boolean", description: "Return true for days that can't be picked. A range can't run across one." },
  { prop: "showOutsideDays", type: "boolean", default: "true", description: "Fill the first and last rows with days from the neighbouring months." },
  { prop: "locale", type: "string", default: '"en-US"', description: "BCP 47 tag for month and weekday names, digits and the week start." },
  { prop: "autoFocus", type: "boolean", default: "false", description: "Focus the active day on mount and mark it with data-autofocus for a surrounding popover." },
  { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
];

export const doc: ComponentDoc = {
  usage: `import { Calendar, type DateRange } from "@/components/ui/calendar"

const [range, setRange] = React.useState<DateRange>({})

<Calendar mode="range" numberOfMonths={2} selected={range} onSelect={setRange} />`,
  examples: [
    {
      name: "demo",
      title: "Booking a stay",
      description:
        "Range mode across two months. The first pick sets check-in, a dim tube previews the stay as you hover, and the second pick lights it. Booked nights are disabled, and a range can't run across them.",
      component: CalendarDemo,
    },
    {
      name: "single",
      title: "A single day",
      description: "The default mode. Weekends are disabled with a function, so the keyboard skips them too.",
      component: CalendarSingle,
    },
    {
      name: "multiple",
      title: "Several days",
      description: "Multiple mode toggles each day on and off and reports them sorted.",
      component: CalendarMultiple,
    },
    {
      name: "locale",
      title: "Locales",
      description: "Month and weekday names, digits and the first day of the week all come from Intl.",
      component: CalendarLocale,
    },
  ],
  api: [
    {
      name: "Calendar",
      description:
        "Also accepts native div attributes, and the ref points at the root. It has no surface of its own, so it sits cleanly in a popover or card.",
      props: [
        { prop: "mode", type: '"single" | "range" | "multiple"', default: '"single"', description: "What a click selects. It also sets the types of selected and onSelect." },
        { prop: "selected", type: "Date | DateRange | Date[] | null", description: "Controlled selection, shaped by mode. Pass null for controlled with nothing picked." },
        { prop: "defaultSelected", type: "Date | DateRange | Date[]", description: "Initial selection when uncontrolled." },
        {
          prop: "onSelect",
          type: "(value) => void",
          description:
            "Single: the picked Date. Range: { from } on the first pick, then { from, to }. Multiple: every selected Date, sorted. Dates are local midnight.",
        },
        ...shared,
      ],
    },
    {
      name: "DateRange",
      props: [
        { prop: "from", type: "Date", description: "First day, inclusive." },
        { prop: "to", type: "Date", description: "Last day, inclusive. Unset while the end is still being picked." },
      ],
    },
  ],
  notes: [
    "Each month is a grid labelled by its caption, and the caption is a polite live region so paging is announced.",
    "Only one day is in the Tab order: the focused day, else the selection, else today, else the first day that can be picked.",
    "Arrow keys move by day and week, Page Up and Page Down by month, Shift with them by year, and Home and End to the ends of the week. Enter or Space selects.",
    "Moving past the visible months pages the view, and moves that land on a disabled day skip ahead to the next one that isn't.",
    "Days carry a full spoken date, aria-selected, aria-disabled, and aria-current=\"date\" for today.",
    "A month that has fewer days than the one you came from lands on its last day: Jan 31 plus a month is Feb 28.",
    "Date math uses local calendar days, never milliseconds, so daylight-saving changes can't skip or repeat a day.",
    "Today is read on the client only, so server and browser time zones can't disagree during hydration.",
    "Month slides and the range ignition are skipped with reduced motion.",
  ],
};
