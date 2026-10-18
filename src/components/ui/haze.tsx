"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

type Light = "bottom" | "left" | "right" | "top";

/** Fog is soft, so it renders at half size and the browser's upscale smooths it for free. */
const SCALE = 0.5;
const TILE = 256;

// Back to front: how big the billows are (CSS px per tile), how fast they drift, and how much light they catch.
const layers = [
  { size: 640, vx: 5, vy: -3, alpha: 0.34, warm: 0, offset: [0.13, 0.71] },
  { size: 420, vx: -8, vy: -6, alpha: 0.42, warm: 0.25, offset: [0.58, 0.29] },
  { size: 860, vx: 12, vy: -9, alpha: 0.36, warm: 0.5, offset: [0.37, 0.05] },
];

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

const tiles = new Map<number, HTMLCanvasElement>();

// One seamless tile of smoke: periodic fractal noise, warped by itself so it curls instead of blobbing.
// Built once per seed and shared by every instance.
function smokeTile(seed: number) {
  const cached = tiles.get(seed);
  if (cached) return cached;
  const random = mulberry32(seed * 7919 + 3);
  const lattice = Float32Array.from({ length: 64 * 64 }, () => random());
  const value = (x: number, y: number, period: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const fx = x - xi;
    const fy = y - yi;
    const sx = fx * fx * (3 - 2 * fx);
    const sy = fy * fy * (3 - 2 * fy);
    const at = (i: number, j: number) => lattice[(((j % period) + period) % period) * 64 + (((i % period) + period) % period)];
    const a = at(xi, yi) + (at(xi + 1, yi) - at(xi, yi)) * sx;
    const b = at(xi, yi + 1) + (at(xi + 1, yi + 1) - at(xi, yi + 1)) * sx;
    return a + (b - a) * sy;
  };
  // u, v in 0..1 around the tile; every octave's period divides the tile, so the edges meet.
  const fbm = (u: number, v: number) => {
    let sum = 0;
    let amp = 0.55;
    for (let period = 4; period <= 32; period *= 2) {
      sum += value(u * period, v * period, period) * amp;
      amp *= 0.5;
    }
    return sum / 1.03;
  };
  const tile = document.createElement("canvas");
  tile.width = tile.height = TILE;
  const ctx = tile.getContext("2d");
  if (!ctx) return tile;
  const image = ctx.createImageData(TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const u = x / TILE;
      const v = y / TILE;
      const wu = fbm(u + 0.31, v + 0.17);
      const wv = fbm(u + 0.73, v + 0.59);
      const n = fbm(u + (wu - 0.5) * 0.7, v + (wv - 0.5) * 0.7);
      // Contrast: thick billows with clear air between them.
      const t = Math.max(0, Math.min(1, (n - 0.36) / 0.3));
      const density = t * t * (3 - 2 * t);
      const i = (y * TILE + x) * 4;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = 255;
      image.data[i + 3] = Math.round(density * 255);
    }
  }
  ctx.putImageData(image, 0, 0);
  tiles.set(seed, tile);
  return tile;
}

