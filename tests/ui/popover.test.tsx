import * as React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

function SharePopover(props: React.ComponentProps<typeof Popover> & { initialFocus?: "content" | "first" }) {
  const { initialFocus, ...rest } = props;
  return (
    <div>
      <Popover {...rest}>
        <PopoverTrigger>Share</PopoverTrigger>
        <PopoverContent initialFocus={initialFocus}>
          <input aria-label="Link" defaultValue="https://acme.dev/q4" />
          <button type="button">Copy link</button>
          <PopoverClose>Done</PopoverClose>
        </PopoverContent>
      </Popover>
      <button type="button">Next on page</button>
    </div>
  );
}

describe("Popover", () => {
  it("opens a dialog labelled by its trigger and moves focus inside", async () => {
    render(<SharePopover />);
    const trigger = screen.getByRole("button", { name: "Share" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");

    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Share" });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls", dialog.id);
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Link" })).toHaveFocus());
  });

  it("focuses the panel itself with initialFocus='content'", async () => {
    render(<SharePopover initialFocus="content" />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    await waitFor(() => expect(screen.getByRole("dialog")).toHaveFocus());
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const onOpenChange = vi.fn();
    render(<SharePopover onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: "Share" });
    fireEvent.click(trigger);
    const input = screen.getByRole("textbox", { name: "Link" });
    await waitFor(() => expect(input).toHaveFocus());

    fireEvent.keyDown(input, { key: "Escape" });
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await waitFor(() => expect(trigger).toHaveFocus());
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("closes on a pointer press outside, but not inside", async () => {
    render(<SharePopover />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    const dialog = screen.getByRole("dialog");

    fireEvent.pointerDown(screen.getByRole("button", { name: "Copy link" }));
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Share" })).toHaveAttribute("aria-expanded", "true");

    fireEvent.pointerDown(document.body);
    expect(screen.getByRole("button", { name: "Share" })).toHaveAttribute("aria-expanded", "false");
  });

  it("closes when focus moves somewhere else on the page", async () => {
    render(<SharePopover />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    await waitFor(() => expect(screen.getByRole("textbox", { name: "Link" })).toHaveFocus());

    act(() => screen.getByRole("button", { name: "Next on page" }).focus());
    expect(screen.getByRole("button", { name: "Share" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Next on page" })).toHaveFocus();
  });

  it("closes from PopoverClose", async () => {
    render(<SharePopover />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("toggles closed from the trigger", () => {
    render(<SharePopover />);
    const trigger = screen.getByRole("button", { name: "Share" });
    fireEvent.click(trigger);
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("tabbing past the last element closes and continues after the trigger", async () => {
    render(<SharePopover />);
    fireEvent.click(screen.getByRole("button", { name: "Share" }));
    const done = screen.getByRole("button", { name: "Done" });
    act(() => done.focus());

    fireEvent.keyDown(done, { key: "Tab" });
    expect(screen.getByRole("button", { name: "Next on page" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Share" })).toHaveAttribute("aria-expanded", "false");
  });

  it("shift-tabbing from the first element closes and focuses the trigger", async () => {
    const onOpenChange = vi.fn();
    render(<SharePopover onOpenChange={onOpenChange} />);
    const trigger = screen.getByRole("button", { name: "Share" });
    fireEvent.click(trigger);
    const input = screen.getByRole("textbox", { name: "Link" });
    await waitFor(() => expect(input).toHaveFocus());

    fireEvent.keyDown(input, { key: "Tab", shiftKey: true });
    expect(trigger).toHaveFocus();
    expect(onOpenChange).toHaveBeenCalledTimes(2);
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("stays open when controlled and reports requests", () => {
    const onOpenChange = vi.fn();
    render(<SharePopover open onOpenChange={onOpenChange} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("merges onto its child with asChild and keeps the child's handlers", () => {
    const onClick = vi.fn();
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" id="filters-button" className="chip" onClick={onClick}>
            Filters
          </button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Status</p>
        </PopoverContent>
      </Popover>,
    );
    const trigger = screen.getByRole("button", { name: "Filters" });
    expect(trigger).toHaveAttribute("id", "filters-button");
    expect(trigger).toHaveClass("chip");
    fireEvent.click(trigger);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeInTheDocument();
  });

  it("lets the child cancel opening with preventDefault", () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" onClick={(event) => event.preventDefault()}>
            Locked
          </button>
        </PopoverTrigger>
        <PopoverContent>Hidden</PopoverContent>
      </Popover>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Locked" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("applies an explicit color through --neon", () => {
    render(
      <Popover defaultOpen>
        <PopoverTrigger>Theme</PopoverTrigger>
        <PopoverContent color="magenta">Body</PopoverContent>
      </Popover>,
    );
    expect(screen.getByRole("dialog").style.getPropertyValue("--neon")).toBe("240 70 235");
  });
});
