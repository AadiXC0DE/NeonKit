"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

type Star = {
  /** Position on the far plane, -1..1 across the canvas. */
  u: number;
  v: number;
  /** Depth: 1 is far away, near 0 is about to pass the viewer. */
  z: number;
  /** Stars whose roll falls under `tint` take the neon color; the rest stay white. */
  roll: number;
  size: number;
  phase: number;
  twinkle: number;
};

const NEAR = 0.04;
const MAX_STARS = 1400;

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

function glowSprite(rgb: Rgb, size: number) {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.55)`);
  gradient.addColorStop(0.25, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.16)`);
  gradient.addColorStop(1, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

export interface StarfieldProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Tint for some of the stars and the warp streaks. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Stars per 10,000 square pixels of canvas. */
  density?: number;
  /** Cruising speed toward the viewer. 1 is a slow drift, 0 holds still. */
  speed?: number;
  /** How far, in pixels, the nearest stars shift toward the pointer. 0 turns it off. */
  parallax?: number;
  /** Jump to hyperspace. Stars stretch into streaks; set it back to false to drop out. */
  warp?: boolean;
  /** Share of stars that take the neon tint, 0 to 1. */
  tint?: number;
  /** Small stars shimmer. */
  twinkle?: boolean;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const Starfield = React.forwardRef<HTMLDivElement, StarfieldProps>(
  (
    {
      className,
      style,
      color,
      density = 7,
      speed = 1,
      parallax = 24,
      warp = false,
      tint = 0.18,
      twinkle = true,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);

    // Props the running loop reads without restarting.
    const live = React.useRef({ density, speed, parallax, warp, tint, twinkle });
    const recolor = React.useRef<() => void>(() => {});
    const refresh = React.useRef<() => void>(() => {});

    React.useEffect(() => {
      live.current = { density, speed, parallax, warp, tint, twinkle };
      refresh.current();
    }, [density, speed, parallax, warp, tint, twinkle]);

    React.useEffect(() => {
      recolor.current();
    }, [color]);

    React.useEffect(() => {
      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas || typeof ResizeObserver === "undefined") return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const random = Math.random;
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const stars: Star[] = [];
      let width = 0;
      let height = 0;
      let rgb = readRgb(canvas);
      let glow = readGlow(canvas);
      let sprites = { white: glowSprite([235, 242, 255], 32), tinted: glowSprite(rgb, 32) };
      let raf = 0;
      let last = 0;
      let time = 0;
      let inView = true;
      let warpLevel = 0;
      const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

      // A star on the far plane can land anywhere; closer ones only where they still project on screen.
      const makeStar = (z: number): Star => ({
        u: (random() * 2 - 1) * z,
        v: (random() * 2 - 1) * z,
        z,
        roll: random(),
        size: 0.5 + random() ** 3 * 1.6,
        phase: random() * Math.PI * 2,
        twinkle: 0.6 + random() * 2.2,
      });

      const fill = () => {
        const target = Math.min(MAX_STARS, Math.round(((width * height) / 10000) * live.current.density));
        // Stars leave the frame as they near, so at rest depth is weighted toward the far plane (z²).
        while (stars.length < target) stars.push(makeStar(NEAR + Math.cbrt(random()) * (1 - NEAR)));
        stars.length = target;
      };

      const project = (star: Star, z: number, out: { x: number; y: number }) => {
        // u and v sit on the far plane (z = 1); dividing by depth spreads them out as they near.
        const depth = 1 - z;
        out.x = width / 2 + (star.u / z) * (width / 2) + pointer.x * live.current.parallax * depth;
        out.y = height / 2 + (star.v / z) * (height / 2) + pointer.y * live.current.parallax * depth;
      };

      const head = { x: 0, y: 0 };
      const tail = { x: 0, y: 0 };

      const draw = () => {
        ctx.clearRect(0, 0, width, height);
        const { twinkle: shimmer, tint } = live.current;
        const cruise = Math.max(0, live.current.speed) * 0.018;
        const velocity = cruise + warpLevel * warpLevel * 1.15;
        const streak = warpLevel > 0.01;

        if (streak) {
          // The tunnel brightens at its vanishing point.
          const tunnel = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) * 0.5);
          tunnel.addColorStop(0, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / ${Math.min(1, 0.16 * warpLevel * glow)})`);
          tunnel.addColorStop(1, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0)`);
          ctx.fillStyle = tunnel;
          ctx.fillRect(0, 0, width, height);
          ctx.lineCap = "round";
        }

        for (const star of stars) {
          project(star, star.z, head);
          if (head.x < -20 || head.x > width + 20 || head.y < -20 || head.y > height + 20) continue;
          const near = 1 - star.z;
          const size = Math.max(0.9, star.size * (0.75 + near * near * 2.2));
          let alpha = Math.min(1, 0.38 + star.size * 0.12 + near * 0.9);
          if (shimmer && size < 1.6) alpha *= 0.72 + 0.28 * Math.sin(time * star.twinkle + star.phase);
          const tinted = star.roll < tint;
          const [r, g, b] = tinted || streak ? rgb : [235, 242, 255];

          if (streak) {
            project(star, Math.min(1, star.z + velocity * 0.07 * warpLevel), tail);
            const whiten = tinted ? 0.35 : 0.75;
            ctx.strokeStyle = `rgb(${r + (255 - r) * whiten} ${g + (255 - g) * whiten} ${b + (255 - b) * whiten} / ${alpha})`;
            ctx.lineWidth = Math.max(0.6, size * 0.9);
            ctx.beginPath();
            ctx.moveTo(tail.x, tail.y);
            ctx.lineTo(head.x, head.y);
            ctx.stroke();
            continue;
          }

          if (size > 1.5 && glow > 0) {
            const halo = size * 7;
            ctx.globalAlpha = Math.min(1, alpha * 0.9 * glow);
            ctx.drawImage(tinted ? sprites.tinted : sprites.white, head.x - halo / 2, head.y - halo / 2, halo, halo);
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = `rgb(${r} ${g} ${b} / ${alpha})`;
          if (size < 1.2) {
            ctx.fillRect(head.x - size / 2, head.y - size / 2, size, size);
          } else {
            ctx.beginPath();
            ctx.arc(head.x, head.y, size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      };

      const step = (dt: number) => {
        time += dt;
        const target = live.current.warp ? 1 : 0;
        // Ease in slowly, drop out a little faster, like a jump that has to spool up.
        warpLevel += (target - warpLevel) * (1 - Math.exp(-dt * (target ? 1.6 : 2.6)));
        if (Math.abs(target - warpLevel) < 0.001) warpLevel = target;
        const ease = 1 - Math.exp(-dt * 3);
        pointer.x += (pointer.tx - pointer.x) * ease;
        pointer.y += (pointer.ty - pointer.y) * ease;

        const velocity = Math.max(0, live.current.speed) * 0.018 + warpLevel * warpLevel * 1.15;
        for (const star of stars) {
          star.z -= velocity * dt * (0.6 + 0.4 * (1 - star.z));
          project(star, star.z, head);
          const gone = head.x < -40 || head.x > width + 40 || head.y < -40 || head.y > height + 40;
          if (star.z <= NEAR || gone) {
            Object.assign(star, makeStar(1));
          }
        }
      };

      const running = () =>
        inView && !document.hidden && !motion.matches && width > 0 &&
        (live.current.speed > 0 || live.current.warp || warpLevel > 0 || live.current.parallax > 0 || live.current.twinkle);

      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        step(dt);
        draw();
        schedule();
      };

      const schedule = () => {
        if (!raf && running()) raf = requestAnimationFrame(frame);
        if (!running()) last = 0;
      };

      const sync = () => {
        if (running()) schedule();
        else {
          cancelAnimationFrame(raf);
          raf = 0;
          last = 0;
          if (motion.matches) {
            warpLevel = 0;
            pointer.x = pointer.y = 0;
          }
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
        fill();
        draw();
        sync();
      };

      const onPointer = (event: PointerEvent) => {
        if (!inView) return;
        const rect = root.getBoundingClientRect();
        const inside =
          event.clientX >= rect.left && event.clientX <= rect.right &&
          event.clientY >= rect.top && event.clientY <= rect.bottom;
        pointer.tx = inside ? ((event.clientX - rect.left) / rect.width) * 2 - 1 : 0;
        pointer.ty = inside ? ((event.clientY - rect.top) / rect.height) * 2 - 1 : 0;
      };
      const onLeave = () => {
        pointer.tx = pointer.ty = 0;
      };

      recolor.current = () => {
        rgb = readRgb(canvas);
        glow = readGlow(canvas);
        sprites = { ...sprites, tinted: glowSprite(rgb, 32) };
        if (!raf && width > 0) draw();
      };
      refresh.current = () => {
        fill();
        sync();
      };
      const onTransition = (event: TransitionEvent) => {
        if (event.target === canvas) recolor.current();
      };

      const resizeObserver = new ResizeObserver(resize);
      // A move to a screen with another pixel ratio needs a fresh backing store.
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
      canvas.addEventListener("transitionend", onTransition);

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        dprQuery?.removeEventListener?.("change", onDpr);
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
        window.removeEventListener("pointermove", onPointer);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        canvas.removeEventListener("transitionend", onTransition);
        recolor.current = () => {};
        refresh.current = () => {};
      };
    }, []);

    return (
      <div
        ref={rootRef}
        aria-hidden
        data-warp={warp ? "" : undefined}
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
Starfield.displayName = "Starfield";

export { Starfield };
