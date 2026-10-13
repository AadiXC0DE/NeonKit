"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

// Blips flare when the beam crosses them and decay until the next pass. The
// blip clocks are pinned to the sweep's clock in an effect, so they stay in step.
const css = `
@keyframes nk-radar-sweep { to { transform: rotate(360deg); } }
@keyframes nk-radar-blip { 0% { opacity: 1; } 10% { opacity: 0.9; } 40% { opacity: 0.42; } 75% { opacity: 0.16; } 100% { opacity: 0.06; } }
@keyframes nk-radar-flare { 0% { transform: scale(1.9); } 12%, 100% { transform: scale(1); } }
@keyframes nk-radar-ping { 0% { opacity: 0.85; transform: scale(0.15); } 22%, 100% { opacity: 0; transform: scale(1); } }
.nk-radar-sweep { transform: rotate(var(--nk-radar-still)); }
.nk-radar-blip { opacity: 0; }
.nk-radar-ping { opacity: 0; }
[data-live] .nk-radar-sweep { animation: nk-radar-sweep var(--nk-radar-period) linear infinite; }
[data-live] .nk-radar-blip { animation: nk-radar-blip var(--nk-radar-period) linear infinite; }
[data-live] .nk-radar-dot { animation: nk-radar-flare var(--nk-radar-period) ease-out infinite; }
[data-live] .nk-radar-ping { animation: nk-radar-ping var(--nk-radar-period) cubic-bezier(0.23, 1, 0.32, 1) infinite; }
@media (prefers-reduced-motion: reduce) {
  [data-live] .nk-radar-sweep, [data-live] .nk-radar-blip, [data-live] .nk-radar-dot, [data-live] .nk-radar-ping { animation: none; }
  .nk-radar-blip { opacity: var(--nk-radar-rest); }
}
`;

// Width only: aspect-square sets the height, and max-w-full lets it shrink in a narrow container.
const sizes = { sm: "w-[200px]", md: "w-[280px]", lg: "w-[360px]" } as const;

// Layout effect on the client so the sweep never paints a frame out of step.
const useIsomorphicLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

// Where the beam rests when motion is reduced, and how bright each blip looks
// for its distance behind it (the same curve as the decay keyframes).
const STILL = 58;
const curve: [number, number][] = [
  [0, 1],
  [0.1, 0.9],
  [0.4, 0.42],
  [0.75, 0.16],
  [1, 0.06],
];
function restingOpacity(angle: number) {
  const age = ((((STILL - angle) % 360) + 360) % 360) / 360;
  for (let i = 1; i < curve.length; i++) {
    const [x1, y1] = curve[i];
    const [x0, y0] = curve[i - 1];
    if (age <= x1) return y0 + ((age - x0) / (x1 - x0)) * (y1 - y0);
  }
  return 0.06;
}

// Trig results can differ in the last bit between the server's and the browser's
// engine, so anything rendered from them is rounded first to hydrate cleanly.
const fix = (value: number) => value.toFixed(3);

const bearing = (angle: number) => String(Math.round(((angle % 360) + 360) % 360)).padStart(3, "0");

export interface RadarBlip {
  /** Bearing in degrees, clockwise from the top. */
  angle: number;
  /** Distance from the center, 0 to 1. */
  distance: number;
  /** Short tag drawn beside the blip and read to screen readers. */
  label?: string;
  /** Palette name or hex for this blip. Defaults to the radar's color. */
  color?: NeonColor;
}

