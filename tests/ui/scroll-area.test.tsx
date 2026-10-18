import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ScrollArea } from "@/components/ui/scroll-area";

// jsdom has no layout. These numbers describe a 200px viewport over 1000px of
// content, with a 200px track: 196px of travel after its 2px end padding.
const VIEWPORT = 200;
const CONTENT = 1000;
const TRAVEL = 196;
const THUMB = (TRAVEL * VIEWPORT) / CONTENT; // 39.2

function mockLayout({ content = CONTENT }: { content?: number } = {}) {
  const isViewport = (el: Element) => el.hasAttribute("data-nk-scroll-viewport");
  const isTrack = (el: Element) => el.getAttribute("data-axis") === "y";
  vi.spyOn(Element.prototype, "scrollHeight", "get").mockImplementation(function (this: Element) {
    return isViewport(this) ? content : 0;
  });
  vi.spyOn(Element.prototype, "clientHeight", "get").mockImplementation(function (this: Element) {
    return isViewport(this) || isTrack(this) ? VIEWPORT : 0;
  });
}

function renderArea(props: React.ComponentProps<typeof ScrollArea> = {}) {
  const viewportRef = React.createRef<HTMLDivElement>();
  const utils = render(
    <ScrollArea aria-label="Changelog" viewportRef={viewportRef} {...props}>
      {props.children ?? <p>v2.3.0 · Table, Timeline and Scroll Area</p>}
    </ScrollArea>,
  );
  const viewport = viewportRef.current as HTMLDivElement;
  const track = utils.container.querySelector('[data-axis="y"]') as HTMLDivElement;
  const thumb = track.lastElementChild as HTMLDivElement;
  return { ...utils, viewport, track, thumb };
}

