"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

export interface CursorGlowProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Follow the pointer over the parent element, or over the whole window. */
  target?: "parent" | "window";
  /** Diameter of the light in pixels. */
  size?: number;
  /** Brightness of the light, 0 to 1. */
  intensity?: number;
  /** A comet tail that streams behind fast movement. */
  trail?: boolean;
  /** How long the tail lingers, in milliseconds. */
  trailLength?: number;
}

type Point = { x: number; y: number; t: number };

/**
 * A light layer. With `target="parent"` place it inside a `relative` parent;
 * it fills it. With `target="window"` it covers the viewport.
 */
const CursorGlow = React.forwardRef<HTMLDivElement, CursorGlowProps>(
  (
    {
      className,
      style,
      color,
      target = "parent",
      size = 360,
      intensity = 1,
      trail = false,
      trailLength = 260,
      ...props
    },
    forwardedRef,
  ) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const lightRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);

    const strength = Math.min(1, Math.max(0, intensity));
    const settings = React.useRef({ strength, trail, trailLength });
    settings.current = { strength, trail, trailLength };

    React.useEffect(() => {
      const root = ref.current;
      const light = lightRef.current;
      const host: HTMLElement | Window | null = target === "window" ? window : root?.parentElement ?? null;
      if (!root || !light || !host) return;

      const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
      let reduce = motion?.matches ?? false;
      const onMotionChange = () => (reduce = motion?.matches ?? false);
      motion?.addEventListener?.("change", onMotionChange);

      let goalX = 0;
      let goalY = 0;
      let x = 0;
      let y = 0;
      let visible = false;
      let frame = 0;
      let last = 0;
      let rgb = "34 211 238";
      let width = 0;
      let height = 0;
      let points: Point[] = [];

      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d") ?? null;

      const resize = () => {
        width = root.clientWidth;
        height = root.clientHeight;
        if (!canvas || !context) return;
        const ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.max(1, Math.round(width * ratio));
        canvas.height = Math.max(1, Math.round(height * ratio));
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
      };
      resize();
      const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
      observer?.observe(root);

      // The tail is one tapered ribbon per pass (halo, colored core, white-hot
      // center) with a round head, filled in one go so nothing overlaps and beads up.
      const ribbon = (halfWidth: number, fades: number[], fill: string | CanvasGradient) => {
        if (!context) return;
        const outline: [number, number][] = [];
        const back: [number, number][] = [];
        let nx = 0;
        let ny = 0;
        for (let i = 0; i < points.length; i++) {
          const prev = points[Math.max(0, i - 1)];
          const next = points[Math.min(points.length - 1, i + 1)];
          const dx = next.x - prev.x;
          const dy = next.y - prev.y;
          const length = Math.hypot(dx, dy);
          if (length > 0.001) {
            nx = -dy / length;
            ny = dx / length;
          }
          const h = halfWidth * fades[i];
          outline.push([points[i].x + nx * h, points[i].y + ny * h]);
          back.unshift([points[i].x - nx * h, points[i].y - ny * h]);
        }
        outline.push(...back);
        // Wind the head's circle the same way as the ribbon so the nonzero fill
        // unions them instead of punching a hole.
        let area = 0;
        for (let i = 0; i < outline.length; i++) {
          const [ax, ay] = outline[i];
          const [bx, by] = outline[(i + 1) % outline.length];
          area += ax * by - bx * ay;
        }
        context.beginPath();
        outline.forEach(([px, py], i) => (i ? context.lineTo(px, py) : context.moveTo(px, py)));
        context.closePath();
        const head = points[points.length - 1];
        const radius = halfWidth * fades[fades.length - 1];
        context.moveTo(head.x + radius, head.y);
        context.arc(head.x, head.y, radius, 0, Math.PI * 2, area < 0);
        context.fillStyle = fill;
        context.fill("nonzero");
      };

      const draw = (now: number) => {
        if (!context) return;
        context.clearRect(0, 0, width, height);
        const life = settings.current.trailLength;
        points = points.filter((point) => now - point.t < life);
        if (points.length < 2) return;
        const tail = points[0];
        const head = points[points.length - 1];
        if (Math.hypot(head.x - tail.x, head.y - tail.y) < 1) return;
        const fades = points.map((point) => Math.max(0, 1 - (now - point.t) / life));
        const strength = settings.current.strength;
        const along = (alpha: number, tint: string) => {
          const gradient = context.createLinearGradient(tail.x, tail.y, head.x, head.y);
          gradient.addColorStop(0, `rgb(${tint} / 0)`);
          gradient.addColorStop(1, `rgb(${tint} / ${alpha * strength})`);
          return gradient;
        };
        context.globalCompositeOperation = "lighter";
        ribbon(9, fades, along(0.16, rgb));
        ribbon(2.2, fades, along(0.9, rgb));
        ribbon(0.8, fades.map((fade) => fade * fade), along(0.8, "255 255 255"));
      };

      const tick = (now: number) => {
        const dt = last ? Math.min(now - last, 64) : 16;
        last = now;
        // Frame-rate independent easing toward the pointer.
        const follow = reduce ? 1 : 1 - Math.exp(-dt / 55);
        x += (goalX - x) * follow;
        y += (goalY - y) * follow;
        light.style.transform = `translate3d(${x}px, ${y}px, 0)`;

        const tailing = settings.current.trail && !reduce;
        if (tailing && visible) points.push({ x, y, t: now });
        if (tailing || points.length) draw(now);

        const moving = Math.abs(goalX - x) > 0.1 || Math.abs(goalY - y) > 0.1;
        if ((moving || points.length > 1) && !document.hidden) {
          frame = requestAnimationFrame(tick);
        } else {
          frame = 0;
          last = 0;
          if (context && points.length <= 1) context.clearRect(0, 0, width, height);
        }
      };

      const start = () => {
        if (!frame) frame = requestAnimationFrame(tick);
      };

      const show = (value: boolean) => {
        visible = value;
        light.style.opacity = value ? "1" : "0";
      };

      const onMove = (event: PointerEvent) => {
        // A finger has no hover, and a light stuck where it lifted looks broken.
        if (event.pointerType === "touch") return;
        const rect = root.getBoundingClientRect();
        goalX = event.clientX - rect.left;
        goalY = event.clientY - rect.top;
        if (!visible) {
          // Read the color fresh each time the light appears: an ancestor's
          // --neon-accent can change without this component re-rendering.
          rgb = getComputedStyle(root).getPropertyValue("--neon").trim() || rgb;
          if (!points.length) {
            x = goalX;
            y = goalY;
          }
          show(true);
        }
        start();
      };

      const onLeave = (event: PointerEvent | Event) => {
        if ("pointerType" in event && event.pointerType === "touch") return;
        show(false);
        start();
      };

      const onVisibility = () => {
        if (document.hidden && frame) {
          cancelAnimationFrame(frame);
          frame = 0;
          last = 0;
        }
      };

      // Leaving the window fires mouseleave on <html>; it doesn't bubble to document.
      const leaveTarget = target === "window" ? document.documentElement : (host as HTMLElement);
      host.addEventListener("pointermove", onMove as EventListener, { passive: true });
      leaveTarget.addEventListener(target === "window" ? "mouseleave" : "pointerleave", onLeave);
      window.addEventListener("blur", onLeave);
      document.addEventListener("visibilitychange", onVisibility);

      return () => {
        cancelAnimationFrame(frame);
        observer?.disconnect();
        motion?.removeEventListener?.("change", onMotionChange);
        host.removeEventListener("pointermove", onMove as EventListener);
        leaveTarget.removeEventListener(target === "window" ? "mouseleave" : "pointerleave", onLeave);
        window.removeEventListener("blur", onLeave);
        document.removeEventListener("visibilitychange", onVisibility);
      };
    }, [target, trail]);

    return (
      <div
        ref={ref}
        aria-hidden
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "pointer-events-none overflow-hidden mix-blend-screen",
          target === "window" ? "fixed inset-0 z-50" : "absolute inset-0 rounded-[inherit]",
          className,
        )}
        {...props}
      >
        <div
          ref={lightRef}
          className="absolute left-0 top-0 opacity-0 transition-opacity duration-300 ease-out will-change-transform"
        >
          <div style={{ opacity: strength }}>
            <div
              className="rounded-full [background:radial-gradient(closest-side,rgb(var(--neon)/0.3),rgb(var(--neon)/0.12)_45%,rgb(var(--neon)/0.04)_70%,transparent)]"
              style={{ width: size, height: size, marginLeft: -size / 2, marginTop: -size / 2 }}
            />
            <div
              className="absolute left-0 top-0 rounded-full [background:radial-gradient(closest-side,rgb(var(--neon)/0.3),rgb(var(--neon)/0.1)_50%,transparent)]"
              style={{ width: size / 4, height: size / 4, marginLeft: -size / 8, marginTop: -size / 8 }}
            />
          </div>
        </div>
        {trail && <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />}
      </div>
    );
  },
);
CursorGlow.displayName = "CursorGlow";

export { CursorGlow };
