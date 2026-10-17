import type { ComponentDoc } from "../types";
import AvatarDemo from "../examples/avatar/demo";
import AvatarGroupExample from "../examples/avatar/group";
import AvatarSizes from "../examples/avatar/sizes";
import AvatarRing from "../examples/avatar/ring";

export const doc: ComponentDoc = {
  usage: `import { Avatar } from "@/components/ui/avatar"

<Avatar src="/maya.jpg" alt="Maya Okafor" status="online" />`,
  examples: [
    {
      name: "demo",
      title: "Team with status",
      description: "Initials show until the image loads, and stay if it fails or there is no src.",
      component: AvatarDemo,
    },
    {
      name: "group",
      title: "Group",
      description: "AvatarGroup overlaps its children and folds the rest into a +N chip.",
      component: AvatarGroupExample,
    },
    {
      name: "sizes",
      title: "Sizes and shapes",
      description: "Square suits workspaces and organisations.",
      component: AvatarSizes,
    },
    {
      name: "ring",
      title: "Ring and color",
      description: "ring marks the active person. color tints the initials and the ring.",
      component: AvatarRing,
    },
  ],
  api: [
    {
      name: "Avatar",
      description: "Renders a span and accepts every native span attribute.",
      props: [
        { prop: "alt", type: "string", description: "The person's name. Read by screen readers and used for the initials. Pass \"\" when decorative." },
        { prop: "src", type: "string", description: "Image URL. Fades in once loaded." },
        { prop: "fallback", type: "ReactNode", description: "Replaces the initials, for example with an icon." },
        { prop: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"md"', description: "28, 36, 48 or 64px." },
        { prop: "shape", type: '"circle" | "square"', default: '"circle"', description: "Outline shape." },
        { prop: "status", type: '"online" | "away" | "busy" | "offline"', description: "Status light in the bottom-right corner." },
        { prop: "ring", type: "boolean", default: "false", description: "Neon ring with a glow, set off by a thin dark gap." },
        { prop: "decorative", type: "boolean", default: "false", description: "Hidden from screen readers; alt still sets the initials. Use it when the name is printed beside the avatar." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "AvatarGroup",
      description: "Renders a div. Size and shape apply to every Avatar inside.",
      props: [
        { prop: "max", type: "number", description: "Avatars past this count collapse into a +N chip." },
        { prop: "size", type: '"sm" | "md" | "lg" | "xl"', default: '"md"', description: "Size of every avatar and the chip." },
        { prop: "shape", type: '"circle" | "square"', default: '"circle"', description: "Shape of every avatar and the chip." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color for every avatar in the group." },
      ],
    },
  ],
  notes: [
    "Each avatar is a single image to assistive tech, named by alt, with the status appended, e.g. \"Maya Okafor (online)\". Next to a visible name, pass decorative so the name isn't read twice.",
    "The +N chip is announced as \"N more\".",
    "The status light is cut out with #05060a; change it with className if your surface is a different color.",
  ],
};
