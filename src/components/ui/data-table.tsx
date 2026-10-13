"use client";

import * as React from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/

export type DataTableDensity = "compact" | "normal";
export type DataTableAlign = "left" | "center" | "right";
export type DataTableFilterValue = string | string[];

export interface DataTableSort {
  id: string;
  desc: boolean;
}

export interface DataTableCellContext<T> {
  row: T;
  /** The accessor's value. */
  value: unknown;
  /** Index in the sorted, filtered rows. */
  index: number;
  /** Wraps the parts of `text` that match the search in a lit mark. */
  highlight: (text: string) => React.ReactNode;
}

export interface DataTableColumn<T> {
  id: string;
  header: React.ReactNode;
  /** A key of the row or a function. Sorting, filtering and the default cell read this value. */
  accessor?: keyof T | ((row: T) => unknown);
  cell?: (context: DataTableCellContext<T>) => React.ReactNode;
  sortable?: boolean;
  /** Compares two rows for this column, ascending. Defaults to a natural compare of the values. */
  sortingFn?: (a: T, b: T) => number;
  /** Start descending on the first click, e.g. for dates and amounts. */
  sortDescFirst?: boolean;
  align?: DataTableAlign;
  /** Any CSS width, e.g. 120 or "30%". */
  width?: number | string;
  /** Adds a filter for this column to the toolbar: free text, or a list of values to tick. */
  filter?: "text" | "select";
  /** Values and labels for a select filter. Defaults to the distinct values in the data. */
  filterOptions?: { value: string; label?: React.ReactNode }[];
  /** Text the search and text filters match against. Defaults to the value as a string. */
  filterValue?: (row: T) => string;
  /** Leaves the column out of the global search. */
  searchable?: boolean;
  /** Renders the cell as a row header (`th scope="row"`). Its text also names the row. */
  rowHeader?: boolean;
  /** Can be switched off in the View menu. */
  hideable?: boolean;
  /** Name in menus when `header` isn't plain text. */
  label?: string;
}

export interface UseDataTableOptions<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Stable id per row. Defaults to `row.id`, then the index. */
  getRowId?: (row: T, index: number) => string;
  sorting?: DataTableSort[];
  defaultSorting?: DataTableSort[];
  onSortingChange?: (sorting: DataTableSort[]) => void;
  globalFilter?: string;
  defaultGlobalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  columnFilters?: Record<string, DataTableFilterValue>;
  defaultColumnFilters?: Record<string, DataTableFilterValue>;
  onColumnFiltersChange?: (filters: Record<string, DataTableFilterValue>) => void;
  /** Selected row ids. */
  selection?: string[];
  defaultSelection?: string[];
  onSelectionChange?: (ids: string[]) => void;
  /** 1-based. With load more, the number of pages shown. */
  page?: number;
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  defaultPageSize?: number;
  onPageSizeChange?: (size: number) => void;
  /** `false` hides a column. Missing ids are visible. */
  columnVisibility?: Record<string, boolean>;
  defaultColumnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (visibility: Record<string, boolean>) => void;
  density?: DataTableDensity;
  defaultDensity?: DataTableDensity;
  onDensityChange?: (density: DataTableDensity) => void;
  /** Numbered pages, a growing list, or every row at once. */
  pagination?: "pages" | "load-more" | "none";
}

export interface DataTableRow<T> {
  id: string;
  row: T;
  /** Index in the sorted, filtered rows. */
  index: number;
}

/* -------------------------------------------------------------------------------------------------
 * Helpers
 * -----------------------------------------------------------------------------------------------*/

const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
const numberFormat = new Intl.NumberFormat("en-US");
const EMPTY_FILTERS: Record<string, DataTableFilterValue> = {};
const EMPTY_VISIBILITY: Record<string, boolean> = {};
const EMPTY_SORT: DataTableSort[] = [];
const EMPTY_IDS: string[] = [];

function useControllable<V>(value: V | undefined, defaultValue: V, onChange?: (value: V) => void) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
  const current = value === undefined ? uncontrolled : value;
  const latest = React.useRef(current);
  React.useLayoutEffect(() => {
    latest.current = current;
  });
  const set = React.useCallback(
    (next: V | ((previous: V) => V)) => {
      const resolved = typeof next === "function" ? (next as (previous: V) => V)(latest.current) : next;
      latest.current = resolved;
      if (value === undefined) setUncontrolled(resolved);
      onChange?.(resolved);
    },
    [value, onChange],
  );
  return [current, set] as const;
}

function readValue<T>(row: T, column: DataTableColumn<T>): unknown {
  const { accessor } = column;
  if (accessor === undefined) return undefined;
  return typeof accessor === "function" ? accessor(row) : row[accessor];
}

