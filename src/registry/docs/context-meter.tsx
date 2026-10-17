import type { ComponentDoc } from "../types";
import ContextMeterDemo from "../examples/context-meter/demo";
import ContextMeterComposer from "../examples/context-meter/composer";
import ContextMeterStates from "../examples/context-meter/states";
import ContextMeterSidebar from "../examples/context-meter/sidebar";

export const doc: ComponentDoc = {
  usage: `import { ContextMeter } from "@/components/ui/context-meter"

<ContextMeter size="sm" limit={200_000} parts={parts} breakdown />`,
  examples: [
    {
      name: "demo",
      title: "Settings panel",
      description:
        "A coding session at 71%. Each LED is 5k tokens, lit in the color of what fills it; the cell the total ends in glows partly. The amber and red cells past 80% and 95% are printed on the scale, like the red line on a gauge. Hover a row or a cell to pick out one part.",
      component: ContextMeterDemo,
    },
    {
      name: "composer",
      title: "In a composer toolbar",
      description:
        "size=\"sm\" is ten cells and a readout in a 32px button. breakdown opens the full panel in a popover.",
      component: ContextMeterComposer,
    },
    {
      name: "states",
      title: "Warning and critical",
      description:
        "The compact meter takes one color by status: neon, amber from warnAt, red from criticalAt, where the last lit cell blinks. Crossing into a zone is announced once.",
      component: ContextMeterStates,
    },
    {
      name: "sidebar",
      title: "Sidebar",
      description: "size=\"md\" spans its container with 24 cells. A million-token window reads the same way as a 200k one.",
      component: ContextMeterSidebar,
    },
  ],
  api: [
    {
      name: "ContextMeter",
      description: "Without breakdown the root has role=\"meter\". With it, the root holds a button that opens the panel. Other div attributes go on the root.",
      props: [
        { prop: "parts", type: "ContextPart[]", description: "What fills the window, in order: { label, tokens, color? }. Free space is what's left of limit." },
        { prop: "used", type: "number", description: "Total tokens, when you don't have a breakdown. Ignored if parts is set." },
        { prop: "limit", type: "number", description: "The window size in tokens." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "sm for a toolbar, md for a sidebar, lg for a settings panel with the table of parts." },
        { prop: "warnAt", type: "number", default: "0.8", description: "Fraction where it turns amber." },
        { prop: "criticalAt", type: "number", default: "0.95", description: "Fraction where it turns red and the last lit cell blinks." },
        { prop: "breakdown", type: "boolean", default: "false", description: "sm and md: make the meter a button that opens the full breakdown in a popover." },
        { prop: "readout", type: '"tokens" | "percent" | "none"', default: '"tokens"', description: "sm only: print 142.3k / 200k, 71%, or nothing." },
        { prop: "label", type: "string", default: '"Context window"', description: "Names the meter and heads the panel." },
        { prop: "note", type: "ReactNode", description: "A line under the table, such as when older turns get summarised." },
        { prop: "format", type: "(tokens: number) => string", default: "formatTokens", description: "Replaces the 48.2k formatting everywhere." },
        { prop: "cells", type: "number", default: "10 / 24 / 40", description: "LED count, by size." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Parts without their own color take shades of it." },
      ],
    },
  ],
  notes: [
    "The meter reports tokens: aria-valuenow is the count used and aria-valuetext reads \"71% used, 142.3k of 200k tokens\", with \"near the limit\" or \"almost full\" added in the zones.",
    "The breakdown button's name carries the same reading, so the value isn't hidden behind a click.",
    "The table of parts is a real table with row headers, and exact counts for screen readers (88,500 tokens).",
    "Crossing into amber or red is announced once through a polite live region; the reading on first render is not.",
    "The first part is drawn white, as fixed overhead like a system prompt; the rest take shades of the neon color. Pass color on a part to pick your own.",
    "The critical blink stops under reduced motion.",
  ],
};
