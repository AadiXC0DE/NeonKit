"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Scroll writes straight to the DOM once per frame: a translate on the lit tube (the bar) or a dash and a
// rotation (the ring). React renders only when the whole-number percentage changes, for aria-valuenow.


function progressOf(target: HTMLElement | null) {
  if (target) {
    const range = target.scrollHeight - target.clientHeight;
    return range > 0 ? Math.min(1, Math.max(0, target.scrollTop / range)) : 0;
  }
  const doc = document.documentElement;
  const range = doc.scrollHeight - window.innerHeight;
  return range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0;
}

export interface ScrollProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** A scroll container to follow. Follows the page when omitted. */
  target?: React.RefObject<HTMLElement | null>;
  /** A tube along an edge, or a ring (for a back-to-top button). */
  variant?: "bar" | "ring";
  /** Pin the bar to the viewport edge. Defaults to true when following the page. */
  fixed?: boolean;
  /** Edge the fixed bar sits on. */
  position?: "top" | "bottom";
  /** Tube thickness in pixels. */
  thickness?: number;
  /** Ring diameter in pixels. */
  size?: number;
  /** Fires with the whole-number percentage, 0 to 100, when it changes. */
  onProgressChange?: (percent: number) => void;
}

const ScrollProgress = React.forwardRef<HTMLDivElement, ScrollProgressProps>(
  (
    {
      className,
      style,
      color,
      target,
      variant = "bar",
      fixed,
      position = "top",
      thickness,
      size = 44,
      onProgressChange,
      children,
      "aria-label": ariaLabel = "Reading progress",
      ...props
    },
    ref,
  ) => {
    const fillRef = React.useRef<HTMLDivElement>(null);
    const tipRef = React.useRef<HTMLSpanElement>(null);
    const arcRef = React.useRef<SVGCircleElement>(null);
    const haloRef = React.useRef<SVGCircleElement>(null);
    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
    const [percent, setPercent] = React.useState(0);
    const report = React.useRef(onProgressChange);
    React.useEffect(() => {
      report.current = onProgressChange;
    });

    const ring = variant === "ring";
    const stroke = thickness ?? (ring ? 2 : 3);

    // A passive effect: a target that renders after this component only has its ref attached once layout
    // effects have run.
    React.useEffect(() => {
      let frame = 0;
      let lastPercent = -1;
      const node = target?.current ?? null;
      const write = () => {
        frame = 0;
        const p = progressOf(node);
        const root = rootRef.current;
        if (ring) {
          const on = p > 0.004;
          arcRef.current?.setAttribute("stroke-dasharray", `${p} 2`);
          haloRef.current?.setAttribute("stroke-dasharray", `${p} 2`);
          arcRef.current?.setAttribute("opacity", on ? "1" : "0");
          haloRef.current?.setAttribute("opacity", on ? "1" : "0");
        } else if (fillRef.current) {
          fillRef.current.style.transform = `translate3d(${(p - 1) * 100}%, 0, 0)`;
        }
        if (tipRef.current) {
          tipRef.current.style.opacity = String(Math.min(1, p * 25));
          if (ring) tipRef.current.style.transform = `rotate(${p * 360}deg)`;
        }
        if (root) {
          if (p >= 0.999) root.setAttribute("data-complete", "");
          else root.removeAttribute("data-complete");
        }
        const next = Math.round(p * 100);
        if (next !== lastPercent) {
          lastPercent = next;
          setPercent(next);
          report.current?.(next);
        }
      };
      const queue = () => {
        if (!frame) frame = requestAnimationFrame(write);
      };
      write();
      const scroller: HTMLElement | Window = node ?? window;
      scroller.addEventListener("scroll", queue, { passive: true });
      window.addEventListener("resize", queue);
      // Content that grows or shrinks moves the end of the page without a scroll.
      const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(queue);
      const content = node ? [node, ...Array.from(node.children)] : [document.body];
      content.forEach((el) => ro?.observe(el));
      return () => {
        cancelAnimationFrame(frame);
        scroller.removeEventListener("scroll", queue);
        window.removeEventListener("resize", queue);
        ro?.disconnect();
      };
    }, [target, ring]);

    const pinned = fixed ?? !target;
    const a11y = {
      role: "progressbar",
      "aria-label": ariaLabel,
      "aria-valuemin": 0,
      "aria-valuemax": 100,
      "aria-valuenow": percent,
    } as const;

    if (ring) {
      const r = (size - stroke * 4) / 2;
      const c = size / 2;
      return (
        <div
          ref={rootRef}
          {...a11y}
          style={neonVars(color, { width: size, height: size, ...style })}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "group/scroll-progress relative inline-grid shrink-0 place-items-center rounded-full text-white/80",
            className,
          )}
          {...props}
        >
          <svg aria-hidden width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90 overflow-visible">
            <circle cx={c} cy={c} r={r} fill="none" strokeWidth={stroke} style={{ stroke: "rgb(var(--neon) / 0.14)" }} />
            <circle
              ref={haloRef}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              pathLength={1}
              strokeDasharray="0 2"
              strokeLinecap="round"
              opacity={0}
              strokeWidth={stroke * 3.5}
              className="[stroke:rgb(var(--neon)/CALC(0.16*var(--neon-glow,1)))] group-data-[complete]/scroll-progress:[stroke:rgb(var(--neon)/CALC(0.3*var(--neon-glow,1)))]"
            />
            <circle
              ref={arcRef}
              cx={c}
              cy={c}
              r={r}
              fill="none"
              pathLength={1}
              strokeDasharray="0 2"
              strokeLinecap="round"
              opacity={0}
              strokeWidth={stroke}
              style={{ stroke: "rgb(var(--neon))" }}
            />
          </svg>
          {/* The white-hot head rides the end of the arc. */}
          <span ref={tipRef} aria-hidden className="pointer-events-none absolute inset-0 opacity-0">
            <span
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_6px_1px_rgb(var(--neon)/var(--neon-glow,1))]"
              style={{ top: stroke * 2, width: stroke * 1.6, height: stroke * 1.6 }}
            />
          </span>
          <span className="relative">{children}</span>
        </div>
      );
    }

    return (
      <div
        ref={rootRef}
        {...a11y}
        style={neonVars(color, { height: stroke, ...style })}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "group/scroll-progress pointer-events-none w-full",
          pinned ? cn("fixed inset-x-0 z-50", position === "top" ? "top-0" : "bottom-0") : "relative",
          className,
        )}
        {...props}
      >
        {/* Unlit glass along the whole edge. */}
        <div aria-hidden className="absolute inset-0 bg-[rgb(var(--neon)/0.12)]" />
        {/* Clipped at the ends only, so the halo still spills above and below the tube. */}
        <div aria-hidden className="absolute inset-0 [clip-path:inset(-16px_0_-16px_0)]">
          <div ref={fillRef} className="absolute inset-0 will-change-transform" style={{ transform: "translate3d(-100%, 0, 0)" }}>
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(var(--neon)/0.55),rgb(var(--neon))_70%)] shadow-[0_0_8px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))),0_0_2px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1)))] transition-shadow duration-300 group-data-[complete]/scroll-progress:shadow-[0_0_14px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1))),0_0_2px_rgb(var(--neon)/var(--neon-glow,1))]" />
            <span ref={tipRef} className="absolute right-0 top-1/2 opacity-0">
              <span className="absolute size-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/CALC(0.5*var(--neon-glow,1))),transparent)]" />
              <span
                className="absolute -translate-x-full -translate-y-1/2 rounded-full bg-[linear-gradient(90deg,transparent,#fff)]"
                style={{ width: 18, height: stroke }}
              />
            </span>
          </div>
        </div>
        {children}
      </div>
    );
  },
);
ScrollProgress.displayName = "ScrollProgress";

export { ScrollProgress };
