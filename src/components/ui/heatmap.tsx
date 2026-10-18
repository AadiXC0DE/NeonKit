"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Only the two brightest steps throw light, and it's static: nothing here repaints per frame.
const css = `
.nk-heat-cell { background-color: rgb(var(--neon) / var(--nk-a)); border-radius: var(--nk-heat-r, 2.5px); outline: 0 solid transparent; outline-offset: 1px; }
.nk-heat-cell[data-level="0"] { background-color: rgb(255 255 255 / 0.04); box-shadow: inset 0 0 0 1px rgb(255 255 255 / 0.025); }
.nk-heat-cell[data-hot] { box-shadow: 0 0 5px rgb(var(--neon) / calc(0.3 * var(--neon-glow, 1))); }
.nk-heat-cell[data-top] { background-color: color-mix(in srgb, rgb(var(--neon)) 78%, white); box-shadow: 0 0 2px rgb(var(--neon) / calc(0.7 * var(--neon-glow, 1))), 0 0 8px rgb(var(--neon) / calc(0.45 * var(--neon-glow, 1))); }
.nk-heat-cell[data-empty] { background-color: transparent; box-shadow: none; }
.nk-heat-cell[data-null] { background: repeating-linear-gradient(135deg, rgb(255 255 255 / 0.07) 0 1px, transparent 1px 4px); }
.nk-heat-cell[data-key]:hover { outline: 1px solid rgb(255 255 255 / 0.55); }
.nk-heat-cell:focus-visible { outline: 2px solid rgb(var(--neon) / 0.9); }
.nk-heat-cell[aria-selected="true"] { outline: 1.5px solid rgb(255 255 255 / 0.95); outline-offset: 1.5px; }
`;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY = 86_400_000;

/** Days since 1970-01-01 for a `YYYY-MM-DD` string, read as UTC so server and browser agree. */
function toDay(date: string) {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  return Math.floor(Date.UTC(y, (m || 1) - 1, d || 1) / DAY);
}

function fromDay(day: number) {
  const date = new Date(day * DAY);
  return { y: date.getUTCFullYear(), m: date.getUTCMonth(), d: date.getUTCDate(), dow: date.getUTCDay() };
}

function isoDay(day: number) {
  const { y, m, d } = fromDay(day);
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function defaultFormatDate(date: string) {
  const { y, m, d, dow } = fromDay(toDay(date));
  return `${WEEKDAYS[dow]}, ${MONTHS[m]} ${d}, ${y}`;
}

const numberFormat = new Intl.NumberFormat("en-US");

// Each row is a subgrid of the grid, so every row shares one label column and one set of tracks.
const ROW: React.CSSProperties = { display: "grid", gridColumn: "1 / -1", gridTemplateColumns: "subgrid" };

export interface HeatmapDatum {
  /** `YYYY-MM-DD`. Several entries on one date add up. */
  date: string;
  value: number;
}

export interface HeatmapCell {
  /** The date (`YYYY-MM-DD`) in a calendar, `row:column` in a matrix. */
  key: string;
  value: number | null;
  /** 0 is unlit; `levels` is the brightest. */
  level: number;
  date?: string;
  row?: string;
  column?: string;
}

interface CommonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue"> {
  /** Lit steps above zero. */
  levels?: number;
  /** The value that lights the top step. Defaults to the largest value. */
  max?: number;
  /** Largest cell size in px. Cells shrink to fit, down to `minCellSize`, then the grid scrolls. */
  cellSize?: number;
  /** Smallest cell size in px before the grid scrolls. 8 for a calendar; 16 for a matrix, so its column labels fit. */
  minCellSize?: number;
  /** Space between cells in px. */
  gap?: number;
  /** What a value counts, for the tooltip and screen readers: `"deploy"` or `["deploy", "deploys"]`. */
  unit?: string | [string, string];
  /** Replaces the value text, e.g. `(v) => \`${v} ms\``. */
  formatValue?: (value: number) => string;
  /** Shows "Less ▢▢▢▢ More" under the grid. */
  legend?: boolean;
  legendLabels?: [React.ReactNode, React.ReactNode];
  /** Left of the legend: a total, a caption, a link. */
  footer?: React.ReactNode;
  /** The selected cell's key. Clicking or pressing Enter selects; again clears. */
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (key: string | null, cell: HeatmapCell | null) => void;
  /** Palette name or hex. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

export interface HeatmapCalendarProps extends CommonProps {
  data: HeatmapDatum[];
  /** First day shown. Defaults to 52 weeks before `end`. */
  start?: string;
  /** Last day shown. Defaults to the latest date in `data`. Pass it for an SSR-stable "today". */
  end?: string;
  /** 0 starts weeks on Sunday, 1 on Monday. */
  weekStart?: 0 | 1;
  formatDate?: (date: string) => string;
  rows?: never;
  columns?: never;
  values?: never;
}

