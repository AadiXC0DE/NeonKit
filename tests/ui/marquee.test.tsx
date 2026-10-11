import * as React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Marquee } from "@/components/ui/marquee";

const items = ["Open late", "Karaoke", "Noodles"];

function Strip(props: React.ComponentProps<typeof Marquee>) {
  return (
    <Marquee data-testid="marquee" {...props}>
      {items.map((item) => (
        <a key={item} href={`#${item}`}>
          {item}
        </a>
      ))}
    </Marquee>
  );
}

type FakeAnimation = {
  keyframes: Keyframe[];
  options: KeyframeAnimationOptions;
  playbackRate: number;
  currentTime: number;
  effect: { getComputedTiming: () => { progress: number } };
  cancel: () => void;
};

// jsdom has no layout, ResizeObserver or Web Animations. Stand in a 500px
// viewport whose copies are each 200px apart, and record the loop.
function stubLayout() {
  const animations: FakeAnimation[] = [];
  const descriptors = {
    offsetLeft: Object.getOwnPropertyDescriptor(HTMLElement.prototype, "offsetLeft"),
    clientWidth: Object.getOwnPropertyDescriptor(Element.prototype, "clientWidth"),
  };
  Object.defineProperty(HTMLElement.prototype, "offsetLeft", {
    configurable: true,
    get(this: HTMLElement) {
      return this.parentElement ? Array.prototype.indexOf.call(this.parentElement.children, this) * 200 : 0;
    },
  });
  Object.defineProperty(Element.prototype, "clientWidth", { configurable: true, get: () => 500 });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(private callback: () => void) {}
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
  HTMLElement.prototype.animate = function (keyframes: Keyframe[], options: KeyframeAnimationOptions) {
    const animation: FakeAnimation = {
      keyframes,
      options,
      playbackRate: 1,
      currentTime: 0,
      effect: { getComputedTiming: () => ({ progress: 0 }) },
      cancel: () => {},
    };
    animations.push(animation);
    return animation as unknown as Animation;
  } as typeof HTMLElement.prototype.animate;

  return {
    animations,
    restore() {
      for (const [key, descriptor] of Object.entries(descriptors)) {
        const target = key === "clientWidth" ? Element.prototype : HTMLElement.prototype;
        if (descriptor) Object.defineProperty(target, key, descriptor);
      }
      // @ts-expect-error jsdom never had it
      delete HTMLElement.prototype.animate;
      vi.unstubAllGlobals();
    },
  };
}

let layout: ReturnType<typeof stubLayout> | null = null;

afterEach(() => {
  layout?.restore();
  layout = null;
  vi.restoreAllMocks();
});

describe("Marquee", () => {
  it("exposes each item once and hides the duplicates", () => {
    const { container } = render(<Strip />);
    for (const item of items) {
      expect(screen.getAllByRole("link", { name: item })).toHaveLength(1);
      expect(screen.getAllByText(item).length).toBeGreaterThan(1);
    }
    const copies = container.querySelectorAll('[aria-hidden="true"]');
    expect(copies.length).toBeGreaterThan(0);
    copies.forEach((copy) => expect((copy as HTMLElement).inert).toBe(true));
  });

  it("reads color through --neon and sets the gap", () => {
    const { rerender } = render(<Strip color="pink" />);
    const root = screen.getByTestId("marquee");
    expect(root.style.getPropertyValue("--neon")).toBe("255 95 162");
    expect(root.style.getPropertyValue("--nk-marquee-gap")).toBe("32px");
    rerender(<Strip gap="2rem" />);
    expect(root.style.getPropertyValue("--nk-marquee-gap")).toBe("2rem");
  });

  it("stacks vertically", () => {
    render(<Strip orientation="vertical" />);
    const root = screen.getByTestId("marquee");
    expect(root.className).toContain("flex-col");
    expect((root.firstElementChild as HTMLElement).className).toContain("flex-col");
  });

  it("reports the paused prop", () => {
    const { rerender } = render(<Strip />);
    expect(screen.getByTestId("marquee")).toHaveAttribute("data-state", "running");
    rerender(<Strip paused />);
    expect(screen.getByTestId("marquee")).toHaveAttribute("data-state", "paused");
  });

  it("loops one copy's length at the given speed, with copies on both sides", async () => {
    layout = stubLayout();
    const { container } = render(<Strip speed={40} />);
    await waitFor(() => expect(layout!.animations.length).toBeGreaterThan(0));
    const loop = layout.animations.at(-1)!;
    // The exposed copy starts mid-viewport (250px) with two copies before it.
    expect(loop.keyframes).toEqual([
      { transform: "translate3d(-150px, 0, 0)" },
      { transform: "translate3d(-350px, 0, 0)" },
    ]);
    expect(loop.options).toMatchObject({ duration: 5000, iterations: Infinity, direction: "normal" });
    const track = container.querySelector("[data-testid=marquee] > div") as HTMLElement;
    const exposed = Array.from(track.children).findIndex((copy) => !copy.hasAttribute("aria-hidden"));
    expect(exposed).toBe(2);
    expect(track.children.length).toBeGreaterThanOrEqual(4);
  });

  it("runs in reverse", async () => {
    layout = stubLayout();
    render(<Strip reverse />);
    await waitFor(() => expect(layout!.animations.at(-1)?.options.direction).toBe("reverse"));
  });

  it("eases to a stop on hover and back up when the pointer leaves", async () => {
    layout = stubLayout();
    render(<Strip />);
    await waitFor(() => expect(layout!.animations.length).toBeGreaterThan(0));
    const root = screen.getByTestId("marquee");
    fireEvent.pointerEnter(root, { pointerType: "mouse" });
    const loop = layout.animations.at(-1)!;
    await waitFor(() => expect(loop.playbackRate).toBeLessThan(1));
    await waitFor(() => expect(loop.playbackRate).toBe(0));
    fireEvent.pointerLeave(root, { pointerType: "mouse" });
    await waitFor(() => expect(loop.playbackRate).toBe(1));
  });

  it("keeps moving on hover when pauseOnHover is off", async () => {
    layout = stubLayout();
    render(<Strip pauseOnHover={false} />);
    await waitFor(() => expect(layout!.animations.length).toBeGreaterThan(0));
    fireEvent.pointerEnter(screen.getByTestId("marquee"), { pointerType: "mouse" });
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(layout.animations.at(-1)!.playbackRate).toBe(1);
  });

  it("stops at once when focus moves inside", async () => {
    layout = stubLayout();
    render(<Strip />);
    await waitFor(() => expect(layout!.animations.length).toBeGreaterThan(0));
    act(() => screen.getByRole("link", { name: "Karaoke" }).focus());
    expect(layout.animations.at(-1)!.playbackRate).toBe(0);
    act(() => screen.getByRole("link", { name: "Karaoke" }).blur());
    await waitFor(() => expect(layout!.animations.at(-1)!.playbackRate).toBe(1));
  });

  it("holds still while paused", async () => {
    layout = stubLayout();
    render(<Strip paused />);
    await waitFor(() => expect(layout!.animations.length).toBeGreaterThan(0));
    expect(layout.animations.at(-1)!.playbackRate).toBe(0);
  });

  it("drops the copies and scrolls instead under reduced motion", async () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("reduce"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    const { container } = render(<Strip />);
    await waitFor(() => expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(0));
    expect(screen.getByTestId("marquee").className).toContain("overflow-x-auto");
    expect(screen.getAllByText("Karaoke")).toHaveLength(1);
  });
});
