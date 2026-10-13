"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Unit = "days" | "hours" | "minutes" | "seconds";

const unitSeconds: Record<Unit, number> = { days: 86400, hours: 3600, minutes: 60, seconds: 1 };
const defaultLabels: Record<Unit, string> = { days: "Days", hours: "Hours", minutes: "Minutes", seconds: "Seconds" };
const order: Unit[] = ["days", "hours", "minutes", "seconds"];

// The largest unit shown absorbs the rest: without days, 50 hours stays 50.
function split(total: number, units: Unit[]) {
  const shown = order.filter((unit) => units.includes(unit));
  const parts = {} as Record<Unit, number>;
  let rest = total;
  for (const unit of shown) {
    parts[unit] = Math.floor(rest / unitSeconds[unit]);
    rest -= parts[unit] * unitSeconds[unit];
  }
  return { shown, parts };
}

const css = `
@keyframes nk-countdown-flap {
  0% { transform: rotateX(0deg); animation-timing-function: cubic-bezier(0.5, 0, 0.9, 0.6); }
  52% { transform: rotateX(-180deg); animation-timing-function: cubic-bezier(0.2, 0.6, 0.4, 1); }
  66% { transform: rotateX(-166deg); animation-timing-function: cubic-bezier(0.6, 0, 0.8, 0.4); }
  78% { transform: rotateX(-180deg); animation-timing-function: cubic-bezier(0.2, 0.6, 0.4, 1); }
  87% { transform: rotateX(-176deg); animation-timing-function: cubic-bezier(0.6, 0, 0.8, 0.4); }
  94%, 100% { transform: rotateX(-180deg); }
}
@keyframes nk-countdown-front { 0% { opacity: 0; } 28%, 100% { opacity: 0.6; } }
@keyframes nk-countdown-back { 0%, 26% { opacity: 0.55; } 52%, 100% { opacity: 0; } }
@keyframes nk-countdown-reveal { 0% { opacity: 0.5; } 30%, 100% { opacity: 0; } }
@keyframes nk-countdown-cover { 0% { opacity: 0; } 50%, 100% { opacity: 0.45; } }
@keyframes nk-countdown-strike { 0% { opacity: 0.45; } 100% { opacity: 1; } }
.nk-countdown-flap { animation: nk-countdown-flap 620ms both; }
.nk-countdown-front { animation: nk-countdown-front 620ms both; }
.nk-countdown-back { animation: nk-countdown-back 620ms both; }
.nk-countdown-reveal { animation: nk-countdown-reveal 620ms both; }
.nk-countdown-cover { animation: nk-countdown-cover 620ms both; }
.nk-countdown-strike { animation: nk-countdown-strike 220ms ease-out both; }
@media (prefers-reduced-motion: reduce) {
  .nk-countdown-flap { animation: none; transform: rotateX(-180deg); }
  .nk-countdown-front, .nk-countdown-back, .nk-countdown-reveal, .nk-countdown-cover { animation: none; opacity: 0; }
  .nk-countdown-strike { animation: none; }
}
`;

// One variable sizes every digit, so `sm:[--countdown-h:72px]` scales the whole timer.
const H = "var(--countdown-h,56px)";
const times = (factor: number) => `calc(${H} * ${factor})`;

/* Flip: a one-step split-flap card. */

const card = "absolute inset-x-0 h-1/2 overflow-hidden";
const cardTop = "top-0 rounded-t-[inherit] bg-[linear-gradient(to_bottom,#1d2029,#14161d)]";
const cardBottom = "bottom-0 rounded-b-[inherit] bg-[linear-gradient(to_bottom,#121419,#0c0e12)]";
const cardGlyph =
  "absolute inset-x-0 h-[200%] select-none text-center font-semibold tabular-nums [color:color-mix(in_srgb,rgb(var(--neon))_62%,white)]";
const cardShade = "pointer-events-none absolute inset-0 bg-black opacity-0";

