"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const keyframes = `
@keyframes nk-progress-sheen { 0% { transform: translateX(-100%); } 60%, 100% { transform: translateX(300%); } }
@keyframes nk-progress-slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(250%); } }
`;

const sizes = {
  sm: {
    track: "h-1",
    text: "text-xs",
    gap: "gap-1.5",
    glow: "shadow-[0_0_6px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1)))]",
  },
  md: {
    track: "h-2",
    text: "text-sm",
    gap: "gap-2",
    glow: "shadow-[0_0_10px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1)))]",
  },
  lg: {
    track: "h-3",
    text: "text-sm",
    gap: "gap-2.5",
    glow: "shadow-[0_0_12px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]",
  },
} as const;

function toPercent(value: number, max: number) {
  if (!(max > 0)) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

export interface ProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Current value. Leave it undefined for an indeterminate bar. */
  value?: number;
  max?: number;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
  /** Slide a segment of light instead of showing a value. */
  indeterminate?: boolean;
  /** Shown above the track and used as the accessible name. */
  label?: React.ReactNode;
  /** Show the percentage at the right of the label row. */
  showValue?: boolean;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      style,
      value,
      max = 100,
      color,
      size = "md",
      indeterminate = false,
      label,
      showValue = false,
      ...props
    },
    ref,
  ) => {
    const labelId = React.useId();
    const isIndeterminate = indeterminate || value == null;
    const percent = isIndeterminate ? 0 : toPercent(value, max);
    const hasName = props["aria-label"] != null || props["aria-labelledby"] != null;
    const hasLabel = label != null && label !== false;
    const s = sizes[size];

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={isIndeterminate ? undefined : Math.min(max, Math.max(0, value))}
        aria-labelledby={!hasName && hasLabel ? labelId : undefined}
        aria-label={!hasName && !hasLabel ? "Progress" : undefined}
        data-state={isIndeterminate ? "indeterminate" : percent >= 100 ? "complete" : "loading"}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "grid w-full",
          s.gap,
          className,
        )}
        {...props}
      >
        <style>{keyframes}</style>
        {(hasLabel || showValue) && (
          <div className={cn("flex items-baseline justify-between gap-3", s.text)}>
            <span id={labelId} className="min-w-0 truncate text-white/90">
              {label}
            </span>
            {showValue && !isIndeterminate && (
              <span aria-hidden className="shrink-0 tabular-nums text-white/55">
                {Math.round(percent)}%
              </span>
            )}
          </div>
        )}
        <div
          className={cn(
            "relative w-full rounded-full bg-white/[0.06] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.04)]",
            s.track,
          )}
        >
          {isIndeterminate ? (
            // The mask fades the segment in and out at the ends without
            // clipping its glow above and below the track.
            <div className="absolute inset-x-0 -inset-y-4 [-webkit-mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)] [mask-image:linear-gradient(90deg,transparent,#000_15%,#000_85%,transparent)]">
              <div
                className={cn(
                  "absolute inset-y-4 left-0 w-2/5 rounded-full bg-[rgb(var(--neon))]",
                  "[animation:nk-progress-slide_1.6s_cubic-bezier(0.65,0,0.35,1)_infinite] motion-reduce:[animation-duration:4s]",
                  s.glow,
                )}
              />
            </div>
          ) : (
            <div
              style={{ width: `${percent}%` }}
              className={cn(
                "relative h-full overflow-hidden rounded-full bg-[rgb(var(--neon))]",
                "transition-[width,opacity,background-color,box-shadow] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
                percent === 0 && "opacity-0",
                s.glow,
              )}
            >
              {percent < 100 && (
                <span className="absolute inset-y-0 left-0 w-1/3 bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.45),transparent)] [animation:nk-progress-sheen_2.8s_ease-in-out_infinite] motion-reduce:hidden" />
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);
Progress.displayName = "Progress";

export interface CircularProgressProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Current value. Leave it undefined for a spinning arc. */
  value?: number;
  max?: number;
  /** Diameter in pixels. */
  size?: number;
  /** Stroke width in pixels. */
  thickness?: number;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Render the percentage in the center. Children replace it. */
  showValue?: boolean;
  indeterminate?: boolean;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  (
    {
      className,
      style,
      value,
      max = 100,
      size = 64,
      thickness = 6,
      color,
      showValue = false,
      indeterminate = false,
      children,
      ...props
    },
    ref,
  ) => {
    const isIndeterminate = indeterminate || value == null;
    const percent = isIndeterminate ? 28 : toPercent(value, max);
    const hasName = props["aria-label"] != null || props["aria-labelledby"] != null;

    const center = size / 2;
    const radius = Math.max(0, (size - thickness) / 2);
    const circumference = 2 * Math.PI * radius;
    const content =
      children ?? (showValue && !isIndeterminate ? `${Math.round(percent)}%` : null);

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={isIndeterminate ? undefined : Math.min(max, Math.max(0, value))}
        aria-label={hasName ? undefined : "Progress"}
        data-state={isIndeterminate ? "indeterminate" : percent >= 100 ? "complete" : "loading"}
        style={neonVars(color, { width: size, height: size, ...style })}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative inline-grid shrink-0 place-items-center",
          className,
        )}
        {...props}
      >
        <svg
          aria-hidden
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          fill="none"
          className={cn(
            "absolute inset-0 -rotate-90 overflow-visible [filter:drop-shadow(0_0_5px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))))]",
            isIndeterminate &&
              "animate-spin [animation-duration:1s] motion-reduce:[animation-duration:3s]",
          )}
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={thickness}
            className="stroke-white/[0.08]"
          />
          <circle
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - percent / 100)}
            className={cn(
              "[stroke:rgb(var(--neon))] transition-[stroke-dashoffset,stroke,opacity] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]",
              percent === 0 && "opacity-0",
            )}
          />
        </svg>
        {content != null && (
          <span
            className="relative font-medium tabular-nums text-white/90"
            style={{ fontSize: Math.max(10, Math.round(size * 0.2)) }}
          >
            {content}
          </span>
        )}
      </div>
    );
  },
);
CircularProgress.displayName = "CircularProgress";

export { Progress, CircularProgress };
