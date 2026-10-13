"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

// LEDs strike instantly and decay over a few frames, like real ones behind a diffuser.
const css = `
.nk-meter-seg {
  background-color: rgb(var(--nk-meter-seg) / 0.14);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.04), inset 0 0 0 1px rgb(var(--nk-meter-seg) / 0.08);
  transition: background-color 200ms ease-out, box-shadow 200ms ease-out;
}
.nk-meter-seg[data-lit], .nk-meter-seg[data-peak] {
  background-color: color-mix(in srgb, rgb(var(--nk-meter-seg)) 82%, white);
  box-shadow: inset 0 0 3px 1px rgb(255 255 255 / 0.45), 0 0 5px rgb(var(--nk-meter-seg) / 0.9), 0 0 16px 1px rgb(var(--nk-meter-seg) / 0.5);
  transition-duration: 0ms;
}
@media (prefers-reduced-motion: reduce) { .nk-meter-seg { transition: none; } }
`;

// Length is a class, so className can override it (w-full, h-64…).
const sizes = {
  sm: { thickness: 6, gap: 2, horizontal: "w-36", vertical: "h-36", label: "text-[10px]" },
  md: { thickness: 10, gap: 2, horizontal: "w-52", vertical: "h-52", label: "text-[11px]" },
  lg: { thickness: 16, gap: 3, horizontal: "w-[272px]", vertical: "h-[272px]", label: "text-xs" },
} as const;

export interface MeterZone {
  /** Where the zone starts, 0 to 1. */
  from: number;
  /** Palette name or hex. Leave it out to use the meter's neon color. */
  color?: NeonColor;
}

const defaultZones: MeterZone[] = [{ from: 0 }, { from: 0.72, color: "amber" }, { from: 0.9, color: "red" }];

function clamp01(value: number) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

