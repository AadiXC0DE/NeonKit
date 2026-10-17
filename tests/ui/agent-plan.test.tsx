import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AgentPlan, type PlanStep } from "@/components/ui/agent-plan";

const steps = (statuses: PlanStep["status"][]): PlanStep[] =>
  ["Reproduce", "Find the cause", "Patch", "Re-run"].map((title, index) => ({ id: title, title, status: statuses[index] }));

describe("AgentPlan", () => {
  it("is an ordered list named by its title, with the current step marked", () => {
    render(<AgentPlan title="Fix the date test" steps={steps(["done", "active", "pending", "pending"])} />);
    const list = screen.getByRole("list", { name: "Fix the date test" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items[1]).toHaveAttribute("aria-current", "step");
    expect(items[0]).toHaveTextContent("Done: Reproduce");
    expect(items[2]).toHaveTextContent("Not started: Patch");
    expect(screen.getByText("1 of 4")).toBeInTheDocument();
  });

  it("lights the tube up to the furthest step reached", () => {
    const { container } = render(<AgentPlan steps={steps(["done", "done", "active", "pending"])} />);
    const tubes = Array.from(container.querySelectorAll("[data-slot=tube] > span"));
    expect(tubes.map((tube) => tube.hasAttribute("data-lit"))).toEqual([true, true, false]);
  });

  it("stops the light at a failure and marks skipped steps", () => {
    const { container } = render(<AgentPlan steps={steps(["done", "failed", "skipped", "skipped"])} />);
    const tubes = Array.from(container.querySelectorAll("[data-slot=tube] > span"));
    expect(tubes.map((tube) => tube.hasAttribute("data-lit"))).toEqual([true, false, false]);
    expect(screen.getAllByText("Skipped").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("listitem")[1]).toHaveTextContent("Failed: Find the cause");
  });

  it("announces the active step when it changes, not on mount", () => {
    const { container, rerender } = render(<AgentPlan steps={steps(["active", "pending", "pending", "pending"])} />);
    const live = container.querySelector("[aria-live=polite]")!;
    expect(live).toHaveTextContent("");
    rerender(<AgentPlan steps={steps(["done", "active", "pending", "pending"])} />);
    expect(live).toHaveTextContent("Step 2 of 4: Find the cause");
    rerender(<AgentPlan steps={steps(["done", "done", "done", "done"])} />);
    expect(live).toHaveTextContent("Plan complete");
  });

  it("renders substeps, meta and custom content", () => {
    render(
      <AgentPlan
        readout={null}
        steps={[
          {
            title: "Patch",
            status: "active",
            meta: "+3 −1",
            substeps: [{ title: "Use setDate", status: "done" }],
            content: <p>diff here</p>,
          },
        ]}
      />,
    );
    expect(screen.getByText("+3 −1")).toBeInTheDocument();
    expect(screen.getByText("Use setDate").closest("li")).toHaveTextContent("Done: Use setDate");
    expect(screen.getByText("diff here")).toBeInTheDocument();
    expect(screen.queryByText(/of 1/)).toBeNull();
  });
});
