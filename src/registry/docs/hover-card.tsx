import type { ComponentDoc } from "../types";
import HoverCardDemo from "../examples/hover-card/demo";
import HoverCardRepository from "../examples/hover-card/repository";
import HoverCardTeam from "../examples/hover-card/team";

export const doc: ComponentDoc = {
  usage: `import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"

<HoverCard>
  <HoverCardTrigger href="/people/mara">@mara</HoverCardTrigger>
  <HoverCardContent>
    Mara Okafor · Design engineer, Lisbon
  </HoverCardContent>
</HoverCard>`,
  examples: [
    {
      name: "demo",
      title: "Profile preview",
      description: "The card's border catches light from the side that faces the trigger.",
      component: HoverCardDemo,
    },
    {
      name: "repository",
      title: "Link preview",
      description: "side=\"top\" and a shorter openDelay for inline links in running text.",
      component: HoverCardRepository,
    },
    {
      name: "team",
      title: "Side and align",
      description: "Cards to the right of a list, aligned to the top of each name. The light follows the side.",
      component: HoverCardTeam,
    },
  ],
  api: [
    {
      name: "HoverCard",
      description: "Holds the open state and the timers. Renders no element of its own.",
      props: [
        { prop: "openDelay", type: "number", default: "500", description: "Milliseconds the pointer rests on the trigger, or keyboard focus stays, before the card opens." },
        { prop: "closeDelay", type: "number", default: "200", description: "Milliseconds before closing after the pointer leaves, enough to cross onto the card." },
        { prop: "open", type: "boolean", description: "Controlled open state." },
        { prop: "defaultOpen", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        { prop: "onOpenChange", type: "(open: boolean) => void", description: "Called when hover, focus, Escape or an outside click changes the state." },
      ],
    },
    {
      name: "HoverCardTrigger",
      description: "Renders a link. Also accepts every native anchor attribute.",
      props: [
        { prop: "asChild", type: "boolean", default: "false", description: "Merges hover behaviour onto its single child, e.g. your router's Link." },
      ],
    },
    {
      name: "HoverCardContent",
      description: "The card, portaled and positioned with floating-ui. Accepts native div attributes; it's w-72 with p-4 until you override them.",
      props: [
        { prop: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "Preferred side. Flips when there's no room." },
        { prop: "align", type: '"start" | "center" | "end"', default: '"center"', description: "Alignment along that side." },
        { prop: "sideOffset", type: "number", default: "8", description: "Gap from the trigger in px." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Without it the card takes the trigger's color, then --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "Opens on mouse hover and on keyboard focus of the trigger. Touch is ignored, so a tap just follows the link.",
    "The card stays open while the pointer is over it, and while the trigger keeps keyboard focus.",
    "While open, the trigger's aria-describedby points at the card, so screen readers announce its text as a description.",
    "Escape closes it without moving focus.",
    "Content inside the card isn't in the tab order after the trigger. Keep anything essential reachable elsewhere, as you would for a tooltip.",
  ],
};
