import type { ComponentDoc } from "../types";
import ButtonGroupDemo from "../examples/button-group/demo";
import ButtonGroupWithInput from "../examples/button-group/with-input";
import ButtonGroupToolbar from "../examples/button-group/toolbar";
import ButtonGroupVertical from "../examples/button-group/vertical";
import ButtonGroupSizes from "../examples/button-group/sizes";

export const doc: ComponentDoc = {
  usage: `import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"

<ButtonGroup aria-label="Promote">
  <Button variant="solid">Promote</Button>
  <ButtonGroupSeparator />
  <Button variant="solid" size="icon" aria-label="More options">
    <ChevronDown />
  </Button>
</ButtonGroup>`,
  examples: [
    {
      name: "demo",
      title: "Pager and split button",
      description: "A counter between two buttons, and a solid split button with a menu behind its seam.",
      component: ButtonGroupDemo,
    },
    {
      name: "with-input",
      title: "With an input",
      description: "Input sits in the group like any segment. Its focus glow is lifted over the neighbouring borders.",
      component: ButtonGroupWithInput,
    },
    {
      name: "toolbar",
      title: "Toolbar",
      description: "Groups inside a group stay attached and the outer one spaces them apart.",
      component: ButtonGroupToolbar,
    },
    {
      name: "vertical",
      title: "Vertical",
      description: "orientation=\"vertical\" stacks the segments and squares the inner corners top and bottom.",
      component: ButtonGroupVertical,
    },
    {
      name: "sizes",
      title: "Sizes",
      description: "Size each segment as usual; the group only handles seams and corners, so any size attaches cleanly.",
      component: ButtonGroupSizes,
    },
  ],
  api: [
    {
      name: "ButtonGroup",
      description: "Renders a div with role=\"group\". Give it an aria-label when the buttons need context.",
      props: [
        { prop: "orientation", type: '"horizontal" | "vertical"', default: '"horizontal"', description: "Direction of the row." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Sets --neon for everything inside." },
      ],
    },
    {
      name: "ButtonGroupText",
      description: "A static segment, for a prefix like \"https://\" or a counter. Accepts native div attributes.",
      props: [{ prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Height and padding, matching Button." }],
    },
    {
      name: "ButtonGroupSeparator",
      description: "A one-pixel seam between two segments, for solid buttons whose borders don't show.",
      props: [
        { prop: "orientation", type: '"horizontal" | "vertical"', default: "across the group", description: "The rule's direction." },
      ],
    },
  ],
  notes: [
    "Neighbours overlap by a pixel, so every seam is a single line.",
    "The hovered, open or focused segment is raised above the others, so its border and focus ring are never covered.",
    "Seams and corners are pure CSS on the group's direct children, so it never inspects or clones them; children passed from a Server Component work the same.",
    "Input and Textarea draw their corners on an inner field box, and the group squares that box too.",
    "Arrow keys aren't added: it's a group of separate buttons. Use Toggle Group for one-of-many choices.",
  ],
};
