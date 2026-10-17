import type { ComponentDoc } from "../types";
import DeviceFrameDemo from "../examples/device-frame/demo";
import DeviceFramePhone from "../examples/device-frame/phone";
import DeviceFrameTabs from "../examples/device-frame/tabs";
import DeviceFrameTilt from "../examples/device-frame/tilt";

export const doc: ComponentDoc = {
  usage: `import { DeviceFrame } from "@/components/ui/device-frame"

<DeviceFrame url="relay.dev/acme/pipelines">
  <img src="/dashboard.png" alt="Pipelines dashboard" className="size-full object-cover" />
</DeviceFrame>`,
  examples: [
    {
      name: "demo",
      title: "Browser",
      description: "A live page, sized in cqw so it scales with the frame like a screenshot.",
      component: DeviceFrameDemo,
    },
    {
      name: "phone",
      title: "Phone",
      description: "Dynamic island, status bar, side buttons. The switch inside works.",
      component: DeviceFramePhone,
    },
    { name: "tabs", title: "Tabs and minimal controls", component: DeviceFrameTabs },
    {
      name: "tilt",
      title: "Tilted pair",
      description: "tilt turns each device in perspective; overlap them for a hero shot.",
      component: DeviceFrameTilt,
    },
  ],
  api: [
    {
      name: "DeviceFrame",
      description: "Children render inside the screen. Also accepts div attributes.",
      props: [
        { prop: "variant", type: '"browser" | "phone"', default: '"browser"', description: "A browser window or a phone." },
        { prop: "url", type: "string", description: "Browser: the address, without the scheme. The host is brighter than the path." },
        { prop: "tabs", type: "string[]", description: "Browser: tab titles. Adds a tab strip and a toolbar." },
        { prop: "activeTab", type: "number", default: "0", description: "Browser: the tab in front." },
        { prop: "controls", type: '"traffic" | "minimal"', default: '"traffic"', description: "Browser: colored window buttons, or grey ones." },
        { prop: "cutout", type: '"island" | "notch" | "none"', default: '"island"', description: "Phone: the cut-out at the top of the screen." },
        { prop: "time", type: "string", description: "Phone: shows a status bar with this time, e.g. \"9:41\"." },
        { prop: "tilt", type: "boolean | number", description: "Turn it in perspective. true is 10°; negative turns the other way." },
        { prop: "aspectRatio", type: "string", default: '"16 / 10" or "9 / 19.5"', description: "Aspect ratio of the screen." },
        { prop: "rim", type: "boolean", default: "true", description: "The hairline of --neon where the screen glass meets the frame." },
        { prop: "screenClassName", type: "string", description: "Class names for the screen." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color the rim reflects." },
      ],
    },
  ],
  notes: [
    "The frame is decoration: window buttons, tabs, the URL bar, the island and the side buttons are aria-hidden or plain text. Whatever you put on the screen keeps its own semantics, so give screenshots alt text.",
    "The screen is a size container. Size the content in cqw and it scales with the frame like a screenshot; size it in px and it reflows like a real viewport.",
    "The phone is sized in cqw of its own width, so one width class scales the bezel, island and buttons together.",
    "The rim is light caught on the glass edge, not a glow: a 1px tint of --neon with a brighter line along the top. Nothing spills outward.",
  ],
};
