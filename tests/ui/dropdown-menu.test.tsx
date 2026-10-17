import * as React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function ProjectMenu({
  onSelect,
  onOpenChange,
  open,
}: {
  onSelect?: (event: Event) => void;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
}) {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger>Actions</DropdownMenuTrigger>
      <DropdownMenuContent aria-label="Project actions">
        <DropdownMenuItem onSelect={onSelect} shortcut="⌘O">
          Open project
        </DropdownMenuItem>
        <DropdownMenuItem>Copy URL</DropdownMenuItem>
        <DropdownMenuItem disabled>Transfer</DropdownMenuItem>
        <DropdownMenuItem>Redeploy</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="danger">Delete project</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const trigger = () => screen.getByRole("button", { name: "Actions" });

describe("DropdownMenu", () => {
  it("opens on click and wires ARIA to the trigger", () => {
    render(<ProjectMenu />);
    expect(trigger()).toHaveAttribute("aria-haspopup", "menu");
    expect(trigger()).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(trigger());
    const menu = screen.getByRole("menu");
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", menu.id);
    expect(menu).toHaveFocus();
    expect(screen.getAllByRole("menuitem")).toHaveLength(5);
  });

  it("opens from the keyboard onto the first item, or the last with ArrowUp", () => {
    const { unmount } = render(<ProjectMenu />);
    fireEvent.keyDown(trigger(), { key: "Enter" });
    expect(screen.getByRole("menuitem", { name: /Open project/ })).toHaveFocus();
    unmount();

    render(<ProjectMenu />);
    fireEvent.keyDown(trigger(), { key: "ArrowUp" });
    expect(screen.getByRole("menuitem", { name: "Delete project" })).toHaveFocus();
  });

  it("moves with arrows, skips disabled items, wraps and jumps with Home/End", () => {
    render(<ProjectMenu />);
    fireEvent.keyDown(trigger(), { key: "ArrowDown" });
    const menu = screen.getByRole("menu");
    const item = (name: string | RegExp) => screen.getByRole("menuitem", { name });

    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(item("Copy URL")).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(item("Redeploy")).toHaveFocus();
    expect(item("Transfer")).toHaveAttribute("aria-disabled", "true");

    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(item("Delete project")).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(item(/Open project/)).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(item("Delete project")).toHaveFocus();
    fireEvent.keyDown(menu, { key: "Home" });
    expect(item(/Open project/)).toHaveFocus();
  });

  it("marks the highlighted item", () => {
    render(<ProjectMenu />);
    fireEvent.keyDown(trigger(), { key: "Enter" });
    const first = screen.getByRole("menuitem", { name: /Open project/ });
    expect(first).toHaveAttribute("data-highlighted");
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(first).not.toHaveAttribute("data-highlighted");
    expect(screen.getByRole("menuitem", { name: "Copy URL" })).toHaveAttribute("data-highlighted");
  });

  it("jumps by typeahead, matching whole words typed quickly", () => {
    vi.useFakeTimers();
    try {
      render(<ProjectMenu />);
      fireEvent.click(trigger());
      fireEvent.keyDown(screen.getByRole("menu"), { key: "r" });
      expect(screen.getByRole("menuitem", { name: "Redeploy" })).toHaveFocus();
      // Within the buffer, "rd" matches nothing, so focus stays put.
      fireEvent.keyDown(document.activeElement!, { key: "d" });
      expect(screen.getByRole("menuitem", { name: "Redeploy" })).toHaveFocus();
      act(() => vi.advanceTimersByTime(600));
      fireEvent.keyDown(document.activeElement!, { key: "d" });
      fireEvent.keyDown(document.activeElement!, { key: "e" });
      expect(screen.getByRole("menuitem", { name: "Delete project" })).toHaveFocus();
    } finally {
      vi.useRealTimers();
    }
  });

  it("focuses the fresh menu when reopened while the last one fades out", () => {
    render(<ProjectMenu />);
    fireEvent.keyDown(trigger(), { key: "Enter" });
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    fireEvent.keyDown(trigger(), { key: "Enter" });
    expect(screen.getAllByRole("menuitem", { name: /Open project/ }).some((item) => item === document.activeElement)).toBe(true);
    expect(document.querySelectorAll(`[id="${trigger().getAttribute("aria-controls")}"]`)).toHaveLength(1);
  });

  it("selects with Enter, closes and returns focus to the trigger", async () => {
    const onSelect = vi.fn();
    render(<ProjectMenu onSelect={onSelect} />);
    fireEvent.keyDown(trigger(), { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("menuitem", { name: /Open project/ }), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBeInstanceOf(Event);
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
  });

  it("stays open when onSelect prevents default", () => {
    render(<ProjectMenu onSelect={(event) => event.preventDefault()} />);
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("menuitem", { name: /Open project/ }));
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("ignores clicks on disabled items", () => {
    const onOpenChange = vi.fn();
    render(<ProjectMenu onOpenChange={onOpenChange} />);
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("menuitem", { name: "Transfer" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });

  it("closes on Escape, Tab and outside pointer down", () => {
    render(
      <>
        <ProjectMenu />
        <button type="button">Elsewhere</button>
      </>,
    );
    fireEvent.keyDown(trigger(), { key: "Enter" });
    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();

    fireEvent.keyDown(trigger(), { key: "Enter" });
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();

    fireEvent.click(trigger());
    fireEvent.pointerDown(screen.getByRole("button", { name: "Elsewhere" }));
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("respects a controlled open prop", () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<ProjectMenu open={false} onOpenChange={onOpenChange} />);
    fireEvent.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole("menu")).toBeNull();
    rerender(<ProjectMenu open onOpenChange={onOpenChange} />);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("toggles checkbox items, controlled or not", () => {
    const onCheckedChange = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>View</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem defaultChecked onCheckedChange={onCheckedChange} onSelect={(e) => e.preventDefault()}>
            Show minimap
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={false} onSelect={(e) => e.preventDefault()}>
            Word wrap
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.click(screen.getByRole("button", { name: "View" }));
    const minimap = screen.getByRole("menuitemcheckbox", { name: "Show minimap" });
    expect(minimap).toHaveAttribute("aria-checked", "true");
    fireEvent.click(minimap);
    expect(minimap).toHaveAttribute("aria-checked", "false");
    expect(onCheckedChange).toHaveBeenCalledWith(false);

    const wrap = screen.getByRole("menuitemcheckbox", { name: "Word wrap" });
    fireEvent.click(wrap);
    expect(wrap).toHaveAttribute("aria-checked", "false");
  });

  it("selects radio items within a group and labels the group", () => {
    const onValueChange = vi.fn();
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Sort</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup defaultValue="updated" onValueChange={onValueChange}>
            <DropdownMenuLabel>Sort by</DropdownMenuLabel>
            <DropdownMenuRadioItem value="updated">Last updated</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    expect(screen.getByRole("group", { name: "Sort by" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Last updated" })).toHaveAttribute("aria-checked", "true");
    fireEvent.click(screen.getByRole("menuitemradio", { name: "Name" }));
    expect(onValueChange).toHaveBeenCalledWith("name");
  });

  it("opens submenus with ArrowRight and closes them with ArrowLeft", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Share</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Copy link</DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export as</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>PDF</DropdownMenuItem>
              <DropdownMenuItem>Markdown</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Share" }), { key: "Enter" });
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    const subTrigger = screen.getByRole("menuitem", { name: "Export as" });
    expect(subTrigger).toHaveFocus();
    expect(subTrigger).toHaveAttribute("aria-haspopup", "menu");
    expect(subTrigger).toHaveAttribute("aria-expanded", "false");

    fireEvent.keyDown(subTrigger, { key: "ArrowRight" });
    expect(subTrigger).toHaveAttribute("aria-expanded", "true");
    const pdf = screen.getByRole("menuitem", { name: "PDF" });
    expect(pdf).toHaveFocus();
    expect(screen.getAllByRole("menu")).toHaveLength(2);

    fireEvent.keyDown(pdf, { key: "ArrowDown" });
    expect(screen.getByRole("menuitem", { name: "Markdown" })).toHaveFocus();

    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(subTrigger).toHaveFocus();
    expect(subTrigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Share" })).toHaveAttribute("aria-expanded", "true");
  });

  it("closes the submenu when the parent highlight moves on", () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Share</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Export as</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem>PDF</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem>Copy link</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    fireEvent.keyDown(screen.getByRole("button", { name: "Share" }), { key: "Enter" });
    const subTrigger = screen.getByRole("menuitem", { name: "Export as" });
    fireEvent.click(subTrigger);
    expect(subTrigger).toHaveAttribute("aria-expanded", "true");
    act(() => screen.getByRole("menuitem", { name: "Copy link" }).focus());
    expect(subTrigger).toHaveAttribute("aria-expanded", "false");
  });

  it("selecting inside a submenu closes the whole menu", () => {
    const onSelect = vi.fn();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Share</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Export as</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onSelect={onSelect}>PDF</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const share = screen.getByRole("button", { name: "Share" });
    fireEvent.keyDown(share, { key: "Enter" });
    fireEvent.keyDown(document.activeElement!, { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "PDF" }), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(share).toHaveAttribute("aria-expanded", "false");
    expect(share).toHaveFocus();
  });

  it("renders a link item with asChild", () => {
    render(
      <DropdownMenu defaultOpen>
        <DropdownMenuTrigger>Help</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem asChild>
            <a href="/docs">Documentation</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const item = screen.getByRole("menuitem", { name: "Documentation" });
    expect(item.tagName).toBe("A");
    expect(item).toHaveAttribute("href", "/docs");
  });

  it("takes the trigger's color across the portal, or the color prop", () => {
    render(
      <DropdownMenu defaultOpen color="lime">
        <DropdownMenuTrigger>Color</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Lime</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const wrapper = screen.getByRole("menu").parentElement!;
    expect(wrapper.style.getPropertyValue("--neon")).toBe("163 230 53");
  });

  it("supports asChild triggers and composes their handlers", () => {
    const onClick = vi.fn();
    const ref = React.createRef<HTMLButtonElement>();
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild ref={ref}>
          <button type="button" onClick={onClick} className="custom">
            More
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Rename</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const button = screen.getByRole("button", { name: "More" });
    expect(ref.current).toBe(button);
    expect(button).toHaveClass("custom");
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
    expect(button).toHaveAttribute("aria-expanded", "true");
  });
});

describe("DropdownMenu under StrictMode", () => {
  it("leaves focus on the first item when opened from the keyboard", async () => {
    // StrictMode runs effects twice; the second run used to pull focus back onto the panel.
    render(
      <React.StrictMode>
        <ProjectMenu />
      </React.StrictMode>,
    );
    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    fireEvent.keyDown(trigger, { key: "Enter" });
    await waitFor(() => expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: /Open project/ })));

    fireEvent.keyDown(document.activeElement!, { key: "Escape" });
    fireEvent.keyDown(trigger, { key: "ArrowUp" });
    await waitFor(() => expect(document.activeElement).toHaveTextContent("Delete project"));
  });
});

