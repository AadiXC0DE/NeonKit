"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

/** Where slits start and finish, as fractions of the sun's height, and how thick they get on the way. */
const SLIT_FROM = 0.34;
const SLIT_TO = 0.97;
const SLIT_MIN = 0.003;
const SLIT_MAX = 0.066;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// The canvas carries `color: rgb(var(--neon))`, so the resolved channels are one read away.
function readRgb(node: HTMLElement): Rgb {
  const parts = getComputedStyle(node).color.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return [34, 211, 238];
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

const mix = (a: Rgb, b: Rgb, t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(" ");

/** A ridge line by midpoint displacement, as points across a 1000 × 100 box. Pure, so it renders the same on the server. */
function ridge(seed: number, top: number, bottom: number) {
  const random = mulberry32(seed);
  const n = 64;
  const heights = new Array(n + 1).fill(50);
  heights[0] = 50 + (random() - 0.5) * 100;
  heights[n] = 50 + (random() - 0.5) * 100;
  for (let step = n; step > 1; step /= 2) {
    const amplitude = 100 * (step / n) ** 0.7;
    for (let i = step / 2; i < n; i += step) {
      heights[i] = (heights[i - step / 2] + heights[i + step / 2]) / 2 + (random() - 0.5) * amplitude;
    }
  }
  // Stretched into a fixed band, so the peaks never clip flat against the top of the box.
  const low = Math.min(...heights);
  const high = Math.max(...heights);
  const points = heights.map(
    (h, i) => `${((i / n) * 1000).toFixed(1)},${(top + ((h - low) / (high - low || 1)) * (bottom - top)).toFixed(1)}`,
  );
  return { line: `M${points.join(" L")}`, fill: `M0,100 L${points.join(" L")} L1000,100 Z` };
}

export interface SunsetProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Color of the sun's lower half and the horizon. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Where the horizon sits, as a fraction of the height from the top. 0.5 lines up with Retro Grid. */
  horizon?: number;
  /** Sun diameter as a fraction of the height. */
  size?: number;
  /** Slits cut across the lower half of the sun. */
  slits?: number;
  /** Speed multiplier for the slits. 0 holds still. */
  speed?: number;
  /** Two ridges of mountains in front of the sun, rim-lit. */
  mountains?: boolean;
  /** Same seed, same mountains. */
  seed?: number;
  /** The bright line along the horizon. Turn it off when another layer (Retro Grid) draws one. */
  line?: boolean;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const Sunset = React.forwardRef<HTMLDivElement, SunsetProps>(
  (
    {
      className,
      style,
      color,
      horizon = 0.5,
      size = 0.62,
      slits = 7,
      speed = 1,
      mountains = true,
      seed = 3,
      line = true,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const sunRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);

    const live = React.useRef({ slits, speed });
    const recolor = React.useRef<() => void>(() => {});
    const refresh = React.useRef<() => void>(() => {});

    React.useEffect(() => {
      live.current = { slits, speed };
      refresh.current();
    }, [slits, speed]);

    React.useEffect(() => {
      recolor.current();
    }, [color]);

    // The disc is a small canvas: slits are real cut-outs (the halo shows through them), and a canvas
    // redraw never restyles the page, so it stays cheap even under a Retro Grid's huge 3D floor.
    React.useEffect(() => {
      const canvas = sunRef.current;
      if (!canvas || typeof ResizeObserver === "undefined") return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let size = 0;
      let rgb = readRgb(canvas);
      let raf = 0;
      let last = 0;
      // Starts partway through a cycle so the first frame already has its full set of slits.
      let phase = 0.37;
      let inView = true;

      const draw = () => {
        if (size === 0) return;
        const dpr = canvas.width / size;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, size, size);
        const r = size / 2;
        // Hot at the top, like a real low sun: nearly white, warming into the color toward the horizon.
        const fill = ctx.createLinearGradient(0, 0, 0, size);
        fill.addColorStop(0, `rgb(${mix(rgb, [255, 246, 228], 0.82)})`);
        fill.addColorStop(0.45, `rgb(${mix(rgb, [255, 240, 220], 0.38)})`);
        fill.addColorStop(1, `rgb(${rgb.join(" ")})`);
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(r, r, r, 0, Math.PI * 2);
        ctx.fill();
        const count = Math.max(0, Math.round(live.current.slits));
        for (let i = 0; i < count; i++) {
          const t = (i / count + phase) % 1;
          const y = (SLIT_FROM + (SLIT_TO - SLIT_FROM) * t) * size;
          const h = (SLIT_MIN + (SLIT_MAX - SLIT_MIN) * t * t) * size;
          ctx.clearRect(0, y, size, h);
        }
      };

      const running = () => inView && !document.hidden && !motion.matches && size > 0 && live.current.speed > 0;

      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        phase = (phase + (dt * Math.max(0, live.current.speed)) / 9) % 1;
        draw();
        schedule();
      };

      const schedule = () => {
        if (!raf && running()) raf = requestAnimationFrame(frame);
      };

      const sync = () => {
        if (running()) schedule();
        else {
          cancelAnimationFrame(raf);
          raf = 0;
          last = 0;
          draw();
        }
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        size = canvas.clientWidth;
        canvas.width = canvas.height = Math.max(1, Math.round(size * dpr));
        draw();
        sync();
      };

      recolor.current = () => {
        rgb = readRgb(canvas);
        if (!raf) draw();
      };
      refresh.current = () => {
        sync();
        if (!raf) draw();
      };
      const onTransition = (event: TransitionEvent) => {
        if (event.target === canvas) recolor.current();
      };

      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      const intersection =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(([entry]) => {
              inView = entry.isIntersecting;
              sync();
            });
      intersection?.observe(canvas);
      document.addEventListener("visibilitychange", sync);
      motion.addEventListener("change", sync);
      canvas.addEventListener("transitionend", onTransition);

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
        canvas.removeEventListener("transitionend", onTransition);
        recolor.current = () => {};
        refresh.current = () => {};
      };
    }, []);

    const at = `${Math.max(0.1, Math.min(0.9, horizon)) * 100}%`;
    const diameter = `min(${Math.max(0.1, size) * 100}cqh, 68cqw)`;
    const ridges = React.useMemo(
      () => (mountains ? { far: ridge(seed, 6, 88), near: ridge(seed + 17, 46, 94) } : null),
      [mountains, seed],
    );

    return (
      <div
        ref={rootRef}
        aria-hidden
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "pointer-events-none absolute inset-0 isolate overflow-hidden [container-type:size]",
          className,
        )}
        {...props}
      >
        {/* Sky: the light pooling over the horizon. */}
        <div
          className="absolute inset-x-0 top-0"
          style={{
            height: at,
            background:
              "linear-gradient(to top, rgb(var(--neon) / calc(0.2 * var(--neon-glow, 1))), rgb(var(--neon) / calc(0.06 * var(--neon-glow, 1))) 30%, transparent 70%)",
          }}
        />
        {/* Everything above the horizon is clipped to it, so the sun really sets. */}
        <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: at }}>
          <div
            className="absolute left-1/2 aspect-square -translate-x-1/2"
            style={{ width: diameter, bottom: `calc(${diameter} * -0.1)` }}
          >
            {/* The halo: static, so nothing blurs per frame. */}
            <div className="absolute -inset-[45%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/CALC(0.3*var(--neon-glow,1))),rgb(var(--neon)/CALC(0.1*var(--neon-glow,1)))_45%,transparent)]" />
            {/* The color transition is a change detector: when --neon changes upstream, transitionend fires. */}
            <canvas
              ref={sunRef}
              className="absolute inset-0 size-full"
              style={{ color: "rgb(var(--neon))", transition: "color 1ms linear" }}
            />
          </div>

          {ridges && (
            <>
              <svg
                viewBox="0 0 1000 100"
                preserveAspectRatio="none"
                className="absolute inset-x-0 bottom-0 h-[40%] w-full"
                style={{ filter: "drop-shadow(0 0 6px rgb(var(--neon) / calc(0.55 * var(--neon-glow, 1))))" }}
              >
                <path d={ridges.far.fill} fill="#0a0b14" />
                <path
                  d={ridges.far.line}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth="1.25"
                  strokeLinejoin="round"
                  style={{ stroke: "color-mix(in oklab, rgb(var(--neon)) 70%, white)" }}
                />
              </svg>
              <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-[20%] w-full">
                <path d={ridges.near.fill} fill="#05060a" />
                <path
                  d={ridges.near.line}
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                  strokeWidth="1"
                  style={{ stroke: "rgb(var(--neon) / 0.22)" }}
                />
              </svg>
            </>
          )}
        </div>

        {/* Below the horizon: the sun's reflection, a narrow column of light on dark ground. */}
        <div
          className="absolute inset-x-0 bottom-0"
          style={{
            top: at,
            background:
              "radial-gradient(ellipse 18% 70% at 50% 0%, rgb(var(--neon) / calc(0.22 * var(--neon-glow, 1))), transparent 70%), linear-gradient(to bottom, rgb(var(--neon) / calc(0.08 * var(--neon-glow, 1))), transparent 35%)",
          }}
        />
        {line && (
          <div
            className="absolute inset-x-0 h-px -translate-y-px bg-[linear-gradient(to_right,transparent,color-mix(in_srgb,rgb(var(--neon))_60%,white)_20%,color-mix(in_srgb,rgb(var(--neon))_60%,white)_80%,transparent)] shadow-[0_0_4px_rgb(var(--neon)/var(--neon-glow,1)),0_0_14px_1px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))),0_0_60px_6px_rgb(var(--neon)/CALC(0.3*var(--neon-glow,1)))]"
            style={{ top: at }}
          />
        )}
      </div>
    );
  },
);
Sunset.displayName = "Sunset";

export { Sunset };
