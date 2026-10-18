"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

const DEG = Math.PI / 180;
/** Samples of the haze along each beam; each one becomes a gradient stop. */
const STOPS = 22;
const NOISE = 16;

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

/** The theme's glow multiplier. A finite check, not `|| 1`, so 0 stays 0. */
function readGlow(node: Element) {
  const value = parseFloat(getComputedStyle(node).getPropertyValue("--neon-glow"));
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

// The canvas carries `color: rgb(var(--neon))`, so the resolved channels are one read away.
function readRgb(node: HTMLElement): Rgb {
  const parts = getComputedStyle(node).color.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return [34, 211, 238];
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

const whiten = ([r, g, b]: Rgb, t: number) =>
  `${Math.round(r + (255 - r) * t)} ${Math.round(g + (255 - g) * t)} ${Math.round(b + (255 - b) * t)}`;

// A small periodic value-noise field: the smoke the beams pass through.
const lattice = (() => {
  const random = mulberry32(0x1a5e);
  return Float32Array.from({ length: NOISE * NOISE }, () => random());
})();

function noise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);
  const at = (i: number, j: number) => lattice[(((j % NOISE) + NOISE) % NOISE) * NOISE + (((i % NOISE) + NOISE) % NOISE)];
  const top = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * sx;
  const bottom = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * sx;
  return top + (bottom - top) * sy;
}

