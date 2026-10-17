import type { ComponentDoc } from "../types";
import ModelSelectDemo from "../examples/model-select/demo";
import ModelSelectField from "../examples/model-select/field";
import ModelSelectLocal from "../examples/model-select/local";

export const doc: ComponentDoc = {
  usage: `import { ModelSelect } from "@/components/ui/model-select"

<ModelSelect models={models} value={model} onValueChange={setModel} />`,
  examples: [
    {
      name: "demo",
      title: "In a composer",
      description:
        "Context, speed and price print as five-cell readouts in shared columns, so models compare down the list. Cells are scaled across the list you pass, context on a log scale. The selected and highlighted rows light; the rest stay grey.",
      component: ModelSelectDemo,
    },
    {
      name: "field",
      title: "As a form field",
      description: "variant=\"outline\" with only the columns that matter here. The list is at least as wide as the field.",
      component: ModelSelectField,
    },
    {
      name: "local",
      title: "Self-hosted models",
      description: "Leave out price when there's no meter running. A readout a model doesn't have prints a dash.",
      component: ModelSelectLocal,
    },
  ],
  api: [
    {
      name: "ModelSelect",
      description: "The ref and other button attributes go on the trigger. The list opens in a Popover.",
      props: [
        {
          prop: "models",
          type: "ModelOption[]",
          description: "{ value, name, description?, context, speed?, price?: { input, output }, disabled?, note? }. Price is US dollars per million tokens; speed is tokens per second.",
        },
        { prop: "value", type: "string", description: "Controlled value." },
        { prop: "defaultValue", type: "string", default: "first enabled", description: "Initial value when uncontrolled." },
        { prop: "onValueChange", type: "(value: string) => void", description: "Called when a model is chosen." },
        { prop: "label", type: "string", default: '"Model"', description: "Names the trigger (\"Model: Argon 2\") and the list." },
        { prop: "variant", type: '"ghost" | "outline"', default: '"ghost"', description: "ghost for a toolbar, outline for a form." },
        { prop: "readouts", type: '("context" | "speed" | "price")[]', default: "all three", description: "Columns to show. A column no model has is dropped." },
        { prop: "side", type: '"top" | "bottom"', default: '"bottom"', description: "Where the list opens. It flips when there isn't room." },
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial open state." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called when the list opens or closes." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex." },
      ],
    },
  ],
  notes: [
    "The list is a listbox that takes focus on open and tracks the highlighted option with aria-activedescendant.",
    "Arrow keys move, Home and End jump, typing a name's first letters finds it, Enter or Space chooses and closes, Escape closes, and focus returns to the trigger.",
    "Each option is described by its readouts in words, \"200k token context, 78 tokens per second, $3 in, $15 out per million tokens\", since the LED cells are hidden from screen readers.",
    "Disabled models are skipped by the keyboard and can't be chosen; put the reason in note.",
  ],
};
