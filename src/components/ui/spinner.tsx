import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const keyframes = `
@keyframes nk-spinner-dot { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.75); } 40% { opacity: 1; transform: scale(1); } }
@keyframes nk-spinner-bar { 0%, 100% { opacity: 0.45; transform: scaleY(0.35); } 50% { opacity: 1; transform: scaleY(1); } }
`;

const sizes = {
  sm: { box: "size-4", stroke: 3, dot: 3, gap: 2, bar: 2, orbit: 4 },
  md: { box: "size-6", stroke: 2.5, dot: 5, gap: 3, bar: 3, orbit: 5 },
  lg: { box: "size-9", stroke: 2, dot: 7, gap: 4, bar: 4, orbit: 7 },
} as const;

type SpinnerSize = keyof typeof sizes;

// Every duration is multiplied by --nk-spinner-slow, which reduced motion
// raises, so the spinner slows down and still reads as busy.
const seconds = (s: number) => `calc(${s}s * var(--nk-spinner-slow))`;

const RING_RADIUS = 9;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function Ring({ size }: { size: SpinnerSize }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={sizes[size].stroke}
      className="size-full animate-spin [animation-duration:calc(0.8s*var(--nk-spinner-slow))] [filter:drop-shadow(0_0_3px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1))))]"
    >
      <circle cx={12} cy={12} r={RING_RADIUS} className="[stroke:rgb(var(--neon)/0.15)]" />
      <circle
        cx={12}
        cy={12}
        r={RING_RADIUS}
        strokeLinecap="round"
        strokeDasharray={`${RING_CIRCUMFERENCE * 0.28} ${RING_CIRCUMFERENCE}`}
        className="[stroke:rgb(var(--neon))]"
      />
    </svg>
  );
}

function Dots({ size }: { size: SpinnerSize }) {
  const { dot, gap } = sizes[size];
  return (
    <span aria-hidden className="flex items-center" style={{ gap }}>
      {[0, 0.16, 0.32].map((delay) => (
        <span
          key={delay}
          className="rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1)))]"
          style={{
            width: dot,
            height: dot,
            animation: `nk-spinner-dot ${seconds(1.2)} ease-in-out ${seconds(delay)} infinite both`,
          }}
        />
      ))}
    </span>
  );
}

function Bars({ size }: { size: SpinnerSize }) {
  const { bar, gap } = sizes[size];
  return (
    <span aria-hidden className="flex h-3/4 items-center" style={{ gap }}>
      {/* Negative delays start each bar mid-cycle, so the wave is already moving on mount. */}
      {[-1, -0.85, -0.7, -0.55].map((delay) => (
        <span
          key={delay}
          className="h-full rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]"
          style={{
            width: bar,
            animation: `nk-spinner-bar ${seconds(1)} ease-in-out ${seconds(delay)} infinite`,
          }}
        />
      ))}
    </span>
  );
}

function Orbit({ size }: { size: SpinnerSize }) {
  const { orbit } = sizes[size];
  return (
    <>
      <span
        aria-hidden
        className="absolute rounded-full border border-[rgb(var(--neon)/0.18)]"
        style={{ inset: (orbit - 1) / 2 }}
      />
      <span
        aria-hidden
        className="absolute inset-0 animate-spin [animation-duration:calc(1.1s*var(--nk-spinner-slow))]"
      >
        <span
          className="absolute top-0 left-1/2 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1)))]"
          style={{ width: orbit, height: orbit, marginLeft: -orbit / 2 }}
        />
      </span>
    </>
  );
}

const variants = { ring: Ring, dots: Dots, bars: Bars, orbit: Orbit } as const;

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  variant?: keyof typeof variants;
  size?: SpinnerSize;
  /** Announced to screen readers, visually hidden. */
  label?: string;
}

const Spinner = React.forwardRef<HTMLSpanElement, SpinnerProps>(
  (
    { className, style, color, variant = "ring", size = "md", label = "Loading", ...props },
    ref,
  ) => {
    const Visual = variants[variant];

    return (
      <span
        ref={ref}
        role="status"
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "[--nk-spinner-slow:1] motion-reduce:[--nk-spinner-slow:3]",
          "relative inline-flex shrink-0 items-center justify-center",
          sizes[size].box,
          className,
        )}
        {...props}
      >
        <style>{keyframes}</style>
        <Visual size={size} />
        {label && <span className="sr-only">{label}</span>}
      </span>
    );
  },
);
Spinner.displayName = "Spinner";

export { Spinner };
