import type { ComponentDoc } from "../types";
import EmptyDemo from "../examples/empty/demo";
import EmptyPermission from "../examples/empty/permission";
import EmptySearch from "../examples/empty/search";
import EmptyPanel from "../examples/empty/panel";

export const doc: ComponentDoc = {
  usage: `import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

<Empty>
  <EmptyMedia variant="tube">
    <Rocket />
  </EmptyMedia>
  <EmptyTitle>No deployments yet</EmptyTitle>
  <EmptyDescription>Push to main and it builds on its own.</EmptyDescription>
  <EmptyContent>
    <Button variant="solid">Deploy main</Button>
  </EmptyContent>
</Empty>`,
  examples: [
    {
      name: "demo",
      title: "Tube media",
      description: "The icon is drawn as an unlit glass tube. There's something to press, so it flickers on.",
      component: EmptyDemo,
    },
    {
      name: "permission",
      title: "Lit by the action",
      description: "As a viewer there's nothing to do and the tube stays dark. Switch to admin: the button appears and the tube ignites.",
      component: EmptyPermission,
    },
    { name: "search", title: "No results", description: "The icon tile, for empty states that don't need light.", component: EmptySearch },
    { name: "panel", title: "Aligned to the start", description: "align=\"start\" for panels and side columns, where a centred block floats.", component: EmptyPanel },
  ],
  api: [
    {
      name: "Empty",
      description: "The block. Renders a div and accepts every native div attribute.",
      props: [
        { prop: "align", type: '"center" | "start"', default: '"center"', description: "Centred, or flush left." },
        { prop: "size", type: '"sm" | "md"', default: '"md"', description: "Vertical padding: 32 or 56px." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the lit tube." },
      ],
    },
    {
      name: "EmptyMedia",
      description: "Holds an icon or illustration. Decorative, so it's hidden from screen readers.",
      props: [
        { prop: "variant", type: '"default" | "icon" | "tube"', default: '"default"', description: "Bare, an icon on a quiet tile, or the icon as a neon tube." },
        { prop: "lit", type: "boolean", description: "Tube only: force it on, or keep it dark, instead of following EmptyContent." },
      ],
    },
    {
      name: "EmptyTitle, EmptyDescription, EmptyContent",
      description: "Text and actions. Each accepts native attributes.",
      props: [
        { prop: "EmptyTitle", type: "h3", description: "An h3, to sit under a page or panel h2." },
        { prop: "EmptyDescription", type: "p", description: "Capped at 42 characters a line, balanced." },
        { prop: "EmptyContent", type: "div", description: "Actions. An enabled button or link in here is what lights the tube." },
      ],
    },
  ],
  notes: [
    "The tube follows EmptyContent through CSS :has(), so an action that appears later still lights it, with no JavaScript.",
    "Hovering or focusing the action turns the tube's halo up.",
    "With reduced motion the tube switches on without the flicker.",
  ],
};
