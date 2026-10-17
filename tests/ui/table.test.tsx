import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Deployments({
  sort = "desc",
  onSort = () => {},
  selected = "dpl_2",
}: {
  sort?: "asc" | "desc" | false;
  onSort?: () => void;
  selected?: string;
}) {
  return (
    <Table aria-label="Deployments" color="violet">
      <TableHeader>
        <TableRow>
          <TableHead>Commit</TableHead>
          <TableHead sortDirection={sort} onSort={onSort}>
            Created
          </TableHead>
          <TableHead align="right" onSort={() => {}}>
            Duration
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {["dpl_1", "dpl_2"].map((id) => (
          <TableRow key={id} selected={selected === id}>
            <TableHead>{id}</TableHead>
            <TableCell>4m ago</TableCell>
            <TableCell align="right">1m 12s</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

describe("Table", () => {
  it("renders semantic table elements", () => {
    render(<Deployments />);
    const table = screen.getByRole("table", { name: "Deployments" });
    expect(within(table).getAllByRole("columnheader")).toHaveLength(3);
    expect(within(table).getAllByRole("rowheader")).toHaveLength(2);
    expect(within(table).getAllByRole("row")).toHaveLength(3);
  });

  it("scopes heads to columns in the header and to rows in the body", () => {
    render(<Deployments />);
    expect(screen.getByRole("columnheader", { name: "Commit" })).toHaveAttribute("scope", "col");
    expect(screen.getByRole("rowheader", { name: "dpl_1" })).toHaveAttribute("scope", "row");
  });

  it("renders sortable heads as buttons and calls onSort", () => {
    const onSort = vi.fn();
    render(<Deployments onSort={onSort} />);
    fireEvent.click(screen.getByRole("button", { name: "Created" }));
    expect(onSort).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "Commit" })).not.toBeInTheDocument();
  });

  it("sets aria-sort only on the sorted column", () => {
    const { rerender } = render(<Deployments sort="desc" />);
    const created = screen.getByRole("columnheader", { name: "Created" });
    expect(created).toHaveAttribute("aria-sort", "descending");
    expect(screen.getByRole("columnheader", { name: "Duration" })).not.toHaveAttribute("aria-sort");
    expect(screen.getByRole("columnheader", { name: "Commit" })).not.toHaveAttribute("aria-sort");

    rerender(<Deployments sort="asc" />);
    expect(created).toHaveAttribute("aria-sort", "ascending");

    rerender(<Deployments sort={false} />);
    expect(created).not.toHaveAttribute("aria-sort");
  });

  it("marks selected rows", () => {
    render(<Deployments selected="dpl_2" />);
    const [, first, second] = screen.getAllByRole("row");
    expect(first).toHaveAttribute("aria-selected", "false");
    expect(second).toHaveAttribute("aria-selected", "true");
    expect(second).toHaveAttribute("data-state", "selected");
  });

  it("leaves aria-selected off rows that don't use selection", () => {
    render(
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>Edge requests</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(screen.getByRole("row")).not.toHaveAttribute("aria-selected");
  });

  it("names the table from its caption and renders a footer", () => {
    render(
      <Table>
        <TableCaption>Usage this billing period</TableCaption>
        <TableBody>
          <TableRow>
            <TableCell>Edge requests</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableHead>Total</TableHead>
          </TableRow>
        </TableFooter>
      </Table>,
    );
    const table = screen.getByRole("table", { name: "Usage this billing period" });
    expect(table.querySelector("tfoot")).toHaveTextContent("Total");
  });

  it("forwards the ref to the table and applies color and density to the container", () => {
    const ref = React.createRef<HTMLTableElement>();
    render(
      <Table ref={ref} color="lime" density="compact">
        <TableBody>
          <TableRow>
            <TableCell>Edge requests</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    expect(ref.current?.tagName).toBe("TABLE");
    const container = ref.current?.parentElement as HTMLElement;
    expect(container.style.getPropertyValue("--neon")).toBe("163 230 53");
    expect(container).toHaveAttribute("data-density", "compact");
  });

  it("calls row click handlers on interactive rows", () => {
    const onClick = vi.fn();
    render(
      <Table>
        <TableBody>
          <TableRow interactive onClick={onClick}>
            <TableCell>Edge requests</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    fireEvent.click(screen.getByText("Edge requests"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
