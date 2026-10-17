import type { ComponentDoc } from "../types";
import DonutChartDemo from "../examples/donut-chart/demo";
import DonutChartStorage from "../examples/donut-chart/storage";
import DonutChartPie from "../examples/donut-chart/pie";
import DonutChartCompact from "../examples/donut-chart/compact";

export const doc: ComponentDoc = {
  usage: `import { DonutChart } from "@/components/ui/donut-chart"

<DonutChart
  label="Sessions this week"
  data={[
    { label: "Direct", value: 18240 },
    { label: "Organic search", value: 12906 },
  ]}
/>`,
  examples: [
    {
      name: "demo",
      title: "Traffic by channel",
      description:
        "Each segment is a bent tube with round ends and a gap to its neighbours. Hover a segment or a legend row, or Tab in and use the arrows: it lights and the rest dim.",
      component: DonutChartDemo,
    },
    {
      name: "storage",
      title: "Part of a whole",
      description: "max sets the whole. What the segments don't use stays as an unlit run of tube. Segments too short to bend become beads.",
      component: DonutChartStorage,
    },
    {
      name: "pie",
      title: "Pie",
      description: "Wedges of tinted glass, each edged with a tube along its outer arc and pulled apart by gap.",
      component: DonutChartPie,
    },
    {
      name: "compact",
      title: "Compact",
      description: "One segment and a max make a small gauge. centerLabel={null} leaves just the number.",
      component: DonutChartCompact,
    },
  ],
  api: [
    {
      name: "DonutChart",
      description: "className and style go on the outer element, which holds the chart and the legend.",
      props: [
        { prop: "data", type: "{ label: string; value: number; color?: NeonColor }[]", description: "Segments clockwise from the top. The first defaults to --neon, the rest to a fixed palette." },
        { prop: "variant", type: '"donut" | "pie"', default: '"donut"', description: "Tubes, or glass wedges edged with tube." },
        { prop: "size", type: "number", default: "220", description: "Diameter in pixels." },
        { prop: "thickness", type: "number", default: "0.075", description: "Tube thickness as a share of the diameter, 0.03 to 0.2." },
        { prop: "gap", type: "number", default: "3", description: "Pixels between segments, on top of the round ends." },
        { prop: "max", type: "number", description: "The whole. Any remainder shows as unlit tube and gets its own legend and table row." },
        { prop: "label", type: "string", description: "What the chart measures. Captions the total and the data table and leads the summary." },
        { prop: "centerLabel", type: "ReactNode", default: "label", description: "Caption under the centre value. null hides it." },
        { prop: "remainderLabel", type: "string", default: '"Remaining"', description: "Name of the remainder when max leaves one." },
        { prop: "formatValue", type: "(value: number) => string", description: "Formats values in the centre, legend, table and announcements." },
        { prop: "activeIndex", type: "number | null", description: "Controlled lit segment. null lights them all." },
        { prop: "defaultActiveIndex", type: "number | null", default: "null", description: "Initial lit segment when uncontrolled." },
        { prop: "onActiveIndexChange", type: "(index: number | null) => void", description: "Called on hover, focus and arrow keys." },
        { prop: "showLegend", type: "boolean", default: "true", description: "Legend with value and share. It wraps under the chart when there's no room beside it." },
        { prop: "hideCenter", type: "boolean", default: "false", description: "Hides the centre readout. Pies never show one." },
        { prop: "animate", type: "boolean", default: "true", description: "Draws the tubes on round the ring when the chart scrolls into view." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color of the first segment." },
      ],
    },
  ],
  notes: [
    "The chart is an image named by a summary of every segment, with a visually hidden table of the same data.",
    "Tab focuses it; arrow keys move between segments, Home and End jump to the ends and Escape clears. Each move is announced.",
    "With reduced motion the tubes appear fully drawn and hover changes are instant.",
  ],
};
