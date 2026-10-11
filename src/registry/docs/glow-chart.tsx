import type { ComponentDoc } from "../types";
import GlowChartDemo from "../examples/glow-chart/demo";
import GlowChartRevenue from "../examples/glow-chart/revenue";
import GlowChartLatency from "../examples/glow-chart/latency";
import GlowChartSparklines from "../examples/glow-chart/sparklines";

export const doc: ComponentDoc = {
  usage: `import { GlowChart, Sparkline } from "@/components/ui/glow-chart"

<GlowChart
  label="Unique visitors per day"
  data={[
    { x: new Date("2026-10-08"), y: 1840 },
    { x: new Date("2026-10-09"), y: 1912 },
    { x: new Date("2026-10-10"), y: 1206 },
  ]}
/>

<Sparkline data={[96, 104, 98, 121, 117, 132]} />`,
  examples: [
    {
      name: "demo",
      title: "Traffic card",
      description:
        "An area series over a muted previous-period line. onActiveIndexChange drives the headline number while you scrub, and switching the range draws the line in again.",
      component: GlowChartDemo,
    },
    {
      name: "revenue",
      title: "Bars with a target",
      description:
        "Bars are glass with a lit cap; the hovered month powers on. Monthly dates tick on calendar months, and thresholds draw a dashed reference line.",
      component: GlowChartRevenue,
    },
    {
      name: "latency",
      title: "Several series",
      description:
        "Each series takes its own color. The first follows the accent, so only the others are set. yDomain fixes the range so a spike doesn't rescale the day.",
      component: GlowChartLatency,
    },
    {
      name: "sparklines",
      title: "Sparklines",
      description: "A Sparkline is a single glowing trend with its latest value marked. live makes that dot ping.",
      component: GlowChartSparklines,
    },
  ],
  api: [
    {
      name: "GlowChart",
      description: "Also accepts native div attributes. aria-label replaces the generated summary.",
      props: [
        {
          prop: "data",
          type: "GlowChartPoint[] | GlowChartSeries[]",
          description: "Points for one series, or named series. Series are matched by x, so they don't need the same length.",
        },
        { prop: "type", type: '"area" | "line" | "bar"', default: '"area"', description: "Area and bar charts start at zero; lines fit the data." },
        { prop: "label", type: "string", description: "What the chart shows. Leads the accessible summary and captions the data table." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the first series. Falls back to --neon-accent, then cyan." },
        { prop: "curve", type: '"smooth" | "linear"', default: '"smooth"', description: "Smooth is monotone, so it never overshoots a peak." },
        { prop: "height", type: "number", default: "240", description: "Plot height in pixels, x-axis labels included. The width fills the container." },
        { prop: "grid", type: "boolean", default: "true", description: "Hairlines at each y tick." },
        { prop: "axis", type: "boolean", default: "true", description: "Tick labels on both axes." },
        { prop: "tooltip", type: "boolean", default: "true", description: "Crosshair, tooltip and arrow-key reading. Off makes the chart a static image." },
        { prop: "legend", type: "boolean", default: "series > 1", description: "Series key above the plot." },
        {
          prop: "yFormat",
          type: '(value: number, context: "axis" | "tooltip") => string',
          default: "compact / grouped",
          description: "Formats y values. The axis gets 1.2K by default; the tooltip and table get 1,204.",
        },
        {
          prop: "xFormat",
          type: '(x: string | number | Date, context: "axis" | "tooltip") => string',
          description: "Formats x values. Dates default to UTC so the server and browser agree; pass this to use a local zone.",
        },
        { prop: "yDomain", type: "[number, number]", description: "A fixed y range instead of fitting the data." },
        { prop: "yTicks", type: "number", default: "4", description: "Rough number of y ticks. Steps are always 1, 2, 2.5 or 5 times a power of ten." },
        { prop: "thresholds", type: "{ y: number; label?: string; color?: NeonColor }[]", description: "Dashed reference lines, like an SLO or a target." },
        { prop: "xLabel", type: "string", default: '"Date" / "Label"', description: "Header of the x column in the data table." },
        {
          prop: "animate",
          type: "boolean",
          default: "true",
          description: "A beam draws the series in when the chart scrolls into view (bars grow), and again when the number of points changes.",
        },
        { prop: "onActiveIndexChange", type: "(index: number | null) => void", description: "The point under the crosshair, from pointer or keyboard." },
      ],
    },
    {
      name: "GlowChartSeries",
      props: [
        { prop: "name", type: "string", description: "Shown in the legend, tooltip, summary and table header." },
        { prop: "data", type: "{ x: string | number | Date; y: number | null }[]", description: "A null y leaves a gap in the line." },
        { prop: "color", type: "NeonColor", description: "The first series defaults to --neon, the rest to white, amber, violet, green, pink and blue in that order." },
        { prop: "type", type: '"line" | "area"', description: "Overrides the chart type for this series in a line or area chart." },
        { prop: "muted", type: "boolean", default: "false", description: "Drawn thin and unlit, for a comparison or baseline." },
      ],
    },
    {
      name: "Sparkline",
      description: "Also accepts native span attributes.",
      props: [
        { prop: "data", type: "number[]", description: "Values in order, oldest first." },
        { prop: "width", type: "number | string", default: "96", description: "Pixels or any CSS length. With a percentage it stretches without distorting the glow." },
        { prop: "height", type: "number", default: "28", description: "Height in pixels." },
        { prop: "label", type: "string", default: "trend summary", description: "Accessible name." },
        { prop: "area", type: "boolean", default: "true", description: "A soft wash under the line." },
        { prop: "dot", type: "boolean", default: "true", description: "Marks the latest value." },
        { prop: "live", type: "boolean", default: "false", description: "The latest-value dot pings, for streaming data." },
        { prop: "curve", type: '"smooth" | "linear"', default: '"smooth"', description: "Line interpolation." },
        { prop: "yFormat", type: "(value: number) => string", description: "Formats values in the generated label." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Line color." },
      ],
    },
  ],
  notes: [
    "The plot is role=\"img\" with a generated summary: the range, then each series' low, high and latest value.",
    "Every value is also in a visually hidden table with a caption, so nothing depends on hovering.",
    "The plot is focusable when tooltip is on. Left and Right move the crosshair, PageUp and PageDown jump a tenth of the range, Home and End go to the ends, and Escape hides it.",
    "Keyboard moves are announced through a polite live region; pointer hover is not, so screen readers aren't flooded.",
    "Touch scrubs horizontally and leaves vertical scrolling to the page.",
    "With reduced motion the series appear without the draw-in beam and the crosshair doesn't glide.",
  ],
};