const isBlank = (value: unknown) => value === null || value === undefined || value === "" || Number.isNaN(value);

function compareValues(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return collator.compare(String(a), String(b));
}

function textOf<T>(row: T, column: DataTableColumn<T>) {
  if (column.filterValue) return column.filterValue(row);
  const value = readValue(row, column);
  if (isBlank(value)) return "";
  if (Array.isArray(value)) return value.join(" ");
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function columnName<T>(column: DataTableColumn<T>) {
  return column.label ?? (typeof column.header === "string" ? column.header : column.id);
}

function defaultRowId<T>(row: T, index: number) {
  const id = (row as { id?: unknown } | null)?.id;
  return typeof id === "string" || typeof id === "number" ? String(id) : String(index);
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const lower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let from = 0;
  let at = lower.indexOf(query, from);
  while (at !== -1 && query) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(
      <mark
        key={at}
        className="rounded-[3px] bg-[rgb(var(--neon)/0.14)] text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.6)]"
      >
        {text.slice(at, at + query.length)}
      </mark>,
    );
    from = at + query.length;
    at = lower.indexOf(query, from);
  }
  if (from < text.length) parts.push(text.slice(from));
  return <>{parts}</>;
}

/* -------------------------------------------------------------------------------------------------
 * useDataTable
 * -----------------------------------------------------------------------------------------------*/

