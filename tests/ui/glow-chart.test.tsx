import * as React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GlowChart, Sparkline, type GlowChartSeries } from "@/components/ui/glow-chart";

const days = [8, 9, 10].map((day) => new Date(Date.UTC(2026, 9, day)));
const visitors = [
  { x: days[0], y: 1840 },
  { x: days[1], y: 1912 },
  { x: days[2], y: 1206 },
];

const twoSeries: GlowChartSeries[] = [
  { name: "This week", data: visitors },
  { name: "Last week", data: [{ x: days[0], y: 1500 }, { x: days[2], y: 1100 }], muted: true },
];

describe("GlowChart", () => {
  it("is an image named by a summary of the data", () => {
    render(<GlowChart data={visitors} label="Unique visitors" />);
    const chart = screen.getByRole("img");
    const name = chart.getAttribute("aria-label");
    expect(name).toContain("Unique visitors.");
    expect(name).toContain("Area chart, 3 points from Thu, Oct 8 to Sat, Oct 10.");
    expect(name).toContain("Low 1,206, high 1,912, latest 1,206.");
  });

  it("lets aria-label replace the generated summary", () => {
    render(<GlowChart data={visitors} aria-label="Visitors are down 37% today" />);
    expect(screen.getByRole("img", { name: "Visitors are down 37% today" })).toBeInTheDocument();
  });

  it("renders every value in a captioned data table", () => {
    render(<GlowChart data={twoSeries} label="Visitors" yFormat={(v) => `${v} visits`} />);
    const table = screen.getByRole("table", { name: "Visitors" });
    const headers = within(table).getAllByRole("columnheader").map((th) => th.textContent);
    expect(headers).toEqual(["Date", "This week", "Last week"]);
    const rows = within(table).getAllByRole("row").slice(1);
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent("Thu, Oct 8");
    expect(rows[0]).toHaveTextContent("1840 visits");
    // Series are matched by x, so the missing point is a gap, not a shift.
    expect(rows[1]).toHaveTextContent("No data");
    expect(rows[2]).toHaveTextContent("1100 visits");
  });

  it("shows a legend for two or more series only", () => {
    const { container, rerender } = render(<GlowChart data={visitors} />);
    expect(container.querySelector("ul")).toBeNull();
    rerender(<GlowChart data={twoSeries} />);
    expect(container.querySelector("ul")).toHaveTextContent("This weekLast week");
  });

  it("reads points with the arrow keys and announces them", () => {
    const onActiveIndexChange = vi.fn();
    render(<GlowChart data={visitors} onActiveIndexChange={onActiveIndexChange} />);
    const chart = screen.getByRole("img");
    expect(chart).toHaveAttribute("tabindex", "0");
    chart.focus();
    const live = document.querySelector("[aria-live]")!;

    // With nothing active yet, the first arrow press shows the newest point.
    fireEvent.keyDown(chart, { key: "ArrowLeft" });
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(2);
    fireEvent.keyDown(chart, { key: "ArrowLeft" });
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(1);
    expect(live).toHaveTextContent("Fri, Oct 9: 1,912");

    fireEvent.keyDown(chart, { key: "Home" });
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(0);
    fireEvent.keyDown(chart, { key: "ArrowLeft" });
    expect(onActiveIndexChange).toHaveBeenCalledTimes(3);

    fireEvent.keyDown(chart, { key: "End" });
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(2);
    expect(live).toHaveTextContent("Sat, Oct 10: 1,206");

    fireEvent.keyDown(chart, { key: "Escape" });
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(null);
  });

  it("names each series in the readout", () => {
    render(<GlowChart data={twoSeries} />);
    const chart = screen.getByRole("img");
    fireEvent.keyDown(chart, { key: "Home" });
    expect(document.querySelector("[aria-live]")).toHaveTextContent("Thu, Oct 8: This week 1,840, Last week 1,500");
    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(document.querySelector("[aria-live]")).toHaveTextContent("Last week no data");
  });

  it("clears the crosshair on blur", () => {
    const onActiveIndexChange = vi.fn();
    render(<GlowChart data={visitors} onActiveIndexChange={onActiveIndexChange} />);
    const chart = screen.getByRole("img");
    fireEvent.keyDown(chart, { key: "Home" });
    fireEvent.blur(chart);
    expect(onActiveIndexChange).toHaveBeenLastCalledWith(null);
  });

  it("is a static image when the tooltip is off", () => {
    const onActiveIndexChange = vi.fn();
    render(<GlowChart data={visitors} tooltip={false} onActiveIndexChange={onActiveIndexChange} />);
    const chart = screen.getByRole("img");
    expect(chart).not.toHaveAttribute("tabindex");
    fireEvent.keyDown(chart, { key: "Home" });
    expect(onActiveIndexChange).not.toHaveBeenCalled();
  });

  it("formats axis and tooltip values separately", () => {
    const yFormat = vi.fn((value: number, context: "axis" | "tooltip") => (context === "axis" ? `${value / 1000}k` : `${value}`));
    render(<GlowChart data={visitors} yFormat={yFormat} />);
    const contexts = new Set(yFormat.mock.calls.map(([, context]) => context));
    expect(contexts).toEqual(new Set(["axis", "tooltip"]));
    expect(screen.getAllByText("2k").length).toBeGreaterThan(0);
  });

  it("summarises bars and categories", () => {
    render(
      <GlowChart
        type="bar"
        label="Deploys"
        data={[
          { x: "Mon", y: 12 },
          { x: "Tue", y: 18 },
        ]}
      />,
    );
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "Deploys. Bar chart, 2 points from Mon to Tue. Low 12, high 18, latest 18.",
    );
    expect(screen.getByRole("columnheader", { name: "Label" })).toBeInTheDocument();
  });

  it("handles empty data", () => {
    render(<GlowChart data={[]} label="Signups" />);
    expect(screen.getByRole("img")).toHaveAttribute("aria-label", "Signups. Area chart with no data.");
    expect(screen.getByRole("img")).not.toHaveAttribute("tabindex");
  });

  it("colors series through CSS variables and forwards the ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <GlowChart
        ref={ref}
        color="magenta"
        data={[
          { name: "p50", data: visitors },
          { name: "p95", data: visitors, color: "#ff8a3d" },
          { name: "p99", data: visitors },
        ]}
      />,
    );
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("240 70 235");
    expect(ref.current?.style.getPropertyValue("--nk-gc-c0")).toBe("var(--neon)");
    expect(ref.current?.style.getPropertyValue("--nk-gc-c1")).toBe("255 138 61");
    // The first fallback goes to the first series without a color of its own.
    expect(ref.current?.style.getPropertyValue("--nk-gc-c2")).toBe("230 237 247");
  });
});

describe("Sparkline", () => {
  it("is an image with a trend summary by default", () => {
    render(<Sparkline data={[96, 104, 98, 121]} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "aria-label",
      "Trend of 4 values from 96 to 121, low 96, high 121",
    );
  });

  it("takes a label, a size and a color", () => {
    const ref = React.createRef<HTMLSpanElement>();
    render(<Sparkline ref={ref} data={[1, 2, 3]} label="Sign-ups, last 10 weeks" width="100%" height={32} color="lime" />);
    expect(screen.getByRole("img", { name: "Sign-ups, last 10 weeks" })).toBe(ref.current);
    expect(ref.current?.style.width).toBe("100%");
    expect(ref.current?.style.height).toBe("32px");
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("163 230 53");
  });

  it("pings the latest value when live", () => {
    const { container, rerender } = render(<Sparkline data={[1, 2, 3]} />);
    expect(container.querySelector(".animate-ping")).toBeNull();
    rerender(<Sparkline data={[1, 2, 3]} live />);
    expect(container.querySelector(".animate-ping")).not.toBeNull();
  });
});
