import type { ComponentDoc } from "../types";
import TableDemo from "../examples/table/demo";
import TableDataTable from "../examples/table/data-table";
import TableStickyHeader from "../examples/table/sticky-header";
import TableUsage from "../examples/table/usage";

export const doc: ComponentDoc = {
  usage: `import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

<Table aria-label="Deployments">
  <TableHeader>
    <TableRow>
      <TableHead sortDirection="desc" onSort={toggleSort}>Created</TableHead>
      <TableHead align="right">Duration</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow selected>
      <TableCell>4m ago</TableCell>
      <TableCell align="right">1m 12s</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
  examples: [
    {
      name: "demo",
      title: "Deployments",
      description:
        "Sortable headers, row selection and status badges. Hover a row and a soft beam crosses it; selected rows get a tint and a lit left edge.",
      component: TableDemo,
    },
    {
      name: "data-table",
      title: "Data table",
      description:
        "Sorting, selection with Checkbox and Pagination wired together. Selection survives paging and sorting; the header checkbox covers the current page.",
      component: TableDataTable,
    },
    {
      name: "sticky-header",
      title: "Sticky header in a Scroll Area",
      description:
        "The header pins to the nearest scroll container. Here the ScrollArea scrolls, so the table's own container is set to overflow-visible and edge fades are off to keep the header crisp.",
      component: TableStickyHeader,
    },
    {
      name: "usage",
      title: "Compact, with footer and caption",
      component: TableUsage,
    },
  ],
  api: [
    {
      name: "Table",
      description:
        "Renders a <table> inside a framed container that scrolls sideways when the table is too wide. Native table attributes, className and ref go to the <table>.",
      props: [
        { prop: "density", type: '"compact" | "normal"', default: '"normal"', description: "Row height and cell padding." },
        {
          prop: "stickyHeader",
          type: "boolean",
          default: "false",
          description: "Pins the header row to the top of the nearest scroll container. Give the container a max-height, or make it overflow-visible inside an outer scroller.",
        },
        { prop: "containerClassName", type: "string", description: "Classes for the container, e.g. max-h-96, or border-0 to drop the frame." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Selection tint, lit edge, beam and sort arrow. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "TableHead",
      description: "A <th>. scope is col in the header and row elsewhere.",
      props: [
        { prop: "onSort", type: "() => void", description: "Renders the label as a sort button. Work out the next direction in your handler." },
        {
          prop: "sortDirection",
          type: '"asc" | "desc" | false',
          default: "false",
          description: "Sets aria-sort and points the arrow. Unsorted columns show the arrow on hover.",
        },
        { prop: "align", type: '"left" | "center" | "right"', default: '"left"', description: "Right-aligned sortable heads put the arrow before the label so numbers line up." },
      ],
    },
    {
      name: "TableRow",
      description: "A <tr>. Body rows light up on hover; header and footer rows don't.",
      props: [
        { prop: "selected", type: "boolean", description: "Neon tint and a lit left edge. Also sets aria-selected." },
        { prop: "interactive", type: "boolean", default: "false", description: "Pointer cursor and a pressed state for rows that respond to clicks." },
      ],
    },
    {
      name: "TableCell",
      description: "A <td>.",
      props: [{ prop: "align", type: '"left" | "center" | "right"', default: '"left"', description: "Text alignment. Numbers use tabular figures throughout the table." }],
    },
    {
      name: "TableHeader, TableBody, TableFooter, TableCaption",
      description: "<thead>, <tbody>, <tfoot> and <caption>, with native attributes. The caption sits under the table.",
      props: [{ prop: "className", type: "string", description: "Extra classes." }],
    },
  ],
  notes: [
    "It's a real HTML table, so screen readers announce rows, columns and headers. Name it with aria-label or a TableCaption.",
    "Sortable headers are buttons inside the <th>; the sorted column gets aria-sort, so the direction is announced with the header.",
    "Row selection belongs on a real control: put a Checkbox with an aria-label in the row. Clicking the row itself is a pointer shortcut, not the only way.",
    "interactive only styles the row. If a row navigates, put a link in its primary cell so keyboard users can reach it.",
    "The hover beam is transform-only and is skipped with reduced motion.",
  ],
};
