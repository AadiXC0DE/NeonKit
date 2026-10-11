"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

type Mote = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Heading of the slow wander, in radians. */
  heading: number;
  /** 0.35 (far, small, slow) to 1 (near, large, quick). */
  depth: number;
  phase: number;
};

const MAX_PARTICLES = 420;
const LINK_LEVELS = 6;

// The canvas carries `color: rgb(var(--neon))`, so the resolved channels are one read away.
function readRgb(node: HTMLElement): Rgb {
  const parts = getComputedStyle(node).color.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return [34, 211, 238];
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

function glowSprite(rgb: Rgb) {
  const size = 48;
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.5)`);
  gradient.addColorStop(0.2, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.18)`);
  gradient.addColorStop(1, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

export interface ParticlesProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Particle color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Particles per 10,000 square pixels of canvas. */
  density?: number;
  /** Drift speed multiplier. 0 holds them still (the cursor still moves them). */
  speed?: number;
  /** How the cursor moves nearby particles. */
  interaction?: "repel" | "attract" | "none";
  /** Reach of the cursor, in pixels. */
  radius?: number;
  /** Draw lines between close particles. A number sets the link distance in pixels (default 110). */
  connect?: boolean | number;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const Particles = React.forwardRef<HTMLDivElement, ParticlesProps>(
  (
    {
      className,
      style,
      color,
      density = 1.4,
      speed = 1,
      interaction = "repel",
      radius = 140,
      connect = false,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);

    const link = connect === true ? 110 : typeof connect === "number" ? Math.max(0, connect) : 0;
    const live = React.useRef({ density, speed, interaction, radius, link });
    const recolor = React.useRef<() => void>(() => {});
    const refresh = React.useRef<() => void>(() => {});

    React.useEffect(() => {
      live.current = { density, speed, interaction, radius, link };
      refresh.current();
    }, [density, speed, interaction, radius, link]);

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
      const motes: Mote[] = [];
      const links: number[][] = Array.from({ length: LINK_LEVELS }, () => []);
      let width = 0;
      let height = 0;
      let rgb = readRgb(canvas);
      let sprite = glowSprite(rgb);
      let raf = 0;
      let last = 0;
      let time = 0;
      let inView = true;
      const pointer = { x: 0, y: 0, active: false };

      const makeMote = (): Mote => {
        const depth = 0.35 + random() * 0.65;
        return {
          x: random() * width,
          y: random() * height,
          vx: 0,
          vy: 0,
          heading: random() * Math.PI * 2,
          depth,
          phase: random() * Math.PI * 2,
        };
      };

      const fill = () => {
        const target = Math.min(MAX_PARTICLES, Math.round(((width * height) / 10000) * live.current.density));
        while (motes.length < target) motes.push(makeMote());
        motes.length = target;
        for (const mote of motes) {
          if (mote.x > width) mote.x = random() * width;
          if (mote.y > height) mote.y = random() * height;
        }
      };

      const draw = () => {
        ctx.clearRect(0, 0, width, height);
        const [r, g, b] = rgb;
        const distance = live.current.link;

        if (distance > 0) {
          // Bucket links by strength so each frame strokes a handful of paths, not hundreds.
          for (const bucket of links) bucket.length = 0;
          const nodes = pointer.active ? motes.length + 1 : motes.length;
          for (let i = 0; i < nodes; i++) {
            const a = i < motes.length ? motes[i] : null;
            const ax = a ? a.x : pointer.x;
            const ay = a ? a.y : pointer.y;
            const reach = a ? distance : distance * 1.4;
            for (let j = 0; j < Math.min(i, motes.length); j++) {
              const other = motes[j];
              const dx = other.x - ax;
              const dy = other.y - ay;
              if (Math.abs(dx) > reach || Math.abs(dy) > reach) continue;
              const d = Math.sqrt(dx * dx + dy * dy);
              if (d >= reach) continue;
              const strength = (1 - d / reach) * (a ? Math.min(a.depth, other.depth) : 1);
              const level = Math.min(LINK_LEVELS - 1, Math.floor(strength * LINK_LEVELS));
              links[level].push(ax, ay, other.x, other.y);
            }
          }
          ctx.lineWidth = 1;
          links.forEach((bucket, level) => {
            if (bucket.length === 0) return;
            ctx.strokeStyle = `rgb(${r} ${g} ${b} / ${((level + 1) / LINK_LEVELS) * 0.32})`;
            ctx.beginPath();
            for (let k = 0; k < bucket.length; k += 4) {
              ctx.moveTo(bucket[k], bucket[k + 1]);
              ctx.lineTo(bucket[k + 2], bucket[k + 3]);
            }
            ctx.stroke();
          });
        }

        // Near-white cores with a tinted halo: lit dust, not flat dots.
        const core = `rgb(${r + (255 - r) * 0.55} ${g + (255 - g) * 0.55} ${b + (255 - b) * 0.55})`;
        for (const mote of motes) {
          const flicker = 0.75 + 0.25 * Math.sin(time * (0.8 + mote.depth) + mote.phase);
          const alpha = (0.25 + mote.depth * 0.75) * flicker;
          const size = 0.6 + mote.depth * mote.depth * 1.9;
          const halo = size * 9;
          ctx.globalAlpha = alpha * 0.85;
          ctx.drawImage(sprite, mote.x - halo / 2, mote.y - halo / 2, halo, halo);
          ctx.globalAlpha = alpha;
          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.arc(mote.x, mote.y, size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      };

      const step = (dt: number) => {
        time += dt;
        const { speed: drift, interaction: mode, radius: reach } = live.current;
        const relax = 1 - Math.exp(-dt * 2.4);
        const margin = 24;

        for (const mote of motes) {
          // A slow wander: the heading turns a little each frame, so paths curve instead of zigzag.
          mote.heading += Math.sin(time * 0.3 + mote.phase) * dt * 0.6;
          const cruise = Math.max(0, drift) * (5 + mote.depth * 9);
          const tx = Math.cos(mote.heading) * cruise;
          const ty = Math.sin(mote.heading) * cruise - Math.max(0, drift) * 2;
          mote.vx += (tx - mote.vx) * relax;
          mote.vy += (ty - mote.vy) * relax;

          if (pointer.active && mode !== "none" && reach > 0) {
            const dx = mote.x - pointer.x;
            const dy = mote.y - pointer.y;
            const d = Math.sqrt(dx * dx + dy * dy) || 1;
            if (d < reach) {
              const falloff = 1 - d / reach;
              if (mode === "repel") {
                const push = falloff * falloff * 1400 * dt;
                mote.vx += (dx / d) * push;
                mote.vy += (dy / d) * push;
              } else {
                // Pull in, but keep a small clear core so the swarm circles the cursor instead of collapsing.
                const pull = (d > 22 ? falloff : -1.5) * 520 * dt;
                mote.vx -= (dx / d) * pull - (dy / d) * falloff * 90 * dt;
                mote.vy -= (dy / d) * pull + (dx / d) * falloff * 90 * dt;
              }
            }
          }

          mote.x += mote.vx * dt;
          mote.y += mote.vy * dt;
          if (mote.x < -margin) mote.x = width + margin;
          else if (mote.x > width + margin) mote.x = -margin;
          if (mote.y < -margin) mote.y = height + margin;
          else if (mote.y > height + margin) mote.y = -margin;
        }
      };

      const running = () => inView && !document.hidden && !motion.matches && width > 0;

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
        fill();
        draw();
        sync();
      };

      const onPointer = (event: PointerEvent) => {
        if (!inView) return;
        const rect = root.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active =
          !motion.matches &&
          pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
      };
      const onRelease = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") pointer.active = false;
      };
      const onLeave = () => {
        pointer.active = false;
      };

      recolor.current = () => {
        rgb = readRgb(canvas);
        sprite = glowSprite(rgb);
        if (!raf && width > 0) draw();
      };
      refresh.current = () => {
        fill();
        if (!raf && width > 0) draw();
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
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerdown", onPointer, { passive: true });
      window.addEventListener("pointerup", onRelease, { passive: true });
      window.addEventListener("pointercancel", onRelease, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      canvas.addEventListener("transitionend", onTransition);

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("pointerdown", onPointer);
        window.removeEventListener("pointerup", onRelease);
        window.removeEventListener("pointercancel", onRelease);
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
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        {...props}
      >
        {/* The color transition is a change detector: when --neon changes upstream, transitionend fires. */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 size-full"
          style={{ color: "rgb(var(--neon))", transition: "color 1ms linear" }}
        />
      </div>
    );
  },
);
Particles.displayName = "Particles";

export { Particles };