function useDataTable<T>(options: UseDataTableOptions<T>) {
  const { data, columns, getRowId = defaultRowId, pagination = "pages" } = options;

  const [sorting, setSortingState] = useControllable(options.sorting, options.defaultSorting ?? EMPTY_SORT, options.onSortingChange);
  const [globalFilter, setGlobalFilterState] = useControllable(
    options.globalFilter,
    options.defaultGlobalFilter ?? "",
    options.onGlobalFilterChange,
  );
  const [columnFilters, setColumnFiltersState] = useControllable(
    options.columnFilters,
    options.defaultColumnFilters ?? EMPTY_FILTERS,
    options.onColumnFiltersChange,
  );
  const [selectionList, setSelectionList] = useControllable(options.selection, options.defaultSelection ?? EMPTY_IDS, options.onSelectionChange);
  const [pageState, setPageState] = useControllable(options.page, options.defaultPage ?? 1, options.onPageChange);
  const [pageSize, setPageSizeState] = useControllable(options.pageSize, options.defaultPageSize ?? 10, options.onPageSizeChange);
  const [columnVisibility, setColumnVisibility] = useControllable(
    options.columnVisibility,
    options.defaultColumnVisibility ?? EMPTY_VISIBILITY,
    options.onColumnVisibilityChange,
  );
  const [density, setDensity] = useControllable(options.density, options.defaultDensity ?? "normal", options.onDensityChange);

  // Typing stays responsive on big tables: the filter catches up a frame later.
  const deferredQuery = React.useDeferredValue(globalFilter);
  const query = deferredQuery.trim().toLowerCase();
  const anchor = React.useRef<string | null>(null);

  const columnsById = React.useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns]);
  const visibleColumns = React.useMemo(() => columns.filter((column) => columnVisibility[column.id] !== false), [columns, columnVisibility]);

  const rows = React.useMemo<DataTableRow<T>[]>(() => data.map((row, i) => ({ id: getRowId(row, i), row, index: i })), [data, getRowId]);

  // Lowercased search text per row, built once per data change rather than per keystroke.
  const haystacks = React.useMemo(() => {
    const searchable = columns.filter((c) => c.searchable !== false && (c.accessor !== undefined || c.filterValue));
    return rows.map(({ row }) => searchable.map((c) => textOf(row, c)).join("\u0000").toLowerCase());
  }, [rows, columns]);

  const filtered = React.useMemo(() => {
    const active = Object.entries(columnFilters).filter(([id, value]) =>
      columnsById.has(id) && (Array.isArray(value) ? value.length > 0 : value.trim() !== ""),
    );
    if (!query && active.length === 0) return rows;
    return rows.filter((entry, i) => {
      if (query && !haystacks[i].includes(query)) return false;
      for (const [id, value] of active) {
        const column = columnsById.get(id)!;
        if (Array.isArray(value)) {
          const raw = readValue(entry.row, column);
          const values = Array.isArray(raw) ? raw.map(String) : [String(raw)];
          if (!values.some((v) => value.includes(v))) return false;
        } else if (!textOf(entry.row, column).toLowerCase().includes(value.trim().toLowerCase())) return false;
      }
      return true;
    });
  }, [rows, haystacks, query, columnFilters, columnsById]);

  const sorted = React.useMemo(() => {
    const rules = sorting.filter((rule) => columnsById.has(rule.id));
    if (rules.length === 0) return filtered;
    const keyed = rules.map((rule) => {
      const column = columnsById.get(rule.id)!;
      return { column, desc: rule.desc, values: new Map(filtered.map((entry) => [entry, readValue(entry.row, column)])) };
    });
    return [...filtered].sort((a, b) => {
      for (const { column, desc, values } of keyed) {
        let result: number;
        if (column.sortingFn) result = column.sortingFn(a.row, b.row);
        else {
          const va = values.get(a);
          const vb = values.get(b);
          // Blanks sink to the bottom in both directions.
          if (isBlank(va) || isBlank(vb)) {
            if (isBlank(va) && isBlank(vb)) continue;
            return isBlank(va) ? 1 : -1;
          }
          result = compareValues(va, vb);
        }
        if (result !== 0) return desc ? -result : result;
      }
      return a.index - b.index;
    });
  }, [filtered, sorting, columnsById]);

  const ordered = React.useMemo(() => sorted.map((entry, index) => ({ ...entry, index })), [sorted]);

  const size = Math.max(1, pageSize);
  const pageCount = pagination === "pages" ? Math.max(1, Math.ceil(ordered.length / size)) : 1;
  const page = Math.min(Math.max(1, pageState), pagination === "load-more" ? Math.max(1, Math.ceil(ordered.length / size)) : pageCount);
  const pageRows = React.useMemo(() => {
    if (pagination === "none") return ordered;
    if (pagination === "load-more") return ordered.slice(0, page * size);
    return ordered.slice((page - 1) * size, page * size);
  }, [ordered, pagination, page, size]);

  const selection = React.useMemo(() => new Set(selectionList), [selectionList]);
  const rowById = React.useMemo(() => new Map(rows.map((entry) => [entry.id, entry.row])), [rows]);
  const selectedRows = React.useMemo(
    () => selectionList.map((id) => rowById.get(id)).filter((row): row is T => row !== undefined),
    [selectionList, rowById],
  );

  const setPage = React.useCallback((next: number) => setPageState(Math.max(1, next)), [setPageState]);

  const toggleSort = React.useCallback(
    (id: string, multi = false) => {
      const column = columnsById.get(id);
      if (!column) return;
      const first = column.sortDescFirst ?? false;
      setSortingState((current) => {
        const existing = current.find((rule) => rule.id === id);
        // Off → first direction → the other → off.
        const step = (): DataTableSort | null =>
          !existing ? { id, desc: first } : existing.desc === first ? { id, desc: !first } : null;
        const next = step();
        if (!multi) return next ? [next] : [];
        if (!existing) return [...current, next!];
        return next ? current.map((rule) => (rule.id === id ? next : rule)) : current.filter((rule) => rule.id !== id);
      });
      setPageState(1);
    },
    [columnsById, setSortingState, setPageState],
  );

  const getSort = React.useCallback(
    (id: string) => {
      const index = sorting.findIndex((rule) => rule.id === id);
      return index === -1 ? null : { desc: sorting[index].desc, priority: index + 1 };
    },
    [sorting],
  );

  const setGlobalFilter = React.useCallback(
    (value: string) => {
      setGlobalFilterState(value);
      setPageState(1);
    },
    [setGlobalFilterState, setPageState],
  );

  const setColumnFilter = React.useCallback(
    (id: string, value: DataTableFilterValue | undefined) => {
      setColumnFiltersState((current) => {
        const next = { ...current };
        if (value === undefined || (Array.isArray(value) ? value.length === 0 : value === "")) delete next[id];
        else next[id] = value;
        return next;
      });
      setPageState(1);
    },
    [setColumnFiltersState, setPageState],
  );

  const resetFilters = React.useCallback(() => {
    setGlobalFilterState("");
    setColumnFiltersState({});
    setPageState(1);
  }, [setGlobalFilterState, setColumnFiltersState, setPageState]);

  /** Ticks or unticks a row. With `range`, everything between it and the last row ticked follows. */
  const toggleRow = React.useCallback(
    (id: string, checked: boolean, range = false) => {
      setSelectionList((current) => {
        const next = new Set(current);
        let ids = [id];
        const from = anchor.current;
        if (range && from && from !== id) {
          const a = ordered.findIndex((entry) => entry.id === from);
          const b = ordered.findIndex((entry) => entry.id === id);
          if (a !== -1 && b !== -1) ids = ordered.slice(Math.min(a, b), Math.max(a, b) + 1).map((entry) => entry.id);
        }
        for (const target of ids) {
          if (checked) next.add(target);
          else next.delete(target);
        }
        return Array.from(next);
      });
      anchor.current = id;
    },
    [ordered, setSelectionList],
  );

  const setRowsSelected = React.useCallback(
    (ids: string[], checked: boolean) =>
      setSelectionList((current) => {
        const next = new Set(current);
        for (const id of ids) {
          if (checked) next.add(id);
          else next.delete(id);
        }
        return Array.from(next);
      }),
    [setSelectionList],
  );

  const clearSelection = React.useCallback(() => setSelectionList([]), [setSelectionList]);

  const toggleColumnVisibility = React.useCallback(
    (id: string, visible?: boolean) =>
      setColumnVisibility((current) => ({ ...current, [id]: visible ?? current[id] === false })),
    [setColumnVisibility],
  );

  return {
    columns: visibleColumns,
    allColumns: columns,
    /** Rows on the current page, or loaded so far. */
    rows: pageRows,
    /** Every row that passes the filters, sorted. */
    filteredRows: ordered,
    total: data.length,
    query,
    sorting,
    setSorting: setSortingState,
    toggleSort,
    getSort,
    globalFilter,
    setGlobalFilter,
    columnFilters,
    setColumnFilter,
    resetFilters,
    isFiltered: query !== "" || Object.keys(columnFilters).length > 0,
    selection,
    selectedRows,
    isSelected: (id: string) => selection.has(id),
    toggleRow,
    setRowsSelected,
    clearSelection,
    page,
    pageCount,
    pageSize: size,
    setPage,
    setPageSize: (next: number) => {
      setPageSizeState(next);
      setPageState(1);
    },
    canLoadMore: pagination === "load-more" && pageRows.length < ordered.length,
    loadMore: () => setPageState(page + 1),
    columnVisibility,
    toggleColumnVisibility,
    density,
    setDensity,
    getValue: readValue,
  };
}

