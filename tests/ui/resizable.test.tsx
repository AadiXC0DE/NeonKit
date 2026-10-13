import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  type ResizablePanelApi,
} from "@/components/ui/resizable";

afterEach(() => window.localStorage.clear());

function Layout({
  onLayout,
  autoSaveId,
  apiRef,
}: {
  onLayout?: (sizes: number[]) => void;
  autoSaveId?: string;
  apiRef?: React.Ref<ResizablePanelApi>;
}) {
  return (
    <ResizablePanelGroup direction="horizontal" onLayout={onLayout} autoSaveId={autoSaveId}>
      <ResizablePanel id="files" defaultSize={30} minSize={20} maxSize={50} collapsible apiRef={apiRef}>
        Files
      </ResizablePanel>
      <ResizableHandle aria-label="Resize files" />
      <ResizablePanel id="editor" defaultSize={70} minSize={30}>
        Editor
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

const handle = () => screen.getByRole("separator", { name: "Resize files" });

describe("Resizable", () => {
  it("renders a focusable window splitter with the primary pane's size", () => {
    render(<Layout />);
    const separator = handle();
    expect(separator).toHaveAttribute("tabindex", "0");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).toHaveAttribute("aria-valuenow", "30");
    expect(separator).toHaveAttribute("aria-valuemin", "0");
    expect(separator).toHaveAttribute("aria-valuemax", "50");
    expect(separator).toHaveAttribute("aria-controls", "files");
  });

  it("sizes panels with flex-grow from the layout", () => {
    render(<Layout />);
    expect(screen.getByText("Files").style.flexGrow).toBe("30");
    expect(screen.getByText("Editor").style.flexGrow).toBe("70");
  });

  it("resizes with the arrow keys, 1% with Shift, and reports the layout", () => {
    const onLayout = vi.fn();
    render(<Layout onLayout={onLayout} />);
    fireEvent.keyDown(handle(), { key: "ArrowRight" });
    expect(handle()).toHaveAttribute("aria-valuenow", "35");
    fireEvent.keyDown(handle(), { key: "ArrowLeft", shiftKey: true });
    expect(handle()).toHaveAttribute("aria-valuenow", "34");
    expect(onLayout).toHaveBeenLastCalledWith([34, 66]);
  });

  it("stops at min and max, and Home and End jump to them", () => {
    render(<Layout />);
    fireEvent.keyDown(handle(), { key: "End" });
    expect(handle()).toHaveAttribute("aria-valuenow", "50");
    fireEvent.keyDown(handle(), { key: "ArrowRight" });
    expect(handle()).toHaveAttribute("aria-valuenow", "50");
    fireEvent.keyDown(handle(), { key: "Home" });
    expect(handle()).toHaveAttribute("aria-valuenow", "0");
  });

  it("collapses on Enter and restores the previous size on the next", () => {
    render(<Layout />);
    fireEvent.keyDown(handle(), { key: "ArrowRight" });
    fireEvent.keyDown(handle(), { key: "Enter" });
    expect(handle()).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("Files")).toHaveAttribute("data-state", "collapsed");
    fireEvent.keyDown(handle(), { key: "Enter" });
    expect(handle()).toHaveAttribute("aria-valuenow", "35");
  });

  it("collapses on double-click", () => {
    render(<Layout />);
    fireEvent.doubleClick(handle());
    expect(handle()).toHaveAttribute("aria-valuenow", "0");
  });

  it("steps from the minimum straight to collapsed", () => {
    render(<Layout />);
    fireEvent.keyDown(handle(), { key: "ArrowLeft" });
    fireEvent.keyDown(handle(), { key: "ArrowLeft" });
    expect(handle()).toHaveAttribute("aria-valuenow", "20");
    fireEvent.keyDown(handle(), { key: "ArrowLeft" });
    expect(handle()).toHaveAttribute("aria-valuenow", "0");
  });

  it("saves the layout under autoSaveId and restores it", () => {
    const { unmount } = render(<Layout autoSaveId="ide" />);
    fireEvent.keyDown(handle(), { key: "ArrowRight" });
    expect(JSON.parse(window.localStorage.getItem("nk-resizable:ide")!)).toEqual([35, 65]);
    unmount();
    render(<Layout autoSaveId="ide" />);
    expect(handle()).toHaveAttribute("aria-valuenow", "35");
  });

  it("ignores a corrupt saved layout and survives storage that throws", () => {
    window.localStorage.setItem("nk-resizable:ide", "[1,2,3]");
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    render(<Layout autoSaveId="ide" />);
    expect(handle()).toHaveAttribute("aria-valuenow", "30");
    expect(() => fireEvent.keyDown(handle(), { key: "ArrowRight" })).not.toThrow();
    spy.mockRestore();
  });

  it("exposes collapse, expand and resize through apiRef", () => {
    const api = React.createRef<ResizablePanelApi>();
    render(<Layout apiRef={api} />);
    act(() => api.current!.collapse());
    expect(api.current!.isCollapsed()).toBe(true);
    act(() => api.current!.expand());
    expect(handle()).toHaveAttribute("aria-valuenow", "30");
    act(() => api.current!.resize(42));
    expect(api.current!.getSize()).toBeCloseTo(42);
  });

  it("orients the separator across a vertical group", () => {
    render(
      <ResizablePanelGroup direction="vertical">
        <ResizablePanel defaultSize={60}>Top</ResizablePanel>
        <ResizableHandle aria-label="Resize terminal" />
        <ResizablePanel defaultSize={40}>Bottom</ResizablePanel>
      </ResizablePanelGroup>,
    );
    const separator = screen.getByRole("separator", { name: "Resize terminal" });
    expect(separator).toHaveAttribute("aria-orientation", "horizontal");
    fireEvent.keyDown(separator, { key: "ArrowDown" });
    expect(separator).toHaveAttribute("aria-valuenow", "65");
  });
});
