"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// One cardiac cycle as [phase, amplitude]: P wave, QRS complex, T wave.
const halfSine = (from: number, span: number, amp: number, lift = 0, steps = 8): [number, number][] =>
  Array.from({ length: steps + 1 }, (_, i) => {
    const u = i / steps;
    return [from + u * span, lift * (1 - u) + Math.sin(u * Math.PI) * amp];
  });

const cycle: [number, number][] = [
  [0, 0],
  ...halfSine(0.06, 0.1, 0.1, 0, 6),
  [0.2, 0],
  [0.226, -0.09],
  [0.25, 1],
  [0.274, -0.3],
  [0.298, 0.02],
  ...halfSine(0.38, 0.18, 0.24, 0.04),
  [0.62, 0],
  [1, 0],
];
const R_PHASE = 0.25;
const NOMINAL_SPEED = 150; // px per second, before snapping to whole beats

function level(phase: number) {
  for (let i = 1; i < cycle.length; i++) {
    const [x1, y1] = cycle[i];
    if (phase <= x1) {
      const [x0, y0] = cycle[i - 1];
      return x1 === x0 ? y1 : y0 + ((phase - x0) / (x1 - x0)) * (y1 - y0);
    }
  }
  return 0;
}

// Beats differ by a few percent, like a real strip. Hashed, so server and client agree.
const variation = (beat: number) => 0.93 + 0.07 * Math.abs((Math.sin(beat * 12.9898 + 4.1) * 43758.5453) % 1);

function layout(width: number, height: number, bpm: number) {
  const flat = !(bpm > 0);
  const interval = flat ? 1 : 60 / bpm;
  // A whole number of beats per screen, so the strip repeats seamlessly.
  const beats = flat ? 1 : Math.max(1, Math.round(width / (NOMINAL_SPEED * interval)));
  const span = width / beats;
  const period = flat ? width / NOMINAL_SPEED : beats * interval;
  const base = height * 0.6;
  const reach = base - height * 0.12;
  const y = (x: number) => {
    if (flat) return base;
    const local = ((x % width) + width) % width;
    const beat = Math.floor(local / span);
    return base - level(local / span - beat) * reach * variation(beat);
  };
  let d = "";
  if (flat) d = `M0 ${base.toFixed(1)}H${(width * 2).toFixed(1)}`;
  else
    for (let k = 0; k < beats * 2; k++) {
      const amp = variation(k % beats);
      for (const [phase, value] of cycle) {
        if (k > 0 && phase === 0) continue;
        const x = (k + phase) * span;
        d += `${d ? "L" : "M"}${x.toFixed(1)} ${(base - value * reach * amp).toFixed(1)}`;
      }
    }
  return { d, span, period, y, flat };
}

export interface HeartbeatProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Beats per minute. 0 draws a flat line. */
  bpm?: number;
  /** Trace color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Height in pixels. The width fills the container. */
  height?: number;
  /** Called as each R peak passes the leading dot. */
  onBeat?: () => void;
}

/**
 * An ECG trace that sweeps left to right with a fading tail.
 */
