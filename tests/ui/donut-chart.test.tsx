import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DonutChart } from "@/components/ui/donut-chart";

const data = [
  { label: "Direct", value: 600 },
  { label: "Search", value: 300 },
  { label: "Email", value: 100 },
];

describe("DonutChart", () => {
  it("summarises the data in its name and a table", () => {
    render(<DonutChart data={data} label="Sessions" animate={false} />);
    const plot = screen.getByRole("img");
    expect(plot).toHaveAccessibleName("Sessions: Direct 600 (60%), Search 300 (30%), Email 100 (10%).");
    const table = screen.getByRole("table", { name: "Sessions" });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(4);
    expect(within(rows[1]).getByRole("rowheader")).toHaveTextContent("Direct");
    expect(rows[2]).toHaveTextContent("30%");
  });

  it("shows the total in the centre", () => {
    const { container } = render(<DonutChart data={data} label="Sessions" animate={false} />);
    expect(container.textContent).toContain("1,000");
  });

  it("walks the segments with the arrow keys and announces each one", () => {
    const onActiveIndexChange = vi.fn();
    render(<DonutChart data={data} animate={false} onActiveIndexChange={onActiveIndexChange} />);
    const plot = screen.getByRole("img");
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    fireEvent.keyDown(plot, { key: "End" });
    fireEvent.keyDown(plot, { key: "ArrowRight" });
    fireEvent.keyDown(plot, { key: "ArrowLeft" });
    expect(onActiveIndexChange.mock.calls.map(([index]) => index)).toEqual([0, 1, 2, 0, 2]);
    expect(document.querySelector("[aria-live]")).toHaveTextContent("Email: 100, 10%");
    fireEvent.keyDown(plot, { key: "Escape" });
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(null);
  });

  it("lights the controlled segment and dims the rest", () => {
    const { container } = render(<DonutChart data={data} activeIndex={1} animate={false} />);
    expect(container.querySelector("[data-dim]")).not.toBeNull();
    expect(container.querySelectorAll(".nk-donut-seg[data-active]")).toHaveLength(1);
    expect(container.textContent).toContain("Search · 30%");
  });

  it("leaves what max doesn't use as an unlit remainder", () => {
    render(<DonutChart data={data} max={2000} remainderLabel="Free" animate={false} />);
    const table = screen.getByRole("table");
    expect(within(table).getByText("Free").closest("tr")).toHaveTextContent("1,00050%");
  });

  it("formats values everywhere", () => {
    render(<DonutChart data={data} formatValue={(v) => `${v} GB`} animate={false} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(/Direct 600 GB/);
  });

  it("holds the tubes undrawn until the chart is in view", () => {
    const { container } = render(<DonutChart data={data} />);
    expect(container.querySelector("[data-reveal]")).toHaveAttribute("data-reveal", "play");
  });

  it("draws a pie with one wedge per segment", () => {
    const { container } = render(<DonutChart data={data} variant="pie" animate={false} />);
    expect(container.querySelectorAll(".nk-donut-fill")).toHaveLength(3);
  });
});