export interface MeterProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Level, 0 to 1. */
  value: number;
  /** Hold the highest recent segment, then let it fall. Pass a number (0 to 1) to place the peak yourself. */
  peak?: boolean | number;
  /** Milliseconds the automatic peak lingers before it falls. */
  peakHold?: number;
  /** Number of LED segments. */
  segments?: number;
  orientation?: "horizontal" | "vertical";
  /** Color bands from low to high. Defaults to neon, then amber from 72%, then red from 90%. */
  zones?: MeterZone[];
  size?: keyof typeof sizes;
  /** Short caption at the start of the meter, such as "L" or "Mic". Also names it. */
  label?: React.ReactNode;
  /** The color of zones without their own. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const Meter = React.forwardRef<HTMLDivElement, MeterProps>(
  (
    {
      className,
      style,
      color,
      value,
      peak = true,
      peakHold = 900,
      segments = 24,
      orientation = "horizontal",
      zones = defaultZones,
      size = "md",
      label,
      ...props
    },
    ref,
  ) => {
    const labelId = React.useId();
    const segmentRefs = React.useRef<(HTMLSpanElement | null)[]>([]);
    const count = Math.max(1, Math.round(segments));
    const level = clamp01(value);
    const lit = Math.round(level * count);
    const auto = peak === true;
    const s = sizes[size];
    const vertical = orientation === "vertical";

    // The zone colors only change with their props, so the segments render once per set.
    const zoneKey = zones.map((zone) => `${zone.from}:${zone.color ?? ""}`).join("|");
    const tints = React.useMemo(() => {
      const sorted = zoneKey
        .split("|")
        .map((entry) => {
          const [from, zoneColor] = entry.split(":");
          return { from: Number(from), color: zoneColor };
        })
        .sort((a, b) => a.from - b.from);
      return Array.from({ length: count }, (_, i) => {
        const start = i / count + 1e-6;
        let tint = "var(--neon)";
        for (const zone of sorted) if (zone.from <= start) tint = zone.color ? toNeonRgb(zone.color) : "var(--neon)";
        return tint;
      });
    }, [zoneKey, count]);

    // Automatic peak hold runs on its own clock and writes straight to the DOM,
    // so a falling peak never re-renders the meter.
    const peakState = React.useRef({ index: -1, since: 0, raf: 0, shown: -1 });
    const levelRef = React.useRef(lit - 1);

    React.useEffect(() => {
      levelRef.current = lit - 1;
      const state = peakState.current;
      if (!auto) return;
      const show = (index: number) => {
        if (index === state.shown) return;
        segmentRefs.current[state.shown]?.removeAttribute("data-peak");
        if (index >= 0) segmentRefs.current[index]?.setAttribute("data-peak", "");
        state.shown = index;
      };
      const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const tick = (now: number) => {
        state.raf = 0;
        const floor = levelRef.current;
        if (state.index <= floor) {
          state.index = floor;
          show(floor);
          return;
        }
        if (now - state.since > peakHold) {
          if (reduce) state.index = floor;
          else {
            // Fall one segment every 40ms once the hold expires.
            const steps = Math.floor((now - state.since - peakHold) / 40);
            state.index = Math.max(floor, state.index - Math.max(1, steps));
            state.since = now - peakHold;
          }
        }
        show(state.index);
        if (state.index > floor) state.raf = requestAnimationFrame(tick);
      };
      if (lit - 1 >= state.index) {
        state.index = lit - 1;
        state.since = performance.now();
        show(state.index);
      } else if (!state.raf) state.raf = requestAnimationFrame(tick);
    }, [lit, auto, peakHold]);

    React.useEffect(() => {
      const state = peakState.current;
      return () => {
        cancelAnimationFrame(state.raf);
        state.raf = 0;
      };
    }, []);

    // Leaving auto mode clears the attribute the clock wrote.
    React.useEffect(() => {
      if (auto) return;
      const state = peakState.current;
      cancelAnimationFrame(state.raf);
      state.raf = 0;
      segmentRefs.current[state.shown]?.removeAttribute("data-peak");
      state.shown = -1;
      state.index = -1;
    }, [auto]);

    const fixedPeak = typeof peak === "number" ? Math.round(clamp01(peak) * count) - 1 : -1;
    const percent = Math.round(level * 100);

    return (
      <div
        ref={ref}
        role="meter"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent}%`}
        aria-labelledby={label ? labelId : undefined}
        data-orientation={orientation}
        style={neonVars(color, { "--nk-meter-level": level, ...style } as React.CSSProperties)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "inline-flex shrink-0 items-center gap-2",
          vertical ? cn("flex-col-reverse", s.vertical) : s.horizontal,
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        {label != null && (
          <span
            id={labelId}
            className={cn(
              "shrink-0 select-none font-semibold uppercase leading-none tracking-[0.12em] text-white/60",
              s.label,
            )}
          >
            {label}
          </span>
        )}
        <span
          aria-hidden
          className={cn(
            "flex min-h-0 min-w-0 flex-1 rounded-[5px] border border-white/10 bg-[#07080c] p-[3px]",
            // The housing picks up light from the lit segments, more as the level rises.
            "shadow-[inset_0_1px_3px_rgb(0_0_0/0.7),0_1px_0_rgb(255_255_255/0.03),0_0_28px_-4px_rgb(var(--neon)/calc(var(--nk-meter-level)*0.4))]",
            vertical && "flex-col-reverse",
          )}
          style={{ gap: s.gap, [vertical ? "width" : "height"]: s.thickness + 8 }}
        >
          {tints.map((tint, i) => (
            <span
              key={i}
              ref={(node) => {
                segmentRefs.current[i] = node;
              }}
              data-lit={i < lit ? "" : undefined}
              data-peak={i === fixedPeak && i >= lit ? "" : undefined}
              style={{ "--nk-meter-seg": tint } as React.CSSProperties}
              className="nk-meter-seg min-h-0 min-w-0 flex-1 rounded-[1.5px]"
            />
          ))}
        </span>
      </div>
    );
  },
);
Meter.displayName = "Meter";

export { Meter };