export type DataTableInstance<T> = ReturnType<typeof useDataTable<T>>;

/* -------------------------------------------------------------------------------------------------
 * DataTable
 * -----------------------------------------------------------------------------------------------*/

export interface DataTableProps<T>
  extends UseDataTableOptions<T>,
    Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "onChange"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Accessible name for the table. Use this or `caption`. */
  label?: string;
  caption?: React.ReactNode;
  /** Shows the search field. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Extra controls at the end of the toolbar. */
  toolbar?: React.ReactNode;
  /** Hides the toolbar entirely. */
  hideToolbar?: boolean;
  /** Adds a checkbox column. Shift-click ticks a range. */
  selectable?: boolean;
  /** Bulk actions, shown in the toolbar while rows are selected. */
  selectionActions?: (rows: T[], clear: () => void) => React.ReactNode;
  onRowClick?: (row: T) => void;
  /** Makes each row a link: the row header cell gets an anchor that covers the row. */
  getRowHref?: (row: T) => string;
  /** Names a row for its checkbox. Defaults to the row header's text. */
  getRowLabel?: (row: T) => string;
  loading?: boolean;
  /** Shown when there's no data at all. Filtered-out results get their own message with a reset. */
  emptyState?: React.ReactNode;
  stickyHeader?: boolean;
  /** Caps the table's height so the body scrolls under the sticky header. */
  maxHeight?: number | string;
  /** Adds a rows-per-page menu to the footer. */
  pageSizeOptions?: number[];
  /** Singular and plural nouns for counts, e.g. `["invoice", "invoices"]`. */
  noun?: [string, string];
}

function FacetFilter<T>({
  column,
  data,
  value,
  onChange,
}: {
  column: DataTableColumn<T>;
  data: T[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  const counts = React.useMemo(() => {
    const map = new Map<string, number>();
    for (const row of data) {
      const raw = readValue(row, column);
      for (const v of Array.isArray(raw) ? raw : [raw]) {
        if (isBlank(v)) continue;
        map.set(String(v), (map.get(String(v)) ?? 0) + 1);
      }
    }
    return map;
  }, [data, column]);

  const options = column.filterOptions ?? Array.from(counts.keys()).sort(collator.compare).map((v) => ({ value: v, label: v }));
  const name = columnName(column);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`${name} filter${value.length ? `, ${value.length} selected` : ""}`}
          className={cn(
            "border border-dashed border-white/15 text-white/70",
            value.length > 0 && "border-solid border-[rgb(var(--neon)/0.45)] text-white/90",
          )}
        >
          {name}
          {value.length > 0 && (
            <span className="-mr-1 flex items-center gap-1.5 border-l border-white/10 pl-2 tabular-nums">
              {value.length <= 2
                ? options
                    .filter((o) => value.includes(o.value))
                    .map((o) => (
                      <span key={o.value} className="text-[rgb(var(--neon))]">
                        {o.label ?? o.value}
                      </span>
                    ))
                : <span className="text-[rgb(var(--neon))]">{value.length} selected</span>}
            </span>
          )}
          <ChevronDown aria-hidden className="text-white/40" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-48">
        <DropdownMenuLabel>{name}</DropdownMenuLabel>
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={value.includes(option.value)}
            onCheckedChange={(checked) =>
              onChange(checked ? [...value, option.value] : value.filter((v) => v !== option.value))
            }
            onSelect={(event) => event.preventDefault()}
            shortcut={<span className="tabular-nums">{numberFormat.format(counts.get(option.value) ?? 0)}</span>}
          >
            {option.label ?? option.value}
          </DropdownMenuCheckboxItem>
        ))}
        {value.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onChange([])}>Clear filter</DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const SKELETON_WIDTHS = ["w-28", "w-16", "w-36", "w-20", "w-24", "w-12"];

