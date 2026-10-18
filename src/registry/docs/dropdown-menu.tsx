import type { ComponentDoc } from "../types";
import DropdownMenuDemo from "../examples/dropdown-menu/demo";
import DropdownMenuAccount from "../examples/dropdown-menu/account";
import DropdownMenuViewOptions from "../examples/dropdown-menu/view-options";
import DropdownMenuNested from "../examples/dropdown-menu/nested";

const itemProps = [
  { prop: "disabled", type: "boolean", default: "false", description: "Visible but skipped by the keyboard and ignored on click." },
  { prop: "textValue", type: "string", description: "Text for typeahead when the label isn't plain text." },
  { prop: "inset", type: "boolean", default: "false", description: "Indents the label to line up with items that have an icon or indicator." },
  {
    prop: "onSelect",
    type: "(event: Event) => void",
    description: "Called on click, Enter or Space. The menu closes unless you call event.preventDefault().",
  },
];

export const doc: ComponentDoc = {
  usage: `import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>Actions</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem icon={<Copy />} shortcut="⌘C">Copy URL</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem variant="danger">Delete project</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>`,
  examples: [
    {
      name: "demo",
      title: "Project actions",
      description:
        "Icons, shortcuts, a submenu of radio items, checkbox items that keep the menu open, and a danger item. The highlight glides between items with a lit edge.",
      component: DropdownMenuDemo,
    },
    {
      name: "account",
      title: "Account menu",
      description: "Without asChild the trigger renders a plain button you can style. Labels take any content.",
      component: DropdownMenuAccount,
    },
    {
      name: "view-options",
      title: "Checkbox and radio items",
      description: "Call event.preventDefault() in onSelect to flip several options without the menu closing.",
      component: DropdownMenuViewOptions,
    },
    {
      name: "nested",
      title: "Nested submenus",
      description:
        "Submenus open on hover after a short delay, or with ArrowRight. Moving diagonally toward an open submenu won't close it.",
      component: DropdownMenuNested,
    },
  ],
  api: [
    {
      name: "DropdownMenu",
      description: "Holds the open state. Renders no element of its own.",
      props: [
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called when the trigger, a selection, Escape, Tab or an outside click asks to change state." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Without it the menu takes the trigger's color, then --neon-accent, then cyan." },
        {
          prop: "anchorPoint",
          type: "{ x: number; y: number }",
          description: "Opens the menu at this viewport point instead of against the trigger. Context Menu is built on it.",
        },
      ],
    },
    {
      name: "DropdownMenuTrigger",
      description: "Renders a button that toggles the menu. Also accepts every native button attribute.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Merges trigger behaviour, ARIA and ref onto its single child, e.g. a Button." },
      ],
    },
    {
      name: "DropdownMenuContent",
      description:
        "The menu panel, portaled and positioned with floating-ui. It flips and shifts to stay on screen and scrolls when it's taller than the space. Inside a modal dialog it portals into the dialog. --menu-trigger-width holds the trigger's width, so className=\"w-[var(--menu-trigger-width)]\" matches it.",
      props: [
        { prop: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Preferred side of the trigger." },
        { prop: "align", type: '"start" | "center" | "end"', default: '"start"', description: "Alignment along that side." },
        { prop: "sideOffset", type: "number", default: "6", description: "Gap from the trigger in px. 2 when opened at an anchorPoint." },
        { prop: "alignOffset", type: "number", default: "0", description: "Nudge along the alignment axis in px." },
        { prop: "loop", type: "boolean", default: "true", description: "Arrow keys wrap from the last item to the first and back." },
      ],
    },
    {
      name: "DropdownMenuItem",
      description: "A role=\"menuitem\". Also accepts native div attributes.",
      props: [
        { prop: "icon", type: "ReactNode", description: "Leading icon. Lights up while the item is highlighted." },
        { prop: "shortcut", type: "ReactNode", description: "Right-aligned hint such as ⌘K. Display only: bind the key yourself." },
        { prop: "variant", type: '"default" | "danger"', default: '"default"', description: "danger turns the text, icon and highlight red." },
        { prop: "asChild", type: "boolean", default: "false", description: "Renders the single child (e.g. a link) as the item. Enter activates it like a click." },
        ...itemProps,
      ],
    },
    {
      name: "DropdownMenuCheckboxItem",
      description: "A role=\"menuitemcheckbox\" with a lit check box. Takes the item props above except icon and variant.",
      props: [
        { prop: "checked", type: "boolean", description: "Controlled state." },
        { prop: "defaultChecked", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onCheckedChange", type: "(checked: boolean) => void", description: "Called with the new state on select." },
        { prop: "shortcut", type: "ReactNode", description: "Right-aligned hint." },
      ],
    },
    {
      name: "DropdownMenuRadioGroup",
      description: "A role=\"group\" whose radio items share one value.",
      props: [
        { prop: "value", type: "string", description: "Controlled value." },
        { prop: "defaultValue", type: "string", description: "Initial value when uncontrolled." },
        { prop: "onValueChange", type: "(value: string) => void", description: "Called when a different radio item is selected." },
      ],
    },
    {
      name: "DropdownMenuRadioItem",
      description: "A role=\"menuitemradio\". Takes the item props above except icon and variant.",
      props: [
        { prop: "value", type: "string", description: "The value this item selects." },
        { prop: "shortcut", type: "ReactNode", description: "Right-aligned hint." },
      ],
    },
    {
      name: "DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent",
      description: "A nested menu. Sub holds the state, the trigger is an item that opens it, the content is a second portaled panel.",
      props: [
        { prop: "DropdownMenuSubTrigger icon", type: "ReactNode", description: "Leading icon. Also takes disabled, textValue and inset." },
        { prop: "DropdownMenuSubContent sideOffset", type: "number", default: "2", description: "Gap from the parent menu in px. Opens to the right, or the left when there's no room." },
      ],
    },
    {
      name: "DropdownMenuLabel, DropdownMenuGroup, DropdownMenuSeparator",
      description: "Structure. Each accepts the native attributes of its div.",
      props: [
        { prop: "DropdownMenuLabel inset", type: "boolean", default: "false", description: "Lines the label up with items that have an icon or indicator." },
        { prop: "DropdownMenuGroup", type: "div", description: "role=\"group\", labelled by a DropdownMenuLabel inside it." },
        { prop: "DropdownMenuSeparator", type: "div", description: "role=\"separator\" hairline." },
      ],
    },
    {
      name: "DropdownMenuAnchor",
      description: "Optional. Positions the menu against this element instead of the trigger and lends it its color. Context Menu uses it for the right-click area.",
      props: [{ prop: "asChild", type: "boolean", default: "false", description: "Use the single child as the anchor instead of rendering a div." }],
    },
  ],
  notes: [
    "Follows the WAI-ARIA menu button pattern: the trigger has aria-haspopup=\"menu\" and aria-expanded, items are menuitem, menuitemcheckbox or menuitemradio with real DOM focus.",
    "Enter, Space and ArrowDown on the trigger open the menu on the first item; ArrowUp opens it on the last. A mouse opens it on press, so press, drag and release selects.",
    "Arrow keys move and skip disabled items, Home and End jump, and typing letters jumps to a matching item. Pressing the same letter again cycles.",
    "Enter or Space selects. ArrowRight or Enter opens a submenu on its first item and ArrowLeft closes it. Escape closes one level at a time.",
    "Tab closes the menu and moves on from the trigger. Escape, a selection and Tab return focus to the trigger.",
    "When the trigger sits in a modal Dialog, the menu renders inside the dialog so it isn't made inert.",
  ],
};
