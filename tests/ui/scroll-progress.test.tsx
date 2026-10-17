import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ScrollProgress } from "@/components/ui/scroll-progress";

let frames: FrameRequestCallback[] = [];
const flush = () =>
  act(() => {
    const queue = frames;
    frames = [];
    queue.forEach((callback) => callback(0));
  });

function scrollable(node: HTMLElement, height: number, viewport: number) {
  Object.defineProperty(node, "scrollHeight", { configurable: true, value: height });
  Object.defineProperty(node, "clientHeight", { configurable: true, value: viewport });
}

function Article(props: Partial<React.ComponentProps<typeof ScrollProgress>>) {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div>
      <ScrollProgress target={ref} {...props} />
      <div ref={ref} data-testid="article" />
    </div>
  );
}

beforeEach(() => {
  frames = [];
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    frames.push(callback);
    return frames.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ScrollProgress", () => {
  it("is a named progressbar pinned to the top of the window when it follows the page", () => {
    render(<ScrollProgress />);
    const bar = screen.getByRole("progressbar", { name: "Reading progress" });
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(bar.className).toContain("fixed");
    expect(bar.className).toContain("top-0");
  });

  it("sits in the flow when it follows a container, and can pin to the bottom", () => {
    const { unmount } = render(<Article />);
    expect(screen.getByRole("progressbar").className).not.toContain("fixed");
    unmount();
    render(<ScrollProgress position="bottom" />);
    expect(screen.getByRole("progressbar").className).toContain("bottom-0");
  });

  it("lights the tube with a translate as the container scrolls, and reports whole percents", () => {
    const onProgressChange = vi.fn();
    const { container } = render(<Article onProgressChange={onProgressChange} />);
    const article = screen.getByTestId("article");
    scrollable(article, 1000, 200);
    article.scrollTop = 400;
    fireEvent.scroll(article);
    flush();
    const fill = container.querySelector<HTMLElement>(".will-change-transform");
    expect(fill?.style.transform).toBe("translate3d(-50%, 0, 0)");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    expect(onProgressChange).toHaveBeenLastCalledWith(50);
  });

  it("only schedules one write per frame however many scroll events arrive", () => {
    render(<Article />);
    const article = screen.getByTestId("article");
    scrollable(article, 1000, 200);
    for (let i = 0; i < 5; i++) fireEvent.scroll(article);
    expect(frames).toHaveLength(1);
  });

  it("marks the end so the whole tube burns brighter", () => {
    render(<Article />);
    const article = screen.getByTestId("article");
    scrollable(article, 1000, 200);
    article.scrollTop = 800;
    fireEvent.scroll(article);
    flush();
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("data-complete");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });

  it("follows the window", () => {
    render(<ScrollProgress />);
    Object.defineProperty(document.documentElement, "scrollHeight", { configurable: true, value: 2900 });
    Object.defineProperty(window, "innerHeight", { configurable: true, value: 900 });
    Object.defineProperty(window, "scrollY", { configurable: true, value: 500 });
    fireEvent.scroll(window);
    flush();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "25");
  });

  it("draws the ring as a dash and turns its tip with the progress", () => {
    const { container } = render(
      <Article variant="ring" aria-label="Guide progress">
        <span>icon</span>
      </Article>,
    );
    const ring = screen.getByRole("progressbar", { name: "Guide progress" });
    expect(ring).toHaveTextContent("icon");
    const article = screen.getByTestId("article");
    scrollable(article, 600, 200);
    article.scrollTop = 100;
    fireEvent.scroll(article);
    flush();
    const arcs = container.querySelectorAll("circle[pathLength]");
    expect(arcs[1].getAttribute("stroke-dasharray")).toBe("0.25 2");
    expect(arcs[1].getAttribute("opacity")).toBe("1");
    const tip = ring.querySelector<HTMLElement>("span.pointer-events-none");
    expect(tip?.style.transform).toBe("rotate(90deg)");
  });

  it("forwards the ref and takes its color through --neon", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<ScrollProgress ref={ref} color="lime" />);
    expect(ref.current?.style.getPropertyValue("--neon")).toBe("163 230 53");
  });
});
