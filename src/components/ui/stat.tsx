"use client";

import * as React from "react";
import { ArrowDownRight, ArrowUpRight, Minus, type Icon } from "@/components/ui/icons";

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
  sm: {
    value: "text-2xl leading-8",
    unit: "text-sm",
    skeleton: "h-8 w-24",
    icon: "size-4",
    spark: { inline: 80, height: 28 },
  },
  md: {
    value: "text-[2rem] leading-10",
    unit: "text-base",
    skeleton: "h-10 w-32",
    icon: "size-[18px]",
    spark: { inline: 96, height: 36 },
  },
  lg: {
    value: "text-[2.75rem] leading-[3.25rem]",
    unit: "text-lg",
    skeleton: "h-[52px] w-40",
    icon: "size-5",
    spark: { inline: 120, height: 48 },
  },
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

function defaultGoal(share: number) {
  return `${Math.round(share * 100)}% of goal`;
}

function defaultDelta(delta: number) {
  return `${Math.abs(delta).toLocaleString("en-US", { maximumFractionDigits: 1 })}%`;
}

/**
 * The icon as a glass tube: a colored outer tube with a hot core drawn inside it. Unlit it's tinted glass with a
 * cold core; lit (live) the core goes white and the tube throws a halo.
 */
function TubeIcon({ icon: Glyph, lit, className }: { icon: Icon; lit: boolean; className: string }) {
  return (
    <span
      aria-hidden
      className={cn("relative inline-grid shrink-0 [&>svg]:[grid-area:1/1] [&>svg]:size-full", className)}
    >
      <Glyph
        strokeWidth={2.25}
        className={cn(
          "transition-[color,filter] duration-300",
          lit
            ? "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_1.5px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1))))_drop-shadow(0_0_7px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))))]"
            : "text-[rgb(var(--neon)/0.42)]",
        )}
      />
      <Glyph
        strokeWidth={0.8}
        className={cn(
          "transition-colors duration-300",
          lit ? "text-[color-mix(in_srgb,rgb(var(--neon))_25%,white)]" : "text-[rgb(var(--neon)/0.75)]",
        )}
      />
    </span>
  );
}