function FlipDigit({ digit }: { digit: string }) {
  const [state, setState] = React.useState({ current: digit, previous: digit, flips: 0 });
  if (state.current !== digit) setState({ current: digit, previous: state.current, flips: state.flips + 1 });
  const { current, previous, flips } = state;
  const moving = flips > 0;

  const glyphStyle = {
    fontSize: times(0.74),
    lineHeight: H,
    textShadow: `0 0 ${times(0.14)} rgb(var(--neon) / 0.55)`,
  };

  return (
    <span
      className="relative inline-block shrink-0 rounded-[6px] shadow-[0_1px_0_rgb(255_255_255/0.04),0_3px_6px_rgb(0_0_0/0.6)]"
      style={{ width: times(0.7), height: H, perspective: times(5) }}
    >
      <span className={cn(card, cardTop)}>
        <span className={cn(cardGlyph, "top-0")} style={glyphStyle}>
          {current}
        </span>
        {moving && <span key={flips} className={cn(cardShade, "nk-countdown-reveal")} />}
      </span>
      <span className={cn(card, cardBottom, "shadow-[inset_0_2px_3px_-1px_rgb(0_0_0/0.7)]")}>
        <span className={cn(cardGlyph, "-top-full")} style={glyphStyle}>
          {previous}
        </span>
        {moving && <span key={flips} className={cn(cardShade, "nk-countdown-cover")} />}
      </span>
      {/* Rests face down over the bottom half; each change remounts it at the top and drops it. */}
      <span
        key={flips}
        className={cn(
          "absolute inset-x-0 top-0 h-1/2 origin-bottom rounded-t-[inherit] [transform-style:preserve-3d]",
          moving && "nk-countdown-flap",
        )}
        style={moving ? undefined : { transform: "rotateX(-180deg)" }}
      >
        <span className={cn(card, cardTop, "h-full [-webkit-backface-visibility:hidden] [backface-visibility:hidden]")}>
          <span className={cn(cardGlyph, "top-0")} style={glyphStyle}>
            {previous}
          </span>
          {moving && <span className={cn(cardShade, "nk-countdown-front")} />}
        </span>
        <span
          className={cn(
            card,
            "top-0 h-full rounded-b-[6px] bg-[linear-gradient(to_bottom,#121419,#0c0e12)] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [transform:rotateX(180deg)]",
          )}
        >
          <span className={cn(cardGlyph, "-top-full")} style={glyphStyle}>
            {current}
          </span>
          {moving && <span className={cn(cardShade, "nk-countdown-back")} />}
        </span>
      </span>
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/90 shadow-[0_1px_0_rgb(255_255_255/0.05)]" />
      <span className="pointer-events-none absolute -left-px top-1/2 h-[12%] w-[2px] -translate-y-1/2 rounded-full bg-[#2b2f3a]" />
      <span className="pointer-events-none absolute -right-px top-1/2 h-[12%] w-[2px] -translate-y-1/2 rounded-full bg-[#2b2f3a]" />
    </span>
  );
}

/* Digital: seven segments with mitred ends. */

const sh = 5.5;
const hSeg = (y: number) =>
  `${7.1},${y} ${12.6},${y - sh} ${43.4},${y - sh} ${48.9},${y} ${43.4},${y + sh} ${12.6},${y + sh}`;
const vSeg = (x: number, y1: number, y2: number) =>
  `${x},${y1} ${x + sh},${y1 + sh} ${x + sh},${y2 - sh} ${x},${y2} ${x - sh},${y2 - sh} ${x - sh},${y1 + sh}`;
const segmentShapes = [
  hSeg(5.5),
  vSeg(50.5, 7.1, 48.4),
  vSeg(50.5, 51.6, 92.9),
  hSeg(94.5),
  vSeg(5.5, 51.6, 92.9),
  vSeg(5.5, 7.1, 48.4),
  hSeg(50),
];
const segmentMasks: Record<string, string> = {
  "0": "1111110", "1": "0110000", "2": "1101101", "3": "1111001", "4": "0110011",
  "5": "1011011", "6": "1011111", "7": "1110000", "8": "1111111", "9": "1111011", "-": "0000001",
};

