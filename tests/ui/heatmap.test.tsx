import * as React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { Heatmap, type HeatmapDatum } from "@/components/ui/heatmap";

// Two weeks, Sun 2026-10-04 to Sat 2026-10-17.
const DATA: HeatmapDatum[] = [
  { date: "2026-10-05", value: 2 },
  { date: "2026-10-06", value: 8 },
  { date: "2026-10-06", value: 4 },
  { date: "2026-10-14", value: 1 },
];

const grid = () => screen.getByRole("grid");
const cell = (name: string | RegExp) => screen.getByRole("gridcell", { name });
const focused = () => document.activeElement?.getAttribute("aria-label");

describe("Heatmap calendar", () => {
  it("lays out weeks by day, sums dates, and names each cell", () => {
    render(<Heatmap data={DATA} start="2026-10-04" end="2026-10-17" unit={["deploy", "deploys"]} />);
    expect(grid()).toHaveAccessibleName("Activity by day");
    expect(screen.getAllByRole("row")).toHaveLength(7); // one per day; the month labels are presentational
    expect(screen.getAllByRole("gridcell")).toHaveLength(14);
    expect(cell("12 deploys, Tue, Oct 6, 2026")).toHaveAttribute("data-level", "4");
    expect(cell("2 deploys, Mon, Oct 5, 2026")).toHaveAttribute("data-level", "1");
    expect(cell("1 deploy, Wed, Oct 14, 2026")).toBeInTheDocument();
    expect(cell("No deploys, Sun, Oct 4, 2026")).toHaveAttribute("data-level", "0");
  });

  it("pads the first week and skips days outside the range", () => {
    // Wed 2026-10-07 starts mid-week: Sun to Tue of that column stay empty and unfocusable.
    const { container } = render(<Heatmap data={DATA} start="2026-10-07" end="2026-10-10" />);
    expect(screen.getAllByRole("gridcell")).toHaveLength(4);
    expect(container.querySelectorAll("[data-empty]").length).toBe(3);
  });

  it("starts weeks on Monday when asked", () => {
    render(<Heatmap data={DATA} start="2026-10-05" end="2026-10-11" weekStart={1} />);
    const rows = screen.getAllByRole("row");
    expect(within(rows[0]).getByRole("gridcell")).toHaveAccessibleName(/Mon, Oct 5/);
  });

  it("has one tab stop on the latest day and moves by keyboard", () => {
    render(<Heatmap data={DATA} start="2026-10-04" end="2026-10-17" />);
    const stops = screen.getAllByRole("gridcell").filter((c) => c.tabIndex === 0);
    expect(stops).toHaveLength(1);
    expect(stops[0]).toHaveAccessibleName(/Sat, Oct 17/);
    stops[0].focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(focused()).toMatch(/Sat, Oct 10/);
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(focused()).toMatch(/Sun, Oct 11/); // down walks into the next week
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(focused()).toMatch(/Fri, Oct 9/);
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(focused()).toMatch(/Fri, Oct 9/); // first in its row is already this week
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(focused()).toMatch(/Fri, Oct 16/);
    fireEvent.keyDown(document.activeElement!, { key: "Home", ctrlKey: true });
    expect(focused()).toMatch(/Sun, Oct 4/);
    fireEvent.keyDown(document.activeElement!, { key: "End", ctrlKey: true });
    expect(focused()).toMatch(/Sat, Oct 17/);
    expect(screen.getAllByRole("gridcell").filter((c) => c.tabIndex === 0)).toHaveLength(1);
  });

  it("shows one tooltip for the focused or hovered cell", () => {
    render(<Heatmap data={DATA} start="2026-10-04" end="2026-10-17" unit="deploy" />);
    const target = cell(/Tue, Oct 6/);
    act(() => target.focus());
    expect(document.body).toHaveTextContent("12 deploysTue, Oct 6, 2026");
    fireEvent.pointerOver(cell(/Mon, Oct 5/));
    expect(document.body).toHaveTextContent("2 deploysMon, Oct 5, 2026");
    fireEvent.blur(target, { relatedTarget: null });
    expect(document.body).not.toHaveTextContent("2 deploysMon");
  });

  it("selects only when asked, by click, Enter or Space, and clears on a second pick", () => {
    const onValueChange = vi.fn();
    const { rerender } = render(<Heatmap data={DATA} start="2026-10-04" end="2026-10-17" />);
    expect(cell(/Tue, Oct 6/)).not.toHaveAttribute("aria-selected");
    fireEvent.click(cell(/Tue, Oct 6/));
    rerender(<Heatmap data={DATA} start="2026-10-04" end="2026-10-17" onValueChange={onValueChange} />);
    fireEvent.click(cell(/Tue, Oct 6/));
    expect(onValueChange).toHaveBeenLastCalledWith("2026-10-06", expect.objectContaining({ date: "2026-10-06", value: 12, level: 4 }));
    expect(cell(/Tue, Oct 6/)).toHaveAttribute("aria-selected", "true");
    expect(cell(/Mon, Oct 5/)).toHaveAttribute("aria-selected", "false");
    cell(/Mon, Oct 5/).focus();
    fireEvent.keyDown(cell(/Mon, Oct 5/), { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith("2026-10-05", expect.anything());
    fireEvent.keyDown(cell(/Mon, Oct 5/), { key: " " });
    expect(onValueChange).toHaveBeenLastCalledWith(null, null);
  });

  it("respects a controlled value", () => {
    render(<Heatmap data={DATA} start="2026-10-04" end="2026-10-17" value="2026-10-14" onValueChange={() => {}} />);
    fireEvent.click(cell(/Tue, Oct 6/));
    expect(cell(/Wed, Oct 14/)).toHaveAttribute("aria-selected", "true");
    expect(cell(/Tue, Oct 6/)).toHaveAttribute("aria-selected", "false");
  });

  it("renders the same markup on the server and keeps model props off the DOM", () => {
    const html = renderToString(<Heatmap data={DATA} end="2026-10-17" />);
    expect(html).toBe(renderToString(<Heatmap data={DATA} end="2026-10-17" />));
    expect(html).toContain("Oct 17, 2026");
    expect(html).not.toContain("weekStart");
    const { container } = render(<Heatmap data={DATA} end="2026-10-17" id="deploys" />);
    expect(container.firstElementChild).toHaveAttribute("id", "deploys");
    expect(container.firstElementChild).not.toHaveAttribute("data");
  });

  it("draws a legend with every step", () => {
    const { container } = render(<Heatmap data={DATA} end="2026-10-17" levels={6} legendLabels={["0", "40+"]} />);
    expect(screen.getByText("40+")).toBeInTheDocument();
    expect(container.querySelectorAll(".flex [data-level]").length).toBe(7);
  });
});

describe("Heatmap matrix", () => {
  const rows = ["Mon", "Tue"];
  const columns = ["00", "01", "02"];
  const values = [
    [0, 5, null],
    [10, 2, 1],
  ];

  it("labels rows and columns and marks missing data", () => {
    render(<Heatmap aria-label="Failures" rows={rows} columns={columns} values={values} formatLabel={(r, c) => `${r} ${c}:00`} />);
    expect(grid()).toHaveAccessibleName("Failures");
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(cell("No data, Mon 02:00")).toHaveAttribute("data-null");
    expect(cell("10, Tue 00:00")).toHaveAttribute("data-level", "4");
    expect(cell("0, Mon 00:00").tabIndex).toBe(0);
  });

  it("moves in two dimensions without wrapping", () => {
    render(<Heatmap rows={rows} columns={columns} values={values} />);
    cell(/Mon, 00/).focus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(focused()).toMatch(/Mon, 00/);
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(focused()).toMatch(/Tue, 00/);
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(focused()).toMatch(/Tue, 02/);
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(focused()).toMatch(/Tue, 02/);
  });

  it("scales with max and formatValue, and takes a color", () => {
    const { container } = render(
      <Heatmap rows={rows} columns={columns} values={values} max={100} formatValue={(v) => `${v} ms`} color="amber" />,
    );
    expect(cell("10 ms, Tue, 00")).toHaveAttribute("data-level", "1");
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--neon")).toBe("251 191 36");
  });
});
