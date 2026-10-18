import type { ComponentDoc } from "../types";
import CountdownDemo from "../examples/countdown/demo";
import CountdownDigital from "../examples/countdown/digital";
import CountdownSign from "../examples/countdown/sign";
import CountdownOnComplete from "../examples/countdown/on-complete";

export const doc: ComponentDoc = {
  usage: `import { Countdown } from "@/components/ui/countdown"

<Countdown to="2026-12-31T23:59:59Z" onComplete={() => setLaunched(true)} />`,
  examples: [
    {
      name: "demo",
      title: "Launch countdown",
      description: "Split-flap cards. Each changing digit drops one flap and lands with a small bounce.",
      component: CountdownDemo,
    },
    {
      name: "digital",
      title: "Digital",
      description: "Seven-segment digits with unlit segments showing. Without days in units, hours carry the overflow.",
      component: CountdownDigital,
    },
    {
      name: "sign",
      title: "Neon sign",
      description: "Bent-tube numerals. They sit as unlit glass until the first tick, then light up.",
      component: CountdownSign,
    },
    {
      name: "on-complete",
      title: "On complete",
      description: "onComplete fires once when the timer hits zero. Change the key to start a fresh run.",
      component: CountdownOnComplete,
    },
  ],
  api: [
    {
      name: "Countdown",
      description: "Renders a <div role=\"timer\">. Digits appear after mount, so server and browser HTML match.",
      props: [
        { prop: "to", type: "Date | string | number", description: "The moment it reaches zero: a Date, an ISO string or epoch milliseconds." },
        { prop: "variant", type: '"flip" | "digital" | "sign"', default: '"flip"', description: "Split-flap cards, seven-segment digits, or neon tube numerals." },
        {
          prop: "units",
          type: '("days" | "hours" | "minutes" | "seconds")[]',
          default: "all four",
          description: "Which units to show. The largest one absorbs the rest, so without days 50 hours stays 50.",
        },
        {
          prop: "labels",
          type: "boolean | Partial<Record<Unit, string>>",
          default: "true",
          description: "Captions under each unit. false hides them; an object renames them, which also changes what screen readers hear.",
        },
        { prop: "onComplete", type: "() => void", description: "Called once at zero, or straight after mount if `to` has already passed." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Digit height: 40, 56 or 80px. Override with a [--countdown-h:72px] class for responsive sizes." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "role=\"timer\" isn't a live region, so screen readers aren't interrupted every second. Visually hidden text such as \"2 days, 14 hours, 7 minutes, 33 seconds\" is there when they read it.",
    "Give the timer an accessible name with aria-label, e.g. \"Time until the launch window opens\".",
    "The timer wakes just after each whole second and recomputes from the clock, so it never drifts or skips.",
    "With reduced motion, flips and tube strikes are skipped and digits change in place.",
  ],
};