export interface HeatmapMatrixProps extends CommonProps {
  rows: string[];
  columns: string[];
  /** `values[row][column]`. `null` is a cell with no data. */
  values: (number | null)[][];
  /** Names a cell in its tooltip and for screen readers. Defaults to "row, column". */
  formatLabel?: (row: string, column: string) => string;
  data?: never;
}

export type HeatmapProps = HeatmapCalendarProps | HeatmapMatrixProps;

type ModelCell = (HeatmapCell & { label: string; text: string; r: number; c: number }) | null;

interface Model {
  calendar: boolean;
  rowCount: number;
  colCount: number;
  cells: ModelCell[][];
  rowLabels: string[];
  colLabels: { col: number; text: string }[];
  byKey: Map<string, NonNullable<ModelCell>>;
}

function useModel(props: HeatmapProps, levels: number): Model {
  const { unit, formatValue, max: maxProp } = props;
  const isMatrix = "values" in props && props.values !== undefined;
  const matrix = isMatrix ? (props as HeatmapMatrixProps) : null;
  const calendar = isMatrix ? null : (props as HeatmapCalendarProps);

  return React.useMemo(() => {
    const [one, many] = typeof unit === "string" ? [unit, `${unit}s`] : (unit ?? ["", ""]);
    const text = (value: number | null) => {
      if (value === null) return "No data";
      if (formatValue) return formatValue(value);
      if (!one) return numberFormat.format(value);
      if (value === 0) return `No ${many}`;
      return `${numberFormat.format(value)} ${value === 1 ? one : many}`;
    };
    const byKey = new Map<string, NonNullable<ModelCell>>();

    if (matrix) {
      const { rows, columns, values, formatLabel = (row: string, column: string) => `${row}, ${column}` } = matrix;
      const top = maxProp ?? Math.max(0, ...values.flat().map((v) => v ?? 0));
      const cells = rows.map((row, r) =>
        columns.map((column, c) => {
          const value = values[r]?.[c] ?? null;
          const level = value === null || value <= 0 || top <= 0 ? 0 : Math.min(levels, Math.ceil((value / top) * levels));
          const cell = { key: `${r}:${c}`, value, level, row, column, label: formatLabel(row, column), text: text(value), r, c };
          byKey.set(cell.key, cell);
          return cell;
        }),
      );
      return {
        calendar: false,
        rowCount: rows.length,
        colCount: columns.length,
        cells,
        rowLabels: rows,
        colLabels: columns.map((text, col) => ({ col, text })),
        byKey,
      };
    }

    const { data = [], start, end, weekStart = 0, formatDate = defaultFormatDate } = calendar!;
    const sums = new Map<number, number>();
    let last = -Infinity;
    for (const datum of data) {
      const day = toDay(datum.date);
      if (!Number.isFinite(day)) continue;
      sums.set(day, (sums.get(day) ?? 0) + datum.value);
      if (day > last) last = day;
    }
    const endDay = end ? toDay(end) : Number.isFinite(last) ? last : start ? toDay(start) + 364 : 0;
    const startDay = start ? toDay(start) : endDay - 364;
    const gridStart = startDay - ((fromDay(startDay).dow - weekStart + 7) % 7);
    const colCount = Math.max(1, Math.ceil((endDay - gridStart + 1) / 7));
    let top = maxProp ?? 0;
    if (maxProp === undefined) for (const [day, value] of sums) if (day >= startDay && day <= endDay && value > top) top = value;

    const cells: ModelCell[][] = Array.from({ length: 7 }, (_, r) =>
      Array.from({ length: colCount }, (_, c) => {
        const day = gridStart + c * 7 + r;
        if (day < startDay || day > endDay) return null;
        const value = sums.get(day) ?? 0;
        const level = value <= 0 || top <= 0 ? 0 : Math.min(levels, Math.ceil((value / top) * levels));
        const date = isoDay(day);
        const cell = { key: date, value, level, date, label: formatDate(date), text: text(value), r, c };
        byKey.set(date, cell);
        return cell;
      }),
    );

    // A month is labelled over the week holding its 1st; a sliver of a month at the start is skipped.
    const colLabels: { col: number; text: string }[] = [];
    for (let c = 0; c < colCount; c++) {
      for (let r = 0; r < 7; r++) {
        const day = gridStart + c * 7 + r;
        const { d, m } = fromDay(day);
        if ((d === 1 && day >= startDay && day <= endDay) || (c === 0 && r === 0)) {
          if (colLabels.length && c - colLabels[colLabels.length - 1].col < 3) colLabels.pop();
          colLabels.push({ col: c, text: MONTHS[c === 0 && r === 0 ? fromDay(Math.max(day, startDay)).m : m] });
          break;
        }
      }
    }

    const rowLabels = Array.from({ length: 7 }, (_, r) => {
      const dow = (r + weekStart) % 7;
      return dow === 1 || dow === 3 || dow === 5 ? WEEKDAYS[dow] : "";
    });

    return { calendar: true, rowCount: 7, colCount, cells, rowLabels, colLabels, byKey };
    // Arrays are compared by identity, so pass stable ones (module constants or memoized).
  }, [matrix?.rows, matrix?.columns, matrix?.values, matrix?.formatLabel, calendar?.data, calendar?.start, calendar?.end, calendar?.weekStart, calendar?.formatDate, maxProp, unit, formatValue, levels]); // eslint-disable-line react-hooks/exhaustive-deps
}

