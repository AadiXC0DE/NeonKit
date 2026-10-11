import type { ComponentDoc } from "../types";
import KbdDemo from "../examples/kbd/demo";
import KbdShortcuts from "../examples/kbd/shortcuts";
import KbdListen from "../examples/kbd/listen";
import KbdSizes from "../examples/kbd/sizes";

export const doc: ComponentDoc = {
  usage: `import { Kbd, KbdCombo } from "@/components/ui/kbd"

<KbdCombo keys={["⌘", "K"]} listen />
<Kbd listen="Shift">Shift</Kbd>`,
  examples: [
    {
      name: "demo",
      title: "Command menu hint",
      description: "With listen, each key lights up while you hold the real one.",
      component: KbdDemo,
    },
    {
      name: "shortcuts",
      title: "Shortcut sheet",
      description: "separator accepts any node, or null for keys side by side.",
      component: KbdShortcuts,
    },
    {
      name: "listen",
      title: "Listening keys",
      description: "listen takes a KeyboardEvent.key value and matches it case-insensitively.",
      component: KbdListen,
    },
    {
      name: "sizes",
      title: "Sizes and pressed state",
      description: "pressed forces the lit state, for tutorials and game controls.",
      component: KbdSizes,
    },
  ],
  api: [
    {
      name: "Kbd",
      description: "Renders a kbd element and accepts every native attribute.",
      props: [
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "20, 24 or 32px tall." },
        { prop: "pressed", type: "boolean", default: "false", description: "Forces the lit, pushed-down state." },
        { prop: "listen", type: "string", description: "KeyboardEvent.key to watch, like \"k\", \"Shift\", \"Meta\" or \"Enter\". Lights up while held." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "KbdCombo",
      description: "A kbd that wraps one Kbd per key, as HTML recommends for key combinations.",
      props: [
        { prop: "keys", type: "string[]", description: "Key labels in order. ⌘ ⌥ ⇧ ⌃ ↵ and arrows get spoken names." },
        { prop: "listen", type: "boolean", default: "false", description: "Each key listens for itself. ⌘ maps to Meta, ⌥ to Alt, ⇧ to Shift, ⌃ to Control, ↵ to Enter, Esc to Escape." },
        { prop: "separator", type: "ReactNode", default: '"+"', description: "Rendered between keys. Pass null for none." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Size of every key." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of every key." },
      ],
    },
  ],
  notes: [
    "Kbd is display only. listen never prevents default or triggers anything, so wire the real shortcut yourself.",
    "Symbol keys in KbdCombo carry a screen reader label, so ⌘ is read as \"Command\".",
    "Held keys clear when the window loses focus, and releasing ⌘ clears the rest because macOS drops their keyup events.",
  ],
};
