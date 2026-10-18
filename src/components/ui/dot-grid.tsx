"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

type Ripple = { x: number; y: number; age: number };

const SPRITE = 64;
const RIPPLE_SPEED = 170;
const RIPPLE_BAND = 46;

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

const whiten = ([r, g, b]: Rgb, amount: number): Rgb => [
  Math.round(r + (255 - r) * amount),
  Math.round(g + (255 - g) * amount),
  Math.round(b + (255 - b) * amount),
];

// Two sprites per color: the light an LED throws on the panel around its hole, and the hot core itself.
function sprites(rgb: Rgb) {
  const make = (paint: (ctx: CanvasRenderingContext2D, r: number) => void) => {
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = SPRITE;
    const ctx = sprite.getContext("2d");
    if (ctx) paint(ctx, SPRITE / 2);
    return sprite;
  };
  const [r, g, b] = rgb;
  const halo = make((ctx, c) => {
    const gradient = ctx.createRadialGradient(c, c, 0, c, c, c);
    gradient.addColorStop(0, `rgb(${r} ${g} ${b} / 0.55)`);
    gradient.addColorStop(0.18, `rgb(${r} ${g} ${b} / 0.2)`);
    gradient.addColorStop(0.5, `rgb(${r} ${g} ${b} / 0.05)`);
    gradient.addColorStop(1, `rgb(${r} ${g} ${b} / 0)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, SPRITE, SPRITE);
  });
  const [wr, wg, wb] = whiten(rgb, 0.6);
  const core = make((ctx, c) => {
    // A disc with a one-pixel soft edge, whiter in the middle like a lit diode.
    const gradient = ctx.createRadialGradient(c, c, 0, c, c, c);
    gradient.addColorStop(0, `rgb(${wr} ${wg} ${wb})`);
    gradient.addColorStop(0.45, `rgb(${whiten(rgb, 0.25).join(" ")})`);
    gradient.addColorStop(0.8, `rgb(${r} ${g} ${b})`);
    gradient.addColorStop(1, `rgb(${r} ${g} ${b} / 0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();
  });
  return { halo, core };
}

export interface DotGridProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Color of the lit dots. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Distance between dots, in pixels. */
  spacing?: number;
  /** Dot diameter, in pixels. */
  size?: number;
  /** How far the pointer's light reaches, in pixels. 0 turns it off. */
  radius?: number;
  /** Slow rings of light that roll across the panel now and then. */
  ripples?: boolean;
  /** Fade the panel out toward its edges. */
  fade?: boolean;
  /** Brightness of the lit dots, 0 to 1. */
  intensity?: number;
  /** Speed multiplier for the ripples. 0 stops them. */
  speed?: number;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const DotGrid = React.forwardRef<HTMLDivElement, DotGridProps>(
  (
    {
      className,
      style,
      color,
      spacing = 22,
      size = 1.5,
      radius = 170,
      ripples = true,
      fade = true,
      intensity = 1,
      speed = 1,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const baseRef = React.useRef<HTMLCanvasElement>(null);
    const litRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);

    const live = React.useRef({ spacing, size, radius, ripples, intensity, speed });
    const recolor = React.useRef<() => void>(() => {});
    const refresh = React.useRef<() => void>(() => {});

    React.useEffect(() => {
      live.current = { spacing, size, radius, ripples, intensity, speed };
      refresh.current();
    }, [spacing, size, radius, ripples, intensity, speed]);

    React.useEffect(() => {
      recolor.current();
    }, [color]);

    React.useEffect(() => {
      const root = rootRef.current;
      const baseCanvas = baseRef.current;
      const litCanvas = litRef.current;
      if (!root || !baseCanvas || !litCanvas || typeof ResizeObserver === "undefined") return;
      const base = baseCanvas.getContext("2d");
      const lit = litCanvas.getContext("2d");
      if (!base || !lit) return;

      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const random = mulberry32(0x5eed);
      let width = 0;
      let height = 0;
      let cols = 0;
      let rows = 0;
      let ox = 0;
      let oy = 0;
      let step = 22;
      let level = new Float32Array(0);
      let rgb = readRgb(litCanvas);
      let glow = readGlow(litCanvas);
      let art = sprites(rgb);
      let raf = 0;
      let timer = 0;
      let last = 0;
      let inView = true;
      let nextRipple = 0.4;
      const rings: Ripple[] = [];
      const pointer = { clientX: 0, clientY: 0, x: -1e4, y: -1e4, inside: false, moved: false };

      const layout = () => {
        step = Math.max(6, live.current.spacing);
        cols = Math.floor(width / step) + 1;
        rows = Math.floor(height / step) + 1;
        // Centered, so the margins match on every side.
        ox = (width - (cols - 1) * step) / 2;
        oy = (height - (rows - 1) * step) / 2;
        if (level.length !== cols * rows) level = new Float32Array(cols * rows);
      };

      const drawBase = () => {
        const dpr = baseCanvas.width / Math.max(width, 1);
        base.setTransform(dpr, 0, 0, dpr, 0, 0);
        base.clearRect(0, 0, width, height);
        // Unlit holes: grey with a trace of the color, like a panel with the LEDs off.
        const [r, g, b] = rgb;
        base.fillStyle = `rgb(${Math.round(150 + r * 0.25)} ${Math.round(155 + g * 0.25)} ${Math.round(170 + b * 0.2)} / 0.2)`;
        const d = Math.max(0.5, live.current.size);
        base.beginPath();
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const x = ox + i * step;
            const y = oy + j * step;
            base.moveTo(x + d / 2, y);
            base.arc(x, y, d / 2, 0, Math.PI * 2);
          }
        }
        base.fill();
      };

      // Still frames: one soft pool of light, high and centered, where a headline usually sits.
      const restingPool = () => {
        const reach = Math.max(live.current.radius, 120) * 1.5;
        const cx = width / 2;
        const cy = height * 0.42;
        for (let j = 0; j < rows; j++) {
          for (let i = 0; i < cols; i++) {
            const d = Math.hypot(ox + i * step - cx, oy + j * step - cy) / reach;
            const t = Math.max(0, 1 - d);
            level[j * cols + i] = t * t * 0.55;
          }
        }
      };

      const drawLit = () => {
        lit.clearRect(0, 0, width, height);
        const strength = Math.max(0, Math.min(1, live.current.intensity));
        if (strength === 0) return;
        const d = Math.max(0.5, live.current.size);
        const core = d * 1.25;
        const halo = step * 2.6;
        // Halos first, added together, so neighbors light the panel between them.
        if (glow > 0) {
          lit.globalCompositeOperation = "lighter";
          for (let k = 0; k < level.length; k++) {
            const v = level[k];
            if (v < 0.02) continue;
            const x = ox + (k % cols) * step;
            const y = oy + Math.floor(k / cols) * step;
            const s = halo * (0.55 + v * 0.45);
            lit.globalAlpha = Math.min(1, v * strength * glow * 0.9);
            lit.drawImage(art.halo, x - s / 2, y - s / 2, s, s);
          }
          lit.globalCompositeOperation = "source-over";
        }
        for (let k = 0; k < level.length; k++) {
          const v = level[k];
          if (v < 0.02) continue;
          const x = ox + (k % cols) * step;
          const y = oy + Math.floor(k / cols) * step;
          const s = core * (0.9 + v * 0.7);
          lit.globalAlpha = Math.min(1, v * strength * 1.15);
          lit.drawImage(art.core, x - s / 2, y - s / 2, s, s);
        }
        lit.globalAlpha = 1;
      };

      // Returns whether anything is still changing.
      const advance = (dt: number) => {
        const { radius: reach, ripples: rippling } = live.current;
        const pace = Math.max(0, live.current.speed);
        if (rippling && pace > 0) {
          nextRipple -= dt * pace;
          if (nextRipple <= 0) {
            rings.push({ x: width * (0.15 + random() * 0.7), y: height * (0.15 + random() * 0.7), age: 0 });
            nextRipple = 2.4 + random() * 2.2;
          }
        }
        const maxAge = Math.hypot(width, height) / RIPPLE_SPEED;
        for (const ring of rings) ring.age += dt * pace;
        for (let i = rings.length - 1; i >= 0; i--) if (rings[i].age > maxAge || !rippling) rings.splice(i, 1);

        if (pointer.inside) {
          const rect = root.getBoundingClientRect();
          pointer.x = pointer.clientX - rect.left;
          pointer.y = pointer.clientY - rect.top;
        }
        const usePointer = pointer.inside && reach > 0;
        // LEDs come on fast and fade slowly, which leaves a short trail behind the pointer.
        const attack = 1 - Math.exp(-dt * 16);
        const decay = 1 - Math.exp(-dt * 2.8);
        // A resting pointer settles too: once nothing changes, the loop sleeps until the next move.
        let busy = rings.length > 0;
        for (let j = 0; j < rows; j++) {
          const y = oy + j * step;
          for (let i = 0; i < cols; i++) {
            const x = ox + i * step;
            let target = 0;
            if (usePointer) {
              const t = Math.max(0, 1 - Math.hypot(x - pointer.x, y - pointer.y) / reach);
              target = t * t * (3 - 2 * t);
            }
            for (const ring of rings) {
              const r = ring.age * RIPPLE_SPEED;
              const off = (Math.hypot(x - ring.x, y - ring.y) - r) / RIPPLE_BAND;
              if (off > 3 || off < -3) continue;
              // Rings thin out and dim as they spread, like a wave losing energy.
              const fadeIn = Math.min(1, ring.age * 1.5);
              const energy = fadeIn * Math.max(0, 1 - r / (maxAge * RIPPLE_SPEED)) * 0.55;
              target = Math.max(target, Math.exp(-off * off) * energy);
            }
            const k = j * cols + i;
            const v = level[k];
            let next = v + (target - v) * (target > v ? attack : decay);
            if (Math.abs(target - next) < 0.003) next = target;
            else busy = true;
            level[k] = next;
          }
        }
        return busy;
      };

      const animated = () => inView && !document.hidden && !motion.matches && width > 0;

      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        const busy = advance(dt);
        drawLit();
        if (busy) schedule();
        else sleep();
      };

      const schedule = () => {
        window.clearTimeout(timer);
        timer = 0;
        if (!raf && animated()) raf = requestAnimationFrame(frame);
      };

      // Nothing lit and the pointer elsewhere: wake for the next ripple instead of spinning.
      const sleep = () => {
        last = 0;
        if (!live.current.ripples || live.current.speed <= 0 || !animated()) return;
        const wait = (nextRipple / live.current.speed) * 1000;
        timer = window.setTimeout(() => {
          timer = 0;
          nextRipple = 0;
          schedule();
        }, wait);
      };

      const sync = () => {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        window.clearTimeout(timer);
        timer = 0;
        if (width === 0) return;
        if (motion.matches) {
          rings.length = 0;
          restingPool();
          drawLit();
          return;
        }
        if (animated()) schedule();
        else drawLit();
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = root.clientWidth;
        height = root.clientHeight;
        for (const canvas of [baseCanvas, litCanvas]) {
          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
        }
        lit.setTransform(dpr, 0, 0, dpr, 0, 0);
        layout();
        level.fill(0);
        drawBase();
        sync();
      };

      const onPointer = (event: PointerEvent) => {
        if (!inView) return;
        const rect = root.getBoundingClientRect();
        const inside =
          event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (!inside && !pointer.inside) return;
        pointer.clientX = event.clientX;
        pointer.clientY = event.clientY;
        pointer.inside = inside;
        if (!motion.matches) schedule();
      };
      const onLeave = () => {
        pointer.inside = false;
      };

      recolor.current = () => {
        rgb = readRgb(litCanvas);
        glow = readGlow(litCanvas);
        art = sprites(rgb);
        if (width > 0) {
          drawBase();
          if (!raf) drawLit();
        }
      };
      refresh.current = () => {
        if (width === 0) return;
        layout();
        drawBase();
        sync();
      };
      const onTransition = (event: TransitionEvent) => {
        if (event.target === litCanvas) recolor.current();
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
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      litCanvas.addEventListener("transitionend", onTransition);

      return () => {
        cancelAnimationFrame(raf);
        window.clearTimeout(timer);
        resizeObserver.disconnect();
        dprQuery?.removeEventListener?.("change", onDpr);
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
        window.removeEventListener("pointermove", onPointer);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        litCanvas.removeEventListener("transitionend", onTransition);
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
          fade && "[mask-image:radial-gradient(ellipse_75%_70%_at_50%_45%,#000_35%,transparent_100%)]",
          className,
        )}
        {...props}
      >
        <canvas ref={baseRef} className="absolute inset-0 size-full" />
        {/* The color and letter-spacing transitions are change detectors: when --neon or --neon-glow changes upstream, transitionend fires. */}
        <canvas
          ref={litRef}
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
DotGrid.displayName = "DotGrid";

export { DotGrid };
