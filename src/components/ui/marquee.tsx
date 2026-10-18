"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

export interface MarqueeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color for neon content inside. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Scroll sideways, or up and down. A vertical marquee needs a height. */
  orientation?: "horizontal" | "vertical";
  /** Run right-to-left becomes left-to-right (or upward becomes downward). */
  reverse?: boolean;
  /** Speed in pixels per second. */
  speed?: number;
  /** Space between items and between copies. A number is pixels. */
  gap?: number | string;
  /** Ease to a stop while the pointer is over it. Keyboard focus always stops it. */
  pauseOnHover?: boolean;
  /** Hold it still, for a visible pause button. */
  paused?: boolean;
  /** Fade the leading and trailing edges. A number sets the fade length in pixels. */
  fade?: boolean | number;
}

function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    const update = () => setReduce(query.matches);
    update();
    query.addEventListener?.("change", update);
    return () => query.removeEventListener?.("change", update);
  }, []);
  return reduce;
}

// Duplicates exist only to make the loop seamless: hidden from assistive
// tech, and inert so their links and buttons never take focus.
const markInert = (node: HTMLDivElement | null) => {
  if (node) node.inert = true;
};

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      className,
      style,
      color,
      orientation = "horizontal",
      reverse = false,
      speed = 40,
      gap = 32,
      pauseOnHover = true,
      paused = false,
      fade = true,
      children,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      ...props
    },
    forwardedRef,
  ) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const trackRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);

    const vertical = orientation === "vertical";
    const reduce = usePrefersReducedMotion();
    const realRef = React.useRef<HTMLDivElement>(null);

    // The focusable copy sits mid-track with hidden copies on both sides, and
    // starts halfway across the viewport. Any item in it can then be brought
    // to the centre without leaving the loop's range.
    const [layout, setLayout] = React.useState({ distance: 0, start: 0, lead: 1, trail: 1 });
    const { distance, start, lead, trail } = layout;

    const animation = React.useRef<Animation | null>(null);
    const geometry = React.useRef({ distance: 0, duration: 0 });
    // Where the content sits (px along the axis), carried across rebuilds.
    const offset = React.useRef(0);
    const rate = React.useRef(paused ? 0 : 1);
    const hovered = React.useRef(false);
    const focused = React.useRef(false);
    const tween = React.useRef(0);

    React.useEffect(() => {
      const root = ref.current;
      const real = realRef.current;
      if (!root || !real || reduce || typeof ResizeObserver === "undefined") return;
      const measure = () => {
        const next = real.nextElementSibling as HTMLElement | null;
        const loop = next ? (vertical ? next.offsetTop - real.offsetTop : next.offsetLeft - real.offsetLeft) : 0;
        if (loop <= 0) return;
        const viewport = vertical ? root.clientHeight : root.clientWidth;
        const middle = viewport / 2;
        const update = {
          distance: loop,
          start: middle,
          lead: Math.max(1, Math.ceil(middle / loop)),
          trail: Math.max(1, Math.ceil((viewport - middle) / loop)),
        };
        setLayout((current) =>
          current.distance === update.distance &&
          current.start === update.start &&
          current.lead === update.lead &&
          current.trail === update.trail
            ? current
            : update,
        );
      };
      measure();
      const observer = new ResizeObserver(measure);
      observer.observe(root);
      observer.observe(real);
      return () => observer.disconnect();
    }, [vertical, reduce, gap]);

    // A compositor-run loop, rebuilt when its geometry or speed changes. It
    // resumes from the current offset, so rebuilding never makes content jump.
    React.useEffect(() => {
      const track = trackRef.current;
      if (!track || reduce || !distance || speed <= 0 || typeof track.animate !== "function") return;
      const base = start - lead * distance;
      const duration = (distance / speed) * 1000;
      const at = (value: number) => (vertical ? `translate3d(0, ${value}px, 0)` : `translate3d(${value}px, 0, 0)`);
      const loop = track.animate([{ transform: at(base) }, { transform: at(base - distance) }], {
        duration,
        iterations: Infinity,
        direction: reverse ? "reverse" : "normal",
        easing: "linear",
      });
      const progress = ((((base - offset.current) / distance) % 1) + 1) % 1;
      loop.currentTime = (reverse ? 1 - progress : progress) * duration;
      loop.playbackRate = rate.current;
      animation.current = loop;
      geometry.current = { distance, duration };
      return () => {
        const current = loop.effect?.getComputedTiming().progress;
        if (typeof current === "number") offset.current = base - distance * current;
        if (animation.current === loop) animation.current = null;
        loop.cancel();
      };
    }, [distance, start, lead, speed, reverse, vertical, reduce]);

    // Ease the playback rate toward running or stopped instead of snapping.
    const settle = React.useCallback(
      (instant = false) => {
        const target = paused || focused.current || (pauseOnHover && hovered.current) ? 0 : 1;
        cancelAnimationFrame(tween.current);
        if (instant) {
          rate.current = target;
          if (animation.current) animation.current.playbackRate = target;
          return;
        }
        let last = 0;
        const step = (now: number) => {
          const dt = last ? Math.min(Math.max(now - last, 0), 64) : 16;
          last = now;
          rate.current += (target - rate.current) * (1 - Math.exp(-dt / 120));
          if (Math.abs(target - rate.current) < 0.01) rate.current = target;
          if (animation.current) animation.current.playbackRate = rate.current;
          if (rate.current !== target) tween.current = requestAnimationFrame(step);
        };
        tween.current = requestAnimationFrame(step);
      },
      [paused, pauseOnHover],
    );

    React.useEffect(() => {
      settle();
    }, [settle]);

    React.useEffect(() => () => cancelAnimationFrame(tween.current), []);

    // Tabbing onto an item that has drifted out of view (or under the fade)
    // glides the loop until the item sits in the middle.
    const reveal = (element: HTMLElement) => {
      const root = ref.current;
      const real = realRef.current;
      const loop = animation.current;
      const { distance: length, duration } = geometry.current;
      if (!root || !real || !loop || !length || !real.contains(element)) return;
      const box = root.getBoundingClientRect();
      const item = element.getBoundingClientRect();
      const inset = fade === false ? 0 : typeof fade === "number" ? fade : 48;
      const near = vertical ? item.top - box.top : item.left - box.left;
      const far = vertical ? item.bottom - box.top : item.right - box.left;
      if (near >= inset && far <= (vertical ? box.height : box.width) - inset) return;

      const copy = real.getBoundingClientRect();
      const center = (vertical ? item.top - copy.top : item.left - copy.left) + (far - near) / 2;
      const from = loop.effect?.getComputedTiming().progress ?? 0;
      let delta = center / length - from;
      delta -= Math.round(delta);
      let begin = 0;
      const glide = (now: number) => {
        begin ||= now;
        const t = Math.min(1, (now - begin + 16) / 280);
        const progress = (((from + delta * (1 - Math.pow(1 - t, 3))) % 1) + 1) % 1;
        loop.currentTime = (reverse ? 1 - progress : progress) * duration;
        if (t < 1) tween.current = requestAnimationFrame(glide);
      };
      cancelAnimationFrame(tween.current);
      tween.current = requestAnimationFrame(glide);
    };

    const fadeLength = fade === false ? 0 : typeof fade === "number" ? fade : 48;
    const mask =
      fadeLength > 0
        ? `linear-gradient(${vertical ? "to bottom" : "to right"}, transparent, #000 ${fadeLength}px, #000 calc(100% - ${fadeLength}px), transparent)`
        : undefined;

    const copyClass = cn(
      "flex shrink-0 gap-[var(--nk-marquee-gap)]",
      vertical ? "flex-col" : "items-center",
    );

    return (
      <div
        ref={ref}
        data-state={paused ? "paused" : "running"}
        // Under reduced motion the strip scrolls by hand instead, so the keyboard needs a way in.
        tabIndex={reduce ? 0 : undefined}
        style={neonVars(color, {
          "--nk-marquee-gap": typeof gap === "number" ? `${gap}px` : gap,
          // clip, unlike hidden, can't be scrolled by focus; engines without it keep hidden.
          overflow: reduce ? undefined : "clip",
          maskImage: mask,
          WebkitMaskImage: mask,
          ...style,
        } as React.CSSProperties)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          // overflow: clip doesn't zero a flex or grid item's automatic minimum size, so do it here.
          "relative flex min-h-0 min-w-0",
          vertical ? "flex-col" : "flex-row",
          reduce
            ? vertical
              ? "overflow-y-auto [scrollbar-width:thin]"
              : "overflow-x-auto [scrollbar-width:thin]"
            : "overflow-hidden",
          reduce &&
            "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          className,
        )}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          if (event.pointerType === "touch") return;
          hovered.current = true;
          settle();
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          hovered.current = false;
          settle();
        }}
        onFocus={(event) => {
          onFocus?.(event);
          focused.current = true;
          // Keyboard moves shouldn't animate: stop at once, then bring the item into view.
          settle(true);
          if (event.target !== event.currentTarget) reveal(event.target as HTMLElement);
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          focused.current = false;
          settle();
        }}
        {...props}
      >
        <div
          ref={trackRef}
          className={cn(
            "flex shrink-0 gap-[var(--nk-marquee-gap)] will-change-transform",
            vertical ? "h-max flex-col" : "w-max",
          )}
        >
          {!reduce &&
            Array.from({ length: lead }, (_, i) => (
              <div key={`lead-${i}`} ref={markInert} aria-hidden className={copyClass}>
                {children}
              </div>
            ))}
          <div
            ref={realRef}
            // Still and scrollable: start and end clear of the fades.
            style={reduce ? { [vertical ? "paddingBlock" : "paddingInline"]: fadeLength } : undefined}
            className={copyClass}
          >
            {children}
          </div>
          {!reduce &&
            Array.from({ length: trail }, (_, i) => (
              <div key={`trail-${i}`} ref={markInert} aria-hidden className={copyClass}>
                {children}
              </div>
            ))}
        </div>
      </div>
    );
  },
);
Marquee.displayName = "Marquee";

export { Marquee };