const Heartbeat = React.forwardRef<HTMLDivElement, HeartbeatProps>(
  ({ className, style, color, bpm = 72, height = 96, onBeat, ...props }, ref) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const haloRef = React.useRef<SVGLinearGradientElement>(null);
    const coreRef = React.useRef<SVGLinearGradientElement>(null);
    const headElRef = React.useRef<HTMLSpanElement>(null);
    const onBeatRef = React.useRef(onBeat);
    const headRef = React.useRef(-1);
    const [width, setWidth] = React.useState(0);
    const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");

    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);

    React.useEffect(() => {
      onBeatRef.current = onBeat;
    }, [onBeat]);

    React.useEffect(() => {
      const root = rootRef.current;
      if (!root) return;
      const measure = () => setWidth(Math.round(root.getBoundingClientRect().width));
      measure();
      if (typeof ResizeObserver === "undefined") return;
      const observer = new ResizeObserver(measure);
      observer.observe(root);
      return () => observer.disconnect();
    }, []);

    const strip = React.useMemo(() => (width > 0 ? layout(width, height, bpm) : null), [width, height, bpm]);

    React.useEffect(() => {
      const root = rootRef.current;
      if (!root || !strip) return;
      const tail = width * 0.72;
      const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
      let raf = 0;
      let last = 0;
      let onScreen = true;

      const place = (head: number) => {
        const p = width + head;
        for (const gradient of [haloRef.current, coreRef.current]) {
          gradient?.setAttribute("x1", (p - tail).toFixed(2));
          gradient?.setAttribute("x2", (p + 1).toFixed(2));
        }
        if (headElRef.current) {
          headElRef.current.style.transform = `translate(${head.toFixed(2)}px, ${strip.y(head).toFixed(2)}px)`;
        }
      };

      // Keep the dot where it was across bpm and size changes.
      if (headRef.current < 0 || headRef.current >= width) headRef.current = width * 0.86;
      place(headRef.current);

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
        last = now;
        const from = headRef.current;
        let to = from + (width / strip.period) * dt;
        if (!strip.flat) {
          // Fire onBeat for every R peak the dot crossed this frame.
          const first = Math.ceil(from / strip.span - R_PHASE);
          for (let k = first; (k + R_PHASE) * strip.span <= to; k++) {
            if ((k + R_PHASE) * strip.span > from) onBeatRef.current?.();
          }
        }
        if (to >= width) to -= width;
        headRef.current = to;
        place(to);
      };

      const stop = () => {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      };
      const sync = () => {
        const live = onScreen && !document.hidden && !motion?.matches;
        if (live && !raf) raf = requestAnimationFrame(frame);
        else if (!live && raf) stop();
      };

      const intersection =
        typeof IntersectionObserver !== "undefined"
          ? new IntersectionObserver(([entry]) => {
              onScreen = entry.isIntersecting;
              sync();
            })
          : null;
      intersection?.observe(root);
      document.addEventListener("visibilitychange", sync);
      motion?.addEventListener?.("change", sync);
      sync();

      return () => {
        stop();
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion?.removeEventListener?.("change", sync);
      };
    }, [strip, width]);

    const rate = Math.max(0, Math.round(bpm));
    // The pool of light around the dot scales with the strip.
    const spill = Math.min(88, Math.max(24, height * 0.85));
    // The tail fades in from nothing; the last stop cuts the trace off right at the dot.
    const stops: [number, number][] = [
      [0, 0],
      [0.4, 0.26],
      [0.8, 0.72],
      [0.997, 1],
      [1, 0],
    ];

    return (
      <div
        ref={rootRef}
        role="img"
        aria-label={rate > 0 ? `Heart rate ${rate} beats per minute` : "Flat line, no heart rate"}
        style={neonVars(color, { height, ...style })}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "relative w-full min-w-0", className)}
        {...props}
      >
        {strip && (
          <>
            <svg
              aria-hidden
              viewBox={`0 0 ${width} ${height}`}
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 size-full overflow-visible [clip-path:inset(-50%_0)]"
            >
              <defs>
                {(
                  [
                    [haloRef, `${id}-halo`, "rgb(var(--neon))"],
                    [coreRef, `${id}-core`, "color-mix(in srgb, rgb(var(--neon)) 30%, white)"],
                  ] as const
                ).map(([gradientRef, gradientId, stopColor]) => (
                  <linearGradient
                    key={gradientId}
                    ref={gradientRef}
                    id={gradientId}
                    gradientUnits="userSpaceOnUse"
                    x1={width * 1.14}
                    x2={width * 1.86 + 1}
                    y1="0"
                    y2="0"
                  >
                    {stops.map(([offset, opacity]) => (
                      <stop key={offset} offset={offset} style={{ stopColor, stopOpacity: opacity }} />
                    ))}
                  </linearGradient>
                ))}
              </defs>
              {/* The strip is two screens long, drawn twice, so the tail wraps around the edge. */}
              {[0, -width].map((shift) => (
                <g key={shift} transform={`translate(${shift} 0)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d={strip.d} stroke={`url(#${id}-halo)`} strokeWidth="7" strokeOpacity="0.16" />
                  <path d={strip.d} stroke={`url(#${id}-halo)`} strokeWidth="3" strokeOpacity="0.55" />
                  <path d={strip.d} stroke={`url(#${id}-core)`} strokeWidth="1.5" />
                </g>
              ))}
            </svg>
            {/* The leading dot and the pool of light it throws; outside the SVG so the edges never clip it. */}
            <span
              ref={headElRef}
              aria-hidden
              style={{ transform: `translate(${width * 0.86}px, ${strip.y(width * 0.86)}px)` }}
              className="pointer-events-none absolute left-0 top-0"
            >
              <span
                style={{ width: spill, height: spill, left: -spill / 2, top: -spill / 2 }}
                className="absolute rounded-full bg-[radial-gradient(circle,rgb(var(--neon)/0.3),transparent_68%)]"
              />
              <span className="absolute -left-[2.5px] -top-[2.5px] size-[5px] rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_30%,white)] shadow-[0_0_0_2px_rgb(var(--neon)/0.4),0_0_6px_3px_rgb(var(--neon)/0.55),0_0_16px_6px_rgb(var(--neon)/0.2)]" />
            </span>
          </>
        )}
      </div>
    );
  },
);
Heartbeat.displayName = "Heartbeat";

export { Heartbeat };
