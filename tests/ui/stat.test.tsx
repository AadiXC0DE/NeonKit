import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Gauge } from "@/components/ui/icons";
import { Stat, StatGroup } from "@/components/ui/stat";

// What a Server Component hands over before the client module is linked: a lazy node.
function lazyNode(element: React.ReactElement) {
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: element,
    _init: (value: React.ReactElement) => value,
  } as unknown as React.ReactElement;
}

describe("Stat", () => {
  it("is a group named by its label, with the final value for assistive tech", () => {
    render(<Stat label="Active workspaces" value={1284} />);
    const group = screen.getByRole("group", { name: "Active workspaces" });
    expect(within(group).getByText("1,284", { selector: ".sr-only" })).toBeInTheDocument();
  });

  it("formats with Intl options and keeps decimals through the count-up", () => {
    render(
      <>
        <Stat label="MRR" value={48210} countUp={false} formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }} />
        <Stat label="NRR" value={118.4} countUp={false} unit="%" />
      </>,
    );
    expect(screen.getAllByText("$48,210").length).toBeGreaterThan(0);
    expect(screen.getAllByText("118.4").length).toBeGreaterThan(0);
    expect(screen.getByText("%")).toBeInTheDocument();
  });

  it("colors the delta by whether its direction is good", () => {
    const { container } = render(
      <>
        <Stat label="Latency" value={182} delta={-12.4} positive="down" />
        <Stat label="Churn" value={1.9} delta={0.3} positive="down" />
        <Stat label="Deploys" value={286} delta={0} />
      </>,
    );
    const deltas = container.querySelectorAll("[data-slot=delta]");
    expect((deltas[0] as HTMLElement).style.getPropertyValue("--neon")).toBe("52 211 153");
    expect((deltas[1] as HTMLElement).style.getPropertyValue("--neon")).toBe("255 77 94");
    expect((deltas[2] as HTMLElement).style.getPropertyValue("--neon")).toBe("");
    expect(screen.getByText(/Down/)).toBeInTheDocument();
    expect(screen.getByText(/No change/)).toBeInTheDocument();
  });

  it("shows skeletons and marks itself busy while loading", () => {
    render(<Stat label="Revenue" value={900} delta={2} loading />);
    const group = screen.getByRole("group", { name: "Revenue" });
    expect(group).toHaveAttribute("aria-busy", "true");
    expect(within(group).queryByText("900")).not.toBeInTheDocument();
  });

  it("announces live stats and draws a sparkline from the trend", () => {
    render(<Stat label="Requests per second" value={478} live trend={[400, 420, 478]} />);
    expect(screen.getByText("(live)")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /Trend of 3 values/ })).toBeInTheDocument();
  });

  it("draws the icon as a tube that lights only when live", () => {
    const { container, rerender } = render(<Stat label="Latency" icon={Gauge} value={182} />);
    const tubes = () => container.querySelectorAll("svg.nk-icon-gauge");
    expect(tubes()).toHaveLength(2);
    expect(tubes()[0].getAttribute("class")).not.toContain("drop-shadow");
    rerender(<Stat label="Latency" icon={Gauge} value={182} live />);
    expect(tubes()[0].getAttribute("class")).toContain("drop-shadow");
    expect(screen.getByText("(live)")).toHaveClass("sr-only");
  });

  it("fills a meter toward the goal and reads its share", () => {
    render(
      <Stat
        label="Seats"
        value={86}
        goal={100}
        countUp={false}
        formatGoal={(share) => `${100 - Math.round(share * 100)} seats open`}
      />,
    );
    const meter = screen.getByRole("meter", { name: "Progress to goal" });
    expect(meter).toHaveAttribute("aria-valuenow", "86");
    expect(meter).toHaveAttribute("aria-valuetext", "86% of 100");
    expect(screen.getByText("14 seats open")).toBeInTheDocument();
  });

  it("keeps four row slots for the group's subgrid, whatever is shown", () => {
    const { container } = render(<Stat label="Bare" value={1} />);
    expect(container.firstElementChild?.children).toHaveLength(4);
  });

  it("applies color through --neon", () => {
    render(<Stat label="Uptime" value={99.98} color="lime" />);
    expect(screen.getByRole("group", { name: "Uptime" }).style.getPropertyValue("--neon")).toBe("163 230 53");
  });
});

describe("StatGroup", () => {
  it("sizes its grid from the number of stats, lazy children included", () => {
    const { container } = render(
      <StatGroup>
        <Stat label="A" value={1} />
        {lazyNode(<Stat label="B" value={2} />)}
        <Stat label="C" value={3} />
      </StatGroup>,
    );
    expect(screen.getByRole("group", { name: "B" })).toBeInTheDocument();
    expect(container.querySelector(".grid")?.className).toContain("sm:grid-cols-3");
  });

  it("takes an explicit column count and a framed variant", () => {
    const { container } = render(
      <StatGroup columns={2} variant="framed">
        <Stat label="A" value={1} />
      </StatGroup>,
    );
    expect(container.firstElementChild?.className).toContain("border-white/10");
    expect(container.querySelector(".grid")?.className).toContain("min-[420px]:grid-cols-2");
  });
});