export interface StatProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  label: React.ReactNode;
  /** A NeonKit icon drawn as a tube by the label. It lights up when the stat is live. */
  icon?: Icon;
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
  /** Data for a Sparkline. */
  trend?: number[];
  /** `bottom` runs the sparkline the full width under the value; `end` sets a small one beside it. */
  trendPlacement?: "bottom" | "end";
  /** A target or limit for a numeric value. Draws a tube that fills toward it. */
  goal?: number;
  /** The line under the goal tube. Gets the share (0–1) and the formatted goal. */
  formatGoal?: (share: number, goal: string) => React.ReactNode;
  /** A line under the value, e.g. the comparison period. */
  helper?: React.ReactNode;
  /** Counts the value up on mount and between updates. Off under reduced motion. */
  countUp?: boolean;
  /** Lights the icon (or a heartbeat dot), pings the sparkline's end and flashes each update. */
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
      icon,
      value,
      format,
      formatOptions,
      locale = "en-US",
      unit,
      delta,
      formatDelta = defaultDelta,
      positive = "up",
      trend,
      trendPlacement = "bottom",
      goal,
      formatGoal = defaultGoal,
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
            {
              textShadow: "0 0 2px rgb(var(--neon) / calc(0.9 * var(--neon-glow, 1))), 0 0 18px rgb(var(--neon) / calc(0.6 * var(--neon-glow, 1)))",
              color: "rgb(var(--neon))",
            },
            {
              textShadow: "0 0 0 transparent",
              color: "rgb(255 255 255 / 0.95)",
            },
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

    const hasTrend = Boolean(trend && trend.length > 1);
    const goalShare = numeric && goal !== undefined && goal > 0 ? Math.max(0, Math.min(1, value / goal)) : null;

    const deltaNode =
      direction === null ? null : loading ? (
        <Skeleton variant="text" className="w-14" />
      ) : (
        <span
          data-slot="delta"
          data-tone={tone}
          style={neonVars(tones[tone])}
          className={cn(
            "inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-md pl-1 pr-1.5 text-[12.5px] font-medium leading-none",
            tone === "neutral"
              ? "bg-white/[0.05] text-white/60"
              : "bg-[rgb(var(--neon)/0.1)] text-[rgb(var(--neon))] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.16)]",
          )}
        >
          <DeltaIcon aria-hidden strokeWidth={2.25} className="size-[15px] shrink-0" />
          <span className="sr-only">{direction === "up" ? "Up" : direction === "down" ? "Down" : "No change,"} </span>
          {formatDelta(delta as number)}
        </span>
      );

    return (
      <div
        ref={ref}
        role="group"
        aria-labelledby={labelId}
        aria-busy={loading || undefined}
        data-live={live ? "" : undefined}
        style={neonVars(color, style)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "grid min-w-0 content-start", className)}
        {...props}
      >
        {live && <style>{css}</style>}
        <div className="flex min-w-0 items-start gap-2.5 text-[13px] leading-5 text-white/60">
          {icon ? (
            <span className="relative mt-px inline-flex">
              <TubeIcon icon={icon} lit={live} className={s.icon} />
              {live && (
                <span aria-hidden className="absolute -right-1 -top-0.5 inline-flex size-[5px]">
                  <span className="absolute inset-0 rounded-full bg-[rgb(var(--neon))] motion-safe:[animation:nk-stat-ring_1.6s_cubic-bezier(0.23,1,0.32,1)_infinite]" />
                  <span className="relative size-full rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_4px_rgb(var(--neon)/var(--neon-glow,1))] motion-safe:[animation:nk-stat-beat_1.6s_ease-out_infinite]" />
                </span>
              )}
            </span>
          ) : (
            live && (
              <span aria-hidden className="relative mt-[7px] inline-flex size-1.5 shrink-0">
                <span className="absolute inset-0 rounded-full bg-[rgb(var(--neon))] motion-safe:[animation:nk-stat-ring_1.6s_cubic-bezier(0.23,1,0.32,1)_infinite]" />
                <span className="relative size-full rounded-full bg-[rgb(var(--neon))] shadow-[0_0_4px_rgb(var(--neon)/var(--neon-glow,1)),0_0_10px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1)))] motion-safe:[animation:nk-stat-beat_1.6s_ease-out_infinite]" />
              </span>
            )
          )}
          <span id={labelId} className="min-w-0 [overflow-wrap:anywhere] [text-wrap:pretty]">
            {label}
            {live && <span className="sr-only"> (live)</span>}
          </span>
        </div>

        {/* Wraps instead of colliding: in a narrow cell the delta and an end sparkline drop under the value. */}
        <div className="flex min-w-0 flex-wrap items-end justify-between gap-x-4 gap-y-2 pt-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1.5">
            {loading ? (
              <Skeleton className={cn("my-0.5", s.skeleton)} />
            ) : (
              <span className={cn("whitespace-nowrap font-semibold tracking-[-0.03em] text-white/95", s.value)}>
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
                {unit && <span className={cn("ml-0.5 font-medium tracking-normal text-white/45", s.unit)}>{unit}</span>}
              </span>
            )}
            {deltaNode}
          </div>
          {hasTrend &&
            trendPlacement === "end" &&
            (loading ? (
              <Skeleton
                style={{ width: s.spark.inline, height: s.spark.height }}
                className="mb-1 shrink-0 rounded-md"
              />
            ) : (
              <Sparkline data={trend!} live={live} width={s.spark.inline} height={s.spark.height} className="mb-1" />
            ))}
        </div>

        {/* Always four slots, so a StatGroup can line every stat's rows up on one subgrid. */}
        <div
          className={cn(
            "grid min-w-0 content-start gap-4",
            ((hasTrend && trendPlacement === "bottom") || goalShare !== null) && "pt-4",
          )}
        >
          {hasTrend &&
            trendPlacement === "bottom" &&
            (loading ? (
              <Skeleton style={{ height: s.spark.height }} className="w-full rounded-md" />
            ) : (
              <Sparkline data={trend!} live={live} width="100%" height={s.spark.height} className="block" />
            ))}
          {goalShare !== null && (
            <div className="grid gap-2">
              <div
                role="meter"
                aria-label="Progress to goal"
                aria-valuemin={0}
                aria-valuemax={goal}
                aria-valuenow={value as number}
                aria-valuetext={`${Math.round(goalShare * 100)}% of ${formatter(goal as number)}`}
                className="relative h-[5px] rounded-full bg-white/[0.06] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.04)]"
              >
                {!loading && (
                  // Width rather than scaleX, which would squash the tube's round ends.
                  <span
                    className="absolute inset-y-0 left-0 min-w-[5px] rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1)))] transition-[width] duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                    style={{ width: `${goalShare * 100}%` }}
                  >
                    <span className="absolute inset-x-1 top-[2px] h-px rounded-full bg-white/70" />
                  </span>
                )}
              </div>
              <div aria-hidden className="flex items-baseline justify-between gap-3 text-xs leading-4 text-white/50">
                <span>{loading ? "\u00a0" : formatGoal(goalShare, formatter(goal as number))}</span>
                <span>{formatter(goal as number)}</span>
              </div>
            </div>
          )}
        </div>

        <div className="min-w-0">
          {helper && <p className="pt-2.5 text-xs leading-5 text-white/50 [text-wrap:pretty]">{helper}</p>}
        </div>
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
            "[&>*]:border-l [&>*]:border-t [&>*]:border-white/[0.08] [&>*]:px-5 [&>*]:py-5",
            // Each stat spans four rows of a subgrid, so a label that wraps doesn't push its value below the others.
            "[&>[role=group]]:[grid-row:span_4] [&>[role=group]]:[grid-template-rows:subgrid]",
            variant === "framed" && "[&>*]:px-6 [&>*]:py-6",
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
