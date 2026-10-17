import type { ComponentDoc } from "../types";
import SplitFlapDemo from "../examples/split-flap/demo";
import SplitFlapTicker from "../examples/split-flap/ticker";
import SplitFlapCounter from "../examples/split-flap/counter";
import SplitFlapPlayground from "../examples/split-flap/playground";

export const doc: ComponentDoc = {
  usage: `import { SplitFlap, SplitFlapBoard } from "@/components/ui/split-flap"

<SplitFlap value="TOKYO" length={8} />

<SplitFlapBoard
  columns={[{ label: "Time", charset: "numeric" }, { label: "Destination" }, { label: "Remarks" }]}
  rows={[{ cells: ["22:45", "TOKYO HND", "ON TIME"] }]}
/>`,
  examples: [
    {
      name: "demo",
      title: "Departures board",
      description:
        "The board starts blank and flips in when it scrolls into view, then updates every few seconds. The time column uses a numeric drum so it settles quickly; remarks take their color per cell.",
      component: SplitFlapDemo,
    },
    {
      name: "ticker",
      title: "Word ticker",
      description: "A fixed length keeps the cell count steady while words change. The letters-only drum spins less than the full one.",
      component: SplitFlapTicker,
    },
    {
      name: "counter",
      title: "Counter",
      description: "A digits-only charset makes each digit step to its neighbour, like a mechanical tally.",
      component: SplitFlapCounter,
    },
    {
      name: "playground",
      title: "Type to flip",
      description: "Every change spins each cell forward through the drum. Characters that aren't on it drop straight in with one flip.",
      component: SplitFlapPlayground,
    },
  ],
  api: [
    {
      name: "SplitFlap",
      description: "A row of flaps. Renders a <span>; the visible cells are hidden from screen readers and the value is read once.",
      props: [
        { prop: "value", type: "string", description: "The text to show. Lowercase letters are shown in uppercase when the drum has no lowercase." },
        { prop: "length", type: "number", default: "value length", description: "Fixed number of cells. Short values are padded with blank flaps, long ones are cut." },
        { prop: "align", type: '"left" | "right"', default: '"left"', description: "Which side short values hug when padded." },
        {
          prop: "charset",
          type: '"alphanumeric" | "letters" | "numeric" | string',
          default: '"alphanumeric"',
          description: "The drum order. Flaps only travel forward, so the order decides how far a change spins. Start custom drums with a space for blank.",
        },
        { prop: "flipDuration", type: "number", default: "90", description: "Milliseconds for one flap to fall. The last flap of a run takes longer and bounces." },
        { prop: "stagger", type: "number", default: "30", description: "Milliseconds between neighbouring cells starting." },
        { prop: "delay", type: "number", default: "0", description: "Milliseconds before the first cell starts." },
        { prop: "flipOnMount", type: "boolean", default: "false", description: "Start blank and flip in once the display scrolls into view." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: "inherited or 40px", description: "Cell height (28, 40 or 60px). Every dimension follows the --flap-h variable, so a class like sm:[--flap-h:48px] also works." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "SplitFlapBoard",
      description: "A housing of SplitFlap rows with column captions. Renders role=\"table\" with rows and cells, so it reads as a table.",
      props: [
        { prop: "rows", type: "{ cells: string[]; colors?: (NeonColor | undefined)[] }[]", description: "One entry per row; colors apply per column index." },
        {
          prop: "columns",
          type: "{ label?, length?, align?, charset?, className? }[]",
          description: "Captions, cell counts, alignment and drum per column. Length defaults to the longest value. className applies to the column's cells and caption, e.g. max-sm:hidden.",
        },
        { prop: "header", type: "ReactNode", description: "Title bar above the board, e.g. a label and a clock." },
        { prop: "charset", type: "string", default: '"alphanumeric"', description: "Default drum for columns without their own." },
        { prop: "flipDuration", type: "number", default: "90", description: "Milliseconds per flap." },
        { prop: "stagger", type: "number", default: "24", description: "Milliseconds between cells. Updates ripple diagonally from the top-left." },
        { prop: "flipOnMount", type: "boolean", default: "false", description: "Start blank and flip every row in once the board is in view." },
        { prop: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "Cell height. Override with a --flap-h class for responsive boards." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Color for every cell without its own." },
      ],
    },
  ],
  notes: [
    "Each SplitFlap reads its value once from visually hidden text; the flapping cells are aria-hidden, so nothing is announced character by character.",
    "Add aria-live=\"polite\" to a SplitFlap when its changes should be announced, as the ticker example does.",
    "SplitFlapBoard is a role=\"table\" with column headers, so screen reader users can move cell by cell. Name it with aria-label.",
    "The flaps are driven by one shared requestAnimationFrame loop that writes transforms directly and stops when every cell has settled.",
    "With reduced motion, cells switch to the new character without flipping.",
  ],
};