export interface LasersProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Beam color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Which edge the projectors sit on. */
  origin?: "top" | "bottom";
  /** Beams per projector. */
  beams?: number;
  /** Width of each fan, in degrees. */
  spread?: number;
  /** Projectors spaced along the edge. Two or more cross their beams. */
  sources?: number;
  /** Speed multiplier for the sweep. 0 holds still. */
  speed?: number;
  /** Brightness of the beams and the flare, 0 to 1. */
  intensity?: number;
  /** How much the smoke breaks the beams up, 0 (clean lines) to 1 (patchy). */
  haze?: number;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const Lasers = React.forwardRef<HTMLDivElement, LasersProps>(
  (
    {
      className,
      style,
      color,
      origin = "bottom",
      beams = 8,
      spread = 76,
      sources = 1,
      speed = 1,
      intensity = 0.85,
      haze = 0.7,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);

    const live = React.useRef({ origin, beams, spread, sources, speed, intensity, haze });
    const refresh = React.useRef<() => void>(() => {});
    const recolor = React.useRef<() => void>(() => {});

    React.useEffect(() => {
      live.current = { origin, beams, spread, sources, speed, intensity, haze };
      refresh.current();
    }, [origin, beams, spread, sources, speed, intensity, haze]);

    React.useEffect(() => {
      recolor.current();
    }, [color]);

    React.useEffect(() => {
      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas || typeof ResizeObserver === "undefined") return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let width = 0;
      let height = 0;
      let rgb = readRgb(canvas);
      let glow = readGlow(canvas);
      let raf = 0;
      let last = 0;
      // Starts mid-program, so the first frame (and the still frame) is already a good look.
      let time = 7.5;
      let inView = true;
      const alphas = new Float32Array(STOPS);
      const clouds = new Float32Array(STOPS);

      const draw = () => {
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, width, height);
        const { beams: count, spread: fan, sources: projectors, haze: smoke } = live.current;
        const level = Math.max(0, Math.min(1, live.current.intensity));
        if (level === 0 || width === 0) return;
        const up = live.current.origin === "bottom";
        const n = Math.max(1, Math.round(count));
        const heads = Math.max(1, Math.min(5, Math.round(projectors)));
        const reach = Math.hypot(width, height) * 1.05;
        const patchy = Math.max(0, Math.min(1, smoke));
        const hot = whiten(rgb, 0.55);
        const tint = rgb.join(" ");
        // The smoke drifts sideways and rises, slower than the beams sweep.
        const driftX = time * 0.09;
        const driftY = time * (up ? 0.05 : -0.05);
        const cell = Math.max(width, height) / 6.5;
        ctx.globalCompositeOperation = "lighter";
        ctx.lineCap = "round";

        for (let h = 0; h < heads; h++) {
          const ox = (width * (h + 1)) / (heads + 1);
          const oy = up ? height + 2 : -2;
          const mirror = h % 2 === 0 ? 1 : -1;
          // A slow programme: the fan sweeps side to side and breathes open and shut.
          const sweep = Math.sin(time * 0.37 + h * 1.7) * 13 * DEG * mirror + Math.sin(time * 0.13 + h) * 5 * DEG;
          const open = 0.72 + 0.28 * Math.sin(time * 0.29 + h * 2.3);
          const aim = (up ? -90 : 90) * DEG + sweep;

          // Air lit by scatter: a faint wedge under the fan.
          const air = ctx.createRadialGradient(ox, oy, 0, ox, oy, height * 0.95);
          air.addColorStop(0, `rgb(${tint} / ${0.1 * level * glow})`);
          air.addColorStop(1, `rgb(${tint} / 0)`);
          ctx.fillStyle = air;
          ctx.beginPath();
          ctx.moveTo(ox, oy);
          const halfFan = (fan * open * DEG) / 2 + 6 * DEG;
          ctx.arc(ox, oy, height * 0.95, aim - halfFan, aim + halfFan);
          ctx.closePath();
          ctx.fill();

          for (let i = 0; i < n; i++) {
            const slot = n === 1 ? 0 : i / (n - 1) - 0.5;
            const angle = aim + slot * fan * open * DEG;
            const dx = Math.cos(angle);
            const dy = Math.sin(angle);
            const ex = ox + dx * reach;
            const ey = oy + dy * reach;
            // Brightness along the beam: falls off with distance, and comes and goes with the smoke.
            for (let k = 0; k < STOPS; k++) {
              const f = k / (STOPS - 1);
              const px = (ox + dx * reach * f) / cell + driftX;
              const py = (oy + dy * reach * f) / cell + driftY;
              const density = noise(px, py) * 0.6 + noise(px * 2.7 + 5, py * 2.7 - time * 0.04) * 0.4;
              // Contrast-stretched, so clouds catch the beam and the clear air between them barely does.
              const t = Math.max(0, Math.min(1, (density - 0.3) / 0.45));
              const smokeFactor = 1 - patchy + patchy * (0.1 + 1.5 * t * t * (3 - 2 * t));
              alphas[k] = (1 - f) ** 2.1 * smokeFactor;
              // The smoke around the beam lights up only inside a cloud: that sheath is what reads as volume.
              clouds[k] = (1 - f) ** 1.4 * patchy * t * t * 2.2;
            }
            const flicker = 0.9 + 0.1 * Math.sin(time * 9 + i * 2.1 + h);
            const layer = (rgbText: string, peak: number, lineWidth: number, profile = alphas) => {
              const gradient = ctx.createLinearGradient(ox, oy, ex, ey);
              for (let k = 0; k < STOPS; k++) {
                gradient.addColorStop(k / (STOPS - 1), `rgb(${rgbText} / ${Math.min(1, profile[k] * peak)})`);
              }
              ctx.strokeStyle = gradient;
              ctx.lineWidth = lineWidth;
              ctx.beginPath();
              ctx.moveTo(ox, oy);
              ctx.lineTo(ex, ey);
              ctx.stroke();
            };
            if (glow > 0) {
              layer(tint, 0.05 * level * glow * flicker, 26, clouds);
              layer(tint, 0.08 * level * glow * flicker, 9);
              layer(tint, 0.26 * level * glow * flicker, 3.2);
            }
            layer(hot, 0.95 * level * flicker, 1.1);
          }

          // The projector's aperture: a hot core, a wide bloom and a horizontal lens streak.
          if (glow > 0) {
            const bloom = ctx.createRadialGradient(ox, oy, 0, ox, oy, 150);
            bloom.addColorStop(0, `rgb(${hot} / ${Math.min(1, 0.7 * level * glow)})`);
            bloom.addColorStop(0.12, `rgb(${tint} / ${0.32 * level * glow})`);
            bloom.addColorStop(1, `rgb(${tint} / 0)`);
            ctx.fillStyle = bloom;
            ctx.fillRect(ox - 150, oy - 150, 300, 300);
            const streakWidth = Math.min(width * 0.7, 640) / heads;
            const streak = ctx.createLinearGradient(ox - streakWidth, 0, ox + streakWidth, 0);
            streak.addColorStop(0, `rgb(${tint} / 0)`);
            streak.addColorStop(0.5, `rgb(${hot} / ${Math.min(1, 0.85 * level * glow)})`);
            streak.addColorStop(1, `rgb(${tint} / 0)`);
            ctx.fillStyle = streak;
            ctx.fillRect(ox - streakWidth, oy - 1, streakWidth * 2, 2);
          }
          const core = ctx.createRadialGradient(ox, oy, 0, ox, oy, 10);
          core.addColorStop(0, `rgb(255 255 255 / ${level})`);
          core.addColorStop(0.5, `rgb(${hot} / ${0.6 * level})`);
          core.addColorStop(1, `rgb(${tint} / 0)`);
          ctx.fillStyle = core;
          ctx.fillRect(ox - 10, oy - 10, 20, 20);
        }
        ctx.globalCompositeOperation = "source-over";
      };

      const running = () =>
        inView && !document.hidden && !motion.matches && width > 0 && live.current.speed > 0;

      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        time += dt * Math.max(0, live.current.speed);
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
          if (width > 0) draw();
        }
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = root.clientWidth;
        height = root.clientHeight;
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        draw();
        sync();
      };

      recolor.current = () => {
        rgb = readRgb(canvas);
        glow = readGlow(canvas);
        if (!raf && width > 0) draw();
      };
      refresh.current = () => {
        if (width === 0) return;
        sync();
        if (!raf) draw();
      };
      const onTransition = (event: TransitionEvent) => {
        if (event.target === canvas) recolor.current();
      };

      const resizeObserver = new ResizeObserver(resize);
      let dprQuery: MediaQueryList | undefined;
      const onDpr = () => {
        resize();
        watchDpr();
      };
      const watchDpr = () => {
        dprQuery?.removeEventListener?.("change", onDpr);
        dprQuery = window.matchMedia?.(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
        dprQuery?.addEventListener?.("change", onDpr);
      };
      watchDpr();
      resizeObserver.observe(root);
      const intersection =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(([entry]) => {
              inView = entry.isIntersecting;
              sync();
            });
      intersection?.observe(root);
      document.addEventListener("visibilitychange", sync);
      motion.addEventListener("change", sync);
      canvas.addEventListener("transitionend", onTransition);

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        dprQuery?.removeEventListener?.("change", onDpr);
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
        canvas.removeEventListener("transitionend", onTransition);
        recolor.current = () => {};
        refresh.current = () => {};
      };
    }, []);

    return (
      <div
        ref={rootRef}
        aria-hidden
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        {...props}
      >
        {/* The color and letter-spacing transitions are change detectors: when --neon or --neon-glow changes upstream, transitionend fires. */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 size-full"
          style={{
            color: "rgb(var(--neon))",
            letterSpacing: "calc(var(--neon-glow, 1) * 1px)",
            transition: "color 1ms linear, letter-spacing 1ms linear",
          }}
        />
      </div>
    );
  },
);
Lasers.displayName = "Lasers";

export { Lasers };