function SegmentDigit({ digit }: { digit: string }) {
  const mask = segmentMasks[digit] ?? "0000000";
  const layer = (lit: boolean) => (
    <svg
      aria-hidden
      viewBox="0 0 66 100"
      className={cn("block overflow-visible", lit && "absolute inset-0")}
      style={{
        width: times(0.66),
        height: H,
        ...(lit
          ? {
              fill: "color-mix(in srgb, rgb(var(--neon)) 72%, white)",
              filter: `drop-shadow(0 0 ${times(0.03)} rgb(var(--neon))) drop-shadow(0 0 ${times(0.14)} rgb(var(--neon) / 0.55))`,
            }
          : { fill: "rgb(var(--neon) / 0.08)" }),
      }}
    >
      <g transform="translate(10 0) skewX(-6)">
        {segmentShapes.map((points, index) =>
          !lit || mask[index] === "1" ? <polygon key={index} points={points} /> : null,
        )}
      </g>
    </svg>
  );
  return (
    <span className="relative inline-block shrink-0">
      {layer(false)}
      {layer(true)}
    </span>
  );
}

/* Sign: bent neon tubes, one per digit. */

const tubes: Record<string, string> = {
  "0": "M20 4C30 4 35 14 35 32S30 60 20 60 5 50 5 32 10 4 20 4Z",
  "1": "M12 13 22 4V60",
  "2": "M6 15C7 8 12 4 20 4C28 4 34 9 34 17C34 26 26 33 6 60H35",
  "3": "M7 9C10 6 15 4 20 4C28 4 33 9 33 16C33 23 27 29 18 29C28 29 35 35 35 44C35 53 28 60 19 60C13 60 8 58 5 54",
  "4": "M27 60V4L5 44H36",
  "5": "M33 4H10L8 28C11 26 15 25 19 25C29 25 35 32 35 42C35 53 28 60 19 60C13 60 8 58 5 54",
  "6": "M31 8C28 5 24 4 21 4C11 4 5 15 5 33C5 51 11 60 20 60C29 60 35 53 35 43C35 33 29 27 20 27C13 27 8 31 5 37",
  "7": "M5 4H35L15 60",
  "8": "M20 30C12 30 7 25 7 17C7 9 12 4 20 4C28 4 33 9 33 17C33 25 28 30 20 30C11 30 5 36 5 45C5 54 11 60 20 60C29 60 35 54 35 45C35 36 29 30 20 30Z",
  "9": "M9 56C12 59 16 60 19 60C29 60 35 49 35 31C35 13 29 4 20 4C11 4 5 11 5 21C5 31 11 37 20 37C27 37 32 33 35 27",
};

function TubeDigit({ digit, lit }: { digit: string; lit: boolean }) {
  const path = tubes[digit] ?? tubes["8"];
  return (
    <svg
      aria-hidden
      viewBox="-2 -2 44 68"
      className="block shrink-0 overflow-visible"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        width: times(44 / 68),
        height: H,
        filter: lit
          ? `drop-shadow(0 0 ${times(0.03)} rgb(var(--neon))) drop-shadow(0 0 ${times(0.12)} rgb(var(--neon) / 0.75)) drop-shadow(0 0 ${times(0.3)} rgb(var(--neon) / 0.4))`
          : undefined,
      }}
    >
      {lit ? (
        <g key={digit} className="nk-countdown-strike">
          <path d={path} stroke="rgb(var(--neon))" strokeWidth={5} />
          <path d={path} stroke="color-mix(in srgb, rgb(var(--neon)) 30%, white)" strokeWidth={2.2} />
        </g>
      ) : (
        <>
          <path d={path} stroke="rgb(var(--neon) / 0.16)" strokeWidth={5} />
          <path d={path} stroke="rgb(255 255 255 / 0.06)" strokeWidth={1} transform="translate(-0.6 -0.6)" />
        </>
      )}
    </svg>
  );
}

const sizes = {
  sm: { height: "[--countdown-h:40px]", label: "text-[9px]" },
  md: { height: "[--countdown-h:56px]", label: "text-[10px]" },
  lg: { height: "[--countdown-h:80px]", label: "text-[11px]" },
} as const;

export interface CountdownProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** The moment it reaches zero: a Date, an ISO string or epoch milliseconds. */
  to: Date | string | number;
  /** Split-flap cards, seven-segment digits, or neon tube numerals. */
  variant?: "flip" | "digital" | "sign";
  /** Captions under each unit. `false` hides them; an object renames them. */
  labels?: boolean | Partial<Record<Unit, string>>;
  /** Which units to show. The largest one carries the overflow. */
  units?: Unit[];
  /** Called once when the countdown reaches zero (straight away if `to` has passed). */
  onComplete?: () => void;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  size?: keyof typeof sizes;
}

