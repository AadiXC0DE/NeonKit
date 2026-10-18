import * as React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
  CarouselNext,
  CarouselPlayToggle,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

// jsdom has no layout. Each slide is 100px wide in a 100px viewport, so there are as many snaps as slides.
const originalRect = HTMLElement.prototype.getBoundingClientRect;
const scrollTo = vi.fn();
beforeAll(() => {
  HTMLElement.prototype.getBoundingClientRect = function () {
    const items = this.parentElement ? Array.from(this.parentElement.children) : [];
    const index = this.hasAttribute("data-carousel-item") ? items.indexOf(this) : 0;
    return { left: index * 100, top: 0, width: 100, height: 100, right: index * 100 + 100, bottom: 100, x: 0, y: 0, toJSON() {} } as DOMRect;
  };
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 100 });
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", {
    configurable: true,
    get(this: HTMLElement) {
      return this.querySelectorAll("[data-carousel-item]").length * 100 || 100;
    },
  });
  Element.prototype.scrollTo = scrollTo as unknown as typeof Element.prototype.scrollTo;
});
afterAll(() => {
  HTMLElement.prototype.getBoundingClientRect = originalRect;
  delete (HTMLElement.prototype as { clientWidth?: number }).clientWidth;
  delete (HTMLElement.prototype as { scrollWidth?: number }).scrollWidth;
});

function Releases(props: Partial<React.ComponentProps<typeof Carousel>>) {
  return (
    <Carousel aria-label="Releases" {...props}>
      <CarouselContent>
        <CarouselItem>Data Table</CarouselItem>
        <CarouselItem>Drawer</CarouselItem>
        <CarouselItem aria-label="Menubar release">Menubar</CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
      <CarouselDots />
      <CarouselPlayToggle />
    </Carousel>
  );
}

describe("Carousel", () => {
  it("gives the viewport a tab stop only when no slide content can take focus", async () => {
    const { rerender } = render(<Releases />);
    const viewport = document.querySelector<HTMLElement>("[data-carousel-viewport]")!;
    expect(viewport.tabIndex).toBe(0);
    rerender(
      <Carousel aria-label="Releases">
        <CarouselContent>
          <CarouselItem>
            <a href="/data-table">Data Table</a>
          </CarouselItem>
        </CarouselContent>
      </Carousel>,
    );
    await act(async () => {});
    expect(document.querySelector<HTMLElement>("[data-carousel-viewport]")!.tabIndex).toBe(-1);
  });

  it("uses APG carousel semantics", () => {
    render(<Releases />);
    const root = screen.getByRole("region", { name: "Releases" });
    expect(root).toHaveAttribute("aria-roledescription", "carousel");
    const slides = screen.getAllByRole("group").filter((el) => el.getAttribute("aria-roledescription") === "slide");
    expect(slides).toHaveLength(3);
    expect(slides[0]).toHaveAttribute("aria-label", "1 of 3");
    expect(slides[2]).toHaveAttribute("aria-label", "Menubar release");
    expect(root.querySelector("[data-carousel-viewport]")).toHaveAttribute("aria-live", "polite");
  });

  it("disables previous at the start and moves with next", () => {
    const onSlideChange = vi.fn();
    render(<Releases onSlideChange={onSlideChange} />);
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ left: 100 }));
    expect(onSlideChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole("button", { name: "Slide 2 of 3" })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: "Previous slide" })).toBeEnabled();
  });

  it("stops at the end, or wraps with loop", () => {
    const { unmount } = render(<Releases />);
    fireEvent.click(screen.getByRole("button", { name: "Slide 3 of 3" }));
    expect(screen.getByRole("button", { name: "Next slide" })).toBeDisabled();
    unmount();
    render(<Releases loop />);
    fireEvent.click(screen.getByRole("button", { name: "Slide 3 of 3" }));
    fireEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(screen.getByRole("button", { name: "Slide 1 of 3" })).toHaveAttribute("aria-current", "true");
  });

  it("moves with the arrow keys from its controls", () => {
    render(<Releases />);
    fireEvent.keyDown(screen.getByRole("button", { name: "Slide 1 of 3" }), { key: "ArrowRight" });
    expect(screen.getByRole("button", { name: "Slide 2 of 3" })).toHaveAttribute("aria-current", "true");
  });

  it("silences the live region while autoplaying and offers a pause button", () => {
    render(<Releases autoplay={4000} />);
    const viewport = document.querySelector("[data-carousel-viewport]")!;
    expect(viewport).toHaveAttribute("aria-live", "off");
    fireEvent.click(screen.getByRole("button", { name: "Pause slides" }));
    expect(viewport).toHaveAttribute("aria-live", "polite");
    expect(screen.getByRole("button", { name: "Play slides" })).toBeInTheDocument();
  });

  it("pauses autoplay while focus is inside", () => {
    render(<Releases autoplay />);
    const viewport = document.querySelector("[data-carousel-viewport]")!;
    act(() => screen.getByRole("button", { name: "Next slide" }).focus());
    expect(viewport).toHaveAttribute("aria-live", "polite");
  });

  it("doesn't autoplay under reduced motion", () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ ...original(query), matches: query.includes("reduce") })) as typeof window.matchMedia;
    render(<Releases autoplay />);
    expect(screen.queryByRole("button", { name: "Pause slides" })).not.toBeInTheDocument();
    window.matchMedia = original;
  });

  it("exposes scrollTo, next and prev through apiRef", () => {
    const api = React.createRef<CarouselApi>();
    render(<Releases apiRef={api} />);
    expect(api.current!.getCount()).toBe(3);
    act(() => api.current!.scrollTo(2));
    expect(api.current!.getIndex()).toBe(2);
    act(() => api.current!.prev());
    expect(api.current!.getIndex()).toBe(1);
  });

  it("applies color through --neon", () => {
    render(<Releases color="amber" />);
    expect(screen.getByRole("region").style.getPropertyValue("--neon")).toBe("251 191 36");
  });
});
