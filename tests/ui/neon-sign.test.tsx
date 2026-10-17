import * as React from "react";
import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NeonSign } from "@/components/ui/neon-sign";

const lettersOf = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>("[data-nk-letter]"));

describe("NeonSign", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("gives screen readers every line once and hides the tube copies", () => {
    const { container } = render(<NeonSign lines={["OPEN", { text: "late" }]} />);
    expect(screen.getByText("OPEN late")).toHaveClass("sr-only");
    const layers = container.querySelectorAll('[data-part="line"] .nk-neon-sign-glass, [data-part="line"] .nk-neon-sign-tube');
    expect(layers).toHaveLength(4);
    for (const layer of layers) expect(layer).toHaveAttribute("aria-hidden", "true");
  });

  it("splits one lit and one unlit copy per letter, skipping spaces", () => {
    const { container } = render(<NeonSign lines={["NO VACANCY"]} />);
    expect(lettersOf(container).map((el) => el.dataset.nkLetter)).toEqual(["0", "1", "2", "3", "4", "5", "6", "7", "8"]);
  });

  it("reflects the power state", () => {
    const { container, rerender } = render(<NeonSign lines={["OPEN"]} />);
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-state", "on");
    expect(root).toHaveClass("nk-neon-sign-on");
    rerender(<NeonSign lines={["OPEN"]} on={false} />);
    expect(root).toHaveAttribute("data-state", "off");
    expect(root).not.toHaveClass("nk-neon-sign-on");
  });

  it("colors the sign and each line through --neon", () => {
    const { container } = render(
      <NeonSign color="cyan" lines={["OPEN", { text: "late", color: "pink", className: "text-[0.5em]" }]} />,
    );
    const root = container.firstElementChild as HTMLElement;
    const [first, second] = Array.from(container.querySelectorAll<HTMLElement>('[data-part="line"]'));
    expect(root.style.getPropertyValue("--neon")).toBe("34 211 238");
    expect(first.style.getPropertyValue("--neon")).toBe("");
    expect(second.style.getPropertyValue("--neon")).toBe("255 95 162");
    expect(second).toHaveClass("text-[0.5em]");
  });

  it("treats a string child as lines split on newlines", () => {
    const { container } = render(<NeonSign>{"BAR\nopen"}</NeonSign>);
    expect(container.querySelectorAll('[data-part="line"]')).toHaveLength(2);
    expect(screen.getByText("BAR open")).toHaveClass("sr-only");
  });

  it("mounts the plate with four standoffs, the frame and the cable", () => {
    const { container } = render(<NeonSign lines={["OPEN"]} frame="pill" cable="left" />);
    expect(container.querySelector('[data-part="plate"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-part="standoff"]')).toHaveLength(4);
    expect(container.querySelector('[data-part="frame"]')).toHaveAttribute("data-shape", "pill");
    expect(container.querySelector('[data-part="cable"]')).toHaveAttribute("data-side", "left");
  });

  it("can drop the plate, the frame and the cable", () => {
    const { container } = render(<NeonSign lines={["OPEN"]} backplate={false} />);
    expect(container.querySelector('[data-part="plate"]')).toBeNull();
    expect(container.querySelector('[data-part="frame"]')).toBeNull();
    expect(container.querySelector('[data-part="cable"]')).toBeNull();
  });

  it("keeps exactly one letter dying, and lets you choose it", () => {
    const { container, rerender } = render(<NeonSign lines={["NO", "VACANCY"]} flicker="dying" dyingLetter={0} />);
    let dying = container.querySelectorAll("[data-dying]");
    expect(dying).toHaveLength(1);
    expect(dying[0]).toHaveTextContent("N");
    expect(dying[0]).toHaveClass("nk-neon-sign-x");

    rerender(<NeonSign lines={["NO", "VACANCY"]} flicker="dying" dyingLetter={4} />);
    dying = container.querySelectorAll("[data-dying]");
    expect(dying).toHaveLength(1);
    expect(dying[0]).toHaveTextContent("C");

    rerender(<NeonSign lines={["NO", "VACANCY"]} flicker="stutter" />);
    expect(container.querySelectorAll("[data-dying]")).toHaveLength(0);
  });

  it("picks the same default dying letter on every render", () => {
    const first = render(<NeonSign lines={["no vacancy"]} flicker="dying" />);
    const a = first.container.querySelector("[data-dying]")?.getAttribute("data-nk-letter");
    first.unmount();
    const second = render(<NeonSign lines={["no vacancy"]} flicker="dying" />);
    expect(second.container.querySelector("[data-dying]")?.getAttribute("data-nk-letter")).toBe(a);
    expect(a).not.toBeUndefined();
  });

  it("staggers the stutter but strikes clean signs together", () => {
    const { container, rerender } = render(<NeonSign lines={["OPEN"]} />);
    const delays = lettersOf(container).map((el) => el.style.getPropertyValue("--nk-d"));
    expect(new Set(delays).size).toBeGreaterThan(1);
    rerender(<NeonSign lines={["OPEN"]} flicker="clean" />);
    expect(lettersOf(container).every((el) => el.style.getPropertyValue("--nk-a") === "nk-neon-sign-clean")).toBe(true);
  });

  it("lights other children as one tube and keeps them readable", () => {
    const { container } = render(
      <NeonSign>
        <span>Bar</span>
      </NeonSign>,
    );
    const art = container.querySelector('[data-part="art"]') as HTMLElement;
    expect(art.children[0]).not.toHaveAttribute("aria-hidden");
    expect(art.children[1]).toHaveAttribute("aria-hidden", "true");
    expect(screen.getAllByText("Bar")).toHaveLength(2);
  });

  it("buzzes a random letter while on, and stops when switched off", () => {
    vi.useFakeTimers();
    const cancel = vi.fn();
    const animate = vi.fn(() => ({ cancel }) as unknown as Animation);
    HTMLElement.prototype.animate = animate;
    const { rerender } = render(<NeonSign lines={["OPEN"]} buzz />);
    act(() => {
      vi.advanceTimersByTime(4300);
    });
    expect(animate).toHaveBeenCalledTimes(1);
    rerender(<NeonSign lines={["OPEN"]} buzz on={false} />);
    expect(cancel).toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(animate).toHaveBeenCalledTimes(1);
  });

  it("forwards the ref and native props", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<NeonSign ref={ref} lines={["OPEN"]} id="sign" className="mx-auto" />);
    expect(ref.current).toHaveAttribute("id", "sign");
    expect(ref.current).toHaveClass("mx-auto");
  });
});
