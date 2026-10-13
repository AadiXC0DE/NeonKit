import type { ComponentDoc } from "../types";
import StatDemo from "../examples/stat/demo";
import StatLive from "../examples/stat/live";
import StatInverted from "../examples/stat/inverted";
import StatLoading from "../examples/stat/loading";

export const doc: ComponentDoc = {
  usage: `import { Stat, StatGroup } from "@/components/ui/stat"

<StatGroup>
  <Stat label="p95 latency" value={182} unit="ms" delta={-12.4} positive="down" trend={latency} />
  <Stat label="Active workspaces" value={1284} delta={3.1} />
</StatGroup>`,
  examples: [
    {
      name: "demo",
      title: "KPI row",
      description: "Four stats with sparklines. Values count up on mount; latency and churn are judged going down.",
      component: StatDemo,
    },
    {
      name: "live",
      title: "Live",
      description: "A heartbeat dot by the label, a pinging sparkline end, and a brief flash on each update.",
      component: StatLive,
    },
    {
      name: "inverted",
      title: "When down is good",
      description: "positive=\"down\" turns a falling error rate green and a rising bill red. Neutral metrics stay grey.",
      component: StatInverted,
    },
    {
      name: "loading",
      title: "Loading",
      description: "Skeletons hold the value, delta and sparkline in place, so nothing jumps when data lands.",
      component: StatLoading,
    },
  ],
  api: [
    {
      name: "Stat",
      description: "Renders a div with role=\"group\", named by its label. Accepts every native div attribute.",
      props: [
        { prop: "label", type: "ReactNode", description: "What the number is. Sentence case, no colon." },
        { prop: "value", type: "number | string", description: "A number counts up and is formatted; a string is shown as is." },
        { prop: "format", type: "(value: number) => string", description: "Formats the value, including every frame of the count-up." },
        { prop: "formatOptions", type: "Intl.NumberFormatOptions", description: "Options for the default formatter, e.g. currency. Decimals follow the value otherwise." },
        { prop: "locale", type: "string", default: '"en-US"', description: "Locale for the default formatter. Fixed by default so server and client agree." },
        { prop: "unit", type: "ReactNode", description: "Smaller text after the value, such as ms or %." },
        { prop: "delta", type: "number", description: "Change since the comparison period. Its sign sets the arrow." },
        { prop: "formatDelta", type: "(delta: number) => ReactNode", default: "12.4%", description: "Formats the delta's absolute value. The arrow carries the sign." },
        { prop: "positive", type: '"up" | "down" | "neutral"', default: '"up"', description: "Which direction is good. Sets green or red; neutral stays grey." },
        { prop: "trend", type: "number[]", description: "Draws a Sparkline beside the value." },
        { prop: "helper", type: "ReactNode", description: "A line under the value, usually the comparison period." },
        { prop: "countUp", type: "boolean", default: "true", description: "Counts up on mount and eases between later values. Skipped under reduced motion." },
        { prop: "live", type: "boolean", default: "false", description: "Heartbeat dot, pinging sparkline end and a flash on every update." },
        { prop: "loading", type: "boolean", default: "false", description: "Skeletons in place of the value, delta and sparkline. Sets aria-busy." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Value set at 24, 32 or 44px." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex for the sparkline and live dot. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "StatGroup",
      description: "A grid of stats split by hairlines. Accepts every native div attribute.",
      props: [
        { prop: "columns", type: "1 | 2 | 3 | 4 | 5 | 6", default: "count, up to 4", description: "Columns at full width. It steps down to two, then one on narrow screens." },
        { prop: "variant", type: '"plain" | "framed"', default: '"plain"', description: "Hairlines only, or with an outer border and surface." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color for every stat inside." },
      ],
    },
  ],
  notes: [
    "Assistive tech reads the final value once; the counting digits are hidden from it.",
    "The delta says Up or Down in words, so color is never the only signal.",
    "Live stats don't announce each tick, which would talk over the page. Put a live region around the one value that matters if you need it.",
    "The count-up reserves the final value's width, so the delta and sparkline don't shift while it runs.",
    "Under prefers-reduced-motion the value appears at once and the heartbeat dot holds still.",
  ],
};
