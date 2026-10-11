import type { ComponentDoc } from "../types";
import FieldDemo from "../examples/field/demo";
import FieldCustomControl from "../examples/field/custom-control";
import FieldValidation from "../examples/field/validation";
import FieldBuildingBlocks from "../examples/field/building-blocks";

export const doc: ComponentDoc = {
  usage: `import { Field } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"

<Field orientation="horizontal" label="Preview deployments" description="Build every pull request on its own URL.">
  <Switch defaultChecked />
</Field>`,
  examples: [
    {
      name: "demo",
      title: "Settings",
      description:
        "One Field wraps a Switch, a native select and a Slider. Each control gets its id, label and description wired without extra props.",
      component: FieldDemo,
    },
    {
      name: "custom-control",
      title: "Custom control",
      description:
        "A control whose focusable parts sit inside a wrapper reads its wiring from useFieldControl() and spreads it onto the group.",
      component: FieldCustomControl,
    },
    {
      name: "validation",
      title: "Validation",
      description:
        "Pass error to swap the description for a message. The field turns red, the control gets aria-invalid, and required shows a neon dot.",
      component: FieldValidation,
    },
    {
      name: "building-blocks",
      title: "Building blocks",
      description:
        "Label, FieldDescription and FieldError on their own, for layouts Field doesn't cover, like an action beside the label.",
      component: FieldBuildingBlocks,
    },
  ],
  api: [
    {
      name: "Field",
      description:
        "Wraps a single control element and clones it with id, aria-describedby, aria-invalid and required. Also accepts native div attributes, which go to the outer block.",
      props: [
        { prop: "label", type: "ReactNode", description: "Visible label. Points at the control with htmlFor, or aria-labelledby for controls a label can't target." },
        { prop: "description", type: "ReactNode", description: "Helper text under the control." },
        {
          prop: "error",
          type: "ReactNode",
          description: "Red invalid state and message. Replaces description. Pass true for the state without a message.",
        },
        { prop: "required", type: "boolean", default: "false", description: "Shows a neon dot after the label and sets required on the control." },
        { prop: "id", type: "string", description: "The control's id. Defaults to the child's own id, then a generated one." },
        { prop: "orientation", type: '"vertical" | "horizontal"', default: '"vertical"', description: "Horizontal puts the label and message on the left and the control on the right. Suits switches and other compact controls." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Label size. Match it to the control's size." },
        {
          prop: "color",
          type: "NeonColor",
          default: "inherited",
          description: "Sets --neon-accent for the control inside. Red while error is set.",
        },
        { prop: "children", type: "ReactElement", description: "The control. One element; it receives the wiring as props." },
      ],
    },
    {
      name: "useFieldControl",
      description:
        "Returns the props a custom control inside a Field should spread onto its focusable element or group. Returns an empty object outside a Field.",
      props: [
        { prop: "id", type: "string", description: "Matches the label's htmlFor." },
        { prop: "aria-labelledby", type: "string", description: "The label's id, for elements a label can't target." },
        { prop: "aria-describedby", type: "string", description: "The description or error message id." },
        { prop: "aria-invalid", type: "true | undefined", description: "Set while the field has an error." },
        { prop: "required", type: "true | undefined", description: "Set when the field is required. Map it to aria-required if your role supports it." },
      ],
    },
    {
      name: "Label",
      description: "Native label with the same type scale as Input, Select and Textarea.",
      props: [
        { prop: "htmlFor", type: "string", description: "The control's id. Inside a Field it defaults to the field's control." },
        { prop: "required", type: "boolean", default: "false", description: "Shows the neon dot. Set required on the control as well so it is announced." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Text size." },
      ],
    },
    {
      name: "FieldDescription",
      description: "Helper text paragraph. Give it an id and point the control's aria-describedby at it.",
      props: [{ prop: "id", type: "string", description: "Referenced by the control's aria-describedby." }],
    },
    {
      name: "FieldError",
      description: "Red message paragraph. Renders nothing when it has no children.",
      props: [{ prop: "id", type: "string", description: "Referenced by the control's aria-describedby." }],
    },
  ],
  notes: [
    "Native inputs, selects, textareas and buttons are labelled with htmlFor; other controls get aria-labelledby, so a slider thumb or a custom group is still named.",
    "Clicking the label of a control that a label can't focus moves focus to its first focusable part.",
    "The description or error is linked with aria-describedby, merged with any aria-describedby the control already has.",
    "The required dot is decorative. Field puts required on the control so assistive tech announces it.",
    "NeonKit inputs that already take label, description and error props don't need a Field; use it for everything else.",
  ],
};
