import type { ComponentDoc } from "../types";
import NeonClockDemo from "../examples/neon-clock/demo";
import NeonClockWorldClocks from "../examples/neon-clock/world-clocks";
import NeonClockDigital from "../examples/neon-clock/digital";
import NeonClockBedside from "../examples/neon-clock/bedside";

export const doc: ComponentDoc = {
  usage: `import { NeonClock } from "@/components/ui/neon-clock"

<NeonClock timeZone="Asia/Tokyo" label="Tokyo" />`,
  examples: [
    {
      name: "demo",
      title: "Analog",
      description:
        "The hands hold the classic 10:10 pose as unlit glass, strike on, and sweep to the time. The seconds hand ticks with a quartz overshoot.",
      component: NeonClockDemo,
    },
    {
      name: "world-clocks",
      title: "World clocks",
      description: "Any IANA time zone. The label names each clock for screen readers too.",
      component: NeonClockWorldClocks,
    },
    {
      name: "digital",
      title: "Digital",
      description: "Neon numerals with a colon that blinks on the second. Looks best with a monoline face such as Tilt Neon.",
      component: NeonClockDigital,
    },
    {
      name: "bedside",
      title: "Without seconds",
      description: "showSeconds={false} with a fixed 24-hour cycle.",
      component: NeonClockBedside,
    },
  ],
  api: [
    {
      name: "NeonClock",
      description: "Renders a <div role=\"timer\">. Time is written straight to the DOM once a second, so React never re-renders for it.",
      props: [
        { prop: "variant", type: '"analog" | "digital"', default: '"analog"', description: "A dial with tube hands, or neon numerals." },
        { prop: "timeZone", type: "string", default: "viewer's", description: "IANA zone such as \"Europe/London\". Unknown zones fall back to the viewer's." },
        { prop: "showSeconds", type: "boolean", default: "true", description: "The seconds hand on the dial, or a seconds pair on the digital face." },
        { prop: "hourCycle", type: "12 | 24", default: "from locale", description: "Digital face only. 12 adds AM/PM and drops the leading zero." },
        { prop: "label", type: "ReactNode", description: "Caption under the clock. Also its accessible name." },
        {
          prop: "size",
          type: '"sm" | "md" | "lg"',
          default: '"md"',
          description: "Dial diameter 128, 184 or 260px (the --clock-size variable); numerals 32, 52 or 80px (the font size). Responsive classes like lg:[--clock-size:260px] or lg:text-[80px] override it.",
        },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "It's role=\"timer\", named by label, with visually hidden text holding the current time. Timers aren't live regions, so nothing is announced every second.",
    "Nothing time-based renders on the server: hands hold a pose and digits show dashes until the first tick, so hydration always matches.",
    "The digital face uses your font. It looks best with a monoline face such as Tilt Neon; pass it through className or style.",
    "With reduced motion the hands jump to the time without sweeping, the seconds hand ticks without bouncing, and the colon stays lit.",
  ],
};
