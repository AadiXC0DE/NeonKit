import type { ComponentDoc } from "../types";
import DataTableDemo from "../examples/data-table/demo";
import DataTableStates from "../examples/data-table/states";
import DataTableLinks from "../examples/data-table/links";
import DataTableHeadless from "../examples/data-table/headless";

export const doc: ComponentDoc = {
  usage: `import { DataTable, type DataTableColumn } from "@/components/ui/data-table"

const columns: DataTableColumn<Invoice>[] = [
  { id: "id", header: "Invoice", accessor: "id", rowHeader: true },
  { id: "status", header: "Status", accessor: "status", sortable: true, filter: "select" },
  { id: "amount", header: "Amount", accessor: "amount", sortable: true, align: "right" },
]

<DataTable label="Invoices" data={invoices} columns={columns} selectable />`,
  examples: [
    {
      name: "demo",
      title: "1,000 invoices",
      description:
        "Search, two faceted filters, Shift-click multi-sort and range selection, page sizes and bulk export. The sorted header gets a lit tube; selected rows light their leading edge.",
      component: DataTableDemo,
    },
    {
      name: "states",
      title: "Loading and empty",
      description: "Skeleton rows while loading, and your own empty state when there's nothing yet.",
      component: DataTableStates,
    },
    {
      name: "links",
      title: "Linked rows, load more",
      description: "getRowHref makes each row a real link. Compact density, a text filter and a growing list instead of pages.",
      component: DataTableLinks,
    },
    {
      name: "headless",
      title: "Headless",
      description: "useDataTable runs the same sorting, search and selection behind your own markup.",
      component: DataTableHeadless,
    },
  ],
  api: [
    {
      name: "DataTable",
      description:
        "Everything in useDataTable, plus the UI. Built on Table, Checkbox, Input, Button, Dropdown Menu, Pagination and Skeleton. Accepts every native div attribute.",
      props: [
        { prop: "data", type: "T[]", description: "The rows. Keep the array stable between renders; sorting and search are memoized on it." },
        { prop: "columns", type: "DataTableColumn<T>[]", description: "Column definitions; see below." },
        { prop: "label", type: "string", description: "Accessible name for the table. Use it or caption." },
        { prop: "caption", type: "ReactNode", description: "A visible caption under the table." },
        { prop: "getRowId", type: "(row: T, index: number) => string", default: "row.id", description: "Stable id for selection. Falls back to the index." },
        { prop: "selectable", type: "boolean", default: "false", description: "Adds the checkbox column. Shift-click or Shift+Space ticks a range." },
        { prop: "selectionActions", type: "(rows: T[], clear: () => void) => ReactNode", description: "Bulk actions shown in the toolbar while rows are selected." },
        { prop: "onRowClick", type: "(row: T) => void", description: "Makes rows focusable and clickable; Enter and Space work too. Clicks on controls inside a row don't count." },
        { prop: "getRowHref", type: "(row: T) => string", description: "Wraps the row header in a link stretched over the whole row." },
        { prop: "getRowLabel", type: "(row: T) => string", description: "Names a row for its checkbox. Defaults to the row header's text." },
        { prop: "pagination", type: '"pages" | "load-more" | "none"', default: '"pages"', description: "Numbered pages, a growing list, or every row." },
        { prop: "pageSizeOptions", type: "number[]", description: "Adds a rows-per-page menu." },
        { prop: "loading", type: "boolean", default: "false", description: "Skeleton rows and aria-busy." },
        { prop: "emptyState", type: "ReactNode", description: "Shown when there's no data. Filtered-out results get their own message with a reset." },
        { prop: "stickyHeader", type: "boolean", default: "true", description: "Pins the header while the body scrolls." },
        { prop: "maxHeight", type: "number | string", description: "Caps the table's height so it scrolls under the header." },
        { prop: "searchable", type: "boolean", default: "true", description: "Shows the search field." },
        { prop: "searchPlaceholder", type: "string", default: '"Search…"', description: "Placeholder for the search field." },
        { prop: "toolbar", type: "ReactNode", description: "Extra controls at the end of the toolbar." },
        { prop: "hideToolbar", type: "boolean", default: "false", description: "Removes the toolbar." },
        { prop: "noun", type: "[string, string]", default: '["row", "rows"]', description: "Singular and plural for counts and messages." },
        { prop: "color", type: "NeonColor", default: "inherited", description: "Palette name or hex. Falls back to --neon-accent, then cyan." },
      ],
    },
    {
      name: "DataTableColumn<T>",
      description: "One column.",
      props: [
        { prop: "id", type: "string", description: "Unique key, used by sorting, filters and visibility." },
        { prop: "header", type: "ReactNode", description: "Header content." },
        { prop: "accessor", type: "keyof T | (row: T) => unknown", description: "The value that sorting, search and the default cell read." },
        { prop: "cell", type: "(ctx: { row, value, index, highlight }) => ReactNode", description: "Custom cell. highlight(text) lights the search match." },
        { prop: "sortable", type: "boolean", description: "Makes the header a sort button." },
        { prop: "sortingFn", type: "(a: T, b: T) => number", description: "Custom ascending compare. The default is natural order, with blanks always last." },
        { prop: "sortDescFirst", type: "boolean", description: "The first click sorts descending, for dates and amounts." },
        { prop: "align", type: '"left" | "center" | "right"', default: '"left"', description: "Cell and header alignment. Right-aligned cells get tabular figures." },
        { prop: "width", type: "number | string", description: "Column width." },
        { prop: "filter", type: '"text" | "select"', description: "Adds a filter for this column to the toolbar." },
        { prop: "filterOptions", type: "{ value: string; label?: ReactNode }[]", description: "Choices for a select filter. Defaults to the distinct values, with counts." },
        { prop: "filterValue", type: "(row: T) => string", description: "Text that search and text filters match." },
        { prop: "searchable", type: "boolean", default: "true", description: "False leaves the column out of the search." },
        { prop: "rowHeader", type: "boolean", description: "Renders as th scope=\"row\" and names the row." },
        { prop: "hideable", type: "boolean", default: "true", description: "Listed in the View menu." },
        { prop: "label", type: "string", description: "Name in menus when header isn't text." },
      ],
    },
    {
      name: "useDataTable(options)",
      description:
        "The state behind DataTable. Every piece is controlled or uncontrolled: sorting, globalFilter, columnFilters, selection, page, pageSize, columnVisibility and density, each with default… and on…Change.",
      props: [
        { prop: "rows", type: "DataTableRow<T>[]", description: "The current page, or every loaded row with load more." },
        { prop: "filteredRows", type: "DataTableRow<T>[]", description: "Every row that passes search and filters, sorted." },
        { prop: "columns", type: "DataTableColumn<T>[]", description: "Visible columns." },
        { prop: "toggleSort(id, multi?)", type: "function", description: "Off, first direction, the other, off. multi adds or updates a key instead of replacing." },
        { prop: "getSort(id)", type: "{ desc, priority } | null", description: "A column's sort state." },
        { prop: "setGlobalFilter / setColumnFilter / resetFilters", type: "function", description: "Filter controls. Each goes back to page 1." },
        { prop: "toggleRow(id, checked, range?)", type: "function", description: "Ticks a row; range ticks everything since the last one." },
        { prop: "setRowsSelected / clearSelection / isSelected", type: "function", description: "Selection helpers." },
        { prop: "page, pageCount, setPage, setPageSize, loadMore", type: "", description: "Pagination." },
        { prop: "toggleColumnVisibility(id, visible?)", type: "function", description: "Shows or hides a column." },
      ],
    },
  ],
  notes: [
    "Sort headers are buttons, so Enter and Space sort and Shift with either adds a sort key. The first key sets aria-sort; later keys say their priority to screen readers.",
    "Selection counts and search results are announced through polite live regions.",
    "Sorting and filtering are memoized and only the current page renders, so 1,000 rows sort in a few milliseconds.",
    "Search runs on a deferred value, so typing stays smooth on large tables.",
    "Selected rows keep their selection when filtered out; the footer says how many are hidden.",
    "On narrow screens cells stay on one line and the table scrolls sideways inside its frame.",
  ],
};
