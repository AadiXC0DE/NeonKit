import * as React from "react";
import { act, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Odometer } from "@/components/ui/odometer";

const live = (container: HTMLElement) => container.querySelector("[aria-live]") as HTMLElement;
const drums = (container: HTMLElement) => container.querySelectorAll(".nk-odo-window");
const separators = (container: HTMLElement) =>
  Array.from(container.querySelectorAll(".nk-odo-sep")).map((node) => node.textContent);
const angle = (drum: Element) => {
  const transform = (drum.querySelector("[style*='rotateX']") as HTMLElement).style.transform;
  return Number(/rotateX\(([-\d.]+)deg\)/.exec(transform)?.[1]);
};

function reduceMotion() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("reduce"),
        media: query,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        onchange: null,
        dispatchEvent: () => false,
      }) as MediaQueryList,
  );
}

afterEach(() => vi.restoreAllMocks());

describe("Odometer", () => {
  it("announces the formatted value politely, with its prefix and suffix", () => {
    const { container } = render(<Odometer value={1284903.2} decimals={2} prefix="$" suffix="today" />);
    const region = live(container);
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toHaveAttribute("aria-atomic", "true");
    expect(region.textContent).toBe("$1,284,903.20 today");
  });

  it("gives every digit a drum and prints separators between them", () => {
    const { container } = render(<Odometer value={48213.5} decimals={1} />);
    expect(drums(container)).toHaveLength(6);
    expect(separators(container)).toEqual([",", "."]);
    expect(container.querySelectorAll(".nk-odo-frac")).toHaveLength(1);
  });

  it("follows the locale's separators", () => {
    const { container } = render(<Odometer value={1234.5} decimals={1} locale="de-DE" />);
    expect(separators(container)).toEqual([".", ","]);
    expect(live(container).textContent).toBe("1.234,5");
  });

  it("pads to minDigits with dim leading drums", () => {
    const { container } = render(<Odometer value={42} minDigits={5} grouping={false} />);
    const all = drums(container);
    expect(all).toHaveLength(5);
    expect(Number((all[0] as HTMLElement).style.getPropertyValue("--nk-odo-lit"))).toBe(0);
    expect(Number((all[4] as HTMLElement).style.getPropertyValue("--nk-odo-lit"))).toBe(1);
  });

  it("sets each drum to its digit", () => {
    const { container } = render(<Odometer value={407} />);
    expect(Array.from(drums(container), angle)).toEqual([144, 0, 252]);
  });

  it("announces only the final value and jumps there with reduced motion", async () => {
    reduceMotion();
    const { container, rerender } = render(<Odometer value={999} grouping={false} />);
    rerender(<Odometer value={1000} grouping={false} />);
    expect(live(container).textContent).toBe("1000");
    await act(async () => {});
    expect(Array.from(drums(container), angle)).toEqual([36, 0, 0, 0]);
  });

  it("treats negative and non-finite values as zero", () => {
    const { container, rerender } = render(<Odometer value={-5} />);
    expect(live(container).textContent).toBe("0");
    rerender(<Odometer value={Number.NaN} />);
    expect(live(container).textContent).toBe("0");
  });

  it("applies color and size", () => {
    const { container } = render(<Odometer value={1} color="amber" size={56} />);
    const root = container.querySelector(".nk-odo") as HTMLElement;
    expect(root.style.getPropertyValue("--neon")).toBe("251 191 36");
    expect(root.style.getPropertyValue("--odo-h")).toBe("56px");
  });
});
