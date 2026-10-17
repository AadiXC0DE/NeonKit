import type { ComponentDoc } from "../types";
import NeonIconDemo from "../examples/neon-icon/demo";
import NeonIconLevels from "../examples/neon-icon/levels";
import NeonIconToolbar from "../examples/neon-icon/toolbar";
import NeonIconStatusBar from "../examples/neon-icon/status-bar";
import NeonIconBattery from "../examples/neon-icon/battery";
import NeonIconNotifications from "../examples/neon-icon/notifications";
import NeonIconSizes from "../examples/neon-icon/sizes";

export const doc: ComponentDoc = {
  usage: `import { NeonIcon } from "@/components/ui/neon-icon"
import { Mic } from "@/components/ui/icons"

<NeonIcon icon={Mic} value={live ? 1 : 0} />
<NeonIcon icon="signal" value={0.75} />
<NeonIcon icon="battery" value={0.4} animated />`,
  examples: [
    {
      name: "demo",
      title: "Studio panel",
      description:
        "Any icon from the set, lit. Each key strikes on with a flicker, its halo warming a beat after the tube, and goes back to unlit glass when switched off. Mic and Stream together light On air.",
      component: NeonIconDemo,
    },
    {
      name: "levels",
      title: "Levels",
      description:
        "The built-in status icons follow value. Drag the link slider: bars and arcs light one after another on the way up and go out from the top on the way down. The others run their idle loops.",
      component: NeonIconLevels,
    },
    {
      name: "toolbar",
      title: "Toolbar state",
      description: "Active marks and the current alignment are lit; the rest stay as glass. 18px icons with the set's 1.75 tube.",
      component: NeonIconToolbar,
    },
    {
      name: "status-bar",
      title: "Status bar",
      description: "Animated signal means searching. A battery at 20% or less turns red unless you pass a color.",
      component: NeonIconStatusBar,
    },
    {
      name: "battery",
      title: "Battery states",
      description: "Four cells. Charging keeps the charged cells lit and runs the rest in sequence.",
      component: NeonIconBattery,
    },
    {
      name: "notifications",
      title: "Notification bell",
      description: "The bell swings and its sound arcs flash while animated. Here it rings for one cycle per new notification.",
      component: NeonIconNotifications,
    },
    {
      name: "sizes",
      title: "Sizes and buttons",
      description: "sm, md and lg are 16, 20 and 24px, or pass any pixel size. Inside a Button use sm, the size Button gives its icons.",
      component: NeonIconSizes,
    },
  ],
  api: [
    {
      name: "NeonIcon",
      description: "Also accepts native span attributes.",
      props: [
        {
          prop: "icon",
          type: '"signal" | "wifi" | "battery" | "bolt" | "power" | "heart" | "bell" | Icon | ReactElement',
          description:
            "A built-in status icon, or any icon from @/components/ui/icons drawn as a lit tube. Pass the component (icon={Mic}) in client code, or the element (icon={<Mic />}) from a server component.",
        },
        {
          prop: "value",
          type: "number",
          default: "1",
          description: "0 to 1. Lights 4 signal bars, 3 Wi-Fi arcs or 4 battery cells; any value above 0 lights at least one. For bolt, power, heart, bell and icons from the set, above 0 is on and 0 is unlit glass.",
        },
        {
          prop: "animated",
          type: "boolean",
          default: "false",
          description: "The idle loop: signal and Wi-Fi search, battery charges, bolt surges, power breathes on standby, heart beats, bell rings. An icon from the set surges like a tired tube.",
        },
        {
          prop: "ignite",
          type: "boolean",
          default: "false",
          description: "Strike on with the power-on flicker when the icon mounts lit. Going from 0 to on always plays it.",
        },
        {
          prop: "strokeWidth",
          type: "number",
          default: "1.75",
          description: "Tube thickness for icons from the set, in 24px grid units.",
        },
        { prop: "size", type: '"sm" | "md" | "lg" | number', default: '"md"', description: "16, 20 or 24px, or any size in pixels. Strokes and glow scale with it." },
        { prop: "label", type: "string", default: "describes the state", description: 'Accessible name, e.g. "Signal: 3 of 4 bars", "Battery 64%, charging" or "Mic, off" by default.' },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Tube color. Falls back to --neon-accent, then cyan; a low battery falls back to red." },
      ],
    },
  ],
  notes: [
    "An icon from the set is layered four times: unlit glass, a wide soft halo, the tube, and a hot core that stays at least 0.6px wide. The halo is tight enough that the blockout gaps where one tube passes behind another stay dark.",
    "The icon is role=\"img\" with a label that describes its state, so a level change is never color or shape alone.",
    "Pass aria-hidden when a visible label or a button's name already says the same thing; the role and label are dropped.",
    "Every loop and the ignition flicker stop under reduced motion. The icon still shows its level, and a ringing bell keeps its sound arcs lit.",
  ],
};
