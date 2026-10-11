import type { ComponentDoc } from "../types";
import CardDemo from "../examples/card/demo";
import CardPricing from "../examples/card/pricing";
import CardInteractive from "../examples/card/interactive";
import CardVariants from "../examples/card/variants";

export const doc: ComponentDoc = {
  usage: `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Usage this month</CardTitle>
    <CardDescription>Pro plan · resets in 20 days</CardDescription>
  </CardHeader>
  <CardContent>…</CardContent>
</Card>`,
  examples: [
    {
      name: "demo",
      title: "Usage",
      description: "A 1px lit edge runs along the top, brightest in the middle.",
      component: CardDemo,
    },
    {
      name: "pricing",
      title: "Pricing",
      description: "glow adds a neon border and ambient light. Use it on one card per view.",
      component: CardPricing,
    },
    {
      name: "interactive",
      title: "Link cards",
      description: "interactive lifts the card on hover. A stretched link makes the whole surface clickable.",
      component: CardInteractive,
    },
    { name: "variants", title: "Variants", component: CardVariants },
  ],
  api: [
    {
      name: "Card",
      description: "Renders a div and accepts every native div attribute.",
      props: [
        { prop: "variant", type: '"default" | "glow" | "outline"', default: '"default"', description: "Surface style." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
        { prop: "interactive", type: "boolean", default: "false", description: "Hover lift, brighter edge and a focus ring when something inside is keyboard-focused." },
      ],
    },
    {
      name: "CardHeader, CardContent, CardFooter",
      description: "Divs with matching 24px padding. Content and footer drop their top padding so the slots stack evenly.",
      props: [
        { prop: "className", type: "string", description: "Merged with the defaults, so p-4 or gap-3 override cleanly." },
      ],
    },
    {
      name: "CardTitle, CardDescription",
      description: "An h3 and a p. Swap the heading level with your own element if the outline needs it.",
      props: [
        { prop: "className", type: "string", description: "Merged with the defaults." },
      ],
    },
  ],
  notes: [
    "Card has no role or tab stop of its own; put the link or button inside it.",
    "For a clickable card, stretch one link over the surface with after:absolute after:inset-0 instead of wrapping the card in an anchor.",
    "The hover lift is disabled when the user prefers reduced motion.",
  ],
};