const Countdown = React.forwardRef<HTMLDivElement, CountdownProps>(
  (
    {
      className,
      style,
      to,
      variant = "flip",
      labels = true,
      units = order,
      onComplete,
      color,
      size = "md",
      ...props
    },
    ref,
  ) => {
    const target = to instanceof Date ? to.getTime() : typeof to === "number" ? to : new Date(to).getTime();
    // Null until the first tick: the server can't know the time, so it renders placeholders.
    const [remaining, setRemaining] = React.useState<number | null>(null);
    const complete = React.useRef(onComplete);

    React.useEffect(() => {
      complete.current = onComplete;
    }, [onComplete]);

    React.useEffect(() => {
      let timer: ReturnType<typeof setTimeout>;
      let done = false;
      const tick = () => {
        const ms = Number.isNaN(target) ? 0 : Math.max(0, target - Date.now());
        const seconds = Math.ceil(ms / 1000);
        setRemaining(seconds);
        if (seconds > 0) {
          // Wake just after the next whole second so the digits change on the beat.
          timer = setTimeout(tick, (ms % 1000 || 1000) + 8);
        } else if (!done) {
          done = true;
          complete.current?.();
        }
      };
      timer = setTimeout(tick, 0);
      return () => clearTimeout(timer);
    }, [target]);

    const { shown, parts } = split(remaining ?? 0, units);
    const names = { ...defaultLabels, ...(typeof labels === "object" ? labels : {}) };
    const s = sizes[size];
    const ready = remaining !== null;

    const spoken = ready
      ? shown
          .map((unit) => {
            const custom = typeof labels === "object" && labels[unit];
            const word = custom ? names[unit] : parts[unit] === 1 ? unit.slice(0, -1) : unit;
            return `${parts[unit]} ${word}`;
          })
          .join(", ")
      : "";

    const digitsFor = (unit: Unit) => {
      if (!ready) return variant === "digital" ? ["-", "-"] : variant === "flip" ? [" ", " "] : ["0", "0"];
      return Array.from(String(parts[unit]).padStart(2, "0"));
    };

    const separator = (key: string) => {
      if (variant === "flip") return null;
      return (
        <span
          key={key}
          aria-hidden
          className="flex shrink-0 flex-col justify-center gap-[0.9em] self-start"
          style={{ height: H, fontSize: times(0.12) }}
        >
          {[0, 1].map((dot) => (
            <span
              key={dot}
              className={cn(
                "block size-[1em] rounded-full",
                variant === "digital"
                  ? "bg-[color-mix(in_srgb,rgb(var(--neon))_72%,white)] shadow-[0_0_6px_rgb(var(--neon)/0.8)]"
                  : ready
                    ? "bg-[color-mix(in_srgb,rgb(var(--neon))_30%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_12px_rgb(var(--neon)/0.7)]"
                    : "bg-[rgb(var(--neon)/0.16)]",
              )}
            />
          ))}
        </span>
      );
    };

    return (
      <div
        ref={ref}
        role="timer"
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "inline-flex max-w-full items-start gap-[calc(var(--countdown-h,56px)*0.22)]",
          s.height,
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        <span className="sr-only">{spoken}</span>
        {shown.map((unit, index) => (
          <React.Fragment key={unit}>
            {index > 0 && separator(`${unit}-separator`)}
            <div aria-hidden className="flex flex-col items-center gap-2.5" style={index > 0 && variant === "flip" ? { marginLeft: times(0.22) } : undefined}>
              <div className={cn("flex", variant === "flip" ? "gap-1" : variant === "digital" ? "gap-1.5" : "gap-1")}>
                {digitsFor(unit).map((digit, position, all) => {
                  const key = all.length - position;
                  if (variant === "flip") return <FlipDigit key={key} digit={digit} />;
                  if (variant === "digital") return <SegmentDigit key={key} digit={digit} />;
                  return <TubeDigit key={key} digit={digit} lit={ready} />;
                })}
              </div>
              {labels !== false && (
                <span className={cn("font-mono font-medium uppercase tracking-[0.2em] text-white/55", s.label)}>
                  {names[unit]}
                </span>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    );
  },
);
Countdown.displayName = "Countdown";

export { Countdown };
export type { Unit as CountdownUnit };
