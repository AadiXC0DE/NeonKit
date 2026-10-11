import * as React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CursorGlow } from "@/components/ui/cursor-glow";

function setup(props: React.ComponentProps<typeof CursorGlow> = {}) {
  const view = render(
    <section data-testid="panel" style={{ position: "relative" }}>
      <CursorGlow data-testid="glow" {...props} />
      <h2>Ship at 2am</h2>
    </section>,
  );
  const panel = view.getByTestId("panel");
  const glow = view.getByTestId("glow");
  const light = glow.firstElementChild as HTMLElement;
  return { ...view, panel, glow, light };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("CursorGlow", () => {
  it("is a decorative layer that fills its parent", () => {
    const { glow } = setup({ color: "lime" });
    expect(glow).toHaveAttribute("aria-hidden", "true");
    expect(glow.className).toContain("pointer-events-none");
    expect(glow.className).toContain("absolute");
    expect(glow.className).toContain("inset-0");
    expect(glow.style.getPropertyValue("--neon")).toBe("163 230 53");
  });

  it("lights up and follows a mouse over the parent", async () => {
    const { panel, light } = setup();
    expect(light.style.opacity).toBe("");
    fireEvent.pointerMove(panel, { pointerType: "mouse", clientX: 120, clientY: 80 });
    expect(light.style.opacity).toBe("1");
    await waitFor(() => expect(light.style.transform).toBe("translate3d(120px, 80px, 0)"));
  });

  it("fades out when the pointer leaves", () => {
    const { panel, light } = setup();
    fireEvent.pointerMove(panel, { pointerType: "mouse", clientX: 40, clientY: 40 });
    fireEvent.pointerLeave(panel, { pointerType: "mouse" });
    expect(light.style.opacity).toBe("0");
  });

  it("ignores touch", () => {
    const { panel, light } = setup();
    fireEvent.pointerMove(panel, { pointerType: "touch", clientX: 40, clientY: 40 });
    expect(light.style.opacity).toBe("");
  });

  it("eases toward the pointer, or jumps straight there under reduced motion", async () => {
    const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const first = setup();
    fireEvent.pointerMove(first.panel, { pointerType: "mouse", clientX: 0, clientY: 0 });
    await nextFrame();
    fireEvent.pointerMove(first.panel, { pointerType: "mouse", clientX: 200, clientY: 100 });
    await nextFrame();
    expect(first.light.style.transform).not.toBe("translate3d(200px, 100px, 0)");
    first.unmount();

    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query.includes("reduce"),
          media: query,
          addEventListener: () => {},
          removeEventListener: () => {},
        }) as unknown as MediaQueryList,
    );
    const reduced = setup();
    fireEvent.pointerMove(reduced.panel, { pointerType: "mouse", clientX: 0, clientY: 0 });
    await nextFrame();
    fireEvent.pointerMove(reduced.panel, { pointerType: "mouse", clientX: 200, clientY: 100 });
    await nextFrame();
    expect(reduced.light.style.transform).toBe("translate3d(200px, 100px, 0)");
  });

  it("sizes the light from the size prop", () => {
    const { light } = setup({ size: 200 });
    const disc = light.firstElementChild?.firstElementChild as HTMLElement;
    expect(disc.style.width).toBe("200px");
    expect(disc.style.marginLeft).toBe("-100px");
  });

  it("draws the tail on a canvas only when asked, and survives a missing 2D context", () => {
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    const { glow, panel, rerender } = setup();
    expect(glow.querySelector("canvas")).toBeNull();
    rerender(
      <section data-testid="panel" style={{ position: "relative" }}>
        <CursorGlow data-testid="glow" trail />
      </section>,
    );
    expect(glow.querySelector("canvas")).not.toBeNull();
    expect(() => fireEvent.pointerMove(panel, { pointerType: "mouse", clientX: 10, clientY: 10 })).not.toThrow();
  });

  it("covers the viewport and listens on the window with target=window", () => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const { glow, unmount } = setup({ target: "window" });
    expect(glow.className).toContain("fixed");
    expect(add.mock.calls.some(([type]) => type === "pointermove")).toBe(true);
    unmount();
    expect(remove.mock.calls.some(([type]) => type === "pointermove")).toBe(true);
  });

  it("stops listening to its parent when unmounted", () => {
    const { panel, unmount } = setup();
    const remove = vi.spyOn(panel, "removeEventListener");
    unmount();
    expect(remove.mock.calls.map(([type]) => type)).toEqual(expect.arrayContaining(["pointermove", "pointerleave"]));
  });
});
