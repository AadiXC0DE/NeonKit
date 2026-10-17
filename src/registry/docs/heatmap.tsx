import type { ComponentDoc } from "../types";
import HeatmapDemo from "../examples/heatmap/demo";
import HeatmapMatrix from "../examples/heatmap/matrix";
import HeatmapQuarter from "../examples/heatmap/quarter";

export const doc: ComponentDoc = {
  usage: `import { Heatmap } from "@/components/ui/heatmap"

<Heatmap data={[{ date: "2026-10-16", value: 5 }]} end="2026-10-16" unit="deploy" />`,
  examples: [
    {
      name: "demo",
      title: "A year of deploys",
      description:
        "Calendar mode: weeks across, days down, the latest week on the right. Hover or focus a day for its count, click it (or press Enter) for the details below.",
      component: HeatmapDemo,
    },
    {
      name: "matrix",
      title: "Matrix",
      description: "rows, columns and values make a labelled grid. Here: failed CI runs by weekday and UTC hour, in five steps.",
      component: HeatmapMatrix,
    },
    {
      name: "quarter",
      title: "Range, week start and format",
      description: "One quarter from Monday, larger cells, a fixed max so 90 minutes is the top step, and values written as minutes.",
      component: HeatmapQuarter,
    },
  ],
  api: [
    {
      name: "Heatmap",
      description: "A role=\"grid\" inside a div. Accepts div attributes; the ref points at the outer div.",
      props: [
        { prop: "data", type: "HeatmapDatum[]", description: "Calendar mode: { date: \"YYYY-MM-DD\", value }. Entries on one date add up." },
        { prop: "start", type: "string", default: "end − 364 days", description: "First day shown." },
        { prop: "end", type: "string", default: "latest date in data", description: "Last day shown. Pass today's date from the server so the grid doesn't depend on the viewer's clock." },
        { prop: "weekStart", type: "0 | 1", default: "0", description: "0 starts each column on Sunday, 1 on Monday." },
        { prop: "formatDate", type: "(date: string) => string", default: '"Tue, Mar 3, 2026"', description: "Calendar: how a day is named in the tooltip and for screen readers." },
        { prop: "rows", type: "string[]", description: "Matrix mode: row labels." },
        { prop: "columns", type: "string[]", description: "Matrix mode: column labels, shown above each column." },
        { prop: "values", type: "(number | null)[][]", description: "Matrix mode: values[row][column]. null draws a hatched cell with no data." },
        { prop: "formatLabel", type: "(row: string, column: string) => string", default: '"row, column"', description: "Matrix: how a cell is named." },
        { prop: "levels", type: "number", default: "4", description: "Lit steps above zero. The top step burns white-hot." },
        { prop: "max", type: "number", default: "largest value", description: "The value that reaches the top step. Values above it clamp." },
        { prop: "unit", type: 'string | [string, string]', description: 'What a value counts: "deploy" or ["failed run", "failed runs"]. Gives "14 deploys" and "No deploys".' },
        { prop: "formatValue", type: "(value: number) => string", description: "Replaces the value text entirely." },
        { prop: "cellSize", type: "number", default: "14", description: "Largest cell, in px. Cells shrink with the container." },
        { prop: "minCellSize", type: "number", default: "8 or 16", description: "Smallest cell before the grid scrolls sideways: 8 in a calendar, 16 in a matrix so column labels fit." },
        { prop: "gap", type: "number", default: "3", description: "Space between cells, in px." },
        { prop: "legend", type: "boolean", default: "true", description: "Shows Less ▢▢▢▢ More under the grid." },
        { prop: "legendLabels", type: "[ReactNode, ReactNode]", default: '["Less", "More"]', description: "Ends of the legend." },
        { prop: "footer", type: "ReactNode", description: "Left of the legend: a total, a caption, the selected day." },
        { prop: "value", type: "string | null", description: "Selected cell key: the date in a calendar, \"row:column\" indexes in a matrix." },
        { prop: "defaultValue", type: "string | null", description: "Starting selection when uncontrolled." },
        { prop: "onValueChange", type: "(key: string | null, cell: HeatmapCell | null) => void", description: "Called on click, Enter or Space. Picking the selected cell again clears it. Passing any of these three props turns selection on." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "The scale's color. Falls back to --neon-accent, then cyan." },
      ],
    },
  ],
  notes: [
    "The grid is a single tab stop. Arrow keys move between cells; in a calendar Up and Down step through days and wrap into the next week. Home and End go to the ends of a row, Ctrl+Home and Ctrl+End to the first and last cell, Page Up and Page Down four columns.",
    "Every cell is named with its value and date (\"14 deploys, Tue, Mar 3, 2026\"). Selected cells report aria-selected only when selection is on.",
    "One tooltip serves the whole grid. It's portaled to the body, so a scrolling or clipped parent can't cut it off, and it follows keyboard focus as well as the pointer.",
    "Dates are read and formatted in UTC with fixed English names, so the server and the browser render the same grid. Pass formatDate for another language.",
    "When the calendar has to scroll, it opens scrolled to the latest weeks.",
    "Only the top two steps throw light, and the glow is static. Hovering repaints one tooltip, not the grid.",
  ],
};