function DataTableInner<T>(
  {
    className,
    style,
    color,
    label,
    caption,
    searchable = true,
    searchPlaceholder = "Search…",
    toolbar,
    hideToolbar = false,
    selectable = false,
    selectionActions,
    onRowClick,
    getRowHref,
    getRowLabel,
    loading = false,
    emptyState,
    stickyHeader = true,
    maxHeight,
    pageSizeOptions,
    noun = ["row", "rows"],
    // Table state, handed to the hook.
    data,
    columns,
    getRowId,
    sorting,
    defaultSorting,
    onSortingChange,
    globalFilter,
    defaultGlobalFilter,
    onGlobalFilterChange,
    columnFilters,
    defaultColumnFilters,
    onColumnFiltersChange,
    selection,
    defaultSelection,
    onSelectionChange,
    page,
    defaultPage,
    onPageChange,
    pageSize,
    defaultPageSize,
    onPageSizeChange,
    columnVisibility,
    defaultColumnVisibility,
    onColumnVisibilityChange,
    density,
    defaultDensity,
    onDensityChange,
    pagination = "pages",
    ...props
  }: DataTableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  const table = useDataTable({
    data,
    columns,
    getRowId,
    sorting,
    defaultSorting,
    onSortingChange,
    globalFilter,
    defaultGlobalFilter,
    onGlobalFilterChange,
    columnFilters,
    defaultColumnFilters,
    onColumnFiltersChange,
    selection,
    defaultSelection,
    onSelectionChange,
    page,
    defaultPage,
    onPageChange,
    pageSize,
    defaultPageSize,
    onPageSizeChange,
    columnVisibility,
    defaultColumnVisibility,
    onColumnVisibilityChange,
    density,
    defaultDensity,
    onDensityChange,
    pagination,
  });

  const shift = React.useRef(false);
  const [one, many] = noun;
  const plural = (n: number) => `${numberFormat.format(n)} ${n === 1 ? one : many}`;
  const visible = table.columns;
  const headerColumn = visible.find((c) => c.rowHeader) ?? visible[0];
  const colSpan = visible.length + (selectable ? 1 : 0);
  const compact = table.density === "compact";
  const pageIds = table.rows.map((entry) => entry.id);
  const selectedOnPage = pageIds.filter((id) => table.selection.has(id)).length;
  const allOnPage = pageIds.length > 0 && selectedOnPage === pageIds.length;
  const selectedVisible = React.useMemo(
    () => table.filteredRows.reduce((n, entry) => n + (table.selection.has(entry.id) ? 1 : 0), 0),
    [table.filteredRows, table.selection],
  );
  const allFiltered = table.filteredRows.length > 0 && selectedVisible === table.filteredRows.length;
  const hiddenSelected = table.selection.size - selectedVisible;
  const filterColumns = table.allColumns.filter((c) => c.filter);
  const hideable = table.allColumns.filter((c) => c.hideable !== false);

  const rowLabel = (row: T, index: number) => {
    if (getRowLabel) return getRowLabel(row);
    const text = headerColumn ? textOf(row, headerColumn) : "";
    return text || `row ${index + 1}`;
  };

  // Shift arrives on the pointer or key event; the checkbox only reports checked.
  const trackShift = {
    onMouseDown: (event: React.MouseEvent) => {
      shift.current = event.shiftKey;
      // Keeps shift-click from selecting the text between the two rows.
      if (event.shiftKey) event.preventDefault();
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      shift.current = event.shiftKey;
    },
  };

  function renderCell(column: DataTableColumn<T>, row: T, index: number, id: string) {
    const value = readValue(row, column);
    const highlight = (text: string) => <Highlight text={text} query={table.query} />;
    let content: React.ReactNode = column.cell
      ? column.cell({ row, value, index, highlight })
      : isBlank(value)
        ? <span className="text-white/30">—</span>
        : highlight(textOf(row, column));

    const isHeader = column === headerColumn && (column.rowHeader || getRowHref);
    if (getRowHref && column === headerColumn) {
      content = (
        <a
          href={getRowHref(row)}
          className={cn(
            "outline-none after:absolute after:inset-0 after:content-['']",
            "focus-visible:after:shadow-[inset_0_0_0_2px_rgb(var(--neon)/0.6)]",
          )}
        >
          {content}
        </a>
      );
    }
    // Cells stay on one line; on narrow screens the table scrolls sideways instead of growing tall.
    const cellClass = cn("whitespace-nowrap", column.align === "right" && "tabular-nums");
    return isHeader && column.rowHeader ? (
      <TableHead key={column.id} align={column.align} className={cn("font-medium", cellClass)} data-row-id={id}>
        {content}
      </TableHead>
    ) : (
      <TableCell key={column.id} align={column.align} className={cn(column === headerColumn && "font-medium text-white/90", cellClass)}>
        {content}
      </TableCell>
    );
  }

  const start = table.rows.length ? (pagination === "pages" ? (table.page - 1) * table.pageSize + 1 : 1) : 0;
  const end = pagination === "pages" ? start + table.rows.length - (table.rows.length ? 1 : 0) : table.rows.length;

  return (
    <div
      ref={ref}
      style={neonVars(color, { ...(maxHeight !== undefined && { "--nk-dt-max-h": typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight }), ...style } as React.CSSProperties)}
      className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid min-w-0 gap-3", className)}
      {...props}
    >
      {!hideToolbar && (
        <div className="flex flex-wrap items-center gap-2">
          {searchable && (
            <Input
              size="sm"
              type="search"
              aria-label={`Search ${many}`}
              placeholder={searchPlaceholder}
              value={table.globalFilter}
              onChange={(event) => table.setGlobalFilter(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape" && table.globalFilter) {
                  event.preventDefault();
                  table.setGlobalFilter("");
                }
              }}
              leading={<Search aria-hidden />}
              trailing={
                table.globalFilter ? (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => table.setGlobalFilter("")}
                    className="-mr-1 grid size-5 cursor-pointer place-items-center rounded-md text-white/50 outline-none hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] [&_svg]:size-3.5"
                  >
                    <X aria-hidden />
                  </button>
                ) : undefined
              }
              containerClassName="w-full sm:w-64"
            />
          )}
          {filterColumns.map((column) =>
            column.filter === "select" ? (
              <FacetFilter
                key={column.id}
                column={column}
                data={data}
                value={(table.columnFilters[column.id] as string[] | undefined) ?? []}
                onChange={(value) => table.setColumnFilter(column.id, value)}
              />
            ) : (
              <Input
                key={column.id}
                size="sm"
                aria-label={`Filter by ${columnName(column).toLowerCase()}`}
                placeholder={`${columnName(column)}…`}
                value={(table.columnFilters[column.id] as string | undefined) ?? ""}
                onChange={(event) => table.setColumnFilter(column.id, event.target.value)}
                containerClassName="w-36"
              />
            ),
          )}
          {table.isFiltered && (
            <Button variant="ghost" size="sm" onClick={table.resetFilters} className="text-white/55">
              Reset
            </Button>
          )}
          <div className="ml-auto flex items-center gap-2">
            {selectable && table.selection.size > 0 && selectionActions?.(table.selectedRows, table.clearSelection)}
            {toolbar}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="border border-white/10 text-white/70">
                  <SlidersHorizontal aria-hidden />
                  View
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-48">
                {hideable.length > 0 && (
                  <>
                    <DropdownMenuLabel>Columns</DropdownMenuLabel>
                    {hideable.map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={table.columnVisibility[column.id] !== false}
                        // Keep at least one column on screen.
                        disabled={table.columnVisibility[column.id] !== false && visible.length === 1}
                        onCheckedChange={(checked) => table.toggleColumnVisibility(column.id, checked)}
                        onSelect={(event) => event.preventDefault()}
                      >
                        {columnName(column)}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuLabel>Density</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={table.density} onValueChange={(value) => table.setDensity(value as DataTableDensity)}>
                  <DropdownMenuRadioItem value="normal" onSelect={(event) => event.preventDefault()}>
                    Comfortable
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="compact" onSelect={(event) => event.preventDefault()}>
                    Compact
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      <Table
        aria-label={label}
        aria-busy={loading || undefined}
        aria-rowcount={loading ? undefined : table.filteredRows.length + 1}
        stickyHeader={stickyHeader}
        density={table.density}
        containerClassName={cn(maxHeight !== undefined && "max-h-[var(--nk-dt-max-h)]")}
      >
        {caption && <TableCaption>{caption}</TableCaption>}
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className={cn("w-10", compact ? "pl-3 pr-0" : "pl-4 pr-0")}>
                <Checkbox
                  size="sm"
                  aria-label={`Select all ${many} on this page`}
                  checked={allOnPage}
                  indeterminate={selectedOnPage > 0 && !allOnPage}
                  disabled={loading || pageIds.length === 0}
                  onCheckedChange={() => table.setRowsSelected(pageIds, !allOnPage)}
                  className="align-middle"
                />
              </TableHead>
            )}
            {visible.map((column) => {
              const sort = table.getSort(column.id);
              const secondary = sort !== null && sort.priority > 1;
              const align = column.align ?? "left";
              return (
                <TableHead
                  key={column.id}
                  align={align}
                  style={column.width !== undefined ? { width: column.width } : undefined}
                  sortDirection={sort ? (sort.desc ? "desc" : "asc") : false}
                  onSort={column.sortable ? () => table.toggleSort(column.id, shift.current) : undefined}
                  // Only the first sort key is announced as the sort; the rest say their priority.
                  aria-sort={secondary ? undefined : sort ? (sort.desc ? "descending" : "ascending") : undefined}
                  onClickCapture={(event: React.MouseEvent) => {
                    shift.current = event.shiftKey || (event.detail === 0 && shift.current);
                  }}
                  onKeyDownCapture={(event: React.KeyboardEvent) => {
                    shift.current = event.shiftKey;
                  }}
                  className={cn(!stickyHeader && "relative")}
                >
                  {column.header}
                  {sort && table.sorting.length > 1 && (
                    <span className="text-[11px] font-medium tabular-nums text-[rgb(var(--neon))]" aria-hidden>
                      {sort.priority}
                    </span>
                  )}
                  {secondary && (
                    <span className="sr-only">
                      , then {sort.desc ? "descending" : "ascending"}, sort {sort.priority}
                    </span>
                  )}
                  {column.sortable && (
                    // The lit tube under a sorted header. Dimmer for the keys after the first.
                    <span
                      aria-hidden
                      className={cn(
                        "pointer-events-none absolute -bottom-px h-[2px] w-5 rounded-full bg-[rgb(var(--neon))]",
                        "transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                        align === "right" ? (compact ? "right-3 origin-right" : "right-4 origin-right") : compact ? "left-3 origin-left" : "left-4 origin-left",
                        align === "center" && "left-1/2 -ml-2.5 origin-center",
                        sort ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0",
                        sort && !secondary
                          ? "shadow-[0_0_2px_rgb(var(--neon)),0_0_8px_rgb(var(--neon)/0.9),0_0_18px_rgb(var(--neon)/0.5)]"
                          : "opacity-45",
                        !sort && "opacity-0",
                      )}
                    />
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: Math.min(table.pageSize, 8) }, (_, r) => (
              <TableRow key={`skeleton-${r}`} aria-hidden>
                {selectable && (
                  <TableCell className={cn("w-10", compact ? "pl-3 pr-0" : "pl-4 pr-0")}>
                    <Skeleton className="size-4 rounded-[5px]" />
                  </TableCell>
                )}
                {visible.map((column, c) => (
                  <TableCell key={column.id} align={column.align}>
                    <Skeleton
                      variant="text"
                      className={cn(
                        SKELETON_WIDTHS[(r * 3 + c * 2) % SKELETON_WIDTHS.length],
                        column.align === "right" && "ml-auto",
                        column.align === "center" && "mx-auto",
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.rows.length === 0 ? (
            // A plain row: the empty state shouldn't get the hover beam.
            <tr>
              <TableCell colSpan={colSpan} className="h-44 text-center">
                {table.isFiltered ? (
                  <div className="grid justify-items-center gap-3">
                    <p className="text-sm text-white/70">
                      No {many} match
                      {table.query ? (
                        <>
                          {" "}
                          <span className="text-white/90">“{table.globalFilter.trim()}”</span>
                        </>
                      ) : (
                        " these filters"
                      )}
                      .
                    </p>
                    <Button variant="ghost" size="sm" onClick={table.resetFilters} className="border border-white/10">
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  (emptyState ?? <p className="text-sm text-white/55">No {many} yet.</p>)
                )}
              </TableCell>
            </tr>
          ) : (
            table.rows.map(({ id, row, index }) => {
              const checked = table.selection.has(id);
              const clickable = Boolean(onRowClick) && !getRowHref;
              return (
                <TableRow
                  key={id}
                  aria-rowindex={index + 2}
                  selected={selectable ? checked : undefined}
                  interactive={clickable || Boolean(getRowHref)}
                  tabIndex={clickable ? 0 : undefined}
                  onClick={
                    clickable
                      ? (event) => {
                          if ((event.target as HTMLElement).closest("a,button,input,label,select,textarea,[role=menuitem]")) return;
                          onRowClick?.(row);
                        }
                      : undefined
                  }
                  onKeyDown={
                    clickable
                      ? (event) => {
                          if (event.target !== event.currentTarget) return;
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onRowClick?.(row);
                          }
                        }
                      : undefined
                  }
                >
                  {selectable && (
                    <TableCell className={cn("relative z-[1] w-10", compact ? "pl-3 pr-0" : "pl-4 pr-0")} {...trackShift}>
                      <Checkbox
                        size="sm"
                        aria-label={`Select ${rowLabel(row, index)}`}
                        checked={checked}
                        onCheckedChange={(next) => {
                          table.toggleRow(id, next, shift.current);
                          shift.current = false;
                        }}
                        className="align-middle"
                      />
                    </TableCell>
                  )}
                  {visible.map((column) => renderCell(column, row, index, id))}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1">
        <p className="text-[13px] leading-5 text-white/55">
          {loading ? (
            "Loading…"
          ) : selectable && table.selection.size > 0 ? (
            <>
              {hiddenSelected > 0 ? (
                <>
                  <span className="tabular-nums text-white/90">{numberFormat.format(table.selection.size)}</span> selected,{" "}
                  <span className="tabular-nums">{numberFormat.format(hiddenSelected)}</span> hidden by filters
                </>
              ) : (
                <>
                  <span className="tabular-nums text-white/90">{numberFormat.format(table.selection.size)}</span> of{" "}
                  <span className="tabular-nums">{plural(table.filteredRows.length)}</span> selected
                </>
              )}
              {allOnPage && !allFiltered && table.filteredRows.length > pageIds.length ? (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={() => table.setRowsSelected(table.filteredRows.map((entry) => entry.id), true)}
                    className="cursor-pointer rounded-md text-[rgb(var(--neon))] underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                  >
                    Select all {numberFormat.format(table.filteredRows.length)}
                  </button>
                </>
              ) : (
                <>
                  {" · "}
                  <button
                    type="button"
                    onClick={table.clearSelection}
                    className="cursor-pointer rounded-md text-white/70 underline-offset-4 outline-none hover:text-white/90 hover:underline focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                  >
                    Clear
                  </button>
                </>
              )}
            </>
          ) : table.filteredRows.length === 0 ? (
            table.isFiltered ? `0 of ${plural(table.total)}` : plural(0)
          ) : (
            <span className="tabular-nums">
              {numberFormat.format(start)}–{numberFormat.format(end)} of {numberFormat.format(table.filteredRows.length)}
              {table.isFiltered && <span className="text-white/40"> · filtered from {numberFormat.format(table.total)}</span>}
            </span>
          )}
        </p>

        <div className="flex items-center gap-3">
          {pageSizeOptions && pagination !== "none" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-white/60">
                  <span className="tabular-nums">{table.pageSize}</span> per page
                  <ChevronDown aria-hidden className="text-white/40" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuRadioGroup value={String(table.pageSize)} onValueChange={(value) => table.setPageSize(Number(value))}>
                  {pageSizeOptions.map((option) => (
                    <DropdownMenuRadioItem key={option} value={String(option)}>
                      <span className="tabular-nums">{option}</span> per page
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {pagination === "pages" && table.pageCount > 1 && (
            <Pagination size="sm" pageCount={table.pageCount} page={table.page} onPageChange={table.setPage} aria-label={`${label ?? "Table"} pages`} />
          )}
          {pagination === "load-more" && table.canLoadMore && (
            <Button variant="ghost" size="sm" onClick={table.loadMore} className="border border-white/10">
              Show {Math.min(table.pageSize, table.filteredRows.length - table.rows.length)} more
              <span className="tabular-nums text-white/40">
                · {numberFormat.format(table.filteredRows.length - table.rows.length)} left
              </span>
            </Button>
          )}
        </div>
      </div>

      <div aria-live="polite" className="sr-only">
        {selectable && table.selection.size > 0 ? `${plural(table.selection.size)} selected.` : ""}
      </div>
      <div aria-live="polite" className="sr-only">
        {table.isFiltered && !loading ? `${plural(table.filteredRows.length)} found.` : ""}
      </div>
    </div>
  );
}

const DataTable = React.forwardRef(DataTableInner) as (<T>(
  props: DataTableProps<T> & { ref?: React.Ref<HTMLDivElement> },
) => React.ReactElement | null) & { displayName?: string };
DataTable.displayName = "DataTable";

export { DataTable, useDataTable };
