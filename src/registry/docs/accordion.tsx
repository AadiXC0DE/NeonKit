import type { ComponentDoc } from "../types";
import AccordionDemo from "../examples/accordion/demo";
import AccordionMultiple from "../examples/accordion/multiple";
import AccordionControlled from "../examples/accordion/controlled";

export const doc: ComponentDoc = {
  usage: `import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

<Accordion defaultValue="free">
  <AccordionItem value="free">
    <AccordionTrigger>Is NeonKit free?</AccordionTrigger>
    <AccordionContent>Yes. Every component is MIT licensed.</AccordionContent>
  </AccordionItem>
</Accordion>`,
  examples: [
    {
      name: "demo",
      title: "FAQ",
      description: "One item at a time. A thin line of light marks the open one.",
      component: AccordionDemo,
    },
    {
      name: "multiple",
      title: "Multiple",
      description: "type=\"multiple\" lets any number of sections stay open, like a filter panel.",
      component: AccordionMultiple,
    },
    {
      name: "controlled",
      title: "Controlled",
      description: "Drive value from state to expand or collapse everything at once.",
      component: AccordionControlled,
    },
  ],
  api: [
    {
      name: "Accordion",
      description: "Renders a div and accepts every native div attribute.",
      props: [
        { prop: "type", type: '"single" | "multiple"', default: '"single"', description: "How many items can be open at once." },
        { prop: "defaultValue", type: "string | string[]", description: "Initially open item(s) when uncontrolled. A string for single, an array for multiple." },
        { prop: "value", type: "string | string[]", description: "Open item(s) when controlled. \"\" means none in single mode." },
        { prop: "onValueChange", type: "(value: string | string[]) => void", description: "Called with the new value, typed to match type." },
        { prop: "collapsible", type: "boolean", default: "true", description: "Single only. Lets the open item close again." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "AccordionItem",
      description: "Renders a div. Items are separated by hairlines.",
      props: [
        { prop: "value", type: "string", description: "Unique id for the item." },
        { prop: "disabled", type: "boolean", default: "false", description: "Locks the item in its current state." },
      ],
    },
    {
      name: "AccordionTrigger, AccordionContent",
      description: "The trigger is a button inside an h3; the content is a div that animates its height.",
      props: [
        { prop: "className", type: "string", description: "Merged with the defaults." },
      ],
    },
  ],
  notes: [
    "Each trigger is a real button with aria-expanded and aria-controls, wrapped in an h3.",
    "Content has role=\"region\" and is labelled by its trigger.",
    "Up and Down arrows move between triggers; Home and End jump to the first and last.",
    "When collapsible is false, the open trigger reports aria-disabled so screen readers know it cannot close.",
    "Height and opacity animations are skipped when the user prefers reduced motion.",
  ],
};
