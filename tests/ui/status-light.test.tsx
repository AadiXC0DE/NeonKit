import * as React from "react";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusLight, StatusLightGroup } from "@/components/ui/status-light";

describe("StatusLight", () => {
  it("is an image named by its state when it has no label", () => {
    render(<StatusLight state="standby" />);
    const light = screen.getByRole("img", { name: "Standby" });
    expect(light).toHaveAttribute("data-state", "standby");
  });

  it("takes aria-label over the state word", () => {
    render(<StatusLight state="on" aria-label="Port 1, link up" />);
    expect(screen.getByRole("img", { name: "Port 1, link up" })).toBeInTheDocument();
  });

  it("reads the state after a visible label, and prints it with showState", () => {
    const { rerender, container } = render(<StatusLight state="error" label="Webhooks" />);
    expect(container.textContent).toContain("Webhooks, Error");
    expect(screen.queryByRole("img")).toBeNull();
    rerender(<StatusLight state="error" label="Webhooks" showState stateLabel="Outage" />);
    expect(screen.getByText("Outage")).toBeVisible();
    expect(container.textContent).not.toContain(", Outage");
  });

  it("keeps warning amber and error red, and tints the other states", () => {
    const { rerender } = render(<StatusLight state="warning" color="green" />);
    expect(screen.getByRole("img").style.getPropertyValue("--neon")).toBe("251 191 36");
    rerender(<StatusLight state="error" />);
    expect(screen.getByRole("img").style.getPropertyValue("--neon")).toBe("255 77 94");
    rerender(<StatusLight state="on" color="green" />);
    expect(screen.getByRole("img").style.getPropertyValue("--neon")).toBe("52 211 153");
  });

  it("draws no lit layer while off", () => {
    const { container, rerender } = render(<StatusLight state="off" variant="panel" />);
    expect(container.querySelector(".nk-status-lit")).toBeNull();
    rerender(<StatusLight state="alert" variant="pulse" />);
    expect(container.querySelector(".nk-status-lit")).not.toBeNull();
    expect(container.querySelector(".nk-status-ping")).not.toBeNull();
  });
});

describe("StatusLightGroup", () => {
  it("lists each light with its state word", () => {
    render(
      <StatusLightGroup aria-label="Services">
        <StatusLight label="API" state="on" stateLabel="Operational" />
        <StatusLight label="Realtime" state="warning" stateLabel="Degraded" />
        {false}
      </StatusLightGroup>,
    );
    const list = screen.getByRole("list", { name: "Services" });
    const items = within(list).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[1]).getByText("Degraded")).toBeInTheDocument();
  });

  it("passes variant and size down unless a light sets its own", () => {
    const { container } = render(
      <StatusLightGroup variant="panel">
        <StatusLight label="A" />
        <StatusLight label="B" variant="dot" />
      </StatusLightGroup>,
    );
    const lights = container.querySelectorAll("[data-variant]");
    expect(lights[0]).toHaveAttribute("data-variant", "panel");
    expect(lights[1]).toHaveAttribute("data-variant", "dot");
  });
});
