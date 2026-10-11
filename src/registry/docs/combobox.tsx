import type { ComponentDoc } from "../types";
import ComboboxDemo from "../examples/combobox/demo";
import ComboboxFramework from "../examples/combobox/framework";
import ComboboxCreatable from "../examples/combobox/creatable";
import ComboboxAsync from "../examples/combobox/async";
import ComboboxStates from "../examples/combobox/states";

export const doc: ComponentDoc = {
  usage: `import { Combobox } from "@/components/ui/combobox"

<Combobox
  label="Framework"
  placeholder="Search frameworks"
  options={[
    { value: "nextjs", label: "Next.js", group: "Full-stack" },
    { value: "astro", label: "Astro", group: "Static" },
  ]}
/>`,
  examples: [
    {
      name: "demo",
      title: "Assign a teammate",
      description:
        "Type to filter by name or role. The highlight glides to the best match, matched letters light up, and multiple values sit in the field as chips.",
      component: ComboboxDemo,
    },
    {
      name: "framework",
      title: "Groups",
      description: "Options with a group are listed under its heading. Disabled options stay visible but are skipped.",
      component: ComboboxFramework,
    },
    {
      name: "creatable",
      title: "Creatable",
      description: "With creatable, text that matches nothing offers a Create option. onCreate adds it and returns its value.",
      component: ComboboxCreatable,
    },
    {
      name: "async",
      title: "Server search",
      description:
        "Pass onSearchChange to filter on the server. While loading is set, a scan line runs along the field.",
      component: ComboboxAsync,
    },
    { name: "states", title: "Sizes, error and disabled", component: ComboboxStates },
  ],
  api: [
    {
      name: "Combobox",
      description:
        "Also accepts native input attributes, and the ref points at the input. className and style go to the field box.",
      props: [
        { prop: "options", type: "ComboboxOption[]", description: "The choices, in order. Groups keep the order they first appear in." },
        { prop: "multiple", type: "boolean", default: "false", description: "Pick several values, shown as chips inside the field." },
        { prop: "value", type: "string | string[]", description: "Controlled value. An array when multiple." },
        { prop: "defaultValue", type: "string | string[]", description: "Initial value when uncontrolled." },
        {
          prop: "onValueChange",
          type: "(value: string) => void | (value: string[]) => void",
          description: "Called with the new value. Single mode passes \"\" when cleared.",
        },
        { prop: "placeholder", type: "string", description: "Shown while the field is empty." },
        { prop: "emptyText", type: "ReactNode", default: '"No matches"', description: "Shown in the list when nothing matches." },
        {
          prop: "onSearchChange",
          type: "(query: string) => void",
          description: "Called with the typed text. Setting it turns local filtering off, for results filtered on a server.",
        },
        {
          prop: "shouldFilter",
          type: "boolean",
          default: "true (false with onSearchChange)",
          description: "Filter and rank options locally: start of label, then start of a word, then anywhere, then description.",
        },
        { prop: "loading", type: "boolean", default: "false", description: "Runs the scan line and shows a loading row while there are no options." },
        { prop: "creatable", type: "boolean", default: "false", description: "Offers to create text that matches no option label." },
        {
          prop: "onCreate",
          type: "(query: string) => string | void",
          description: "Called on Create. Add the option to options yourself; return its value to select it (defaults to the text).",
        },
        { prop: "name", type: "string", description: "Submits the value with a form. Multiple adds one entry per value." },
        { prop: "label", type: "ReactNode", description: "Visible label. Names both the input and the list." },
        { prop: "description", type: "ReactNode", description: "Helper text under the field." },
        {
          prop: "error",
          type: "ReactNode",
          description: "Red invalid state and message. Replaces description. Pass true for the state without a message.",
        },
        { prop: "disabled", type: "boolean", default: "false", description: "Blocks typing and opening, and leaves the value out of form data." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Field height and option padding." },
        { prop: "containerClassName", type: "string", description: "Classes for the outer block with the label, field and message." },
      ],
    },
    {
      name: "ComboboxOption",
      props: [
        { prop: "value", type: "string", description: "Unique value, also the React key." },
        { prop: "label", type: "string", description: "Shown in the list, the input and chips. Searched first." },
        { prop: "description", type: "string", description: "Second line in the list. Also searched." },
        { prop: "icon", type: "ReactNode", description: "An icon or avatar before the label, also shown in the field for the selected option." },
        { prop: "group", type: "string", description: "Heading to list the option under." },
        { prop: "disabled", type: "boolean", default: "false", description: "Visible but can't be picked." },
      ],
    },
  ],
  notes: [
    "Follows the WAI-ARIA editable combobox pattern with list autocomplete: focus stays in the input and aria-activedescendant tracks the highlighted option.",
    "ArrowDown and ArrowUp open the list and move through it, wrapping and skipping disabled options. Home and End jump to the ends while it's open.",
    "Enter picks the highlighted option, Escape closes the list and restores the selected label, and Tab closes it. Space types a space.",
    "Typing highlights the best match, so Enter picks it. Leaving the field with an exact label typed selects that option; leaving it empty clears the value.",
    "In multiple mode the list stays open after each pick, Enter on a selected option removes it, and Backspace in an empty input removes the last chip.",
    "Result counts and added or removed values are announced through a polite live region.",
    "The list is portaled to the body (or the enclosing modal dialog) and sized to the field, so overflow-hidden ancestors don't clip it.",
    "Without a visible label, pass aria-label. It names both the input and the list.",
  ],
};
