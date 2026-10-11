import type { ComponentDoc } from "../types";
import ToggleGroupDemo from "../examples/toggle-group/demo";
import ToggleExample from "../examples/toggle-group/toggle";
import ToggleGroupVariants from "../examples/toggle-group/variants";
import ToggleGroupVertical from "../examples/toggle-group/vertical";
import ToggleGroupSizes from "../examples/toggle-group/sizes";

export const doc: ComponentDoc = {
  usage: `import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

<ToggleGroup aria-label="Range" defaultValue="week">
  <ToggleGroupItem value="day">Day</ToggleGroupItem>
  <ToggleGroupItem value="week">Week</ToggleGroupItem>
  <ToggleGroupItem value="month">Month</ToggleGroupItem>
</ToggleGroup>`,
  examples: [
    {
      name: "demo",
      title: "Range and formatting",
      description:
        "A segmented control whose lit pill slides to the selection, and a toolbar where each pressed item powers on with a flicker.",
      component: ToggleGroupDemo,
    },
    {
      name: "toggle",
      title: "Toggle",
      description: "A single on/off button with aria-pressed, in the default and outline variants.",
      component: ToggleExample,
    },
    {
      name: "variants",
      title: "Variants",
      description: "Segmented for switching views, outline for attached settings, ghost for toolbars.",
      component: ToggleGroupVariants,
    },
    {
      name: "vertical",
      title: "Vertical",
      description: "orientation=\"vertical\" stacks the items and moves the arrow keys to Up and Down.",
      component: ToggleGroupVertical,
    },
    {
      name: "sizes",
      title: "Sizes",
      description: "32, 40 and 48px tall, so a segmented control lines up with inputs and buttons.",
      component: ToggleGroupSizes,
    },
  ],
  api: [
    {
      name: "ToggleGroup",
      description: "Renders a div and accepts every native div attribute. Give it an aria-label or aria-labelledby.",
      props: [
        {
          prop: "type",
          type: '"single" | "multiple"',
          default: '"single"',
          description: "Single acts as a radio group; multiple is a toolbar of pressed buttons.",
        },
        { prop: "value", type: "string | string[]", description: "Controlled value. An array when type is multiple." },
        { prop: "defaultValue", type: "string | string[]", description: "Initial value when uncontrolled." },
        {
          prop: "onValueChange",
          type: "(value: string) => void | (value: string[]) => void",
          description: "Called with the new value. Single never deselects, like a radio group.",
        },
        {
          prop: "variant",
          type: '"segmented" | "outline" | "ghost"',
          default: '"segmented"',
          description: "Track with a sliding pill, attached cells with a lit edge, or bare items.",
        },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Overall height: 32, 40 or 48px." },
        {
          prop: "orientation",
          type: '"horizontal" | "vertical"',
          default: '"horizontal"',
          description: "Layout direction and which arrow keys move between items.",
        },
        { prop: "disabled", type: "boolean", default: "false", description: "Disables every item." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "ToggleGroupItem",
      description: "Renders a button. Icon-only items need an aria-label.",
      props: [
        { prop: "value", type: "string", description: "Unique value within the group." },
        { prop: "disabled", type: "boolean", default: "false", description: "Skipped by the arrow keys and can't be pressed." },
      ],
    },
    {
      name: "Toggle",
      description: "A standalone pressable button. Accepts every native button attribute.",
      props: [
        { prop: "pressed", type: "boolean", description: "Controlled state." },
        { prop: "defaultPressed", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onPressedChange", type: "(pressed: boolean) => void", description: "Called when it's pressed or released." },
        { prop: "variant", type: '"default" | "outline"', default: '"default"', description: "Bare or bordered." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "32, 40 or 48px tall; icon-only toggles are square." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "Single groups are a radiogroup of radio items with aria-checked; multiple groups are a toolbar of buttons with aria-pressed.",
    "The group is one Tab stop. Arrow keys move between items and wrap, Home and End jump to the ends, and disabled items are skipped.",
    "In a single group, moving with the arrows also selects, as in a native radio group. In a toolbar the arrows only move focus; Space or Enter presses.",
    "A radio group answers both arrow pairs; a toolbar only the pair along its orientation.",
    "The sliding pill and the power-on flicker are turned off under prefers-reduced-motion.",
  ],
};