const MODEL_KEYS = new Set(["data", "start", "end", "weekStart", "formatDate", "formatLabel", "rows", "columns", "values", "max", "unit", "formatValue"]);

const subscribe = () => () => {};
const useIsClient = () =>
  React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const Heatmap = React.forwardRef<HTMLDivElement, HeatmapProps>((props, forwardedRef) => {
  const {
    levels: levelsProp = 4,
    cellSize = 14,
    minCellSize: minCellProp,
    gap = 3,
    legend = true,
    legendLabels = ["Less", "More"],
    footer,
    value: valueProp,
    defaultValue = null,
    onValueChange,
    color,
    className,
    style,
    "aria-label": ariaLabel,
    ...rest
  } = props;
  // The model's props stay off the DOM.
  const domProps = Object.fromEntries(
    Object.entries(rest).filter(([key]) => !MODEL_KEYS.has(key)),
  ) as React.HTMLAttributes<HTMLDivElement>;

  const levels = Math.max(1, Math.round(levelsProp));
  const model = useModel(props, levels);
  const minCell = Math.min(cellSize, minCellProp ?? (model.calendar ? 8 : 16));
  const rootRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);

  const [innerValue, setInnerValue] = React.useState<string | null>(defaultValue);
  const selected = valueProp !== undefined ? valueProp : innerValue;
  // Selection is opt-in: without these props cells are read-only and say nothing about being selected.
  const selectable = onValueChange !== undefined || valueProp !== undefined || props.defaultValue !== undefined;
  const [active, setActive] = React.useState<string | null>(null);
  const [tip, setTip] = React.useState<{ key: string; element: HTMLElement } | null>(null);

  // The roving tab stop: the focused cell, else the selection, else the latest day (or the first cell).
  const fallback = React.useMemo(() => {
    const flat = model.calendar
      ? Array.from({ length: model.colCount * 7 }, (_, i) => model.cells[i % 7][Math.floor(i / 7)])
      : model.cells.flat();
    const present = flat.filter(Boolean) as NonNullable<ModelCell>[];
    return (model.calendar ? present[present.length - 1] : present[0])?.key ?? null;
  }, [model]);
  const tabStop = active && model.byKey.has(active) ? active : selected && model.byKey.has(selected) ? selected : fallback;

  // Show the most recent weeks first when a calendar has to scroll.
  useIsomorphicLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (scroller && model.calendar) scroller.scrollLeft = scroller.scrollWidth;
  }, [model.calendar]);

  const select = (key: string) => {
    const next = key === selected ? null : key;
    if (valueProp === undefined) setInnerValue(next);
    onValueChange?.(next, next ? strip(model.byKey.get(next)) : null);
  };

  const cellAt = (r: number, c: number) => model.cells[r]?.[c] ?? null;

  const move = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = (event.target as HTMLElement).dataset.key;
    const current = key ? model.byKey.get(key) : null;
    if (!current) return;
    const { r, c } = current;
    const ctrl = event.ctrlKey || event.metaKey;
    let target: ModelCell = null;
    const scan = (dr: number, dc: number, from = { r, c }) => {
      let nr = from.r + dr;
      let nc = from.c + dc;
      while (nr >= 0 && nr < model.rowCount && nc >= 0 && nc < model.colCount) {
        const cell = cellAt(nr, nc);
        if (cell) return cell;
        nr += dr;
        nc += dc;
      }
      return null;
    };
    // In a calendar, up and down walk through the days, wrapping into the next or previous week.
    const stepDay = (delta: number) => {
      let index = c * 7 + r + delta;
      while (index >= 0 && index < model.colCount * 7) {
        const cell = cellAt(index % 7, Math.floor(index / 7));
        if (cell) return cell;
        index += delta;
      }
      return null;
    };
    // Four columns over (about a month in a calendar), or as far as the row goes.
    const page = (direction: 1 | -1) => {
      for (let step = 4; step > 0; step--) {
        const cell = cellAt(r, c + step * direction);
        if (cell) return cell;
      }
      return null;
    };
    const rtl = rootRef.current ? getComputedStyle(rootRef.current).direction === "rtl" : false;
    switch (event.key) {
      case "ArrowRight":
        target = scan(0, rtl ? -1 : 1);
        break;
      case "ArrowLeft":
        target = scan(0, rtl ? 1 : -1);
        break;
      case "ArrowDown":
        target = model.calendar ? stepDay(1) : scan(1, 0);
        break;
      case "ArrowUp":
        target = model.calendar ? stepDay(-1) : scan(-1, 0);
        break;
      case "PageDown":
        target = page(1);
        break;
      case "PageUp":
        target = page(-1);
        break;
      case "Home":
        target = ctrl ? firstCell(model) : scan(0, 1, { r, c: -1 });
        break;
      case "End":
        target = ctrl ? lastCell(model) : scan(0, -1, { r, c: model.colCount });
        break;
      case "Enter":
      case " ":
        if (!selectable) return;
        event.preventDefault();
        select(current.key);
        return;
      default:
        return;
    }
    event.preventDefault();
    if (!target) return;
    rootRef.current?.querySelector<HTMLElement>(`[data-key="${target.key}"]`)?.focus();
  };

  const isClient = useIsClient();
  const cellKey = (event: React.SyntheticEvent) =>
    (event.target as HTMLElement).closest<HTMLElement>("[data-key]");

  // Hover and focus only re-render the tooltip: the grid is memoized on what it actually shows.
  const grid = React.useMemo(
    () => (
      <>
        {/* Labels only: the cells name their own dates, so this row stays out of the grid's structure. */}
        <div role="presentation" style={ROW}>
          <span aria-hidden />
          {model.colLabels.map(({ col, text }) => (
            <span
              key={`${col}-${text}`}
              aria-hidden
              style={{ gridColumn: `${col + 2} / span ${model.calendar ? 4 : 1}` }}
              className={cn(
                "self-end whitespace-nowrap pb-1 text-[11px] leading-none text-white/55",
                !model.calendar && "justify-self-center font-mono text-[10.5px] tabular-nums",
              )}
            >
              {text}
            </span>
          ))}
        </div>
        {model.cells.map((row, r) => (
          <div key={r} role="row" style={ROW}>
            <span aria-hidden className="self-center whitespace-nowrap pr-2 text-[11px] leading-none text-white/45">
              {model.rowLabels[r]}
            </span>
            {row.map((cell, c) =>
              cell ? (
                <div
                  key={cell.key}
                  role="gridcell"
                  data-key={cell.key}
                  data-level={cell.level}
                  data-top={cell.level === levels ? "" : undefined}
                  data-null={cell.value === null ? "" : undefined}
                  tabIndex={cell.key === tabStop ? 0 : -1}
                  aria-label={`${cell.text}, ${cell.label}`}
                  aria-selected={selectable ? cell.key === selected : undefined}
                  data-hot={cell.level === levels - 1 && levels > 1 ? "" : undefined}
                  style={{ "--nk-a": (0.16 + (0.84 * (cell.level - 1)) / Math.max(1, levels - 1)).toFixed(3) } as React.CSSProperties}
                  className={cn("nk-heat-cell aspect-square outline-none", selectable && "cursor-pointer")}
                />
              ) : (
                <div key={`x${r}-${c}`} aria-hidden data-empty="" className="nk-heat-cell aspect-square" />
              ),
            )}
          </div>
        ))}
      </>
    ),
    [model, levels, tabStop, selected, selectable],
  );

  const tipCell = tip ? model.byKey.get(tip.key) : undefined;

  return (
    <div
      ref={rootRef}
      style={neonVars(color, style)}
      className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid w-fit min-w-0 max-w-full gap-3", className)}
      {...domProps}
    >
      <style href="nk-heatmap" precedence="nk">{css}</style>
      <div ref={scrollerRef} className="-m-1 min-w-0 overflow-x-auto p-1 [scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]">
        <div
          role="grid"
          aria-label={ariaLabel ?? (model.calendar ? "Activity by day" : "Heatmap")}
          aria-readonly
          onPointerOver={(event) => {
            const element = cellKey(event);
            const key = element?.dataset.key;
            if (key && key !== tip?.key) setTip({ key, element });
          }}
          onPointerLeave={(event) => {
            // Back to the focused cell's tooltip, if a cell has focus.
            const focused = document.activeElement as HTMLElement | null;
            const key = focused?.dataset.key;
            setTip(key && event.currentTarget.contains(focused) ? { key, element: focused } : null);
          }}
          onFocus={(event) => {
            const element = cellKey(event);
            const key = element?.dataset.key;
            if (!key || !element) return;
            setActive(key);
            setTip({ key, element });
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setTip(null);
          }}
          onClick={(event) => {
            const key = cellKey(event)?.dataset.key;
            if (key && selectable) select(key);
          }}
          onKeyDown={move}
          style={{
            gridTemplateColumns: `auto repeat(${model.colCount}, minmax(${minCell}px, ${cellSize}px))`,
            gap,
            minWidth: `calc(${model.calendar ? 30 : 48}px + ${model.colCount} * ${minCell + gap}px)`,
          }}
          className="grid w-full justify-start"
        >
          {grid}
        </div>
      </div>

      {(legend || footer) && (
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-[12px] text-white/50">
          <div className="min-w-0">{footer}</div>
          {legend && (
            <div aria-hidden className="flex items-center gap-1.5">
              <span className="mr-1">{legendLabels[0]}</span>
              {Array.from({ length: levels + 1 }, (_, level) => (
                <span
                  key={level}
                  data-level={level}
                  data-top={level === levels ? "" : undefined}
                  style={{ "--nk-a": (0.16 + (0.84 * (level - 1)) / Math.max(1, levels - 1)).toFixed(3) } as React.CSSProperties}
                  className="nk-heat-cell size-[11px]"
                />
              ))}
              <span className="ml-1">{legendLabels[1]}</span>
            </div>
          )}
        </div>
      )}

      {isClient && tip && tipCell && <HeatTip element={tip.element} cell={tipCell} />}
    </div>
  );
});
Heatmap.displayName = "Heatmap";

