import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

describe("Empty", () => {
  it("renders a title, description and actions", () => {
    render(
      <Empty>
        <EmptyMedia variant="icon">
          <svg />
        </EmptyMedia>
        <EmptyTitle>No deployments yet</EmptyTitle>
        <EmptyDescription>Push to main and it builds.</EmptyDescription>
        <EmptyContent>
          <button type="button">Deploy main</button>
        </EmptyContent>
      </Empty>,
    );
    expect(screen.getByRole("heading", { level: 3, name: "No deployments yet" })).toBeInTheDocument();
    expect(screen.getByText("Push to main and it builds.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Deploy main" })).toBeInTheDocument();
  });

  it("draws the tube media as hidden, layered copies of the icon", () => {
    const { container } = render(
      <Empty>
        <EmptyMedia variant="tube">
          <svg data-testid="icon" />
        </EmptyMedia>
      </Empty>,
    );
    const tube = container.querySelector("[data-nk-tube]")!;
    expect(tube).toHaveAttribute("aria-hidden", "true");
    expect(tube).toHaveAttribute("data-nk-tube", "auto");
    expect(tube.querySelectorAll("svg")).toHaveLength(5);
    expect(tube.querySelector("[data-nk-tube-lit]")).toBeInTheDocument();
  });

  it("lets lit force the tube on or off", () => {
    const { container, rerender } = render(
      <EmptyMedia variant="tube" lit>
        <svg />
      </EmptyMedia>,
    );
    expect(container.querySelector("[data-nk-tube]")).toHaveAttribute("data-nk-tube", "on");
    rerender(
      <EmptyMedia variant="tube" lit={false}>
        <svg />
      </EmptyMedia>,
    );
    expect(container.querySelector("[data-nk-tube]")).toHaveAttribute("data-nk-tube", "off");
  });

  it("marks the content so the tube can follow its actions, and aligns to the start", () => {
    const { container } = render(
      <Empty align="start">
        <EmptyContent />
      </Empty>,
    );
    expect(container.querySelector("[data-nk-empty]")).toHaveAttribute("data-align", "start");
    expect(container.querySelector("[data-nk-empty-content]")).toBeInTheDocument();
    expect(container.querySelector("style")?.textContent).toContain(":has([data-nk-empty-content]");
  });
});
