import type { ComponentDoc } from "../types";
import ItemDemo from "../examples/item/demo";
import ItemPeople from "../examples/item/people";
import ItemNotifications from "../examples/item/notifications";
import ItemFiles from "../examples/item/files";
import ItemVariants from "../examples/item/variants";

export const doc: ComponentDoc = {
  usage: `import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"

<Item variant="outline">
  <ItemMedia variant="icon">
    <KeyRound />
  </ItemMedia>
  <ItemContent>
    <ItemTitle>Passkeys</ItemTitle>
    <ItemDescription>2 registered</ItemDescription>
  </ItemContent>
  <ItemActions>
    <Button variant="ghost" size="sm">Manage</Button>
  </ItemActions>
</Item>`,
  examples: [
    {
      name: "demo",
      title: "Settings",
      description: "Rows with a switch, a button and a link. The link row lights its icon and edge on hover.",
      component: ItemDemo,
    },
    { name: "people", title: "People", description: "Avatars as media, a badge in the title, and a muted row for a pending invite.", component: ItemPeople },
    {
      name: "notifications",
      title: "Notifications",
      description: "active lights the edge of unread rows. Clicking one marks it read.",
      component: ItemNotifications,
    },
    { name: "files", title: "Files", description: "asChild buttons as a selectable list. The lit edge follows the selection.", component: ItemFiles },
    { name: "variants", title: "Variants and sizes", component: ItemVariants },
  ],
  api: [
    {
      name: "Item",
      description: "A row: media, content and actions. Renders a div and accepts every native div attribute.",
      props: [
        { prop: "variant", type: '"default" | "outline" | "muted"', default: '"default"', description: "Bare, bordered, or on a faint fill." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Minimum height 48, 64 or 80px, with matching padding." },
        { prop: "active", type: "boolean", default: "false", description: "Lights the leading edge, for the selected or unread row." },
        { prop: "asChild", type: "boolean", default: "false", description: "Renders the single child (a link or button) as the row, with hover and focus styles." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex." },
      ],
    },
    {
      name: "ItemMedia",
      description: "The leading slot.",
      props: [
        { prop: "variant", type: '"default" | "icon" | "image"', default: '"default"', description: "Bare, an icon on a tile that lights with the row, or a photo cropped to a circle." },
      ],
    },
    {
      name: "ItemDescription",
      description: "Secondary text under the title.",
      props: [{ prop: "lines", type: '1 | 2 | "none"', default: "2", description: 'Clamp to one line with an ellipsis or two, or "none" to wrap in full. Two or more lines pin the media to the top.' }],
    },
    {
      name: "ItemGroup, ItemSeparator",
      description: "A list of rows and a hairline between them.",
      props: [
        { prop: "ItemGroup", type: "div", description: "role=\"list\"; rows inside become listitems, links get a listitem wrapper." },
        { prop: "inset", type: "number", default: "0", description: "ItemSeparator: start the rule this many px in, to line up with the text." },
      ],
    },
    {
      name: "ItemContent, ItemTitle, ItemActions",
      description: "Layout parts. Each accepts native div attributes.",
      props: [
        { prop: "ItemTitle", type: "div", description: "A flex row, so badges and timestamps can sit beside the title. Wrap the title text in a span to truncate it." },
        { prop: "ItemActions", type: "div", description: "Trailing controls, kept at their natural width." },
      ],
    },
  ],
  notes: [
    "Item is layout only. Make a row interactive with asChild and a real <a> or <button>, never an onClick on the div.",
    "Inside ItemGroup, rows are listitems of a list, so screen readers announce the count.",
    "Interactive rows get the standard focus ring; the lit edge is an extra signal, not the only one.",
  ],
};
