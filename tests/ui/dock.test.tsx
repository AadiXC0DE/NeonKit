import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Dock, DockItem, DockSeparator } from "@/components/ui/dock";

/** What a Server Component's child looks like to a client component: a lazy reference. */
function lazyElement(element: React.ReactElement) {
  const payload = Object.assign(Promise.resolve(element), { status: "fulfilled", value: element });
  return {
    $$typeof: Symbol.for("react.lazy"),
    _payload: payload,
    _init: (thenable: typeof payload) => thenable.value,
  } as unknown as React.ReactElement;
}

function Apps(props: Partial<React.ComponentProps<typeof Dock>>) {
  return (
    <Dock aria-label="Dock" {...props}>
      <DockItem label="Files">F</DockItem>
      <DockItem label="Mail" badge={12}>
        M
      </DockItem>
      <DockItem label="Notes" disabled>
        N
      </DockItem>
      <DockSeparator />
      <DockItem label="Trash" running>
        T
      </DockItem>
    </Dock>
  );
}

describe("Dock", () => {
  it("is a toolbar of named buttons with one tab stop", async () => {
    render(<Apps />);
    await act(async () => {});
    expect(screen.getByRole("toolbar", { name: "Dock" })).toHaveAttribute("aria-orientation", "horizontal");
    expect(screen.getByRole("button", { name: "Files" })).toHaveAttribute("tabindex", "0");
    expect(screen.getByRole("button", { name: "Mail" })).toHaveAttribute("tabindex", "-1");
    expect(screen.getByRole("separator")).toHaveAttribute("aria-orientation", "vertical");
  });

  it("moves focus with the arrows, wraps, and skips disabled items", async () => {
    render(<Apps />);
    await act(async () => {});
    const files = screen.getByRole("button", { name: "Files" });
    files.focus();
    fireEvent.keyDown(files, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "Mail" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "Trash" })).toHaveFocus();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(files).toHaveFocus();
    fireEvent.keyDown(files, { key: "End" });
    expect(screen.getByRole("button", { name: "Trash" })).toHaveFocus();
    expect(screen.getByRole("button", { name: "Trash" })).toHaveAttribute("tabindex", "0");
    expect(files).toHaveAttribute("tabindex", "-1");
  });

  it("uses up and down when vertical", async () => {
    render(<Apps orientation="vertical" />);
    await act(async () => {});
    const files = screen.getByRole("button", { name: "Files" });
    files.focus();
    fireEvent.keyDown(files, { key: "ArrowRight" });
    expect(files).toHaveFocus();
    fireEvent.keyDown(files, { key: "ArrowDown" });
    expect(screen.getByRole("button", { name: "Mail" })).toHaveFocus();
  });

  it("describes badges and running items", () => {
    render(<Apps />);
    expect(screen.getByRole("button", { name: "Mail" })).toHaveAccessibleDescription("12");
    expect(screen.getByRole("button", { name: "Trash" })).toHaveAccessibleDescription("open");
  });

  it("calls onClick and blocks disabled items", () => {
    const onClick = vi.fn();
    render(
      <Dock aria-label="Dock">
        <DockItem label="Files" onClick={onClick}>
          F
        </DockItem>
        <DockItem label="Notes" disabled onClick={onClick}>
          N
        </DockItem>
      </Dock>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Files" }));
    fireEvent.click(screen.getByRole("button", { name: "Notes" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders links with asChild, including lazy ones", async () => {
    render(
      <Dock aria-label="Workspace">
        <DockItem asChild label="Home">
          <a href="/home">H</a>
        </DockItem>
        <DockItem asChild label="Inbox">
          {lazyElement(<a href="/inbox">I</a>)}
        </DockItem>
      </Dock>,
    );
    await act(async () => {});
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
    expect(screen.getByRole("link", { name: "Inbox" })).toHaveAttribute("href", "/inbox");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("applies its color", () => {
    render(<Apps color="violet" />);
    expect(screen.getByRole("toolbar").style.getPropertyValue("--neon")).toBe("168 85 247");
  });
});
