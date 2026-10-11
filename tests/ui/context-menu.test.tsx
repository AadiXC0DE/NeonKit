import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

function FileTile({
  onOpenChange,
  onRename,
  disabled,
}: {
  onOpenChange?: (open: boolean) => void;
  onRename?: () => void;
  disabled?: boolean;
}) {
  return (
    <ContextMenu onOpenChange={onOpenChange}>
      <ContextMenuTrigger disabled={disabled} tabIndex={0} aria-label="roadmap.md">
        roadmap.md
      </ContextMenuTrigger>
      <ContextMenuContent aria-label="File actions">
        <ContextMenuItem onSelect={onRename}>Rename</ContextMenuItem>
        <ContextMenuItem>Duplicate</ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>Share</ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem>Copy link</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuCheckboxItem defaultChecked>Starred</ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem variant="danger">Move to trash</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

const area = () => screen.getByLabelText("roadmap.md");

describe("ContextMenu", () => {
  it("opens on right-click, blocking the native menu", () => {
    const onOpenChange = vi.fn();
    render(<FileTile onOpenChange={onOpenChange} />);
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true, clientX: 120, clientY: 80 });
    act(() => {
      area().dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    const menu = screen.getByRole("menu", { name: "File actions" });
    expect(menu).toHaveFocus();
    expect(area()).toHaveAttribute("data-state", "open");
  });

  it("shares the dropdown items, keyboard model and selection", () => {
    const onRename = vi.fn();
    render(<FileTile onRename={onRename} />);
    fireEvent.contextMenu(area());
    fireEvent.keyDown(screen.getByRole("menu"), { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Rename" })).toHaveFocus();
    expect(screen.getByRole("menuitemcheckbox", { name: "Starred" })).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    expect(onRename).toHaveBeenCalled();
    expect(area()).toHaveAttribute("data-state", "closed");
  });

  it("opens from the keyboard with Shift+F10 or the ContextMenu key and returns focus", () => {
    render(<FileTile />);
    act(() => area().focus());
    fireEvent.keyDown(area(), { key: "F10", shiftKey: true });
    expect(screen.getByRole("menu")).toHaveFocus();
    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(area()).toHaveAttribute("data-state", "closed");
    expect(area()).toHaveFocus();

    fireEvent.keyDown(area(), { key: "ContextMenu" });
    expect(area()).toHaveAttribute("data-state", "open");
  });

  it("opens after a long press on touch, and not when the finger moves", () => {
    vi.useFakeTimers();
    try {
      render(<FileTile />);
      fireEvent.pointerDown(area(), { pointerType: "touch", clientX: 40, clientY: 40 });
      fireEvent.pointerMove(area(), { pointerType: "touch", clientX: 70, clientY: 40 });
      act(() => vi.advanceTimersByTime(600));
      expect(area()).toHaveAttribute("data-state", "closed");

      fireEvent.pointerDown(area(), { pointerType: "touch", clientX: 40, clientY: 40 });
      act(() => vi.advanceTimersByTime(300));
      expect(area()).toHaveAttribute("data-state", "closed");
      act(() => vi.advanceTimersByTime(250));
      expect(area()).toHaveAttribute("data-state", "open");
    } finally {
      vi.useRealTimers();
    }
  });

  it("leaves the native menu alone when disabled", () => {
    render(<FileTile disabled />);
    const event = new MouseEvent("contextmenu", { bubbles: true, cancelable: true });
    act(() => {
      area().dispatchEvent(event);
    });
    expect(event.defaultPrevented).toBe(false);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("closes on a click elsewhere and reopens at the next right-click", () => {
    render(
      <>
        <FileTile />
        <p>Outside</p>
      </>,
    );
    fireEvent.contextMenu(area(), { clientX: 10, clientY: 10 });
    fireEvent.pointerDown(screen.getByText("Outside"));
    expect(area()).toHaveAttribute("data-state", "closed");
    fireEvent.contextMenu(area(), { clientX: 30, clientY: 30 });
    expect(area()).toHaveAttribute("data-state", "open");
    expect(screen.getByRole("menu", { name: "File actions" })).toHaveFocus();
  });

  it("opens submenus like the dropdown does", () => {
    render(<FileTile />);
    fireEvent.contextMenu(area());
    fireEvent.keyDown(screen.getByRole("menu"), { key: "s" });
    const share = screen.getByRole("menuitem", { name: "Share" });
    expect(share).toHaveFocus();
    fireEvent.keyDown(share, { key: "ArrowRight" });
    expect(screen.getByRole("menuitem", { name: "Copy link" })).toHaveFocus();
  });
});
