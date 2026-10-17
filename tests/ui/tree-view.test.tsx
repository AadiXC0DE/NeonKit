import * as React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TreeView, type TreeNode } from "@/components/ui/tree-view";

const data: TreeNode[] = [
  {
    id: "app",
    label: "app",
    children: [
      { id: "app/page.tsx", label: "page.tsx" },
      { id: "app/layout.tsx", label: "layout.tsx" },
      { id: "app/blog", label: "blog", children: [{ id: "app/blog/post.tsx", label: "post.tsx" }] },
    ],
  },
  { id: "lib", label: "lib", children: [{ id: "lib/utils.ts", label: "utils.ts" }] },
  { id: "readme", label: "README.md" },
];

const item = (name: string) => screen.getByRole("treeitem", { name: new RegExp(`^${name.replace(".", "\\.")}`) });
const focused = () => (document.activeElement as HTMLElement | null)?.dataset.nodeId;
const key = (k: string, init: Partial<KeyboardEventInit> = {}) =>
  fireEvent.keyDown(document.activeElement as HTMLElement, { key: k, ...init });

describe("TreeView", () => {
  it("renders the APG tree structure", () => {
    render(<TreeView aria-label="Files" data={data} defaultExpanded={["app"]} />);
    expect(screen.getByRole("tree", { name: "Files" })).toBeInTheDocument();
    const app = item("app");
    expect(app).toHaveAttribute("aria-expanded", "true");
    expect(app).toHaveAttribute("aria-level", "1");
    expect(app).toHaveAttribute("aria-posinset", "1");
    expect(app).toHaveAttribute("aria-setsize", "3");
    expect(item("layout.tsx")).toHaveAttribute("aria-level", "2");
    expect(item("README.md")).not.toHaveAttribute("aria-expanded");
    expect(screen.getAllByRole("group").length).toBeGreaterThan(0);
  });

  it("keeps one tab stop", () => {
    render(<TreeView aria-label="Files" data={data} defaultSelected={["lib"]} />);
    const tabbable = screen.getAllByRole("treeitem").filter((el) => el.tabIndex === 0);
    expect(tabbable).toHaveLength(1);
    expect(tabbable[0]).toHaveAttribute("data-node-id", "lib");
  });

  it("moves with the arrows, opens with Right and closes with Left", () => {
    const onExpandedChange = vi.fn();
    render(<TreeView aria-label="Files" data={data} onExpandedChange={onExpandedChange} />);
    act(() => item("app").focus());
    key("ArrowRight");
    expect(onExpandedChange).toHaveBeenLastCalledWith(["app"]);
    expect(item("app")).toHaveAttribute("aria-expanded", "true");
    key("ArrowRight");
    expect(focused()).toBe("app/page.tsx");
    key("ArrowDown");
    expect(focused()).toBe("app/layout.tsx");
    key("ArrowLeft");
    expect(focused()).toBe("app");
    key("ArrowLeft");
    expect(item("app")).toHaveAttribute("aria-expanded", "false");
    key("ArrowDown");
    expect(focused()).toBe("lib");
  });

  it("jumps with Home and End and finds nodes by typing", () => {
    render(<TreeView aria-label="Files" data={data} defaultExpanded={["app"]} />);
    act(() => item("app").focus());
    key("End");
    expect(focused()).toBe("readme");
    key("Home");
    expect(focused()).toBe("app");
    key("l");
    expect(focused()).toBe("app/layout.tsx");
    key("l");
    expect(focused()).toBe("lib");
  });

  it("expands every sibling with *", () => {
    render(<TreeView aria-label="Files" data={data} />);
    act(() => item("app").focus());
    key("*");
    expect(item("app")).toHaveAttribute("aria-expanded", "true");
    expect(item("lib")).toHaveAttribute("aria-expanded", "true");
  });

  it("selects one node in single mode and fires onAction for leaves", () => {
    const onSelectedChange = vi.fn();
    const onAction = vi.fn();
    render(
      <TreeView aria-label="Files" data={data} defaultExpanded={["app"]} onSelectedChange={onSelectedChange} onAction={onAction} />,
    );
    fireEvent.click(item("page.tsx").querySelector("[data-tree-row]")!);
    expect(onSelectedChange).toHaveBeenLastCalledWith(["app/page.tsx"]);
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: "app/page.tsx" }));
    expect(item("page.tsx")).toHaveAttribute("aria-selected", "true");
    act(() => item("layout.tsx").focus());
    key("Enter");
    expect(item("layout.tsx")).toHaveAttribute("aria-selected", "true");
    expect(item("page.tsx")).toHaveAttribute("aria-selected", "false");
  });

  it("toggles, ranges and selects all in multiple mode", () => {
    render(<TreeView aria-label="Files" data={data} selectionMode="multiple" defaultExpanded={["app"]} />);
    expect(screen.getByRole("tree")).toHaveAttribute("aria-multiselectable", "true");
    act(() => item("page.tsx").focus());
    key(" ");
    key("ArrowDown", { shiftKey: true });
    expect(item("page.tsx")).toHaveAttribute("aria-selected", "true");
    expect(item("layout.tsx")).toHaveAttribute("aria-selected", "true");
    fireEvent.click(item("README.md").querySelector("[data-tree-row]")!, { shiftKey: true });
    expect(item("lib")).toHaveAttribute("aria-selected", "true");
    fireEvent.click(item("lib").querySelector("[data-tree-row]")!, { metaKey: true });
    expect(item("lib")).toHaveAttribute("aria-selected", "false");
    key("a", { ctrlKey: true });
    expect(screen.getAllByRole("treeitem").every((el) => el.getAttribute("aria-selected") === "true")).toBe(true);
  });

  it("loads lazy children once, marking the branch busy meanwhile", async () => {
    let resolve: (nodes: TreeNode[]) => void = () => {};
    const loadChildren = vi.fn(() => new Promise<TreeNode[]>((r) => (resolve = r)));
    render(<TreeView aria-label="Bucket" data={[{ id: "media", label: "media", isBranch: true }]} loadChildren={loadChildren} />);
    act(() => item("media").focus());
    key("ArrowRight");
    expect(loadChildren).toHaveBeenCalledTimes(1);
    expect(item("media")).toHaveAttribute("aria-busy", "true");
    await act(async () => resolve([{ id: "media/a.png", label: "a.png" }]));
    expect(item("a.png")).toHaveAttribute("aria-level", "2");
    expect(item("media")).not.toHaveAttribute("aria-busy");
    key("ArrowLeft");
    key("ArrowRight");
    expect(loadChildren).toHaveBeenCalledTimes(1);
  });

  it("shows an error row when loading fails and retries on reopen", async () => {
    const loadChildren = vi.fn(() => Promise.reject(new Error("403")));
    render(<TreeView aria-label="Bucket" data={[{ id: "x", label: "x", isBranch: true }]} loadChildren={loadChildren} />);
    act(() => item("x").focus());
    key("ArrowRight");
    await waitFor(() => expect(screen.getByText(/Couldn.t load/)).toBeInTheDocument());
    key("ArrowLeft");
    key("ArrowRight");
    expect(loadChildren).toHaveBeenCalledTimes(2);
  });

  it("skips disabled nodes", () => {
    render(
      <TreeView
        aria-label="Files"
        data={[{ id: "a", label: "a" }, { id: "b", label: "b", disabled: true }, { id: "c", label: "c" }]}
      />,
    );
    act(() => item("a").focus());
    key("ArrowDown");
    expect(focused()).toBe("c");
    expect(item("b")).toHaveAttribute("aria-disabled", "true");
  });
});
