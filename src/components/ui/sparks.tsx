"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  life: number;
  rgb: Rgb;
  glow: number;
  /** Line width of the core, in CSS pixels. */
  size: number;
  /** Embers are slow and float; they flicker as they die. */
  ember: boolean;
  drag: number;
  gravity: number;
  phase: number;
  /** A still flash, fired instead of a burst under reduced motion. */
  flash?: number;
};

export type SparksOptions = {
  /** Viewport x of the burst. Defaults to the centre of `origin`. */
  x?: number;
  /** Viewport y of the burst. Defaults to the centre of `origin`. */
  y?: number;
  /** Element (or rect) to fire from. Its `--neon` colors the sparks unless `color` is set. */
  origin?: Element | DOMRect | null;
  /** Palette name or any hex color. */
  color?: NeonColor;
  /** Number of sparks. */
  count?: number;
  /** Direction of the burst in degrees: -90 is straight up, 0 is right. */
  angle?: number;
  /** Width of the cone in degrees. 360 fires every way. */
  spread?: number;
  /** Launch speed in pixels per second. */
  velocity?: number;
  /** Pull in pixels per second squared. */
  gravity?: number;
  /** Air drag per second: higher stops sparks sooner. */
  drag?: number;
  /** Seconds a spark burns, give or take 40%. */
  life?: number;
};

const MAX_SPARKS = 900;
// The streak is the distance a spark covers in this many seconds, so fast sparks streak and slow ones dot.
const STREAK = 0.04;

const layer: {
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  sprite: HTMLCanvasElement | null;
  sparks: Spark[];
  raf: number;
  last: number;
  width: number;
  height: number;
} = { canvas: null, ctx: null, sprite: null, sparks: [], raf: 0, last: 0, width: 0, height: 0 };

function reducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
}

