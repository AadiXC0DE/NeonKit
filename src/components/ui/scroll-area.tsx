"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Orientation = "vertical" | "horizontal" | "both";
type Axis = "x" | "y";

const DEFAULT_FADE = 24;
const MIN_THUMB = 20;
/** Space between the thumb's travel and the ends of the track. */
const TRACK_PAD = 2;
/** How long the scrollbar lingers after the last scroll event in hover mode. */
const LINGER = 900;

const FOCUSABLE =
  'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"]), [contenteditable="true"]';

const fadeY =
  "linear-gradient(to bottom, transparent, #000 var(--nk-fade-top, 0px), #000 calc(100% - var(--nk-fade-bottom, 0px)), transparent)";
const fadeX =
  "linear-gradient(to right, transparent, #000 var(--nk-fade-left, 0px), #000 calc(100% - var(--nk-fade-right, 0px)), transparent)";

function maskFor(orientation: Orientation): React.CSSProperties {
  if (orientation === "vertical") return { maskImage: fadeY, WebkitMaskImage: fadeY };
  if (orientation === "horizontal") return { maskImage: fadeX, WebkitMaskImage: fadeX };
  return {
    maskImage: `${fadeY}, ${fadeX}`,
    WebkitMaskImage: `${fadeY}, ${fadeX}`,
    maskComposite: "intersect",
    WebkitMaskComposite: "source-in",
  };
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface ScrollAreaProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "onScroll"> {
  /** Palette name or any hex color for the thumb glow. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Which axes scroll. */
  orientation?: Orientation;
  /**
   * "hover" shows the scrollbar while the pointer is over the area or it is scrolling,
   * "auto" whenever the content overflows, "always" keeps the track visible even without overflow.
   */
  scrollbar?: "hover" | "always" | "auto";
  /** Fade the edges that have more content past them. A number sets the fade length in px. */
  fade?: boolean | number;
  /** Classes for the scrolling viewport inside the root. */
  viewportClassName?: string;
  /** Ref to the scrolling viewport, for scrollTo() and friends. The root takes `ref`. */
  viewportRef?: React.Ref<HTMLDivElement>;
  /** Fires when the viewport scrolls. */
  onScroll?: React.UIEventHandler<HTMLDivElement>;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      className,
      style,
      color,
      orientation = "vertical",
      scrollbar = "hover",
      fade = true,
      viewportClassName,
      viewportRef: viewportRefProp,
      onScroll,
      onPointerEnter,
      onPointerLeave,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      children,
      ...props
    },
    ref,
  ) => {
    const axisY = orientation !== "horizontal";
    const axisX = orientation !== "vertical";
    const fadeSize = fade === true ? DEFAULT_FADE : typeof fade === "number" ? Math.max(0, fade) : 0;

    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const trackRefs = React.useRef<Record<Axis, HTMLDivElement | null>>({ x: null, y: null });
    const thumbRefs = React.useRef<Record<Axis, HTMLDivElement | null>>({ x: null, y: null });
    const drag = React.useRef<{ axis: Axis; offset: number } | null>(null);
    const scrollTimer = React.useRef(0);
    const scrollingRef = React.useRef(false);
    const rtlRef = React.useRef(false);

    const [overflow, setOverflow] = React.useState({ x: false, y: false });
    const [focusableContent, setFocusableContent] = React.useState(false);
    const [hovered, setHovered] = React.useState(false);
    const [scrolling, setScrolling] = React.useState(false);
    const [dragging, setDragging] = React.useState<Axis | null>(null);
    const [thumbHovered, setThumbHovered] = React.useState<Axis | null>(null);

    const setViewport = React.useCallback(
      (node: HTMLDivElement | null) => {
        viewportRef.current = node;
        setRef(viewportRefProp, node);
      },
      [viewportRefProp],
    );

    /** Positions the thumbs and edge fades. Runs on every scroll, so it never re-renders. */
    const sync = React.useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;

      const axes: [Axis, boolean][] = [
        ["y", axisY],
        ["x", axisX],
      ];
      for (const [axis, enabled] of axes) {
        if (!enabled) continue;
        const size = axis === "y" ? viewport.clientHeight : viewport.clientWidth;
        const content = axis === "y" ? viewport.scrollHeight : viewport.scrollWidth;
        const max = Math.max(0, content - size);
        // Measured from the top or left edge. Right-to-left scrollLeft runs from 0 down to -max.
        const scrolled = clamp(Math.abs(axis === "y" ? viewport.scrollTop : viewport.scrollLeft), 0, max);
        const position = axis === "x" && rtlRef.current ? max - scrolled : scrolled;

        const track = trackRefs.current[axis];
        const thumb = thumbRefs.current[axis];
        if (track && thumb && content > 0) {
          const trackSize = Math.max(0, (axis === "y" ? track.clientHeight : track.clientWidth) - TRACK_PAD * 2);
          const thumbSize = Math.min(trackSize, Math.max(MIN_THUMB, (trackSize * size) / content));
          const offset = max > 0 ? ((trackSize - thumbSize) * position) / max : 0;
          thumb.style[axis === "y" ? "height" : "width"] = `${thumbSize}px`;
          thumb.style.transform =
            axis === "y" ? `translate3d(0, ${offset}px, 0)` : `translate3d(${offset}px, 0, 0)`;
        }

        if (fadeSize > 0) {
          const [start, end] = axis === "y" ? ["top", "bottom"] : ["left", "right"];
          viewport.style.setProperty(`--nk-fade-${start}`, `${Math.min(position, fadeSize)}px`);
          viewport.style.setProperty(`--nk-fade-${end}`, `${Math.min(max - position, fadeSize)}px`);
        }
      }
    }, [axisX, axisY, fadeSize]);

    /** Re-reads overflow after a size change, then syncs. */
    const measure = React.useCallback(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      const x = axisX && viewport.scrollWidth - viewport.clientWidth >= 1;
      const y = axisY && viewport.scrollHeight - viewport.clientHeight >= 1;
      rtlRef.current = getComputedStyle(viewport).direction === "rtl";
      setOverflow((previous) => (previous.x === x && previous.y === y ? previous : { x, y }));
      setFocusableContent(viewport.querySelector(FOCUSABLE) !== null);
      sync();
    }, [axisX, axisY, sync]);

    useIsomorphicLayoutEffect(() => {
      measure();
      const viewport = viewportRef.current;
      const content = contentRef.current;
      if (!viewport || typeof ResizeObserver === "undefined") {
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
      }
      const observer = new ResizeObserver(() => measure());
      observer.observe(viewport);
      if (content) observer.observe(content);
      return () => observer.disconnect();
    }, [measure]);

    // The bars sit on top of the viewport, so wheel input over them is passed
    // through by hand. At the end of the scroll range it falls back to the page.
    React.useEffect(() => {
      const viewport = viewportRef.current;
      const tracks = [trackRefs.current.x, trackRefs.current.y].filter(
        (track): track is HTMLDivElement => track !== null,
      );
      if (!viewport || tracks.length === 0) return;

      function handleWheel(event: WheelEvent) {
        if (!viewport) return;
        const unit =
          event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? viewport.clientHeight : 1;
        const top = viewport.scrollTop;
        const left = viewport.scrollLeft;
        if (axisY) viewport.scrollTop += event.deltaY * unit;
        if (axisX) viewport.scrollLeft += (event.deltaX || (axisY ? 0 : event.deltaY)) * unit;
        if (viewport.scrollTop !== top || viewport.scrollLeft !== left) event.preventDefault();
      }

      tracks.forEach((track) => track.addEventListener("wheel", handleWheel, { passive: false }));
      return () => tracks.forEach((track) => track.removeEventListener("wheel", handleWheel));
    }, [axisX, axisY]);

    React.useEffect(() => () => window.clearTimeout(scrollTimer.current), []);

    function handleScroll(event: React.UIEvent<HTMLDivElement>) {
      onScroll?.(event);
      sync();
      if (!scrollingRef.current) {
        scrollingRef.current = true;
        setScrolling(true);
      }
      window.clearTimeout(scrollTimer.current);
      scrollTimer.current = window.setTimeout(() => {
        scrollingRef.current = false;
        setScrolling(false);
      }, LINGER);
    }

    /** Scrolls so the thumb's leading edge sits `offset` px before the pointer. */
    function scrollToPointer(axis: Axis, pointer: number, offset: number) {
      const viewport = viewportRef.current;
      const track = trackRefs.current[axis];
      const thumb = thumbRefs.current[axis];
      if (!viewport || !track || !thumb) return;

      const trackRect = track.getBoundingClientRect();
      const thumbRect = thumb.getBoundingClientRect();
      const trackStart = (axis === "y" ? trackRect.top : trackRect.left) + TRACK_PAD;
      const trackSize = (axis === "y" ? track.clientHeight : track.clientWidth) - TRACK_PAD * 2;
      const thumbSize = axis === "y" ? thumbRect.height : thumbRect.width;
      const travel = trackSize - thumbSize;
      if (travel <= 0) return;

      const ratio = clamp((pointer - offset - trackStart) / travel, 0, 1);
      if (axis === "y") {
        viewport.scrollTop = ratio * (viewport.scrollHeight - viewport.clientHeight);
      } else {
        const max = viewport.scrollWidth - viewport.clientWidth;
        viewport.scrollLeft = rtlRef.current ? -(1 - ratio) * max : ratio * max;
      }
    }

    function handlePointerDown(axis: Axis, event: React.PointerEvent<HTMLDivElement>) {
      const thumb = thumbRefs.current[axis];
      if (event.button !== 0 || !thumb) return;
      // Keeps focus where it is and stops the drag from selecting text.
      event.preventDefault();

      const pointer = axis === "y" ? event.clientY : event.clientX;
      const rect = thumb.getBoundingClientRect();
      let offset: number;
      if (thumb.contains(event.target as Node)) {
        // Grab the thumb where it was pressed, so it doesn't jump under the pointer.
        offset = pointer - (axis === "y" ? rect.top : rect.left);
      } else {
        // A press on the track jumps there, centered, and keeps dragging from there.
        offset = (axis === "y" ? rect.height : rect.width) / 2;
        scrollToPointer(axis, pointer, offset);
      }

      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { axis, offset };
      setDragging(axis);
    }

    function handlePointerMove(axis: Axis, event: React.PointerEvent<HTMLDivElement>) {
      if (drag.current?.axis !== axis) return;
      scrollToPointer(axis, axis === "y" ? event.clientY : event.clientX, drag.current.offset);
    }

    function endDrag() {
      if (!drag.current) return;
      drag.current = null;
      setDragging(null);
    }

    const tracksShown = (axis: Axis) =>
      scrollbar === "always" ||
      (overflow[axis] &&
        (scrollbar === "auto" || hovered || scrolling || dragging !== null));

    const named = ariaLabel != null || ariaLabelledBy != null;

    function renderScrollbar(axis: Axis) {
      const vertical = axis === "y";
      const visible = tracksShown(axis);
      const active = dragging === axis;
      const lit = active || thumbHovered === axis;
      const corner = orientation === "both" && overflow.x && overflow.y;

      return (
        <div
          ref={(node) => {
            trackRefs.current[axis] = node;
          }}
          aria-hidden
          data-axis={axis}
          data-state={visible ? "visible" : "hidden"}
          onPointerDown={(event) => handlePointerDown(axis, event)}
          onPointerMove={(event) => handlePointerMove(axis, event)}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onLostPointerCapture={endDrag}
          className={cn(
            "group/track absolute z-10 touch-none select-none",
            "transition-opacity ease-out",
            vertical ? "right-0 top-0 w-3" : "bottom-0 left-0 h-3",
            vertical ? (corner ? "bottom-3" : "bottom-0") : corner ? "right-3" : "right-0",
            visible ? "opacity-100 duration-150" : "pointer-events-none opacity-0 duration-500",
          )}
        >
          <span
            className={cn(
              "absolute rounded-full bg-white/[0.04] transition-opacity duration-150 ease-out",
              vertical ? "inset-y-0.5 right-[3px] w-1.5" : "inset-x-0.5 bottom-[3px] h-1.5",
              scrollbar === "always" || active ? "opacity-100" : "opacity-0 group-hover/track:opacity-100",
            )}
          />
          <div
            ref={(node) => {
              thumbRefs.current[axis] = node;
            }}
            data-state={active ? "dragging" : undefined}
            onPointerEnter={() => setThumbHovered(axis)}
            onPointerLeave={() => setThumbHovered(null)}
            className={cn(
              "absolute will-change-transform",
              vertical ? "inset-x-0 top-0.5" : "inset-y-0 left-0.5",
              !overflow[axis] && "invisible",
            )}
          >
            <span
              className={cn(
                "absolute rounded-full",
                "transition-[transform,scale,background-color,box-shadow] duration-150 ease-out motion-reduce:transition-none",
                vertical ? "inset-y-0 right-[3px] w-1.5 origin-right" : "inset-x-0 bottom-[3px] h-1.5 origin-bottom",
                active &&
                  "bg-[rgb(var(--neon))] shadow-[0_0_4px_rgb(var(--neon)/var(--neon-glow,1)),0_0_14px_rgb(var(--neon)/CALC(0.75*var(--neon-glow,1)))]",
                !active && lit && "bg-[rgb(var(--neon)/0.85)] shadow-[0_0_10px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]",
                !lit &&
                  cn(
                    "bg-white/25 group-hover/track:bg-white/40",
                    vertical
                      ? "scale-x-[0.67] group-hover/track:scale-x-100"
                      : "scale-y-[0.67] group-hover/track:scale-y-100",
                  ),
              )}
            />
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        data-orientation={orientation}
        style={neonVars(color, style)}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          setHovered(true);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          setHovered(false);
        }}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          // min-w-0 keeps a flex or grid parent from growing to the content's width.
          "relative flex min-w-0 flex-col",
          "[&:has(>[data-nk-scroll-viewport]:focus-visible)]:ring-2 [&:has(>[data-nk-scroll-viewport]:focus-visible)]:ring-[rgb(var(--neon)/0.6)] [&:has(>[data-nk-scroll-viewport]:focus-visible)]:ring-offset-2 [&:has(>[data-nk-scroll-viewport]:focus-visible)]:ring-offset-[#05060a]",
          className,
        )}
        {...props}
      >
        <div
          ref={setViewport}
          data-nk-scroll-viewport=""
          role={named ? "region" : undefined}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          // Keyboard users need a way in when there is nothing focusable inside to scroll to.
          tabIndex={(overflow.x || overflow.y) && !focusableContent ? 0 : undefined}
          onScroll={handleScroll}
          style={fadeSize > 0 ? maskFor(orientation) : undefined}
          className={cn(
            "min-h-0 flex-auto rounded-[inherit] outline-none",
            "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            orientation === "vertical" && "overflow-y-auto overflow-x-hidden",
            orientation === "horizontal" && "overflow-x-auto overflow-y-hidden",
            orientation === "both" && "overflow-auto",
            viewportClassName,
          )}
        >
          <div ref={contentRef} className={cn(axisX && "table min-w-full")}>
            {children}
          </div>
        </div>
        {axisY && renderScrollbar("y")}
        {axisX && renderScrollbar("x")}
      </div>
    );
  },
);
ScrollArea.displayName = "ScrollArea";

export { ScrollArea };