function strip(cell: ModelCell | undefined): HeatmapCell | null {
  if (!cell) return null;
  const { key, value, level, date, row, column } = cell;
  return { key, value, level, ...(date ? { date } : null), ...(row !== undefined ? { row, column } : null) };
}

function firstCell(model: Model) {
  for (let c = 0; c < model.colCount; c++) for (let r = 0; r < model.rowCount; r++) if (model.cells[r][c]) return model.cells[r][c];
  return null;
}

function lastCell(model: Model) {
  for (let c = model.colCount - 1; c >= 0; c--) for (let r = model.rowCount - 1; r >= 0; r--) if (model.cells[r][c]) return model.cells[r][c];
  return null;
}

/** One tooltip for the whole grid, portaled so a scrolling or clipped parent can't cut it off. */
function HeatTip({ element, cell }: { element: HTMLElement; cell: NonNullable<ModelCell> }) {
  const ref = React.useRef<HTMLDivElement>(null);

  useIsomorphicLayoutEffect(() => {
    const tip = ref.current;
    if (!tip) return;
    // A portal leaves the grid's subtree, so carry its color across.
    const neon = getComputedStyle(element).getPropertyValue("--neon").trim();
    if (neon) tip.style.setProperty("--neon", neon);
    const place = () => {
      const rect = element.getBoundingClientRect();
      const width = tip.offsetWidth;
      const left = Math.min(Math.max(rect.left + rect.width / 2 - width / 2, 8), window.innerWidth - width - 8);
      const above = rect.top - tip.offsetHeight - 8 >= 4;
      tip.style.transform = `translate3d(${Math.round(left)}px, ${Math.round(above ? rect.top - tip.offsetHeight - 8 : rect.bottom + 8)}px, 0)`;
      tip.dataset.side = above ? "top" : "bottom";
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [element, cell]);

  return createPortal(
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none fixed left-0 top-0 z-50 whitespace-nowrap rounded-lg border border-white/10 bg-[#0a0b11] px-2.5 py-1.5 text-xs leading-4",
        "shadow-[0_8px_24px_-8px_rgb(0_0_0/0.9),0_0_16px_-6px_rgb(var(--neon)/CALC(0.4*var(--neon-glow,1)))]",
      )}
    >
      <span className="font-medium tabular-nums text-white/90">{cell.text}</span>
      <span className="ml-2 text-white/50">{cell.label}</span>
    </div>,
    document.body,
  );
}

export { Heatmap };
