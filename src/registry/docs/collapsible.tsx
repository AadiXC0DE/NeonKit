import type { ComponentDoc } from "../types";
import CollapsibleDemo from "../examples/collapsible/demo";
import CollapsibleShowMore from "../examples/collapsible/show-more";
import CollapsibleAdvancedOptions from "../examples/collapsible/advanced-options";

export const doc: ComponentDoc = {
  usage: `import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

<Collapsible>
  <CollapsibleTrigger>Build steps</CollapsibleTrigger>
  <CollapsibleContent>…</CollapsibleContent>
</Collapsible>`,
  examples: [
    {
      name: "demo",
      title: "Build steps",
      description: "As the content opens, a line of light draws down its edge and cools off.",
      component: CollapsibleDemo,
    },
    {
      name: "show-more",
      title: "Show more",
      description: "Controlled, so the trigger's label can follow the state. The trigger can sit after the content.",
      component: CollapsibleShowMore,
    },
    {
      name: "advanced-options",
      title: "Advanced options",
      description: "forceMount keeps the fields mounted while closed, so edits survive and still submit with the form.",
      component: CollapsibleAdvancedOptions,
    },
  ],
  api: [
    {
      name: "Collapsible",
      description: "Holds the open state. Renders a div and accepts its native attributes.",
      props: [
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called when the trigger asks to toggle." },
        { prop: "disabled", type: "boolean", default: "false", description: "Blocks toggling from the trigger." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "CollapsibleTrigger",
      description: "Renders a button with a chevron that turns and lights up while open. Also accepts every native button attribute.",
      props: [
        {
          prop: "asChild",
          type: "boolean",
          default: "false",
          description: "Merges trigger behaviour and ARIA onto its single child element instead. No chevron is added.",
        },
      ],
    },
    {
      name: "CollapsibleContent",
      description: "The part that opens and closes, with a height animation. Accepts native div attributes.",
      props: [
        {
          prop: "forceMount",
          type: "boolean",
          default: "false",
          description: "Keep the content in the DOM while closed, hidden once the collapse finishes.",
        },
      ],
    },
  ],
  notes: [
    "The trigger is a button with aria-expanded, and aria-controls pointing at the content while it's open.",
    "Closed content is unmounted (or hidden with forceMount), so its links and fields leave the tab order.",
    "Overflow is clipped only during the animation, so focus rings and shadows inside aren't cut off once it's open.",
    "With reduced motion it opens and closes instantly, and the edge light is skipped.",
  ],
};
