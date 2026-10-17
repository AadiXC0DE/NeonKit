"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

/** Depth of the farthest ring, in ring radii. */
const FAR = 9;
const NEAR = 0.22;
// Halos are soft, so they render at half resolution and the upscale does the blurring.
const HALO_SCALE = 0.5;

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

export interface TunnelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Tube color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Round rings, or rectangular frames shaped like a corridor. */
  shape?: "circle" | "square";
  /** Rings in view at once. */
  rings?: number;
  /** How far the tunnel winds, 0 (straight) to 1. */
  curve?: number;
  /** Speed multiplier. 0 holds still. */
  speed?: number;
  /** Brightness of the tubes, 0 to 1. */
  intensity?: number;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const Tunnel = React.forwardRef<HTMLDivElement, TunnelProps>(
  (
    { className, style, color, shape = "circle", rings = 22, curve = 0.5, speed = 1, intensity = 0.85, ...props },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const haloRef = React.useRef<HTMLCanvasElement>(null);
    const coreRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);

    const live = React.useRef({ shape, rings, curve, speed, intensity });
    const recolor = React.useRef<() => void>(() => {});
    const refresh = React.useRef<() => void>(() => {});

    React.useEffect(() => {
      live.current = { shape, rings, curve, speed, intensity };
      refresh.current();
    }, [shape, rings, curve, speed, intensity]);

    React.useEffect(() => {
      recolor.current();
    }, [color]);

    React.useEffect(() => {
      const root = rootRef.current;
      const haloCanvas = haloRef.current;
      const coreCanvas = coreRef.current;
      if (!root || !haloCanvas || !coreCanvas || typeof ResizeObserver === "undefined") return;
      const halo = haloCanvas.getContext("2d");
      const core = coreCanvas.getContext("2d");
      if (!halo || !core) return;

      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let width = 0;
      let height = 0;
      let rgb = readRgb(coreCanvas);
      let glow = readGlow(coreCanvas);
      let raf = 0;
      let last = 0;
      // Distance travelled down the tunnel, in ring radii. Starts partway in so the first bend is already showing.
      let travelled = 3.4;
      let inView = true;

      // The tunnel's centre line wanders on two slow, unrelated waves.
      const bend = (z: number) => {
        const amount = Math.max(0, Math.min(1, live.current.curve)) * 20;
        return [
          (Math.sin(z * 0.16) * 0.7 + Math.sin(z * 0.07 + 1.3) * 0.3) * amount,
          (Math.sin(z * 0.11 + 2.1) * 0.3 + Math.sin(z * 0.05) * 0.15) * amount,
        ];
      };

      const draw = () => {
        const cw = coreCanvas.width / Math.max(width, 1);
        core.setTransform(cw, 0, 0, cw, 0, 0);
        core.clearRect(0, 0, width, height);
        halo.setTransform(1, 0, 0, 1, 0, 0);
        halo.clearRect(0, 0, haloCanvas.width, haloCanvas.height);
        halo.setTransform(HALO_SCALE, 0, 0, HALO_SCALE, 0, 0);
        const level = Math.max(0, Math.min(1, live.current.intensity));
        if (level === 0 || width === 0) return;

        const square = live.current.shape === "square";
        const count = Math.max(4, Math.round(live.current.rings));
        const gap = FAR / count;
        const focal = Math.min(width, height) * 0.5;
        // Corridor frames take the box's proportions, within reason.
        const aspect = square ? Math.max(1, Math.min(1.8, width / Math.max(height, 1))) : 1;
        // The camera looks along the tunnel's own heading, so only the curvature ahead shows, not the drift.
        const [camX, camY] = bend(travelled);
        const [aheadX, aheadY] = bend(travelled + 0.01);
        const slopeX = (aheadX - camX) / 0.01;
        const slopeY = (aheadY - camY) / 0.01;
        // Tall boxes have less room to swing sideways.
        const narrow = Math.min(1, width / Math.max(1, height * 1.5));
        const tint = rgb.join(" ");
        const cx = width / 2;
        const cy = height / 2;

        // Rings from far to near, so nearer tubes draw over farther ones.
        const first = Math.ceil(travelled / gap);
        const frames: { x: number; y: number; r: number; z: number; index: number }[] = [];
        for (let k = count - 1; k >= 0; k--) {
          const index = first + k;
          const z = index * gap - travelled;
          if (z < NEAR || z > FAR) continue;
          const [bx, by] = bend(index * gap);
          const scale = focal / z;
          frames.push({
            x: cx + (bx - camX - slopeX * z) * scale * narrow,
            y: cy + (by - camY - slopeY * z) * scale,
            r: scale,
            z,
            index,
          });
        }

        // Light at the far end, where the tunnel opens.
        const far = frames[0];
        if (far && glow > 0) {
          const reach = Math.min(width, height) * 0.5;
          const g = halo.createRadialGradient(far.x, far.y, 0, far.x, far.y, reach);
          g.addColorStop(0, `rgb(${whiten(rgb, 0.5)} / ${Math.min(1, 0.55 * level * glow)})`);
          g.addColorStop(0.15, `rgb(${tint} / ${0.16 * level * glow})`);
          g.addColorStop(1, `rgb(${tint} / 0)`);
          halo.fillStyle = g;
          halo.fillRect(0, 0, width, height);
        }

        const outline = (ctx: CanvasRenderingContext2D, f: (typeof frames)[number]) => {
          ctx.beginPath();
          if (square) {
            const hw = f.r * aspect;
            const hh = f.r;
            ctx.roundRect?.(f.x - hw, f.y - hh, hw * 2, hh * 2, f.r * 0.06);
          } else {
            ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          }
        };

        // Rails: the same points on every ring joined up, so the bends read as one continuous tube.
        const rails = square ? 4 : 12;
        core.lineWidth = 1;
        for (let i = 0; i < rails; i++) {
          core.beginPath();
          frames.forEach((f, n) => {
            let px: number;
            let py: number;
            if (square) {
              px = f.x + (i % 2 === 0 ? -1 : 1) * f.r * aspect;
              py = f.y + (i < 2 ? -1 : 1) * f.r;
            } else {
              const a = (i / rails) * Math.PI * 2 + Math.PI / rails;
              px = f.x + Math.cos(a) * f.r;
              py = f.y + Math.sin(a) * f.r;
            }
            if (n === 0) core.moveTo(px, py);
            else core.lineTo(px, py);
          });
          core.strokeStyle = `rgb(${tint} / ${0.13 * level})`;
          core.stroke();
        }

        for (const f of frames) {
          // Fog takes the far rings; the nearest ones fade as they pass the camera.
          const depth = f.z / FAR;
          const fog = (1 - depth) ** 1.7;
          const pass = Math.min(1, (f.z - NEAR) / 1.1);
          // Every eighth ring is a brighter gate, so the speed reads even when the rest blur together.
          const gate = ((f.index % 8) + 8) % 8 === 0;
          const alpha = fog * pass * (gate ? 1 : 0.62) * level;
          if (alpha < 0.01) continue;
          const thickness = Math.max(0.7, Math.min(4, (f.r / focal) * 1.6));
          if (glow > 0) {
            outline(halo, f);
            halo.lineWidth = thickness * (gate ? 9 : 6);
            halo.strokeStyle = `rgb(${tint} / ${Math.min(1, alpha * 0.4 * glow)})`;
            halo.stroke();
          }
          outline(core, f);
          core.lineWidth = thickness;
          core.strokeStyle = `rgb(${whiten(rgb, gate ? 0.6 : 0.3)} / ${Math.min(1, alpha)})`;
          core.stroke();
        }
      };

      const running = () =>
        inView && !document.hidden && !motion.matches && width > 0 && live.current.speed > 0;

      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        travelled += dt * 0.7 * Math.max(0, live.current.speed);
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
        haloCanvas.width = Math.max(1, Math.round(width * HALO_SCALE));
        haloCanvas.height = Math.max(1, Math.round(height * HALO_SCALE));
        coreCanvas.width = Math.round(width * dpr);
        coreCanvas.height = Math.round(height * dpr);
        draw();
        sync();
      };

      recolor.current = () => {
        rgb = readRgb(coreCanvas);
        glow = readGlow(coreCanvas);
        if (!raf && width > 0) draw();
      };
      refresh.current = () => {
        if (width === 0) return;
        sync();
        if (!raf) draw();
      };
      const onTransition = (event: TransitionEvent) => {
        if (event.target === coreCanvas) recolor.current();
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
      coreCanvas.addEventListener("transitionend", onTransition);

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        dprQuery?.removeEventListener?.("change", onDpr);
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
        coreCanvas.removeEventListener("transitionend", onTransition);
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
        <canvas ref={haloRef} className="absolute inset-0 size-full [mix-blend-mode:screen]" />
        {/* The color and letter-spacing transitions are change detectors: when --neon or --neon-glow changes upstream, transitionend fires. */}
        <canvas
          ref={coreRef}
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
Tunnel.displayName = "Tunnel";

export { Tunnel };
