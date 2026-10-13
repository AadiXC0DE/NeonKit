import * as React from "react";
import { act, fireEvent, render, renderHook, screen, within } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { DataTable, useDataTable, type DataTableColumn } from "@/components/ui/data-table";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});
afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

type Invoice = { id: string; customer: string; status: "paid" | "open"; amount: number | null };

const invoices: Invoice[] = [
  { id: "INV-1", customer: "Kestrel Health", status: "paid", amount: 300 },
  { id: "INV-2", customer: "Orbital Freight", status: "open", amount: 1200 },
  { id: "INV-3", customer: "Lumen Analytics", status: "paid", amount: null },
  { id: "INV-4", customer: "Parallel Works", status: "open", amount: 90 },
  { id: "INV-5", customer: "Kestrel Health", status: "open", amount: 5000 },
];

const columns: DataTableColumn<Invoice>[] = [
  { id: "id", header: "Invoice", accessor: "id", rowHeader: true },
  { id: "customer", header: "Customer", accessor: "customer", sortable: true },
  { id: "status", header: "Status", accessor: "status", sortable: true, filter: "select" },
  { id: "amount", header: "Amount", accessor: "amount", sortable: true, align: "right" },
];

const bodyIds = () =>
  screen
    .getAllByRole("rowheader")
    .map((cell) => cell.textContent);

function Table(props: Partial<React.ComponentProps<typeof DataTable<Invoice>>>) {
  return <DataTable label="Invoices" noun={["invoice", "invoices"]} data={invoices} columns={columns} {...props} />;
}

