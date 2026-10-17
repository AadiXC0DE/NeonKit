import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Timeline, TimelineItem } from "@/components/ui/timeline";

function segments(container: HTMLElement) {
  return Array.from(container.querySelectorAll("li > div > span[data-state], li > div > [data-state]")).map(
    (node) => node.getAttribute("data-state"),
  );
}

describe("Timeline", () => {
  it("renders an ordered list of items", () => {
    render(
      <Timeline aria-label="Incident">
        <TimelineItem title="Investigating" />
        <TimelineItem title="Identified" />
        <TimelineItem title="Resolved" />
      </Timeline>,
    );
    const list = screen.getByRole("list", { name: "Incident" });
    expect(list.tagName).toBe("OL");
    expect(within(list).getAllByRole("listitem")).toHaveLength(3);
  });

  it("marks the current item with aria-current", () => {
    render(
      <Timeline>
        <TimelineItem title="Fix deployed" />
        <TimelineItem status="current" title="Monitoring" />
        <TimelineItem status="upcoming" title="Resolved" />
      </Timeline>,
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]).not.toHaveAttribute("aria-current");
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[2]).not.toHaveAttribute("aria-current");
  });

  it("lights the tube up to the current item and bleeds past it", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="Investigating" />
        <TimelineItem title="Identified" />
        <TimelineItem status="current" title="Monitoring" />
        <TimelineItem status="upcoming" title="Resolved" />
        <TimelineItem status="upcoming" title="Postmortem" />
      </Timeline>,
    );
    expect(segments(container)).toEqual(["lit", "lit", "bleed", "unlit"]);
  });

  it("bleeds into the first upcoming item when nothing is current", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="Packed" />
        <TimelineItem status="upcoming" title="Shipped" />
      </Timeline>,
    );
    expect(segments(container)).toEqual(["bleed"]);
  });

  it("announces done and upcoming status with hidden text", () => {
    render(
      <Timeline statusLabels={{ upcoming: "Planned" }}>
        <TimelineItem title="Build" />
        <TimelineItem status="current" title="Deploy" />
        <TimelineItem status="upcoming" title="Promote" />
      </Timeline>,
    );
    const [done, current, upcoming] = screen.getAllByRole("listitem");
    expect(done).toHaveTextContent("Completed: Build");
    expect(current).toHaveTextContent(/^Deploy/);
    expect(upcoming).toHaveTextContent("Planned: Promote");
  });

  it("renders Date and ISO times as <time> with a machine-readable value", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="Investigating" time={new Date("2026-10-11T09:12:00Z")} />
        <TimelineItem title="v2.0" time="2026-03-04" />
      </Timeline>,
    );
    const times = container.querySelectorAll("time");
    expect(times[0]).toHaveAttribute("dateTime", "2026-10-11T09:12:00.000Z");
    expect(times[0]).toHaveTextContent("Oct 11, 9:12 AM UTC");
    expect(times[1]).toHaveAttribute("dateTime", "2026-03-04");
    expect(times[1]).toHaveTextContent("Mar 4, 2026");
  });

  it("uses dateTime for human times and leaves other text alone", () => {
    const { container } = render(
      <Timeline>
        <TimelineItem title="Built" time="48s" dateTime="PT48S" />
        <TimelineItem title="Promote" time="Next" />
      </Timeline>,
    );
    const times = container.querySelectorAll("time");
    expect(times).toHaveLength(1);
    expect(times[0]).toHaveAttribute("dateTime", "PT48S");
    expect(times[0]).toHaveTextContent("48s");
    expect(screen.getByText("Next").tagName).toBe("SPAN");
  });

  it("formats times with formatTime", () => {
    render(
      <Timeline formatTime={(date) => `day ${date.getUTCDate()}`}>
        <TimelineItem title="Shipped" time="2026-10-09T08:00:00Z" />
      </Timeline>,
    );
    expect(screen.getByText("day 9").tagName).toBe("TIME");
  });

  it("renders icons, descriptions, orientation and color", () => {
    const ref = React.createRef<HTMLOListElement>();
    render(
      <Timeline ref={ref} orientation="horizontal" color="lime">
        <TimelineItem title="Build" icon={<svg data-testid="icon" />}>
          312 routes
        </TimelineItem>
      </Timeline>,
    );
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("312 routes")).toBeInTheDocument();
    expect(ref.current).toHaveAttribute("data-orientation", "horizontal");
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("163 230 53");
  });
});
