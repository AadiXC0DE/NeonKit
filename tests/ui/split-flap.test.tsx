import { act, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SplitFlap, SplitFlapBoard } from "@/components/ui/split-flap";

const cells = (root: ParentNode = document) => Array.from(root.querySelectorAll<HTMLElement>("[data-flap-cell]"));
// The upper half shows the character arriving; at rest it's the character on display.
const top = (cell: HTMLElement) => cell.firstElementChild?.firstElementChild?.textContent;
const shown = (root?: ParentNode) => cells(root).map(top).join("");

function reduceMotion(matches: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: matches && query.includes("reduce"),
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

describe("SplitFlap", () => {
  const original = window.matchMedia;
  beforeEach(() => reduceMotion(false));
  afterEach(() => {
    window.matchMedia = original;
    vi.useRealTimers();
  });

  it("reads the value once and hides the flaps", () => {
    const { container } = render(<SplitFlap value="Tokyo" />);
    expect(screen.getByText("Tokyo")).toHaveClass("sr-only");
    expect(container.querySelector("[aria-hidden]")).toContainElement(cells()[0]);
    expect(cells()).toHaveLength(5);
    expect(shown()).toBe("TOKYO");
  });

  it("pads to a fixed length on either side", () => {
    const { rerender } = render(<SplitFlap value="42" length={5} />);
    expect(shown()).toBe("42   ");
    rerender(<SplitFlap value="7" length={3} align="right" key="right" />);
    expect(shown()).toBe("  7");
  });

  it("cuts values longer than the length", () => {
    render(<SplitFlap value="SINGAPORE" length={4} />);
    expect(shown()).toBe("SING");
  });

  it("steps each cell forward through the drum to the target", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { rerender } = render(<SplitFlap value="A" charset="letters" />);
    rerender(<SplitFlap value="D" charset="letters" />);

    const seen = [shown()];
    for (let i = 0; i < 60; i++) {
      act(() => {
        vi.advanceTimersByTime(16);
      });
      if (seen[seen.length - 1] !== shown()) seen.push(shown());
    }
    expect(seen).toEqual(["A", "B", "C", "D"]);
  });

  it("wraps around the drum instead of turning back", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { rerender } = render(<SplitFlap value="8" charset="0123456789" />);
    rerender(<SplitFlap value="1" charset="0123456789" />);
    const seen = [shown()];
    for (let i = 0; i < 80; i++) {
      act(() => {
        vi.advanceTimersByTime(16);
      });
      if (seen[seen.length - 1] !== shown()) seen.push(shown());
    }
    expect(seen).toEqual(["8", "9", "0", "1"]);
  });

  it("drops characters that aren't on the drum straight in", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout", "requestAnimationFrame", "cancelAnimationFrame", "performance"] });
    const { rerender } = render(<SplitFlap value="A" charset="letters" />);
    rerender(<SplitFlap value="7" charset="letters" />);
    act(() => {
      vi.advanceTimersByTime(16);
    });
    expect(shown()).toBe("7");
  });

  it("switches without flipping when motion is reduced", () => {
    reduceMotion(true);
    const { rerender } = render(<SplitFlap value="ARRIVALS" />);
    rerender(<SplitFlap value="DEPARTED" />);
    expect(shown()).toBe("DEPARTED");
  });

  it("starts blank and fills in with flipOnMount", () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    reduceMotion(true);
    render(<SplitFlap value="GATE" flipOnMount />);
    expect(shown()).toBe("    ");
    expect(screen.getByText("GATE")).toHaveClass("sr-only");
    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(shown()).toBe("GATE");
  });

  it("takes a color and spreads props onto the root", () => {
    render(<SplitFlap value="ON" color="amber" data-testid="flap" aria-live="polite" />);
    const root = screen.getByTestId("flap");
    expect(root.style.getPropertyValue("--neon")).toBe("251 191 36");
    expect(root).toHaveAttribute("aria-live", "polite");
  });
});

describe("SplitFlapBoard", () => {
  it("is a table with column headers and cells", () => {
    render(
      <SplitFlapBoard
        aria-label="Departures"
        columns={[{ label: "Time", charset: "numeric" }, { label: "Destination" }, { label: "Remarks", length: 9 }]}
        rows={[
          { cells: ["22:45", "TOKYO HND", "ON TIME"] },
          { cells: ["23:05", "SINGAPORE", "DELAYED"], colors: [undefined, undefined, "orange"] },
        ]}
      />,
    );
    const table = screen.getByRole("table", { name: "Departures" });
    expect(within(table).getAllByRole("columnheader").map((head) => head.textContent)).toEqual([
      "Time",
      "Destination",
      "Remarks",
    ]);
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(3);
    expect(within(rows[2]).getAllByRole("cell").map((cell) => cell.querySelector(".sr-only")?.textContent)).toEqual([
      "23:05",
      "SINGAPORE",
      "DELAYED",
    ]);
  });

  it("sizes columns to their longest value unless given a length", () => {
    render(
      <SplitFlapBoard
        columns={[{}, { length: 9 }]}
        rows={[{ cells: ["OSAKA", "ON TIME"] }, { cells: ["SEOUL ICN", "BOARDING"] }]}
      />,
    );
    const [first] = screen.getAllByRole("row");
    const [city, remark] = within(first).getAllByRole("cell");
    expect(cells(city)).toHaveLength(9);
    expect(cells(remark)).toHaveLength(9);
  });

  it("colors individual cells", () => {
    render(<SplitFlapBoard rows={[{ cells: ["DELAYED"], colors: ["orange"] }]} />);
    const flap = screen.getByRole("cell").querySelector<HTMLElement>("[aria-hidden]");
    expect(flap?.style.getPropertyValue("--neon")).toBe("255 138 61");
  });

  it("renders a header", () => {
    render(<SplitFlapBoard header={<span>Departures</span>} rows={[{ cells: ["TOKYO"] }]} />);
    expect(screen.getByText("Departures")).toBeInTheDocument();
  });
});
