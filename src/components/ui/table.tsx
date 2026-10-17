"use client";

import * as React from "react";
import { ArrowUp } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// The row is positioned, so pseudo-elements of its first cell can span the
// whole row: ::before is the lit edge of a selected row, ::after the beam that
// crosses a hovered row. They hang off a cell because browsers wrap
// pseudo-elements of the row itself in an extra anonymous cell. The beam is 40%
// of the row and travels 150% of its own width, so it never leaves the row.
const css = `
.nk-table-row > :first-child::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  pointer-events: none;
  background: rgb(var(--neon));
  box-shadow: 0 0 2px rgb(var(--neon) / var(--neon-glow, 1)), 0 0 10px rgb(var(--neon) / calc(0.7 * var(--neon-glow, 1)));
  opacity: 0;
  transform: scaleY(0.4);
  transition: transform 220ms cubic-bezier(0.23, 1, 0.32, 1), opacity 160ms ease-out;
}
.nk-table-row[data-state="selected"] > :first-child::before { opacity: 1; transform: none; }
.nk-table-row > :first-child::after {
  content: "";
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 40%;
  pointer-events: none;
  opacity: 0;
  background:
    linear-gradient(90deg, transparent, rgb(var(--neon) / 0.5), transparent) bottom / 100% 1px no-repeat,
    linear-gradient(90deg, transparent, rgb(var(--neon) / 0.06), transparent);
}
.nk-table-row:hover > :first-child::after { animation: nk-table-beam 1.1s cubic-bezier(0.45, 0, 0.25, 1); }
@keyframes nk-table-beam {
  0% { transform: translateX(0); opacity: 0; }
  25%, 70% { opacity: 1; }
  100% { transform: translateX(150%); opacity: 0; }
}
@media (prefers-reduced-motion: reduce) {
  .nk-table-row > :first-child::before { transition: none; }
  .nk-table-row:hover > :first-child::after { animation: none; }
}
`;

const densities = {
  compact: { head: "h-9 px-3", cell: "px-3 py-2 text-[13px] leading-5", caption: "px-3 py-2.5" },
  normal: { head: "h-10 px-4", cell: "px-4 py-3 text-sm leading-5", caption: "px-4 py-3" },
} as const;

const aligns = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

type Density = keyof typeof densities;
type Align = keyof typeof aligns;
type Section = "head" | "body" | "foot";

const TableContext = React.createContext<{ density: Density; stickyHeader: boolean }>({
  density: "normal",
  stickyHeader: false,
});
const SectionContext = React.createContext<Section>("body");

export interface TableProps extends Omit<React.TableHTMLAttributes<HTMLTableElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Pins the header row while the nearest scroll container scrolls. */
  stickyHeader?: boolean;
  density?: Density;
  /** Classes for the framed scroll container around the table. */
  containerClassName?: string;
}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      containerClassName,
      color,
      stickyHeader = false,
      density = "normal",
      ...props
    },
    ref,
  ) => {
    const context = React.useMemo(() => ({ density, stickyHeader }), [density, stickyHeader]);

    return (
      <TableContext.Provider value={context}>
        <div
          data-density={density}
          style={neonVars(color)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "relative w-full overflow-auto rounded-xl border border-white/10 bg-white/[0.02]",
            containerClassName,
          )}
        >
          <style>{css}</style>
          <table
            ref={ref}
            className={cn(
              "w-full border-separate border-spacing-0 text-left tabular-nums text-white/75 [caption-side:bottom]",
              className,
            )}
            {...props}
          />
        </div>
      </TableContext.Provider>
    );
  },
);
Table.displayName = "Table";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => {
  const { density } = React.useContext(TableContext);
  return (
    <caption
      ref={ref}
      className={cn(
        "border-t border-white/[0.06] text-left text-xs leading-5 text-white/55",
        densities[density].caption,
        className,
      )}
      {...props}
    />
  );
});
TableCaption.displayName = "TableCaption";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>((props, ref) => (
  <SectionContext.Provider value="head">
    <thead ref={ref} {...props} />
  </SectionContext.Provider>
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <SectionContext.Provider value="body">
    <tbody
      ref={ref}
      className={cn("[&>tr:last-child>*]:border-b-0", className)}
      {...props}
    />
  </SectionContext.Provider>
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <SectionContext.Provider value="foot">
    <tfoot
      ref={ref}
      className={cn("bg-white/[0.02] font-medium text-white/90", className)}
      {...props}
    />
  </SectionContext.Provider>
));
TableFooter.displayName = "TableFooter";

export interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  /** Neon tint and a lit left edge. Also sets `aria-selected`. */
  selected?: boolean;
  /** Pointer cursor and a pressed state, for rows that respond to clicks. */
  interactive?: boolean;
}

const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, selected, interactive = false, ...props }, ref) => {
    const section = React.useContext(SectionContext);
    const body = section === "body";

    return (
      <tr
        ref={ref}
        data-state={selected ? "selected" : undefined}
        aria-selected={body && selected !== undefined ? selected : undefined}
        className={cn(
          body && [
            "nk-table-row relative transition-colors duration-150 ease-out",
            selected
              ? "bg-[rgb(var(--neon)/0.06)] hover:bg-[rgb(var(--neon)/0.08)]"
              : "hover:bg-white/[0.025]",
            interactive &&
              "cursor-pointer active:bg-white/[0.04] focus-visible:[outline:2px_solid_rgb(var(--neon)/0.6)] focus-visible:[outline-offset:-2px]",
          ],
          className,
        )}
        {...props}
      />
    );
  },
);
TableRow.displayName = "TableRow";

export interface TableHeadProps
  extends Omit<React.ThHTMLAttributes<HTMLTableCellElement>, "align"> {
  /** Current sort of this column. Sets `aria-sort` and points the arrow. */
  sortDirection?: "asc" | "desc" | false;
  /** Makes the header a sort button. Work out the next direction in your handler. */
  onSort?: () => void;
  align?: Align;
}

const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, sortDirection = false, onSort, align = "left", children, ...props }, ref) => {
    const { density, stickyHeader } = React.useContext(TableContext);
    const section = React.useContext(SectionContext);
    const head = section === "head";
    const sorted = sortDirection === "asc" || sortDirection === "desc";

    return (
      <th
        ref={ref}
        scope={head ? "col" : "row"}
        aria-sort={
          sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : undefined
        }
        className={cn(
          "whitespace-nowrap align-middle font-medium",
          aligns[align],
          head
            ? cn(
                "border-b border-white/10 text-xs text-white/50",
                densities[density].head,
                stickyHeader
                  ? "sticky top-0 z-10 bg-[#0e0f14] shadow-[0_8px_16px_-10px_rgb(0_0_0/0.9)]"
                  : "bg-white/[0.02]",
              )
            : cn(
                "border-b border-white/[0.06] text-white/90",
                densities[density].cell,
                section === "foot" && "border-b-0 border-t border-t-white/10",
              ),
          className,
        )}
        {...props}
      >
        {onSort ? (
          <button
            type="button"
            onClick={onSort}
            className={cn(
              "group/sort -mx-2 inline-flex h-7 cursor-pointer select-none items-center gap-1.5 rounded-md px-2 font-medium outline-none",
              "transition-colors duration-150 ease-out hover:bg-white/[0.04] hover:text-white/85",
              "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
              align === "right" && "flex-row-reverse",
              sorted && "text-white/90",
            )}
          >
            {children}
            <ArrowUp
              aria-hidden
              strokeWidth={2.25}
              className={cn(
                "size-3.5 shrink-0",
                "transition-[transform,rotate,opacity,color,filter] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                sorted
                  ? "text-[rgb(var(--neon))] opacity-100 [filter:drop-shadow(0_0_4px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1))))]"
                  : "opacity-0 group-hover/sort:opacity-50 group-focus-visible/sort:opacity-50",
                sortDirection === "desc" && "rotate-180",
              )}
            />
          </button>
        ) : (
          children
        )}
      </th>
    );
  },
);
TableHead.displayName = "TableHead";

export interface TableCellProps
  extends Omit<React.TdHTMLAttributes<HTMLTableCellElement>, "align"> {
  align?: Align;
}

const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, align = "left", ...props }, ref) => {
    const { density } = React.useContext(TableContext);
    const section = React.useContext(SectionContext);

    return (
      <td
        ref={ref}
        className={cn(
          "align-middle",
          densities[density].cell,
          aligns[align],
          section === "foot" ? "border-t border-white/10" : "border-b border-white/[0.06]",
          className,
        )}
        {...props}
      />
    );
  },
);
TableCell.displayName = "TableCell";

export {
  Table,
  TableCaption,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
};