export interface HazeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Color of the light in the smoke. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Which edge the light comes from. */
  light?: Light;
  /** How thick the smoke is, 0 to 1. */
  density?: number;
  /** Brightness of the light, 0 to 1. */
  intensity?: number;
  /** Speed multiplier for the drift. 0 holds still. */
  speed?: number;
  /** Same seed, same smoke. */
  seed?: number;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const Haze = React.forwardRef<HTMLDivElement, HazeProps>(
  (
    { className, style, color, light = "bottom", density = 0.6, intensity = 0.85, speed = 1, seed = 1, ...props },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);

    const live = React.useRef({ light, density, intensity, speed, seed });
    const recolor = React.useRef<() => void>(() => {});
    const refresh = React.useRef<() => void>(() => {});

    React.useEffect(() => {
      live.current = { light, density, intensity, speed, seed };
      refresh.current();
    }, [light, density, intensity, speed, seed]);

    React.useEffect(() => {
      recolor.current();
    }, [color]);

    React.useEffect(() => {
      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas || typeof ResizeObserver === "undefined") return;
      const ctx = canvas.getContext("2d");
      const buffer = document.createElement("canvas");
      const layer = buffer.getContext("2d");
      if (!ctx || !layer) return;

      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let width = 0;
      let height = 0;
      let rgb = readRgb(canvas);
      let glow = readGlow(canvas);
      let pattern: CanvasPattern | null = null;
      let patternSeed = NaN;
      let raf = 0;
      let last = 0;
      let time = 0;
      let inView = true;

      const ensurePattern = () => {
        if (pattern && patternSeed === live.current.seed) return pattern;
        patternSeed = live.current.seed;
        pattern = layer.createPattern(smokeTile(patternSeed), "repeat");
        return pattern;
      };

      // Where the light sits, and how far it reaches, in canvas pixels.
      const source = () => {
        const w = canvas.width;
        const h = canvas.height;
        switch (live.current.light) {
          case "left":
            return { x: -w * 0.08, y: h * 0.6, reach: w * 1.05 };
          case "right":
            return { x: w * 1.08, y: h * 0.6, reach: w * 1.05 };
          case "top":
            return { x: w * 0.5, y: -h * 0.12, reach: Math.max(h * 1.2, w * 0.7) };
          default:
            return { x: w * 0.5, y: h * 1.1, reach: Math.max(h * 1.1, w * 0.6) };
        }
      };

      const draw = () => {
        const w = canvas.width;
        const h = canvas.height;
        ctx.globalCompositeOperation = "source-over";
        ctx.clearRect(0, 0, w, h);
        const level = Math.max(0, Math.min(1, live.current.intensity));
        const thick = Math.max(0, Math.min(1, live.current.density));
        const fill = ensurePattern();
        if (!fill || w === 0 || level === 0) return;
        const { x: sx, y: sy, reach } = source();
        // The light breathes a little, as if the smoke thins and thickens in front of it.
        const breathe = 1 + Math.sin(time * 0.35) * 0.06;
        ctx.globalCompositeOperation = "lighter";

        layers.forEach((spec, i) => {
          const tile = spec.size * SCALE;
          const k = tile / TILE;
          const ox = ((spec.offset[0] * tile + time * spec.vx * SCALE) % tile + tile) % tile;
          const oy = ((spec.offset[1] * tile + time * spec.vy * SCALE) % tile + tile) % tile;
          layer.globalCompositeOperation = "source-over";
          layer.clearRect(0, 0, w, h);
          layer.save();
          // Bicubic where the browser offers it, so the stretched tile has no texel grid.
          layer.imageSmoothingQuality = "high";
          layer.translate(ox - tile, oy - tile);
          layer.scale(k, k);
          layer.fillStyle = fill;
          layer.fillRect(0, 0, (w + tile * 2) / k, (h + tile * 2) / k);
          layer.restore();

          // Light the smoke: whiter and brighter near the source, the plain color further off.
          layer.globalCompositeOperation = "source-in";
          const g = layer.createRadialGradient(sx, sy, 0, sx, sy, reach);
          // The light is drawn at full strength and the layer faded once on the way out:
          // lighting at low alpha in 8 bits leaves stepped bands the upscale makes visible.
          const a = spec.alpha * (0.35 + thick * 0.9) * level * breathe * (i === 0 ? 0.8 : 1);
          g.addColorStop(0, `rgb(${whiten(rgb, 0.35 + spec.warm * 0.3)})`);
          g.addColorStop(0.25, `rgb(${whiten(rgb, spec.warm * 0.15)} / 0.5)`);
          g.addColorStop(0.6, `rgb(${rgb.join(" ")} / 0.12)`);
          g.addColorStop(1, `rgb(${rgb.join(" ")} / 0)`);
          layer.fillStyle = g;
          layer.fillRect(0, 0, w, h);
          ctx.globalAlpha = Math.min(1, a);
          ctx.drawImage(buffer, 0, 0);
          ctx.globalAlpha = 1;
        });

        // The source itself, bleeding in from the edge.
        if (glow > 0) {
          const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, reach * 0.55);
          g.addColorStop(0, `rgb(${whiten(rgb, 0.3)} / ${Math.min(1, 0.3 * level * glow)})`);
          g.addColorStop(1, `rgb(${rgb.join(" ")} / 0)`);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, w, h);
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
        width = root.clientWidth;
        height = root.clientHeight;
        canvas.width = buffer.width = Math.max(1, Math.round(width * SCALE));
        canvas.height = buffer.height = Math.max(1, Math.round(height * SCALE));
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
Haze.displayName = "Haze";

export { Haze };