function parseRgb(value: string): Rgb | null {
  const parts = value.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return null;
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

function readGlow(node: Element | null) {
  if (!node) return 1;
  const value = parseFloat(getComputedStyle(node).getPropertyValue("--neon-glow"));
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

function readNeon(node: Element | null): Rgb {
  if (node) {
    const style = getComputedStyle(node);
    const rgb = parseRgb(style.getPropertyValue("--neon")) ?? parseRgb(style.getPropertyValue("--neon-accent"));
    if (rgb) return rgb;
  }
  return [34, 211, 238];
}

// One white sprite, tinted per spark by drawing it with a colored composite would cost a pass; a white core
// with a soft falloff reads as heat on any hue, and the colored halo comes from the stroke underneath.
function sprite() {
  if (layer.sprite) return layer.sprite;
  const size = 32;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const r = size / 2;
    const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
    gradient.addColorStop(0, "rgb(255 255 255 / 0.9)");
    gradient.addColorStop(0.25, "rgb(255 255 255 / 0.3)");
    gradient.addColorStop(1, "rgb(255 255 255 / 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
  }
  layer.sprite = canvas;
  return canvas;
}

function resize() {
  const { canvas, ctx } = layer;
  if (!canvas || !ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  layer.width = window.innerWidth;
  layer.height = window.innerHeight;
  canvas.width = Math.round(layer.width * dpr);
  canvas.height = Math.round(layer.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function teardown() {
  cancelAnimationFrame(layer.raf);
  layer.raf = 0;
  layer.last = 0;
  layer.sparks = [];
  layer.canvas?.remove();
  layer.canvas = null;
  layer.ctx = null;
  window.removeEventListener("resize", resize);
  document.removeEventListener("visibilitychange", onVisibility);
}

// A burst nobody can see is over: drop it rather than replay it when the tab comes back.
function onVisibility() {
  if (document.hidden) teardown();
}

function ensureLayer() {
  if (layer.canvas && layer.ctx) return true;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return false;
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.nkSparks = "";
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "2147483000",
  });
  document.body.appendChild(canvas);
  layer.canvas = canvas;
  layer.ctx = ctx;
  resize();
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", onVisibility);
  return true;
}

const hot = (rgb: Rgb, t: number) =>
  `${Math.round(rgb[0] + (255 - rgb[0]) * t)} ${Math.round(rgb[1] + (255 - rgb[1]) * t)} ${Math.round(rgb[2] + (255 - rgb[2]) * t)}`;

function draw() {
  const { ctx, width, height } = layer;
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  const glowSprite = sprite();
  for (const s of layer.sparks) {
    const heat = Math.max(0, 1 - s.age / s.life);
    if (s.flash) {
      // One soft bloom of the color that fades where it stands.
      const r = s.flash / 2;
      const bloom = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
      bloom.addColorStop(0, `rgb(${s.rgb[0]} ${s.rgb[1]} ${s.rgb[2]} / 0.5)`);
      bloom.addColorStop(0.4, `rgb(${s.rgb[0]} ${s.rgb[1]} ${s.rgb[2]} / 0.16)`);
      bloom.addColorStop(1, `rgb(${s.rgb[0]} ${s.rgb[1]} ${s.rgb[2]} / 0)`);
      ctx.globalAlpha = heat * heat * Math.min(1, s.glow);
      ctx.fillStyle = bloom;
      ctx.fillRect(s.x - r, s.y - r, r * 2, r * 2);
      ctx.globalAlpha = 1;
      continue;
    }
    // White-hot at birth, the hue through most of its life, then a dull ember that dims out.
    const white = Math.max(0, (heat - 0.55) / 0.45);
    const flicker = s.ember && heat < 0.5 ? 0.6 + 0.4 * Math.sin(s.age * 40 + s.phase) : 1;
    const alpha = Math.min(1, Math.pow(heat, 0.7) * 1.15) * flicker;
    const tx = s.x - s.vx * STREAK;
    const ty = s.y - s.vy * STREAK;
    if (s.glow > 0) {
      // The halo hugs the front half of the streak, so it reads as a hot head rather than a capsule.
      ctx.strokeStyle = `rgb(${s.rgb[0]} ${s.rgb[1]} ${s.rgb[2]} / ${0.2 * alpha * s.glow})`;
      ctx.lineWidth = s.size * 3.2;
      ctx.beginPath();
      ctx.moveTo((tx + s.x) / 2, (ty + s.y) / 2);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();
    }
    // Three segments, thinner and fainter toward the tail: a streak that tapers off behind the spark.
    const color = hot(s.rgb, 0.25 + white * 0.75);
    for (let k = 0; k < 3; k++) {
      const a0 = k / 3;
      const a1 = (k + 1) / 3;
      ctx.strokeStyle = `rgb(${color} / ${alpha * (0.2 + 0.4 * k)})`;
      ctx.lineWidth = s.size * (0.45 + 0.275 * k);
      ctx.beginPath();
      ctx.moveTo(tx + (s.x - tx) * a0, ty + (s.y - ty) * a0);
      ctx.lineTo(tx + (s.x - tx) * a1, ty + (s.y - ty) * a1);
      ctx.stroke();
    }
    if (white > 0 && s.glow > 0) {
      const size = s.size * 7;
      ctx.globalAlpha = white * Math.min(1, s.glow);
      ctx.drawImage(glowSprite, s.x - size / 2, s.y - size / 2, size, size);
      ctx.globalAlpha = 1;
    }
  }
  ctx.globalCompositeOperation = "source-over";
}

function frame(now: number) {
  layer.raf = 0;
  const dt = layer.last ? Math.min((now - layer.last) / 1000, 1 / 30) : 1 / 60;
  layer.last = now;
  const sparks = layer.sparks;
  let alive = 0;
  for (let i = 0; i < sparks.length; i++) {
    const s = sparks[i];
    s.age += dt;
    if (s.age >= s.life) continue;
    const slow = Math.exp(-s.drag * dt);
    s.vx *= slow;
    s.vy = s.vy * slow + s.gravity * dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    sparks[alive++] = s;
  }
  sparks.length = alive;
  draw();
  if (alive > 0) layer.raf = requestAnimationFrame(frame);
  else teardown();
}

/**
 * Fires a burst of sparks over the page. Safe to call from any event handler; does nothing on the server.
 */
function fireSparks(options: SparksOptions = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  const origin = options.origin ?? null;
  const rect = origin ? ("getBoundingClientRect" in origin ? origin.getBoundingClientRect() : origin) : null;
  const x = options.x ?? (rect ? rect.left + rect.width / 2 : window.innerWidth / 2);
  const y = options.y ?? (rect ? rect.top + rect.height / 2 : window.innerHeight / 2);
  const node = origin && "getBoundingClientRect" in origin ? origin : null;
  const rgb = options.color ? (parseRgb(toNeonRgb(options.color)) as Rgb) : readNeon(node);
  const glow = readGlow(node ?? document.documentElement);
  if (!ensureLayer()) return;

  if (reducedMotion()) {
    // No flying debris: one soft flash of the color where the burst would have been, fading out.
    layer.sparks.push({
      x, y, vx: 0, vy: 0, age: 0, life: 0.45, rgb, glow, size: 0, ember: false, drag: 0, gravity: 0, phase: 0,
      flash: Math.min(140, Math.max(48, (rect?.width ?? 60) * 1.1)),
    });
  } else {
    const count = Math.max(1, Math.round(options.count ?? 40));
    const angle = ((options.angle ?? -90) * Math.PI) / 180;
    const spread = ((Math.min(360, Math.max(0, options.spread ?? 360))) * Math.PI) / 180;
    const velocity = options.velocity ?? 520;
    const life = options.life ?? 0.9;
    const random = Math.random;
    for (let i = 0; i < count && layer.sparks.length < MAX_SPARKS; i++) {
      const ember = random() < 0.28;
      // Bias toward the middle of the cone, so a narrow burst reads as a jet with a few strays.
      const a = angle + (random() - 0.5 + (random() - 0.5) * 0.5) * spread * 0.8;
      const v = velocity * (ember ? 0.25 + random() * 0.3 : 0.55 + random() * 0.7);
      layer.sparks.push({
        x,
        y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v,
        age: 0,
        life: life * (ember ? 1.1 + random() * 0.6 : 0.6 + random() * 0.6),
        rgb,
        glow,
        size: ember ? 1.6 + random() * 0.8 : 1.1 + random() * 0.7,
        ember,
        drag: (options.drag ?? 2.4) * (ember ? 1.8 : 1),
        gravity: (options.gravity ?? 900) * (ember ? 0.35 : 1),
        phase: random() * Math.PI * 2,
      });
    }
  }
  if (!layer.raf) layer.raf = requestAnimationFrame(frame);
}

/**
 * Returns `fire(options)` plus a `ref`: attach the ref to an element and `fire()` bursts from its centre in
 * its color. `defaults` apply to every burst; options passed to `fire` win.
 */
function useSparks<T extends HTMLElement = HTMLElement>(defaults: SparksOptions = {}) {
  const ref = React.useRef<T>(null);
  const saved = React.useRef(defaults);
  React.useEffect(() => {
    saved.current = defaults;
  });
  const fire = React.useCallback((options: SparksOptions = {}) => {
    fireSparks({ origin: ref.current, ...saved.current, ...options });
  }, []);
  return { ref, fire };
}

export interface SparksProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    Omit<SparksOptions, "x" | "y" | "origin" | "color"> {
  /** Palette name or any hex color. Otherwise the clicked element's `--neon`, then `--neon-accent`. */
  color?: NeonColor;
  /** Stop firing, without unwrapping. */
  disabled?: boolean;
}

/**
 * Fires a burst when anything inside is clicked: from the pointer, or from the clicked element's centre when
 * the click came from the keyboard. Adds no box of its own (`display: contents`).
 */
const Sparks = React.forwardRef<HTMLSpanElement, SparksProps>(
  (
    { className, style, color, disabled, count, angle, spread, velocity, gravity, drag, life, onClick, children, ...props },
    ref,
  ) => {
    const handleClick = (event: React.MouseEvent<HTMLSpanElement>) => {
      onClick?.(event);
      if (disabled || event.defaultPrevented) return;
      const target = event.target as Element;
      const host = target.closest?.("button, a, [role='button'], [role='checkbox'], [role='switch'], [role='radio']") ?? target;
      if (host instanceof HTMLButtonElement && host.disabled) return;
      // Keyboard activation reports detail 0 and no pointer position.
      const pointer = event.detail > 0 && (event.clientX !== 0 || event.clientY !== 0);
      fireSparks({
        ...(pointer ? { x: event.clientX, y: event.clientY } : {}),
        origin: host,
        color,
        count,
        angle,
        spread,
        velocity,
        gravity,
        drag,
        life,
      });
    };

    return (
      <span
        ref={ref}
        style={neonVars(color, style)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "contents", className)}
        onClick={handleClick}
        {...props}
      >
        {children}
      </span>
    );
  },
);
Sparks.displayName = "Sparks";

export { Sparks, useSparks, fireSparks };