function scrollTo(viewport: HTMLElement, top: number) {
  viewport.scrollTop = top;
  fireEvent.scroll(viewport);
}

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("ScrollArea", () => {
  it("renders children in a named, native scroll viewport", () => {
    const { viewport } = renderArea();
    expect(screen.getByRole("region", { name: "Changelog" })).toBe(viewport);
    expect(viewport).toHaveTextContent("v2.3.0");
    expect(viewport.className).toContain("overflow-y-auto");
  });

  it("forwards onScroll from the viewport", () => {
    const onScroll = vi.fn();
    const { viewport } = renderArea({ onScroll });
    fireEvent.scroll(viewport);
    expect(onScroll).toHaveBeenCalledTimes(1);
  });

  it("joins the tab order only when it overflows and has nothing focusable", () => {
    mockLayout();
    const { viewport, unmount } = renderArea();
    expect(viewport).toHaveAttribute("tabindex", "0");
    unmount();

    renderArea({ children: <button type="button">Read more</button> });
    expect(screen.getByRole("region", { name: "Changelog" })).not.toHaveAttribute("tabindex");
  });

  it("stays out of the tab order when nothing overflows", () => {
    mockLayout({ content: VIEWPORT });
    const { viewport } = renderArea();
    expect(viewport).not.toHaveAttribute("tabindex");
  });

  it("sizes and positions the thumb from the scroll position", () => {
    mockLayout();
    const { viewport, thumb } = renderArea();
    expect(parseFloat(thumb.style.height)).toBeCloseTo(THUMB);
    expect(thumb.style.transform).toBe("translate3d(0, 0px, 0)");

    scrollTo(viewport, 400);
    const offset = ((TRAVEL - THUMB) * 400) / (CONTENT - VIEWPORT);
    expect(thumb.style.transform).toBe(`translate3d(0, ${offset}px, 0)`);
  });

  it("fades only the edges with more content past them", () => {
    mockLayout();
    const { viewport } = renderArea();
    expect(viewport.style.getPropertyValue("--nk-fade-top")).toBe("0px");
    expect(viewport.style.getPropertyValue("--nk-fade-bottom")).toBe("24px");

    scrollTo(viewport, 10);
    expect(viewport.style.getPropertyValue("--nk-fade-top")).toBe("10px");

    scrollTo(viewport, CONTENT - VIEWPORT);
    expect(viewport.style.getPropertyValue("--nk-fade-top")).toBe("24px");
    expect(viewport.style.getPropertyValue("--nk-fade-bottom")).toBe("0px");
  });

  it("skips the mask when fade is off", () => {
    mockLayout();
    const { viewport } = renderArea({ fade: false });
    expect(viewport.style.maskImage).toBe("");
    expect(viewport.style.getPropertyValue("--nk-fade-bottom")).toBe("");
  });

  it("shows the hover scrollbar on hover and while scrolling", () => {
    vi.useFakeTimers();
    mockLayout();
    const { viewport, track, container } = renderArea();
    expect(track).toHaveAttribute("data-state", "hidden");

    fireEvent.pointerEnter(container.firstElementChild as HTMLElement);
    expect(track).toHaveAttribute("data-state", "visible");
    fireEvent.pointerLeave(container.firstElementChild as HTMLElement);
    expect(track).toHaveAttribute("data-state", "hidden");

    scrollTo(viewport, 50);
    expect(track).toHaveAttribute("data-state", "visible");
    act(() => vi.advanceTimersByTime(1000));
    expect(track).toHaveAttribute("data-state", "hidden");
  });

  it("shows auto scrollbars whenever content overflows, and always tracks regardless", () => {
    mockLayout();
    const auto = renderArea({ scrollbar: "auto" });
    expect(auto.track).toHaveAttribute("data-state", "visible");
    auto.unmount();

    mockLayout({ content: VIEWPORT });
    const always = renderArea({ scrollbar: "always" });
    expect(always.track).toHaveAttribute("data-state", "visible");
    expect(always.thumb.className).toContain("invisible");
  });

  it("scrolls when the thumb is dragged", () => {
    mockLayout();
    const { viewport, track, thumb } = renderArea();
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 12, VIEWPORT));
    vi.spyOn(thumb, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 2, 12, THUMB));

    // Grab the thumb 8px below its top edge, then move it half its travel.
    fireEvent.pointerDown(thumb, { button: 0, clientY: 10, pointerId: 1 });
    expect(thumb).toHaveAttribute("data-state", "dragging");
    fireEvent.pointerMove(track, { clientY: 10 + (TRAVEL - THUMB) / 2, pointerId: 1 });
    expect(viewport.scrollTop).toBeCloseTo((CONTENT - VIEWPORT) / 2);

    fireEvent.pointerUp(track, { pointerId: 1 });
    expect(thumb).not.toHaveAttribute("data-state");
  });

  it("jumps to a point pressed on the track", () => {
    mockLayout();
    const { viewport, track, thumb } = renderArea();
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 12, VIEWPORT));
    vi.spyOn(thumb, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 2, 12, THUMB));

    // Centering the thumb on the middle of its travel lands halfway down.
    fireEvent.pointerDown(track, { button: 0, clientY: 2 + TRAVEL / 2, pointerId: 1 });
    expect(viewport.scrollTop).toBeCloseTo((CONTENT - VIEWPORT) / 2);
  });

  it("ignores secondary buttons on the track", () => {
    mockLayout();
    const { viewport, track } = renderArea();
    fireEvent.pointerDown(track, { button: 2, clientY: 150, pointerId: 1 });
    expect(viewport.scrollTop).toBe(0);
  });

  it("passes wheel input over the scrollbar through to the viewport", () => {
    mockLayout();
    const { viewport, track } = renderArea();
    const notPrevented = fireEvent.wheel(track, { deltaY: 120 });
    expect(viewport.scrollTop).toBe(120);
    expect(notPrevented).toBe(false);
  });

  it("renders a horizontal bar for horizontal areas", () => {
    const { container } = render(
      <ScrollArea orientation="horizontal">
        <p>tags</p>
      </ScrollArea>,
    );
    expect(container.querySelector('[data-axis="x"]')).toBeInTheDocument();
    expect(container.querySelector('[data-axis="y"]')).not.toBeInTheDocument();
  });

  it("forwards the root ref and color", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(
      <ScrollArea ref={ref} color="amber">
        <p>Regions</p>
      </ScrollArea>,
    );
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("251 191 36");
    expect(ref.current).toHaveAttribute("data-orientation", "vertical");
  });
});
