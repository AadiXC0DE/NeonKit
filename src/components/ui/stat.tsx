"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";
import { Sparkline } from "@/components/ui/glow-chart";
import { Skeleton } from "@/components/ui/skeleton";

// Lub-dub: two quick beats, then rest. The ring only goes out on the first beat.
const css = `
@keyframes nk-stat-beat {
  0%, 36%, 100% { transform: scale(1); }
  9% { transform: scale(1.4); }
  22% { transform: scale(1.22); }
}
@keyframes nk-stat-ring {
  0% { transform: scale(1); opacity: 0.7; }
  45%, 100% { transform: scale(3.2); opacity: 0; }
}
`;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const sizes = {
  sm: { value: "text-2xl leading-8", unit: "text-sm", skeleton: "h-8 w-24", spark: { width: 80, height: 28 } },
  md: { value: "text-[2rem] leading-10", unit: "text-base", skeleton: "h-10 w-32", spark: { width: 96, height: 32 } },
  lg: { value: "text-[2.75rem] leading-[3.25rem]", unit: "text-lg", skeleton: "h-[52px] w-40", spark: { width: 120, height: 40 } },
} as const;

const tones = {
  good: "green",
  bad: "red",
  neutral: undefined,
} as const;

/** Decimals in a number as written, so a count-up to 99.5 shows one decimal the whole way. */
function decimalsOf(value: number) {
  if (!Number.isFinite(value) || Number.isInteger(value)) return 0;
  const [, fraction = ""] = String(value).split(".");
  return Math.min(fraction.length, 4);
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function defaultDelta(delta: number) {
  return `${Math.abs(delta).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
}

export interface StatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  label: React.ReactNode;
  /** A number counts up and formats itself; a string is shown as is. */
  value: number | string;
  /** Formats a numeric value, including every frame of the count-up. */
  format?: (value: number) => string;
  /** Intl options for the default formatter, e.g. `{ style: "currency", currency: "USD" }`. */
  formatOptions?: Intl.NumberFormatOptions;
  locale?: string;
  /** Smaller text after the value, e.g. "ms". */
  unit?: React.ReactNode;
  /** Change since the comparison period. Its sign sets the arrow. */
  delta?: number;
  formatDelta?: (delta: number) => React.ReactNode;
  /** Which direction is good. Latency and churn improve going down. */
  positive?: "up" | "down" | "neutral";
  /** Data for a Sparkline beside the value. */
  trend?: number[];
  /** A line under the value, e.g. the comparison period. */
  helper?: React.ReactNode;
  /** Counts the value up on mount and between updates. Off under reduced motion. */
  countUp?: boolean;
  /** Heartbeat dot by the label, the sparkline's end pings, and each update flashes. */
  live?: boolean;
  loading?: boolean;
  size?: keyof typeof sizes;
}

const Stat = React.forwardRef<HTMLDivElement, StatProps>(
  (
    {
      className,
      style,
      color,
      label,
      value,
      format,
      formatOptions,
      locale = "en-US",
      unit,
      delta,
      formatDelta = defaultDelta,
      positive = "up",
      trend,
      helper,
      countUp = true,
      live = false,
      loading = false,
      size = "md",
      ...props
    },
    ref,
  ) => {
    const id = React.useId();
    const labelId = `${id}-label`;
    const s = sizes[size];
    const numeric = typeof value === "number";

    const formatter = React.useMemo(() => {
      if (format) return format;
      const decimals = numeric ? decimalsOf(value) : 0;
      const intl = new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        ...formatOptions,
      });
      return (n: number) => intl.format(n);
    }, [format, formatOptions, locale, numeric, value]);

    const text = numeric ? formatter(value) : value;
    const displayRef = React.useRef<HTMLSpanElement>(null);
    const shown = React.useRef<number | null>(null);
    // Read inside the effect without making it re-run when only the formatter's identity changes.
    const formatRef = React.useRef(formatter);
    useIsomorphicLayoutEffect(() => {
      formatRef.current = formatter;
    });

    useIsomorphicLayoutEffect(() => {
      const node = displayRef.current;
      if (!node || !numeric || loading) return;
      const from = shown.current ?? 0;
      const first = shown.current === null;
      shown.current = value;
      const write = (n: number) => {
        node.textContent = formatRef.current(n);
      };

      if (live && !first && typeof node.animate === "function" && !prefersReducedMotion()) {
        node.animate(
          [
            { textShadow: "0 0 2px rgb(var(--neon) / 0.9), 0 0 18px rgb(var(--neon) / 0.6)", color: "rgb(var(--neon))" },
            { textShadow: "0 0 0 transparent", color: "rgb(255 255 255 / 0.95)" },
          ],
          { duration: 900, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
        );
      }

      if (!countUp || from === value || prefersReducedMotion()) {
        write(value);
        return;
      }

      const duration = first ? 1100 : 600;
      const start = performance.now();
      let frame = 0;
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 4);
        write(from + (value - from) * eased);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      write(from);
      frame = requestAnimationFrame(tick);
      return () => {
        cancelAnimationFrame(frame);
        write(value);
      };
    }, [value, numeric, countUp, live, loading]);

    const direction = delta === undefined ? null : delta > 0 ? "up" : delta < 0 ? "down" : "flat";
    const tone =
      direction === null || direction === "flat" || positive === "neutral"
        ? "neutral"
        : direction === positive
          ? "good"
          : "bad";
    const DeltaIcon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : Minus;

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={labelId}
        aria-busy={loading || undefined}
        data-live={live ? "" : undefined}
        style={neonVars(color, style)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid min-w-0 content-start gap-1.5", className)}
        {...props}
      >
        {live && <style>{css}</style>}
        <div className="flex min-w-0 items-center gap-2 text-[13px] leading-5 text-white/55">
          {live && (
            <span aria-hidden className="relative inline-flex size-1.5 shrink-0">
              <span className="absolute inset-0 rounded-full bg-[rgb(var(--neon))] motion-safe:[animation:nk-stat-ring_1.6s_cubic-bezier(0.23,1,0.32,1)_infinite]" />
              <span className="relative size-full rounded-full bg-[rgb(var(--neon))] shadow-[0_0_4px_rgb(var(--neon)),0_0_10px_rgb(var(--neon)/0.7)] motion-safe:[animation:nk-stat-beat_1.6s_ease-out_infinite]" />
            </span>
          )}
          <span id={labelId} className="truncate">
            {label}
          </span>
          {live && <span className="sr-only">(live)</span>}
        </div>

        <div className="flex min-w-0 items-end justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            {loading ? (
              <Skeleton className={cn("my-1", s.skeleton)} />
            ) : (
              <span
                className={cn(
                  "whitespace-nowrap font-semibold tracking-[-0.025em] text-white/95 tabular-nums",
                  s.value,
                )}
              >
                <span className="sr-only">{text}</span>
                {numeric ? (
                  // The final value holds the width, so nothing beside it moves while it counts.
                  <span aria-hidden className="inline-grid text-right">
                    <span className="invisible [grid-area:1/1]">{text}</span>
                    <span ref={displayRef} className="[grid-area:1/1]">
                      {text}
                    </span>
                  </span>
                ) : (
                  <span aria-hidden>{text}</span>
                )}
                {unit && <span className={cn("ml-0.5 font-medium tracking-normal text-white/50", s.unit)}>{unit}</span>}
              </span>
            )}
            {direction !== null &&
              (loading ? (
                <Skeleton variant="text" className="w-12" />
              ) : (
                <span
                  style={neonVars(tones[tone])}
                  className={cn(
                    "inline-flex items-center gap-0.5 whitespace-nowrap text-[13px] font-medium leading-5 tabular-nums",
                    tone === "neutral" ? "text-white/55" : "text-[rgb(var(--neon))]",
                  )}
                >
                  <DeltaIcon aria-hidden strokeWidth={2.25} className="size-3.5 shrink-0" />
                  <span className="sr-only">
                    {direction === "up" ? "Up" : direction === "down" ? "Down" : "No change,"}{" "}
                  </span>
                  {formatDelta(delta as number)}
                </span>
              ))}
          </div>
          {trend &&
            trend.length > 1 &&
            (loading ? (
              <Skeleton style={{ width: s.spark.width, height: s.spark.height }} className="mb-1 shrink-0 rounded-md" />
            ) : (
              <Sparkline data={trend} live={live} {...s.spark} className="mb-1" />
            ))}
        </div>

        {helper && <p className="text-xs leading-5 text-white/50">{helper}</p>}
      </div>
    );
  },
);
Stat.displayName = "Stat";

const columnClasses = {
  1: "grid-cols-1",
  2: "grid-cols-1 min-[420px]:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-1 min-[420px]:grid-cols-2 lg:grid-cols-4",
  5: "grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-5",
  6: "grid-cols-1 min-[420px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-6",
} as const;

export interface StatGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color for every stat inside. */
  color?: NeonColor;
  /** Columns at full width. Fewer below it. Defaults to the number of stats, up to 4. */
  columns?: keyof typeof columnClasses;
  /** `framed` adds an outer border; `plain` leaves only the hairlines between stats. */
  variant?: "plain" | "framed";
}

const StatGroup = React.forwardRef<HTMLDivElement, StatGroupProps>(
  ({ className, style, color, columns, variant = "plain", children, ...props }, ref) => {
    // toArray resolves the lazy references Server Components can pass, and drops empty slots.
    const count = React.Children.toArray(children).length;
    const cols = columns ?? (Math.min(Math.max(count, 1), 4) as keyof typeof columnClasses);

    return (
      <div
        ref={ref}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "overflow-hidden",
          variant === "framed" && "rounded-xl border border-white/10 bg-white/[0.02]",
          className,
        )}
        {...props}
      >
        {/* Every cell draws its top and left hairline; the wrapper hides the outer ones, however the grid wraps. */}
        <div
          className={cn(
            "-ml-px -mt-px grid",
            "[&>*]:border-l [&>*]:border-t [&>*]:border-white/[0.08] [&>*]:px-5 [&>*]:py-4",
            variant === "framed" && "[&>*]:py-5",
            columnClasses[cols],
          )}
        >
          {children}
        </div>
      </div>
    );
  },
);
StatGroup.displayName = "StatGroup";

export { Stat, StatGroup };
