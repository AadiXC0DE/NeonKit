"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Orientation = "horizontal" | "vertical";

const DEFAULT_DELAY = 5000;
const DRAG_THRESHOLD = 6;

const subscribeReducedMotion = (callback: () => void) => {
  const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  query?.addEventListener?.("change", callback);
  return () => query?.removeEventListener?.("change", callback);
};
const getReducedMotion = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

function useReducedMotion() {
  return React.useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
}

export interface CarouselApi {
  scrollTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  getIndex: () => number;
  /** Snap positions, which is fewer than slides when several show at once. */
  getCount: () => number;
  play: () => void;
  pause: () => void;
}

interface CarouselContextValue {
  orientation: Orientation;
  trackId: string;
  setViewport: (node: HTMLDivElement | null) => void;
  index: number;
  count: number;
  canPrev: boolean;
  canNext: boolean;
  scrollTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  autoplay: boolean;
  playing: boolean;
  setUserPaused: (paused: boolean) => void;
  live: "off" | "polite";
  onDragStart: (event: React.PointerEvent<HTMLDivElement>) => void;
  onScroll: () => void;
}

const CarouselContext = React.createContext<CarouselContextValue | null>(null);

function useCarousel(component: string) {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Carousel>.`);
  return context;
}

export interface CarouselProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  orientation?: Orientation;
  /** Previous and next wrap around at the ends. */
  loop?: boolean;
  /** Advances on its own; a number sets the delay in ms. Pauses on hover, focus and hidden tabs; off under reduced motion. */
  autoplay?: boolean | number;
  defaultIndex?: number;
  onSlideChange?: (index: number) => void;
  /** Imperative control: scrollTo, next, prev, play, pause. */
  apiRef?: React.Ref<CarouselApi>;
}

const Carousel = React.forwardRef<HTMLElement, CarouselProps>(
  (
    {
      className,
      style,
      color,
      orientation = "horizontal",
      loop = false,
      autoplay = false,
      defaultIndex = 0,
      onSlideChange,
      apiRef,
      onKeyDown,
      children,
      ...props
    },
    ref,
  ) => {
    const trackId = React.useId();
    const rootRef = React.useRef<HTMLElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLElement);
    const viewportRef = React.useRef<HTMLDivElement>(null);
    const snaps = React.useRef<number[]>([0]);
    const target = React.useRef<number | null>(null);
    const dragging = React.useRef(false);
    const elapsed = React.useRef(0);
    const reduceMotion = useReducedMotion();
    const horizontal = orientation === "horizontal";

    const [index, setIndex] = React.useState(0);
    const [count, setCount] = React.useState(1);
    const [userPaused, setUserPaused] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);
    const [focused, setFocused] = React.useState(false);
    const [hidden, setHidden] = React.useState(false);

    const delay = typeof autoplay === "number" ? autoplay : DEFAULT_DELAY;
    const autoplayOn = autoplay !== false && !reduceMotion;
    const playing = autoplayOn && !userPaused;
    const running = playing && !hovered && !focused && !hidden;

    const setVar = (name: string, value: number) => rootRef.current?.style.setProperty(name, String(value));

    const measure = React.useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const items = Array.from(viewport.querySelectorAll<HTMLElement>("[data-carousel-item]")).filter(
        (item) => item.closest("[data-carousel-viewport]") === viewport,
      );
      const view = viewport.getBoundingClientRect();
      const scroll = horizontal ? viewport.scrollLeft : viewport.scrollTop;
      const max = horizontal ? viewport.scrollWidth - viewport.clientWidth : viewport.scrollHeight - viewport.clientHeight;
      const positions: number[] = [];
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        const pos = Math.min(Math.max(0, (horizontal ? rect.left - view.left : rect.top - view.top) + scroll), Math.max(0, max));
        if (!positions.length || pos - positions[positions.length - 1] > 2) positions.push(pos);
      }
      snaps.current = positions.length ? positions : [0];
      items.forEach((item, i) => {
        if (!item.hasAttribute("data-labelled")) item.setAttribute("aria-label", `${i + 1} of ${items.length}`);
      });
      const size = horizontal ? viewport.scrollWidth : viewport.scrollHeight;
      setVar("--carousel-visible", size ? (horizontal ? viewport.clientWidth : viewport.clientHeight) / size : 1);
      setCount(snaps.current.length);
    }, [horizontal]);

    const nearest = (pos: number) => {
      let best = 0;
      snaps.current.forEach((snap, i) => {
        if (Math.abs(snap - pos) < Math.abs(snaps.current[best] - pos)) best = i;
      });
      return best;
    };

    const onScroll = () => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const pos = horizontal ? viewport.scrollLeft : viewport.scrollTop;
      const max = horizontal ? viewport.scrollWidth - viewport.clientWidth : viewport.scrollHeight - viewport.clientHeight;
      setVar("--carousel-progress", max > 0 ? Math.min(1, Math.max(0, pos / max)) : 0);
      if (target.current !== null) {
        if (Math.abs(pos - snaps.current[target.current]) > 2) return;
        target.current = null;
        if (!dragging.current) viewport.style.scrollSnapType = "";
      }
      if (dragging.current) return;
      setIndex(nearest(pos));
    };

    const scrollTo = React.useCallback(
      (next: number, instant = false) => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const last = snaps.current.length - 1;
        const i = Math.min(Math.max(0, next), last);
        target.current = i;
        setIndex(i);
        elapsed.current = 0;
        const position = snaps.current[i];
        viewport.scrollTo({
          [horizontal ? "left" : "top"]: position,
          behavior: instant || reduceMotion ? "auto" : "smooth",
        });
        // Release the lock if the browser never reports reaching the snap (e.g. already there).
        const current = horizontal ? viewport.scrollLeft : viewport.scrollTop;
        if (Math.abs(current - position) < 2) {
          target.current = null;
          viewport.style.scrollSnapType = "";
        }
      },
      [horizontal, reduceMotion],
    );

    const indexRef = React.useRef(index);
    React.useLayoutEffect(() => {
      indexRef.current = index;
    });
    const next = React.useCallback(() => {
      const i = indexRef.current;
      const last = snaps.current.length - 1;
      scrollTo(i >= last ? (loop ? 0 : last) : i + 1);
    }, [loop, scrollTo]);
    const prev = React.useCallback(() => {
      const i = indexRef.current;
      const last = snaps.current.length - 1;
      scrollTo(i <= 0 ? (loop ? last : 0) : i - 1);
    }, [loop, scrollTo]);

    React.useImperativeHandle(
      apiRef,
      () => ({
        scrollTo: (i: number) => scrollTo(i),
        next,
        prev,
        getIndex: () => indexRef.current,
        getCount: () => snaps.current.length,
        play: () => setUserPaused(false),
        pause: () => setUserPaused(true),
      }),
      [scrollTo, next, prev],
    );

    // Measure on mount and whenever the viewport or track changes size.
    React.useEffect(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      measure();
      if (defaultIndex > 0) scrollTo(defaultIndex, true);
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(() => measure());
      observer.observe(viewport);
      if (viewport.firstElementChild) observer.observe(viewport.firstElementChild);
      return () => observer.disconnect();
      // defaultIndex only applies on mount.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [measure]);

    const onSlideChangeRef = React.useRef(onSlideChange);
    React.useEffect(() => {
      onSlideChangeRef.current = onSlideChange;
    });
    const reported = React.useRef(index);
    React.useEffect(() => {
      elapsed.current = 0;
      if (reported.current === index) return;
      reported.current = index;
      onSlideChangeRef.current?.(index);
    }, [index]);

    React.useEffect(() => {
      const update = () => setHidden(document.visibilityState === "hidden");
      document.addEventListener("visibilitychange", update);
      return () => document.removeEventListener("visibilitychange", update);
    }, []);

    // The autoplay clock. It keeps its place through a pause, and the active dot fills with it.
    React.useEffect(() => {
      if (!playing) {
        setVar("--carousel-autoplay", 1);
        return;
      }
      setVar("--carousel-autoplay", elapsed.current / delay);
      if (!running) return;
      let frame = 0;
      let last = performance.now();
      const tick = (now: number) => {
        elapsed.current += now - last;
        last = now;
        if (elapsed.current >= delay) {
          elapsed.current = 0;
          const i = indexRef.current;
          scrollTo(i >= snaps.current.length - 1 ? 0 : i + 1);
        }
        setVar("--carousel-autoplay", Math.min(1, elapsed.current / delay));
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [playing, running, delay, scrollTo]);

    const onDragStart = (event: React.PointerEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;
      if (!viewport || event.pointerType !== "mouse" || event.button !== 0) return;
      const origin = horizontal ? event.clientX : event.clientY;
      const start = horizontal ? viewport.scrollLeft : viewport.scrollTop;
      let moved = false;
      let lastPos = origin;
      let lastTime = performance.now();
      let velocity = 0;

      const move = (e: PointerEvent) => {
        const pos = horizontal ? e.clientX : e.clientY;
        if (!moved && Math.abs(pos - origin) < DRAG_THRESHOLD) return;
        if (!moved) {
          moved = true;
          dragging.current = true;
          target.current = null;
          viewport.style.scrollSnapType = "none";
          viewport.dataset.dragging = "";
        }
        const now = performance.now();
        velocity = (pos - lastPos) / Math.max(1, now - lastTime);
        lastPos = pos;
        lastTime = now;
        if (horizontal) viewport.scrollLeft = start - (pos - origin);
        else viewport.scrollTop = start - (pos - origin);
      };
      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("pointercancel", up);
        if (!moved) return;
        dragging.current = false;
        delete viewport.dataset.dragging;
        // Swallow the click that ends a drag, so dragging across a link doesn't open it.
        const block = (e: MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
        };
        window.addEventListener("click", block, { capture: true, once: true });
        setTimeout(() => window.removeEventListener("click", block, { capture: true }), 0);

        const pos = horizontal ? viewport.scrollLeft : viewport.scrollTop;
        let i = nearest(pos - velocity * 180);
        const from = indexRef.current;
        // A deliberate flick always moves at least one slide.
        if (i === from && Math.abs(velocity) > 0.3) i = from + (velocity < 0 ? 1 : -1);
        scrollTo(i);
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("pointercancel", up);
    };

    const setViewport = React.useCallback((node: HTMLDivElement | null) => {
      viewportRef.current = node;
    }, []);

    const last = count - 1;
    const context: CarouselContextValue = {
      orientation,
      trackId,
      setViewport,
      index,
      count,
      canPrev: loop || index > 0,
      canNext: loop || index < last,
      scrollTo,
      next,
      prev,
      autoplay: autoplayOn,
      playing,
      setUserPaused,
      live: running ? "off" : "polite",
      onDragStart,
      onScroll,
    };

    return (
      <CarouselContext.Provider value={context}>
        <section
          ref={rootRef}
          aria-roledescription="carousel"
          data-orientation={orientation}
          style={neonVars(color, style)}
          onPointerEnter={(event) => event.pointerType === "mouse" && setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented) return;
            const from = event.target as HTMLElement;
            if (!from.closest("[data-carousel-control],[data-carousel-viewport]")) return;
            const back = horizontal ? "ArrowLeft" : "ArrowUp";
            const forward = horizontal ? "ArrowRight" : "ArrowDown";
            if (event.key === back) prev();
            else if (event.key === forward) next();
            else if (event.key === "Home" && from.closest("[data-carousel-viewport]")) scrollTo(0);
            else if (event.key === "End" && from.closest("[data-carousel-viewport]")) scrollTo(count - 1);
            else return;
            event.preventDefault();
          }}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)] [--slides:1] [--gap:16px]",
            "relative grid min-w-0",
            className,
          )}
          {...props}
        >
          {children}
        </section>
      </CarouselContext.Provider>
    );
  },
);
Carousel.displayName = "Carousel";

export interface CarouselContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Classes for the scrolling viewport around the track. Give it a height in vertical carousels. */
  viewportClassName?: string;
}

const CarouselContent = React.forwardRef<HTMLDivElement, CarouselContentProps>(
  ({ className, viewportClassName, ...props }, ref) => {
    const { setViewport, live, onScroll, onDragStart, trackId, orientation } = useCarousel("CarouselContent");
    const horizontal = orientation === "horizontal";
    return (
      <div
        ref={setViewport}
        data-carousel-viewport=""
        // Focusable so the track scrolls from the keyboard: arrows, Home and End are handled on the root.
        tabIndex={0}
        aria-live={live}
        onScroll={onScroll}
        onPointerDown={onDragStart}
        onDragStart={(event) => event.preventDefault()}
        className={cn(
          "min-h-0 min-w-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          // Only the scrolling axis is contained, so a vertical wheel over a horizontal carousel still moves the page.
          horizontal
            ? "snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain"
            : "snap-y snap-mandatory overflow-y-auto overflow-x-hidden overscroll-y-contain",
          "cursor-grab data-[dragging]:cursor-grabbing data-[dragging]:select-none",
          "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          viewportClassName,
        )}
      >
        <div
          ref={ref}
          id={trackId}
          className={cn("flex gap-[var(--gap)]", horizontal ? "flex-row" : "h-full flex-col", className)}
          {...props}
        />
      </div>
    );
  },
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, "aria-label": ariaLabel, ...props }, ref) => (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      aria-label={ariaLabel}
      data-labelled={ariaLabel ? "" : undefined}
      data-carousel-item=""
      className={cn(
        "min-h-0 min-w-0 shrink-0 grow-0 snap-start basis-[calc((100%-(var(--slides)-1)*var(--gap))/var(--slides))]",
        className,
      )}
      {...props}
    />
  ),
);
CarouselItem.displayName = "CarouselItem";

const arrowClass = cn(
  "inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#0a0c12]/80 text-white/70 outline-none",
  "transition-[background-color,border-color,color,box-shadow,transform,opacity] duration-150 ease-out active:scale-[0.94]",
  "hover:border-[rgb(var(--neon)/0.55)] hover:text-[rgb(var(--neon))] hover:shadow-[0_0_14px_rgb(var(--neon)/CALC(0.25*var(--neon-glow,1)))]",
  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
  "disabled:pointer-events-none disabled:opacity-30 [&_svg]:size-[18px]",
);

type ArrowProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

const CarouselPrevious = React.forwardRef<HTMLButtonElement, ArrowProps>(({ className, onClick, children, ...props }, ref) => {
  const carousel = useCarousel("CarouselPrevious");
  return (
    <button
      ref={ref}
      type="button"
      data-carousel-control=""
      aria-label="Previous slide"
      aria-controls={carousel.trackId}
      disabled={!carousel.canPrev}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) carousel.prev();
      }}
      className={cn(arrowClass, className)}
      {...props}
    >
      {children ?? <ChevronLeft aria-hidden className={cn(carousel.orientation === "vertical" && "rotate-90")} />}
    </button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, ArrowProps>(({ className, onClick, children, ...props }, ref) => {
  const carousel = useCarousel("CarouselNext");
  return (
    <button
      ref={ref}
      type="button"
      data-carousel-control=""
      aria-label="Next slide"
      aria-controls={carousel.trackId}
      disabled={!carousel.canNext}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) carousel.next();
      }}
      className={cn(arrowClass, className)}
      {...props}
    >
      {children ?? <ChevronRight aria-hidden className={cn(carousel.orientation === "vertical" && "rotate-90")} />}
    </button>
  );
});
CarouselNext.displayName = "CarouselNext";

/** One button per snap position. The active one is a tube that fills with the autoplay clock. */
const CarouselDots = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const carousel = useCarousel("CarouselDots");
    const vertical = carousel.orientation === "vertical";
    return (
      <div
        ref={ref}
        role="group"
        aria-label="Choose slide"
        className={cn("flex items-center", vertical && "flex-col", className)}
        {...props}
      >
        {Array.from({ length: carousel.count }, (_, i) => {
          const active = i === carousel.index;
          return (
            <button
              key={i}
              type="button"
              data-carousel-control=""
              aria-label={`Slide ${i + 1} of ${carousel.count}`}
              aria-controls={carousel.trackId}
              aria-current={active || undefined}
              onClick={() => carousel.scrollTo(i)}
              className={cn(
                "group/dot flex cursor-pointer items-center justify-center outline-none",
                vertical ? "w-6 py-[3px]" : "h-6 px-[3px]",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "relative block overflow-hidden rounded-full",
                  "transition-[width,height,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                  "group-focus-visible/dot:ring-2 group-focus-visible/dot:ring-[rgb(var(--neon)/0.6)] group-focus-visible/dot:ring-offset-2 group-focus-visible/dot:ring-offset-[#05060a]",
                  vertical ? "w-1.5" : "h-1.5",
                  active
                    ? cn(vertical ? "h-6" : "w-6", "bg-[rgb(var(--neon)/0.2)] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.35)]")
                    : cn(vertical ? "h-1.5" : "w-1.5", "bg-white/25 group-hover/dot:bg-white/50"),
                )}
              >
                {active && (
                  <span
                    className={cn(
                      "absolute inset-0 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))),0_0_14px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1)))]",
                      vertical
                        ? "origin-top scale-y-[var(--carousel-autoplay,1)]"
                        : "origin-left scale-x-[var(--carousel-autoplay,1)]",
                    )}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  },
);
CarouselDots.displayName = "CarouselDots";

/** A thin track with a lit segment that follows the scroll position, drag included. */
const CarouselProgress = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const carousel = useCarousel("CarouselProgress");
    const vertical = carousel.orientation === "vertical";
    return (
      <div
        ref={ref}
        aria-hidden
        className={cn("relative overflow-hidden rounded-full bg-white/[0.08]", vertical ? "h-full w-[2px]" : "h-[2px] w-full", className)}
        {...props}
      >
        <span
          className={cn(
            "absolute rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1)))]",
            vertical
              ? "inset-x-0 top-0 h-[calc(var(--carousel-visible,1)*100%)] translate-y-[calc(var(--carousel-progress,0)*(1/var(--carousel-visible,1)-1)*100%)]"
              : "inset-y-0 left-0 w-[calc(var(--carousel-visible,1)*100%)] translate-x-[calc(var(--carousel-progress,0)*(1/var(--carousel-visible,1)-1)*100%)]",
          )}
        />
      </div>
    );
  },
);
CarouselProgress.displayName = "CarouselProgress";

/** Pause and play for autoplaying carousels. Renders nothing when autoplay is off. */
const CarouselPlayToggle = React.forwardRef<HTMLButtonElement, ArrowProps>(({ className, onClick, ...props }, ref) => {
  const carousel = useCarousel("CarouselPlayToggle");
  if (!carousel.autoplay) return null;
  return (
    <button
      ref={ref}
      type="button"
      data-carousel-control=""
      aria-label={carousel.playing ? "Pause slides" : "Play slides"}
      aria-controls={carousel.trackId}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) carousel.setUserPaused(carousel.playing);
      }}
      className={cn(arrowClass, className)}
      {...props}
    >
      {carousel.playing ? <Pause aria-hidden /> : <Play aria-hidden />}
    </button>
  );
});
CarouselPlayToggle.displayName = "CarouselPlayToggle";

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselDots,
  CarouselProgress,
  CarouselPlayToggle,
};
