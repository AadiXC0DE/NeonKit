import * as React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";

function Editor({ onValueChange, onSave }: { onValueChange?: (value: string | null) => void; onSave?: () => void }) {
  const [rulers, setRulers] = React.useState(true);
  return (
    <Menubar aria-label="Editor" onValueChange={onValueChange}>
      <MenubarMenu value="file">
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem shortcut="⌘N">New canvas</MenubarItem>
          <MenubarItem onSelect={onSave}>Save</MenubarItem>
          <MenubarSub>
            <MenubarSubTrigger>Export as</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>PNG</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="edit">
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo</MenubarItem>
          <MenubarItem>Redo</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu value="view">
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem checked={rulers} onCheckedChange={setRulers}>
            Rulers
          </MenubarCheckboxItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const title = (name: string) => screen.getByRole("menuitem", { name });
const flushFrame = () => act(() => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined))));

describe("Menubar", () => {
  it("renders a menubar of menuitem titles with a single Tab stop", async () => {
    render(<Editor />);
    expect(screen.getByRole("menubar", { name: "Editor" })).toHaveAttribute("aria-orientation", "horizontal");
    await waitFor(() => expect(title("Edit")).toHaveAttribute("tabindex", "-1"));
    expect(title("File")).toHaveAttribute("tabindex", "0");
    expect(title("File")).toHaveAttribute("aria-haspopup", "menu");
  });

  it("moves between titles with Left, Right, Home and End, wrapping", () => {
    render(<Editor />);
    title("File").focus();
    fireEvent.keyDown(title("File"), { key: "ArrowRight" });
    expect(title("Edit")).toHaveFocus();
    expect(title("Edit")).toHaveAttribute("tabindex", "0");
    fireEvent.keyDown(title("Edit"), { key: "End" });
    expect(title("View")).toHaveFocus();
    fireEvent.keyDown(title("View"), { key: "ArrowRight" });
    expect(title("File")).toHaveFocus();
    fireEvent.keyDown(title("File"), { key: "ArrowLeft" });
    expect(title("View")).toHaveFocus();
  });

  it("opens on ArrowDown onto the first item and moves across menus with ArrowRight", async () => {
    const onValueChange = vi.fn();
    render(<Editor onValueChange={onValueChange} />);
    title("File").focus();
    fireEvent.keyDown(title("File"), { key: "ArrowDown" });
    expect(onValueChange).toHaveBeenLastCalledWith("file");
    await flushFrame();
    expect(screen.getByRole("menuitem", { name: /New canvas/ })).toHaveFocus();

    fireEvent.keyDown(document.activeElement!, { key: "ArrowRight" });
    expect(onValueChange).toHaveBeenLastCalledWith("edit");
    expect(title("Edit")).toHaveAttribute("aria-expanded", "true");
    expect(title("File")).toHaveAttribute("aria-expanded", "false");
    await flushFrame();
    expect(screen.getByRole("menuitem", { name: "Undo" })).toHaveFocus();

    fireEvent.keyDown(document.activeElement!, { key: "ArrowLeft" });
    expect(onValueChange).toHaveBeenLastCalledWith("file");
  });

  it("lets a submenu trigger claim ArrowRight", async () => {
    const onValueChange = vi.fn();
    render(<Editor onValueChange={onValueChange} />);
    fireEvent.keyDown(title("File"), { key: "ArrowDown" });
    await flushFrame();
    const sub = screen.getByRole("menuitem", { name: "Export as" });
    sub.focus();
    fireEvent.keyDown(sub, { key: "ArrowRight" });
    expect(sub).toHaveAttribute("aria-expanded", "true");
    expect(onValueChange).toHaveBeenLastCalledWith("file");
  });

  it("opens other menus on hover once one is open", () => {
    const onValueChange = vi.fn();
    render(<Editor onValueChange={onValueChange} />);
    fireEvent.click(title("File"));
    expect(onValueChange).toHaveBeenLastCalledWith("file");
    fireEvent.pointerEnter(title("View"), { pointerType: "mouse" });
    expect(onValueChange).toHaveBeenLastCalledWith("view");
    expect(title("View")).toHaveAttribute("aria-expanded", "true");
  });

  it("does not open on hover while every menu is closed", () => {
    const onValueChange = vi.fn();
    render(<Editor onValueChange={onValueChange} />);
    fireEvent.pointerEnter(title("View"), { pointerType: "mouse" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("selects items, toggles checkbox items and closes with Escape onto the title", async () => {
    const onSave = vi.fn();
    render(<Editor onSave={onSave} />);
    fireEvent.click(title("File"));
    fireEvent.click(screen.getByRole("menuitem", { name: "Save" }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(title("File")).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(title("View"));
    const rulers = screen.getByRole("menuitemcheckbox", { name: "Rulers" });
    expect(rulers).toHaveAttribute("aria-checked", "true");
    fireEvent.click(rulers);
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    fireEvent.click(title("View"));
    expect(screen.getByRole("menuitemcheckbox", { name: "Rulers" })).toHaveAttribute("aria-checked", "false");

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(title("View")).toHaveAttribute("aria-expanded", "false");
    expect(title("View")).toHaveFocus();
  });
});
