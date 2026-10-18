import type { ComponentDoc } from "../types";
import DrawerDemo from "../examples/drawer/demo";
import DrawerShare from "../examples/drawer/share";
import DrawerNested from "../examples/drawer/nested";
import DrawerScaled from "../examples/drawer/scaled";

export const doc: ComponentDoc = {
  usage: `import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"

<Drawer snapPoints={[0.4, 0.85]}>
  <DrawerTrigger asChild>
    <Button>Find a charger</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Chargers near you</DrawerTitle>
      <DrawerDescription>7 stations within 6 km.</DrawerDescription>
    </DrawerHeader>
  </DrawerContent>
</Drawer>`,
  examples: [
    {
      name: "demo",
      title: "Snap points",
      description:
        "Rests at 40% and 85% of the screen. Drag it, flick it, or press the handle to step between stops; the handle flashes each time it clicks into one.",
      component: DrawerDemo,
    },
    {
      name: "share",
      title: "Content height",
      description: "Without snapPoints the drawer is as tall as its content. Drag down past a third of it, or flick, to dismiss.",
      component: DrawerShare,
    },
    {
      name: "nested",
      title: "Nested",
      description: "A drawer opened from a drawer pushes its parent back into a card that always peeks above it.",
      component: DrawerNested,
    },
    {
      name: "scaled",
      title: "Scaled background",
      description: "scaleBackground shrinks the element marked data-drawer-wrapper into a card. Put the attribute on your app's root.",
      component: DrawerScaled,
    },
  ],
  api: [
    {
      name: "Drawer",
      description: "Holds the open state and the active snap point. Renders no element of its own.",
      props: [
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called by the trigger, DrawerClose, Escape, the overlay and a dismissing drag." },
        { prop: "snapPoints", type: "(number | `${number}px`)[]", description: "Heights to rest at, lowest first: a fraction of the viewport (0.4) or pixels (\"320px\")." },
        { prop: "activeSnapPoint", type: "SnapPoint | null", description: "Controlled snap point. Changing it glides the drawer there." },
        { prop: "onActiveSnapPointChange", type: "(point: SnapPoint) => void", description: "Called when a drag, flick or the handle settles on a new stop." },
        { prop: "dismissible", type: "boolean", default: "true", description: "When false, drags, Escape and the overlay can't close it." },
        { prop: "scaleBackground", type: "boolean", default: "false", description: "Shrinks [data-drawer-wrapper] behind the drawer. Nested drawers leave it to the outermost one." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "DrawerContent",
      description: "The overlay and bottom panel in a native modal <dialog>. Other props go to the panel.",
      props: [
        { prop: "showHandle", type: "boolean", default: "true", description: "The grab handle. With snapPoints it's also a button: Enter steps through the stops, ArrowUp and ArrowDown move one." },
        { prop: "bodyClassName", type: "string", description: "Classes for the scrolling body that holds the children." },
        { prop: "className", type: "string", description: "Classes for the panel. It's full width up to 672px; pass sm:max-w-md and so on to narrow it." },
      ],
    },
    {
      name: "DrawerTrigger, DrawerClose",
      description: "Buttons that open and close the drawer. Both accept native button attributes.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Merges the behaviour onto the single child element instead of rendering a button." },
      ],
    },
    {
      name: "DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter",
      description: "Layout and text parts. Each accepts the native attributes of its element.",
      props: [
        { prop: "DrawerTitle", type: "h2", description: "Names the drawer through aria-labelledby." },
        { prop: "DrawerDescription", type: "p", description: "Describes it through aria-describedby, only while it's rendered." },
        { prop: "DrawerFooter", type: "div", description: "Stacked actions, pushed to the bottom of the panel." },
      ],
    },
  ],
  notes: [
    "Drag from anywhere on the panel except inputs and [data-drawer-no-drag]. A drag never fires the click it started on.",
    "Fully open with scrollable content, the content scrolls; pull down from its top to drag the drawer instead.",
    "Flicks carry their speed: a quick one moves at least one stop, a hard one downward dismisses.",
    "Focus lands on the panel rather than the first input, so phones don't raise the keyboard on open, and returns to the trigger on close.",
    "Escape closes only the topmost drawer. With reduced motion the drawer appears at its stop without sliding.",
  ],
};
