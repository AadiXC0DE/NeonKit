import { fireEvent, render, screen, within } from "@testing-library/react";
import { MotionGlobalConfig } from "motion/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { Pagination } from "@/components/ui/pagination";

beforeAll(() => {
  MotionGlobalConfig.skipAnimations = true;
});

afterAll(() => {
  MotionGlobalConfig.skipAnimations = false;
});

const pageLabels = () =>
  screen
    .getAllByRole("button", { name: /^Page \d+$/ })
    .map((button) => button.getAttribute("aria-label")!.replace("Page ", ""));

describe("Pagination", () => {
  it("renders a labelled nav and marks the current page", () => {
    render(<Pagination variant="default" pageCount={12} defaultPage={6} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 6" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Page 5" })).not.toHaveAttribute("aria-current");
  });

  it("windows the pages with ellipses and a constant slot count", () => {
    const { container, rerender } = render(<Pagination variant="default" pageCount={12} page={1} />);
    const slots = () => container.querySelectorAll("ul > li").length;
    expect(pageLabels()).toEqual(["1", "2", "3", "4", "5", "12"]);
    expect(slots()).toBe(9);

    rerender(<Pagination variant="default" pageCount={12} page={6} />);
    expect(pageLabels()).toEqual(["1", "5", "6", "7", "12"]);
    expect(slots()).toBe(9);

    rerender(<Pagination variant="default" pageCount={12} page={12} />);
    expect(pageLabels()).toEqual(["1", "8", "9", "10", "11", "12"]);
    expect(slots()).toBe(9);
  });

  it("respects siblingCount and boundaryCount", () => {
    render(<Pagination variant="default" pageCount={40} page={20} siblingCount={2} boundaryCount={2} />);
    expect(pageLabels()).toEqual(["1", "2", "18", "19", "20", "21", "22", "39", "40"]);
  });

  it("keeps ellipses out of the tab order and away from screen readers", () => {
    const { container } = render(<Pagination variant="default" pageCount={12} page={6} />);
    const hidden = container.querySelectorAll('li[aria-hidden="true"]');
    expect(hidden).toHaveLength(2);
    hidden.forEach((item) => expect(item.querySelector("button, a")).toBeNull());
  });

  it("moves uncontrolled and reports the new page", () => {
    const onPageChange = vi.fn();
    render(<Pagination variant="default" pageCount={12} defaultPage={6} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(7);
    expect(screen.getByRole("button", { name: "Page 7" })).toHaveAttribute("aria-current", "page");

    fireEvent.click(screen.getByRole("button", { name: "Page 1" }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByRole("button", { name: "Previous page" })).toBeDisabled();
  });

  it("stays put when controlled", () => {
    const onPageChange = vi.fn();
    render(<Pagination variant="default" pageCount={12} page={3} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Page 4" }));
    expect(onPageChange).toHaveBeenCalledWith(4);
    expect(screen.getByRole("button", { name: "Page 3" })).toHaveAttribute("aria-current", "page");
  });

  it("does not report a click on the current page", () => {
    const onPageChange = vi.fn();
    render(<Pagination variant="default" pageCount={5} page={2} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Page 2" }));
    expect(onPageChange).not.toHaveBeenCalled();
  });

  it("moves focus with the picked page when the window slides", () => {
    render(<Pagination variant="default" pageCount={12} defaultPage={5} />);
    const six = screen.getByRole("button", { name: "Page 6" });
    six.focus();
    fireEvent.click(six);
    // The slot that held 6 now holds 7; focus follows 6 to its new slot.
    expect(six).toHaveAccessibleName("Page 7");
    expect(screen.getByRole("button", { name: "Page 6" })).toHaveFocus();
  });

  it("leaves focus alone when the click came from elsewhere", () => {
    render(<Pagination variant="default" pageCount={12} defaultPage={5} />);
    const next = screen.getByRole("button", { name: "Next page" });
    next.focus();
    fireEvent.click(next);
    expect(next).toHaveFocus();
  });

  it("disables next on the last page", () => {
    render(<Pagination variant="default" pageCount={4} defaultPage={4} />);
    expect(screen.getByRole("button", { name: "Next page" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Previous page" })).toBeEnabled();
  });

  it("renders links with getHref and still reports plain clicks", () => {
    const onPageChange = vi.fn();
    render(
      <Pagination
        variant="default"
        pageCount={10}
        defaultPage={1}
        getHref={(page) => `/changelog?page=${page}`}
        onPageChange={onPageChange}
      />,
    );
    const three = screen.getByRole("link", { name: "Page 3" });
    expect(three).toHaveAttribute("href", "/changelog?page=3");
    expect(screen.getByRole("link", { name: "Next page" })).toHaveAttribute("href", "/changelog?page=2");

    const previous = screen.getByRole("link", { name: "Previous page" });
    expect(previous).not.toHaveAttribute("href");
    expect(previous).toHaveAttribute("aria-disabled", "true");

    fireEvent.click(three, { metaKey: true });
    expect(onPageChange).not.toHaveBeenCalled();
    fireEvent.click(three);
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it("shows a compact counter with prev and next", () => {
    render(<Pagination variant="compact" pageCount={12} defaultPage={3} />);
    const nav = screen.getByRole("navigation", { name: "Pagination" });
    expect(within(nav).queryByRole("button", { name: /^Page/ })).not.toBeInTheDocument();
    expect(within(nav).getByText("Page 3 of 12")).toHaveAttribute("aria-live", "polite");

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(within(nav).getByText("Page 4 of 12")).toBeInTheDocument();
  });

  it("renders both layouts when variant is unset, for the sm breakpoint to choose", () => {
    render(<Pagination pageCount={12} defaultPage={3} />);
    expect(screen.getAllByRole("button", { name: "Next page" })).toHaveLength(2);
    expect(screen.getByRole("list").className).toContain("sm:flex");
  });

  it("clamps the page into range", () => {
    render(<Pagination variant="default" pageCount={5} page={99} />);
    expect(screen.getByRole("button", { name: "Page 5" })).toHaveAttribute("aria-current", "page");
  });

  it("applies an explicit color through --neon", () => {
    render(<Pagination variant="default" pageCount={3} color="lime" />);
    expect(screen.getByRole("navigation").style.getPropertyValue("--neon")).toBe("163 230 53");
  });
});
