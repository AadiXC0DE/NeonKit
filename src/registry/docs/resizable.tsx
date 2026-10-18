import type { ComponentDoc } from "../types";
import ResizableDemo from "../examples/resizable/demo";
import ResizableRail from "../examples/resizable/rail";
import ResizableControlled from "../examples/resizable/controlled";

export const doc: ComponentDoc = {
  usage: `import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

<ResizablePanelGroup direction="horizontal" autoSaveId="editor">
  <ResizablePanel defaultSize={25} minSize={15} collapsible>Files</ResizablePanel>
  <ResizableHandle />
  <ResizablePanel defaultSize={75}>Editor</ResizablePanel>
</ResizablePanelGroup>`,
  examples: [
    {
      name: "demo",
      title: "Editor layout",
      description:
        "A file list beside a nested vertical group. Drag a grip, or drag a panel past half its minimum to fold it. The layout is saved.",
      component: ResizableDemo,
    },
    {
      name: "rail",
      title: "Collapse to a rail",
      description: "collapsedSize leaves the folder pane as an icon rail rather than hiding it.",
      component: ResizableRail,
    },
    {
      name: "controlled",
      title: "Imperative and onLayout",
      description: "A button folds the outline through apiRef; onLayout reports every size.",
      component: ResizableControlled,
    },
  ],
  api: [
    {
      name: "ResizablePanelGroup",
      description: "A flex container. Panels and handles must be its direct children. Accepts every native div attribute.",
      props: [
        { prop: "direction", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Which way the panels sit." },
        { prop: "onLayout", type: "(sizes: number[]) => void", description: "Every panel's size in percent, after each change." },
        { prop: "autoSaveId", type: "string", description: "Saves the layout in localStorage and restores it on the next visit. Blocked or full storage is ignored." },
        { prop: "keyboardStep", type: "number", default: "5", description: "Percent per arrow key. Shift moves 1%." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex for the handles. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "ResizablePanel",
      description: "Accepts every native div attribute. Sizes are percentages of the group.",
      props: [
        { prop: "defaultSize", type: "number", description: "Starting size. Panels without one share what's left. Set it on every panel to avoid a jump after hydration." },
        { prop: "minSize", type: "number", default: "0", description: "Smallest size while open." },
        { prop: "maxSize", type: "number", default: "100", description: "Largest size." },
        { prop: "collapsible", type: "boolean", default: "false", description: "Can fold to collapsedSize: drag past half the minimum, double-click the handle or press Enter on it." },
        { prop: "collapsedSize", type: "number", default: "0", description: "Size when collapsed, e.g. room for an icon rail." },
        { prop: "onResize", type: "(size: number) => void", description: "Called when this panel's size changes." },
        { prop: "onCollapse / onExpand", type: "() => void", description: "Called when the panel folds or opens." },
        { prop: "apiRef", type: "Ref<ResizablePanelApi>", description: "collapse(), expand(), resize(size), getSize() and isCollapsed()." },
      ],
    },
    {
      name: "ResizableHandle",
      description: "A focusable separator. Give it an aria-label that names what it resizes.",
      props: [
        { prop: "withHandle", type: "boolean", default: "true", description: "Shows the grip. Without it the handle is a hairline that lights up." },
        { prop: "disabled", type: "boolean", default: "false", description: "Can't be dragged or focused." },
      ],
    },
  ],
  notes: [
    "Handles follow the APG window splitter: role separator, aria-valuenow is the size of the panel before it, and aria-controls points at that panel.",
    "Arrow keys resize along the group's direction, Shift for 1%. Home and End go to the minimum and maximum.",
    "Enter folds the panel before the handle, or the one after it if only that one is collapsible, and Enter again restores its last size.",
    "A shrinking panel that reaches its minimum passes the rest of the drag to the next one along.",
    "The grip lights as a tube while hovered, focused or dragged; at rest it's an unlit glass capsule.",
    "Folding with the keyboard or a double-click animates; dragging never does, and reduced motion turns the animation off.",
  ],
};