describe("DataTable", () => {
  it("renders a labelled table with sort buttons on sortable headers only", () => {
    render(<Table />);
    const table = screen.getByRole("table", { name: "Invoices" });
    expect(within(table).getAllByRole("columnheader")).toHaveLength(4);
    expect(within(table).getByRole("button", { name: "Customer" })).toBeInTheDocument();
    expect(within(table).queryByRole("button", { name: "Invoice" })).not.toBeInTheDocument();
    expect(bodyIds()).toEqual(["INV-1", "INV-2", "INV-3", "INV-4", "INV-5"]);
  });

  it("cycles a column through ascending, descending and off, keeping blanks last", () => {
    render(<Table />);
    const amount = () => screen.getByRole("columnheader", { name: /Amount/ });
    fireEvent.click(screen.getByRole("button", { name: "Amount" }));
    expect(amount()).toHaveAttribute("aria-sort", "ascending");
    expect(bodyIds()).toEqual(["INV-4", "INV-1", "INV-2", "INV-5", "INV-3"]);
    fireEvent.click(screen.getByRole("button", { name: "Amount" }));
    expect(amount()).toHaveAttribute("aria-sort", "descending");
    expect(bodyIds()).toEqual(["INV-5", "INV-2", "INV-1", "INV-4", "INV-3"]);
    fireEvent.click(screen.getByRole("button", { name: "Amount" }));
    expect(amount()).not.toHaveAttribute("aria-sort");
    expect(bodyIds()).toEqual(["INV-1", "INV-2", "INV-3", "INV-4", "INV-5"]);
  });

  it("adds sort keys with Shift and announces only the first as the sort", () => {
    const onSortingChange = vi.fn();
    render(<Table onSortingChange={onSortingChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Status" }));
    fireEvent.click(screen.getByRole("button", { name: /Amount/ }), { shiftKey: true });
    expect(onSortingChange).toHaveBeenLastCalledWith([
      { id: "status", desc: false },
      { id: "amount", desc: false },
    ]);
    expect(bodyIds()).toEqual(["INV-4", "INV-2", "INV-5", "INV-1", "INV-3"]);
    expect(screen.getByRole("columnheader", { name: /Status/ })).toHaveAttribute("aria-sort", "ascending");
    expect(screen.getByRole("columnheader", { name: /Amount/ })).not.toHaveAttribute("aria-sort");
    expect(screen.getByText(/then ascending, sort 2/)).toBeInTheDocument();
  });

  it("sorts from the keyboard: Shift with Enter adds a key", () => {
    const onSortingChange = vi.fn();
    render(<Table defaultSorting={[{ id: "status", desc: false }]} onSortingChange={onSortingChange} />);
    const button = screen.getByRole("button", { name: /Amount/ });
    fireEvent.keyDown(button, { key: "Enter", shiftKey: true });
    fireEvent.click(button, { detail: 0 });
    expect(onSortingChange).toHaveBeenLastCalledWith([
      { id: "status", desc: false },
      { id: "amount", desc: false },
    ]);
  });

  it("searches every column and lights the match", () => {
    render(<Table />);
    fireEvent.change(screen.getByRole("searchbox", { name: "Search invoices" }), { target: { value: "kestrel" } });
    expect(bodyIds()).toEqual(["INV-1", "INV-5"]);
    expect(screen.getAllByText("Kestrel", { selector: "mark" })).toHaveLength(2);
    expect(screen.getByText("2 invoices found.")).toBeInTheDocument();
  });

  it("filters by a column and says when nothing matches", () => {
    render(<Table defaultColumnFilters={{ status: ["open"] }} />);
    expect(bodyIds()).toEqual(["INV-2", "INV-4", "INV-5"]);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzz" } });
    expect(screen.getByText(/No invoices match/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(bodyIds()).toHaveLength(5);
  });

  it("selects rows, ranges with Shift and announces the count", () => {
    const onSelectionChange = vi.fn();
    render(<Table selectable onSelectionChange={onSelectionChange} />);
    const box = (name: string) => screen.getByRole("checkbox", { name: `Select ${name}` });
    fireEvent.click(box("INV-1"));
    const cell = box("INV-4").closest("td")!;
    fireEvent.mouseDown(cell, { shiftKey: true });
    fireEvent.click(box("INV-4"));
    expect(onSelectionChange).toHaveBeenLastCalledWith(["INV-1", "INV-2", "INV-3", "INV-4"]);
    expect(box("INV-3")).toBeChecked();
    expect(screen.getByText("4 invoices selected.")).toBeInTheDocument();
    expect(box("INV-2").closest("tr")).toHaveAttribute("data-state", "selected");
  });

  it("selects the page from the header and offers the rest", () => {
    render(<Table selectable defaultPageSize={2} />);
    const all = screen.getByRole("checkbox", { name: "Select all invoices on this page" });
    fireEvent.click(all);
    expect(all).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Select all 5" }));
    expect(screen.getByText("5 invoices selected.")).toBeInTheDocument();
  });

  it("paginates and loads more", () => {
    const { unmount } = render(<Table defaultPageSize={2} />);
    expect(bodyIds()).toEqual(["INV-1", "INV-2"]);
    fireEvent.click(screen.getAllByRole("button", { name: "Next page" })[0]);
    expect(bodyIds()).toEqual(["INV-3", "INV-4"]);
    unmount();
    render(<Table defaultPageSize={2} pagination="load-more" />);
    fireEvent.click(screen.getByRole("button", { name: /Show 2 more/ }));
    expect(bodyIds()).toHaveLength(4);
  });

  it("hides columns from columnVisibility", () => {
    render(<Table defaultColumnVisibility={{ status: false }} />);
    expect(screen.queryByRole("columnheader", { name: /Status/ })).not.toBeInTheDocument();
  });

  it("shows skeleton rows while loading", () => {
    render(<Table loading defaultPageSize={3} />);
    expect(screen.getByRole("table")).toHaveAttribute("aria-busy", "true");
    expect(screen.queryByRole("rowheader")).not.toBeInTheDocument();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("shows the empty state when there's no data", () => {
    render(<Table data={[]} emptyState={<p>No invoices yet</p>} />);
    expect(screen.getByText("No invoices yet")).toBeInTheDocument();
  });

  it("clicks rows, but not through their checkboxes", () => {
    const onRowClick = vi.fn();
    render(<Table selectable onRowClick={onRowClick} />);
    const row = screen.getByRole("rowheader", { name: "INV-2" }).closest("tr")!;
    fireEvent.click(row);
    expect(onRowClick).toHaveBeenCalledWith(invoices[1]);
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onRowClick).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole("checkbox", { name: "Select INV-2" }));
    expect(onRowClick).toHaveBeenCalledTimes(2);
  });

  it("makes rows links with getRowHref", () => {
    render(<Table getRowHref={(row) => `/invoices/${row.id}`} />);
    expect(screen.getByRole("link", { name: "INV-3" })).toHaveAttribute("href", "/invoices/INV-3");
  });

  it("applies color through --neon", () => {
    const { container } = render(<Table color="violet" />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--neon")).toBe("168 85 247");
  });
});

describe("useDataTable", () => {
  it("sorts and filters 1,000 rows and returns one page", () => {
    const data = Array.from({ length: 1000 }, (_, i) => ({ id: `r${i}`, n: (i * 7919) % 1000, name: `Row ${i}` }));
    const cols: DataTableColumn<(typeof data)[number]>[] = [
      { id: "name", header: "Name", accessor: "name" },
      { id: "n", header: "N", accessor: "n", sortable: true },
    ];
    const { result } = renderHook(() => useDataTable({ data, columns: cols, defaultPageSize: 25 }));
    expect(result.current.rows).toHaveLength(25);
    expect(result.current.pageCount).toBe(40);
    const start = performance.now();
    act(() => result.current.toggleSort("n"));
    expect(performance.now() - start).toBeLessThan(250);
    expect(result.current.rows[0].row.n).toBe(0);
    act(() => result.current.setGlobalFilter("row 99"));
    expect(result.current.filteredRows.map((r) => r.row.name)).toEqual(
      expect.arrayContaining(["Row 99", "Row 990", "Row 999"]),
    );
    expect(result.current.page).toBe(1);
  });
});
