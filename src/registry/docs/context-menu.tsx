import type { ComponentDoc } from "../types";
import ContextMenuDemo from "../examples/context-menu/demo";
import ContextMenuCanvas from "../examples/context-menu/canvas";
import ContextMenuMessages from "../examples/context-menu/messages";

export const doc: ComponentDoc = {
  usage: `import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"

<ContextMenu>
  <ContextMenuTrigger className="h-40 rounded-xl border border-white/10">
    Right-click here
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem shortcut="⌘D">Duplicate</ContextMenuItem>
    <ContextMenuItem variant="danger">Move to trash</ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>`,
  examples: [
    {
      name: "demo",
      title: "File browser",
      description:
        "Each tile has its own menu. Duplicate, star and trash change the grid; the tile stays lit while its menu is open.",
      component: ContextMenuDemo,
    },
    {
      name: "canvas",
      title: "Canvas",
      description: "One menu for a whole area, with a radio submenu and checkbox items that drive the canvas.",
      component: ContextMenuCanvas,
    },
    {
      name: "messages",
      title: "Messages",
      description: "Long-press a message on touch, or focus one and press Shift+F10.",
      component: ContextMenuMessages,
    },
  ],
  api: [
    {
      name: "ContextMenu",
      description: "Holds the state and the pointer position. Renders no element of its own. Built on DropdownMenu with anchorPoint.",
      props: [
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called when the menu opens or closes." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Without it the menu takes the trigger area's color, then --neon-accent, then cyan." },
      ],
    },
    {
      name: "ContextMenuTrigger",
      description: "The area that answers right-click. Renders a div and accepts its native attributes.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Uses the single child as the area instead of rendering a div." },
        { prop: "disabled", type: "boolean", default: "false", description: "Lets the browser's own context menu through." },
      ],
    },
    {
      name: "ContextMenuContent",
      description: "The same panel as DropdownMenuContent, opened at the pointer.",
      props: [
        { prop: "side", type: '"top" | "right" | "bottom" | "left"', default: '"right"', description: "Which side of the pointer to open on. Flips near the viewport edge." },
        { prop: "align", type: '"start" | "center" | "end"', default: '"start"', description: "Alignment against the pointer." },
        { prop: "sideOffset", type: "number", default: "2", description: "Gap from the pointer in px, so the item under the cursor isn't hovered on open." },
        { prop: "loop", type: "boolean", default: "true", description: "Arrow keys wrap around." },
      ],
    },
    {
      name: "Items",
      description:
        "ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuLabel, ContextMenuGroup, ContextMenuSeparator, ContextMenuSub, ContextMenuSubTrigger and ContextMenuSubContent are the Dropdown Menu parts under new names, with the same props.",
      props: [
        { prop: "icon", type: "ReactNode", description: "Leading icon on items and sub triggers." },
        { prop: "shortcut", type: "ReactNode", description: "Right-aligned hint." },
        { prop: "variant", type: '"default" | "danger"', default: '"default"', description: "danger turns the item red." },
        { prop: "onSelect", type: "(event: Event) => void", description: "Called on select. The menu closes unless you call event.preventDefault()." },
      ],
    },
  ],
  notes: [
    "Opens at the pointer on right-click, after a 500ms long-press on touch (moving more than 10px cancels it), and from the keyboard with Shift+F10 or the ContextMenu key at the area's top-left corner.",
    "The browser's own context menu is suppressed inside the trigger and the menu. Set disabled to give it back.",
    "For Shift+F10 to reach the area, it or something inside it must be focusable: give the area tabIndex={0} or use focusable children.",
    "The keyboard model is the Dropdown Menu's: arrows, Home and End, typeahead, Enter or Space to select, ArrowRight and ArrowLeft for submenus, Escape and Tab to close.",
    "Focus returns to whatever had it before the menu opened. The menu has no trigger to name it, so pass aria-label to ContextMenuContent.",
  ],
};
