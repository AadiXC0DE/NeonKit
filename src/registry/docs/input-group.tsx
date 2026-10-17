import type { ComponentDoc } from "../types";
import InputGroupDemo from "../examples/input-group/demo";
import InputGroupSearch from "../examples/input-group/search";
import InputGroupMessage from "../examples/input-group/message";
import InputGroupUsername from "../examples/input-group/username";

export const doc: ComponentDoc = {
  usage: `import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"

<InputGroup>
  <InputGroupAddon>
    <InputGroupText>https://</InputGroupText>
  </InputGroupAddon>
  <InputGroupInput aria-label="Domain" placeholder="acme.dev" />
</InputGroup>`,
  examples: [
    {
      name: "demo",
      title: "Prefixes, units and a copy button",
      description: "Text addons sit flush with the value so it reads as one URL. The glow wraps the whole group.",
      component: InputGroupDemo,
    },
    {
      name: "search",
      title: "Search",
      description: "The trailing addon swaps between a ⌘K hint, a spinner and a result count. ⌘K focuses the field.",
      component: InputGroupSearch,
    },
    {
      name: "message",
      title: "Message box",
      description: "A growing Textarea with a toolbar row below. Send only lights up once there's something to send.",
      component: InputGroupMessage,
    },
    {
      name: "username",
      title: "Availability",
      description: "aria-invalid on the control turns the group and its focus glow red.",
      component: InputGroupUsername,
    },
  ],
  api: [
    {
      name: "InputGroup",
      description: "The field box, a div with role=\"group\". A click on anything but a button focuses the control.",
      props: [
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "32, 40 or 48px tall. Passed to the control." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the focus glow." },
      ],
    },
    {
      name: "InputGroupAddon",
      description: "Holds icons, text, buttons, a Kbd or a Spinner. Icons light up while the group has focus.",
      props: [
        {
          prop: "align",
          type: '"inline-start" | "inline-end" | "block-start" | "block-end"',
          default: '"inline-start"',
          description: "Before or after the control on its line, or a full-width row above or below it.",
        },
      ],
    },
    {
      name: "InputGroupInput",
      description: "NeonKit's Input without its own box. Takes every Input prop except label, description, error, leading, trailing and size.",
      props: [{ prop: "aria-invalid", type: "boolean", description: "Turns the whole group red." }],
    },
    {
      name: "InputGroupTextarea",
      description: "NeonKit's Textarea without its own box. Grows with its content.",
      props: [
        { prop: "minRows", type: "number", default: "2", description: "Rows before it starts growing." },
        { prop: "maxRows", type: "number", default: "10", description: "Rows before it scrolls." },
      ],
    },
    {
      name: "InputGroupButton",
      description: "A Button sized to sit inside the field. Takes every Button prop.",
      props: [
        { prop: "size", type: '"sm" | "icon"', default: '"sm"', description: "28px tall text button, or a 28px square." },
        { prop: "variant", type: "ButtonVariant", default: '"ghost"', description: "Any Button variant." },
      ],
    },
    {
      name: "InputGroupText",
      description: "Muted inline text, for prefixes, suffixes and units. Sits flush against the value.",
      props: [{ prop: "className", type: "string", description: "Merged onto the span." }],
    },
  ],
  notes: [
    "Label the control, not the group: a <label htmlFor> or aria-label on InputGroupInput.",
    "Addons are outside the input, so screen readers don't read a prefix as part of the value; mention it in the label when it matters.",
    "Use aria-invalid with aria-describedby pointing at the message, as in the availability example.",
  ],
};
