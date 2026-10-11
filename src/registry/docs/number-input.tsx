import type { ComponentDoc } from "../types";
import NumberInputDemo from "../examples/number-input/demo";
import NumberInputFormats from "../examples/number-input/formats";
import NumberInputScrub from "../examples/number-input/scrub";
import NumberInputStates from "../examples/number-input/states";

export const doc: ComponentDoc = {
  usage: `import { NumberInput } from "@/components/ui/number-input"

<NumberInput
  label="Price"
  defaultValue={24}
  min={0}
  formatOptions={{ style: "currency", currency: "USD" }}
/>`,
  examples: [
    {
      name: "demo",
      title: "Pricing",
      description:
        "Drag either label sideways to scrub, hold a stepper to repeat, or type. The value ticks up or down with a short slide as it steps.",
      component: NumberInputDemo,
    },
    {
      name: "formats",
      title: "Formats and locales",
      description:
        "formatOptions takes any Intl.NumberFormat options. Typing is read back leniently, with the locale's separators, percent signs and compact suffixes.",
      component: NumberInputFormats,
    },
    {
      name: "scrub",
      title: "Scrubbing",
      description: "A leading addon is a grip too, which suits dense inspectors without visible labels.",
      component: NumberInputScrub,
    },
    { name: "states", title: "Sizes, error and disabled", component: NumberInputStates },
  ],
  api: [
    {
      name: "NumberInput",
      description:
        "Also accepts native input attributes, and the ref points at the input. className and style go to the field box.",
      props: [
        { prop: "value", type: "number | null", description: "Controlled value. null is an empty field." },
        { prop: "defaultValue", type: "number | null", default: "null", description: "Initial value when uncontrolled." },
        {
          prop: "onValueChange",
          type: "(value: number | null) => void",
          description: "Called when a value is committed: on blur, Enter, stepping and scrubbing. Not on every keystroke.",
        },
        { prop: "min", type: "number", description: "Lowest value. Typed values are clamped to it, and Home jumps to it." },
        { prop: "max", type: "number", description: "Highest value. Typed values are clamped to it, and End jumps to it." },
        { prop: "step", type: "number", default: "1", description: "Amount for the arrow keys, the steppers and scrubbing. Steps snap to multiples from min." },
        { prop: "largeStep", type: "number", default: "10", description: "Amount for Shift+Arrow, PageUp, PageDown and Shift while scrubbing." },
        {
          prop: "formatOptions",
          type: "Intl.NumberFormatOptions",
          description: "How the value displays: currency, percent (value 0.15 shows 15%), units, compact, fraction digits.",
        },
        { prop: "locale", type: "string", default: "browser", description: "BCP 47 locale for formatting and parsing." },
        { prop: "scrub", type: "boolean", default: "true", description: "Drag the label or leading addon sideways to change the value." },
        { prop: "leading", type: "ReactNode", description: "Icon or text before the value. A scrub grip when scrub is on." },
        { prop: "trailing", type: "ReactNode", description: "Icon or text after the value, before the steppers." },
        { prop: "name", type: "string", description: "Submits the raw number (not the formatted text) with a surrounding form." },
        { prop: "label", type: "ReactNode", description: "Visible label. A scrub grip when scrub is on." },
        { prop: "description", type: "ReactNode", description: "Helper text under the field." },
        {
          prop: "error",
          type: "ReactNode",
          description: "Red invalid state and message. Replaces description. Pass true for the state without a message.",
        },
        { prop: "disabled", type: "boolean", default: "false", description: "Blocks editing, stepping and scrubbing." },
        { prop: "readOnly", type: "boolean", default: "false", description: "Shows the value without letting it change." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Field height: 32, 40 or 48px." },
        { prop: "containerClassName", type: "string", description: "Classes for the outer block with the label, field and message." },
      ],
    },
  ],
  notes: [
    "The input is a spinbutton with aria-valuenow, aria-valuemin, aria-valuemax and aria-valuetext set to the formatted value.",
    "ArrowUp and ArrowDown step by step; with Shift, or PageUp and PageDown, by largeStep. Home and End jump to min and max when they're set.",
    "Enter commits what's typed and Escape drops it. Text that holds no number reverts to the last value; an empty field commits null.",
    "The stepper buttons repeat while held and speed up. They're out of the Tab order, since the arrow keys do the same job.",
    "Scrubbing captures the pointer, so the drag keeps working past the edge of the label. Shift moves by largeStep and Alt slows to one step per 10px.",
    "The tick animation is skipped under prefers-reduced-motion.",
  ],
};
