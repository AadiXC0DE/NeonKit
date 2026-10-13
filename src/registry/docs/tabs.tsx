import type { ComponentDoc } from "../types";
import TabsDemo from "../examples/tabs/demo";
import TabsInstall from "../examples/tabs/install";
import TabsColors from "../examples/tabs/colors";
import TabsManual from "../examples/tabs/manual";
import TabsVertical from "../examples/tabs/vertical";

export const doc: ComponentDoc = {
  usage: `import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
  </TabsList>
  <TabsContent value="account">…</TabsContent>
  <TabsContent value="password">…</TabsContent>
</Tabs>`,
  examples: [
    {
      name: "demo",
      title: "Settings",
      description: "The lit pill slides to the selected tab.",
      component: TabsDemo,
    },
    {
      name: "install",
      title: "Underline",
      description: "variant=\"underline\" draws a glowing line on a hairline track. Good for code.",
      component: TabsInstall,
    },
    {
      name: "colors",
      title: "Colors",
      description: "Every Tabs gets its own indicator, so several can sit side by side.",
      component: TabsColors,
    },
    {
      name: "vertical",
      title: "Vertical",
      description: "orientation=\"vertical\" stacks the list beside the panels. Up and Down move between tabs.",
      component: TabsVertical,
    },
    {
      name: "manual",
      title: "Manual activation",
      description: "Arrow keys move focus; Enter or Space selects. Disabled tabs are skipped.",
      component: TabsManual,
    },
  ],
  api: [
    {
      name: "Tabs",
      description: "Renders a div and accepts every native div attribute.",
      props: [
        { prop: "defaultValue", type: "string", description: "Initially selected tab when uncontrolled." },
        { prop: "value", type: "string", description: "Selected tab when controlled." },
        { prop: "onValueChange", type: "(value: string) => void", description: "Called when the selection changes." },
        { prop: "variant", type: '"pill" | "underline"', default: '"pill"', description: "Indicator style." },
        { prop: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Direction of the list. Vertical puts it beside the panels and switches the arrow keys to Up and Down." },
        { prop: "activationMode", type: '"automatic" | "manual"', default: '"automatic"', description: "Select on focus, or wait for Enter and Space." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "TabsTrigger",
      description: "Renders a button.",
      props: [
        { prop: "value", type: "string", description: "Matches a TabsContent value." },
        { prop: "disabled", type: "boolean", default: "false", description: "Skipped by the keyboard and not clickable." },
      ],
    },
    {
      name: "TabsContent",
      description: "Renders a div that fades in when selected.",
      props: [
        { prop: "value", type: "string", description: "Matches a TabsTrigger value." },
        { prop: "forceMount", type: "boolean", default: "false", description: "Keeps the panel mounted but hidden while inactive, so its state survives." },
      ],
    },
  ],
  notes: [
    "Follows the WAI-ARIA tabs pattern: tablist, tab and tabpanel roles, with aria-selected and aria-controls wired up.",
    "Only the selected tab is in the Tab order. Left and Right arrows (Up and Down when vertical) move between tabs, Home and End jump to the ends.",
    "Panels are focusable so keyboard users can reach content without interactive elements.",
    "The indicator jumps instead of sliding when the user prefers reduced motion.",
  ],
};