export interface RadarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Contacts on the scope. */
  blips?: RadarBlip[];
  /** Seconds per revolution. */
  speed?: number;
  /** Range rings. */
  rings?: number;
  /** Named size, or a diameter in pixels. */
  size?: keyof typeof sizes | number;
  /** Accessible name. The contacts are appended to it. */
  label?: string;
  /** Phosphor color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const Radar = React.forwardRef<HTMLDivElement, RadarProps>(
  (
    {
      className,
      style,
      color,
      blips = [],
      speed = 4,
      rings = 4,
      size = "md",
      label = "Radar",
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const sweepRef = React.useRef<HTMLDivElement>(null);
    const born = React.useRef(new WeakMap<Element, number>());
    const period = Math.max(0.5, speed) * 1000;
    const ringCount = Math.max(1, Math.round(rings));

    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    const signature = blips.map((blip) => blip.angle).join(",");

    useIsomorphicLayoutEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      root.setAttribute("data-live", "");
      const now = Number(document.timeline?.currentTime ?? performance.now());
      // The sweep's clock starts at the timeline's origin, so its angle is a pure function of time.
      for (const animation of sweepRef.current?.getAnimations?.() ?? []) animation.startTime = 0;
      root.querySelectorAll<HTMLElement>("[data-radar-blip]").forEach((node) => {
        const angle = Number(node.dataset.angle) || 0;
        if (!born.current.has(node)) born.current.set(node, now);
        const offset = ((((angle % 360) + 360) % 360) / 360) * period;
        // The most recent pass over this bearing; a new contact waits for the next one.
        let start = offset + Math.floor((now - offset) / period) * period;
        if (start < (born.current.get(node) ?? now)) start += period;
        for (const animation of node.getAnimations?.({ subtree: true }) ?? []) animation.startTime = start;
      });
    }, [period, signature]);

    const named = typeof size === "number";
    const contacts = blips.length;
    const summary = [
      `${label}: ${contacts} ${contacts === 1 ? "contact" : "contacts"}`,
      ...blips
        .filter((blip) => blip.label)
        .map((blip) => `${blip.label} at bearing ${bearing(blip.angle)}, ${Math.round(blip.distance * 100)}% range`),
    ].join(". ");

    const ticks = Array.from({ length: 72 }, (_, i) => i * 5);

    return (
      <div
        ref={rootRef}
        role="img"
        aria-label={summary}
        style={neonVars(color, {
          "--nk-radar-period": `${period}ms`,
          "--nk-radar-still": `${STILL}deg`,
          ...(named ? { width: size } : null),
          ...style,
        } as React.CSSProperties)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative isolate aspect-square max-w-full shrink-0 select-none rounded-full",
          "bg-[radial-gradient(circle_at_50%_30%,#20242e,#0b0c11_70%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),inset_0_-2px_6px_rgb(0_0_0/0.6),0_24px_60px_-24px_rgb(0_0_0/0.9),0_0_80px_-30px_rgb(var(--neon)/0.45)]",
          !named && sizes[size],
          className,
        )}
        {...props}
      >
        <style>{css}</style>

        {/* The bezel: an engraved compass ring. */}
        <svg aria-hidden viewBox="-100 -100 200 200" className="pointer-events-none absolute inset-0 size-full">
          <circle r="99" fill="none" stroke="rgb(255 255 255 / 0.06)" strokeWidth="1" />
          {ticks.map((deg) => {
            const rad = (deg * Math.PI) / 180;
            const major = deg % 30 === 0;
            const inner = major ? 82 : 83.5;
            return (
              <line
                key={deg}
                x1={fix(Math.sin(rad) * inner)}
                y1={fix(-Math.cos(rad) * inner)}
                x2={fix(Math.sin(rad) * 86)}
                y2={fix(-Math.cos(rad) * 86)}
                stroke={major ? "rgb(255 255 255 / 0.5)" : "rgb(255 255 255 / 0.22)"}
                strokeWidth={major ? 0.9 : 0.6}
              />
            );
          })}
          {ticks
            .filter((deg) => deg % 30 === 0)
            .map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return (
                <text
                  key={deg}
                  x={fix(Math.sin(rad) * 92.5)}
                  y={fix(-Math.cos(rad) * 92.5)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="6.2"
                  fill="rgb(255 255 255 / 0.42)"
                  style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", letterSpacing: "0.04em" }}
                >
                  {bearing(deg)}
                </text>
              );
            })}
        </svg>

        {/* The scope face. */}
        <div className="absolute inset-[10.5%] overflow-hidden rounded-full bg-[radial-gradient(circle,rgb(var(--neon)/0.13),rgb(var(--neon)/0.04)_48%,#020304_78%)] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.25),0_0_0_1px_rgb(0_0_0/0.7)]">
          <svg aria-hidden viewBox="-100 -100 200 200" className="pointer-events-none absolute inset-0 size-full">
            {Array.from({ length: ringCount }, (_, i) => (
              <circle
                key={i}
                r={(98 * (i + 1)) / ringCount}
                fill="none"
                stroke="rgb(var(--neon) / 0.22)"
                strokeWidth={i === ringCount - 1 ? 0.9 : 0.6}
                strokeDasharray={i === ringCount - 1 ? undefined : "1.2 2.4"}
              />
            ))}
            {[0, 30, 60, 90, 120, 150].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const cross = deg % 90 === 0;
              return (
                <line
                  key={deg}
                  x1={fix(-Math.sin(rad) * 98)}
                  y1={fix(Math.cos(rad) * 98)}
                  x2={fix(Math.sin(rad) * 98)}
                  y2={fix(-Math.cos(rad) * 98)}
                  stroke={cross ? "rgb(var(--neon) / 0.2)" : "rgb(var(--neon) / 0.07)"}
                  strokeWidth="0.6"
                />
              );
            })}
          </svg>

          <div
            ref={sweepRef}
            aria-hidden
            className="nk-radar-sweep pointer-events-none absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0deg,transparent_250deg,rgb(var(--neon)/0.04)_290deg,rgb(var(--neon)/0.16)_335deg,rgb(var(--neon)/0.42)_359.5deg,transparent_360deg)]"
          >
            <span className="absolute bottom-1/2 left-1/2 h-1/2 w-[1.5px] -translate-x-1/2 bg-[linear-gradient(to_top,color-mix(in_srgb,rgb(var(--neon))_30%,white),rgb(var(--neon)/0.9)_60%,rgb(var(--neon)/0.3))] shadow-[0_0_6px_rgb(var(--neon)),0_0_16px_rgb(var(--neon)/0.6)]" />
          </div>

          {blips.map((blip, i) => {
            const rad = (blip.angle * Math.PI) / 180;
            const reach = Math.min(1, Math.max(0, blip.distance)) * 48;
            // Labels sit to the right, or to the left near the right rim so the glass doesn't clip them.
            const flip = Math.sin(rad) * reach > 12;
            return (
              <span
                key={i}
                aria-hidden
                data-radar-blip=""
                data-angle={blip.angle}
                className="nk-radar-blip pointer-events-none absolute size-0"
                style={
                  {
                    left: `${fix(50 + Math.sin(rad) * reach)}%`,
                    top: `${fix(50 - Math.cos(rad) * reach)}%`,
                    "--nk-radar-tint": blip.color ? toNeonRgb(blip.color) : "var(--neon)",
                    "--nk-radar-rest": restingOpacity(blip.angle).toFixed(3),
                  } as React.CSSProperties
                }
              >
                <span className="nk-radar-ping absolute -left-3.5 -top-3.5 size-7 rounded-full border border-[rgb(var(--nk-radar-tint)/0.9)] shadow-[0_0_10px_rgb(var(--nk-radar-tint)/0.6)]" />
                <span className="nk-radar-dot absolute -left-[3.5px] -top-[3.5px] size-[7px] rounded-full bg-[color-mix(in_srgb,rgb(var(--nk-radar-tint))_35%,white)] shadow-[0_0_4px_rgb(var(--nk-radar-tint)),0_0_12px_2px_rgb(var(--nk-radar-tint)/0.75)]" />
                {blip.label && (
                  <span
                    className={cn(
                      "absolute top-1.5 whitespace-nowrap font-mono text-[10px] leading-none tracking-[0.06em] text-[rgb(var(--nk-radar-tint))] [text-shadow:0_0_8px_rgb(var(--nk-radar-tint)/0.8)]",
                      flip ? "right-2" : "left-2",
                    )}
                  >
                    {blip.label}
                  </span>
                )}
              </span>
            );
          })}

          <span className="pointer-events-none absolute left-1/2 top-1/2 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_30%,white)] shadow-[0_0_8px_rgb(var(--neon))]" />
          {/* Curved glass. */}
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_60%,rgb(0_0_0/0.55))] shadow-[inset_0_0_24px_rgb(0_0_0/0.8)]" />
          <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(ellipse_60%_40%_at_32%_18%,rgb(255_255_255/0.08),transparent_70%)]" />
        </div>
      </div>
    );
  },
);
Radar.displayName = "Radar";

export { Radar };
