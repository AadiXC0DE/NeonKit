import * as React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ToolCall, ToolCallGroup } from "@/components/ui/tool-call";

afterEach(() => vi.useRealTimers());

describe("ToolCall", () => {
  it("shows a single string argument as itself and expands to arguments and result", () => {
    render(<ToolCall name="read_file" args={{ path: "src/date.ts" }} duration={0.4} result="export const DAY = 1;" />);
    const row = screen.getByRole("button", { name: /read_file/ });
    expect(row).toHaveTextContent("src/date.ts");
    expect(row).toHaveTextContent("0.4s");
    expect(row).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(row);
    expect(row).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Arguments")).toBeInTheDocument();
    expect(screen.getByText("Result")).toBeInTheDocument();
    expect(screen.getByText("path").tagName).toBe("DT");
  });

  it("summarises several arguments as key: value", () => {
    render(<ToolCall name="query" args={{ table: "users", limit: 5 }} />);
    expect(screen.getByRole("button")).toHaveTextContent('table: "users" limit: 5');
  });

  it("takes a summary and a meta readout", () => {
    render(<ToolCall name="run_command" summary="npm test" status="success" duration={1.7} meta="14 passed" />);
    const row = screen.getByText("run_command").closest("[data-status]")!;
    expect(row).toHaveTextContent("npm test");
    expect(row).toHaveTextContent("14 passed");
    expect(row).not.toHaveTextContent("1.7s");
  });

  it("accepts done as success", () => {
    render(<ToolCall name="x" status="done" />);
    expect(screen.getByText("x").closest("[data-status]")).toHaveAttribute("data-status", "success");
  });

  it("counts up while running and names its state", () => {
    vi.useFakeTimers();
    render(<ToolCall name="deploy" status="running" />);
    act(() => vi.advanceTimersByTime(1500));
    const root = screen.getByText("deploy").closest("[data-status]")!;
    expect(root).toHaveAttribute("data-status", "running");
    expect(root).toHaveTextContent(/1\.\ds/);
    expect(root).toHaveTextContent("Running");
  });

  it("asks for approval and reports the decision", () => {
    const onApprove = vi.fn();
    const onDeny = vi.fn();
    render(
      <ToolCall
        name="run_sql"
        args={{ statement: "DELETE FROM sessions" }}
        status="approval"
        approvalNote="Deletes 48,210 rows."
        approveLabel="Run on prod"
        onApprove={onApprove}
        onDeny={onDeny}
      />,
    );
    expect(screen.getByText("Deletes 48,210 rows.")).toBeInTheDocument();
    // The details are always open while it waits, so there's no disclosure to toggle.
    expect(screen.queryByRole("button", { expanded: false })).toBeNull();
    expect(screen.getByText("Arguments")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Run on prod" }));
    expect(onApprove).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Deny" }));
    expect(onDeny).toHaveBeenCalled();
  });

  it("announces status transitions politely", () => {
    const { rerender, container } = render(<ToolCall name="build" status="running" />);
    const live = container.querySelector("[aria-live=polite]")!;
    expect(live).toHaveTextContent("");
    rerender(<ToolCall name="build" status="error" error="exit 1" />);
    expect(live).toHaveTextContent("build: Failed");
    expect(screen.getByText("exit 1")).toBeInTheDocument();
  });

  it("supports controlled open", () => {
    const onOpenChange = vi.fn();
    render(<ToolCall name="x" args={{ a: "b" }} open={false} onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.getByRole("button")).toHaveAttribute("aria-expanded", "false");
  });
});

describe("ToolCallGroup", () => {
  it("renders a named list with one item per call", () => {
    render(
      <ToolCallGroup label="Run log">
        <ToolCall name="a" />
        <ToolCall name="b" status="pending" />
      </ToolCallGroup>,
    );
    const list = screen.getByRole("list", { name: "Run log" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
  });
});
