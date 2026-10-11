"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

type Origin = "top" | "top-left" | "top-right" | "left" | "right" | "bottom";

type Ray = {
  /** Offset from the fan's center line, radians. */
  offset: number;
  /** Half width of the beam, radians. */
  width: number;
  strength: number;
  sway: number;
  period: number;
  phase: number;
};

type Mote = { x: number; y: number; vx: number; vy: number; size: number; phase: number };

const DEG = Math.PI / 180;
// Beams are soft, so they render at half resolution and the browser's upscale does the blurring.
const BEAM_SCALE = 0.5;

// Where the light comes from, as fractions of the box. It sits just outside
// the frame so you see beams, not a bulb.
const anchors: Record<Origin, [number, number]> = {
  top: [0.5, -0.14],
  "top-left": [-0.06, -0.18],
  "top-right": [1.06, -0.18],
  left: [-0.1, 0.3],
  right: [1.1, 0.3],
  bottom: [0.5, 1.16],
};

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

export interface LightRaysProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Beam color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Where the light comes from. It sits just outside the frame. */
  origin?: Origin;
  /** Number of beams. */
  rays?: number;
  /** Width of the fan of beams, in degrees. */
  spread?: number;
  /** How far each beam swings, in degrees. 0 holds them still. */
  sway?: number;
  /** Speed multiplier for the sway and the drifting dust. */
  speed?: number;
  /** Brightness of the beams, 0 to 1. */
  intensity?: number;
  /** Dust motes that sparkle when they drift through a beam. A number scales how many. */
  dust?: boolean | number;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const LightRays = React.forwardRef<HTMLDivElement, LightRaysProps>(
  (
    {
      className,
      style,
      color,
      origin = "top",
      rays = 7,
      spread = 64,
      sway = 4,
      speed = 1,
      intensity = 0.7,
      dust = true,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const beamRef = React.useRef<HTMLCanvasElement>(null);
    const dustRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);

    const dustAmount = dust === true ? 1 : typeof dust === "number" ? Math.max(0, dust) : 0;
    const live = React.useRef({ origin, rays, spread, sway, speed, intensity, dustAmount });
    const recolor = React.useRef<() => void>(() => {});
    const refresh = React.useRef<() => void>(() => {});

    React.useEffect(() => {
      live.current = { origin, rays, spread, sway, speed, intensity, dustAmount };
      refresh.current();
    }, [origin, rays, spread, sway, speed, intensity, dustAmount]);

    React.useEffect(() => {
      recolor.current();
    }, [color]);

    React.useEffect(() => {
      const root = rootRef.current;
      const beamCanvas = beamRef.current;
      const dustCanvas = dustRef.current;
      if (!root || !beamCanvas || !dustCanvas || typeof ResizeObserver === "undefined") return;
      const beams = beamCanvas.getContext("2d");
      const motes = dustCanvas.getContext("2d");
      if (!beams || !motes) return;

      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      // A fresh layout per instance, kept stable when props change.
      const seed = (Math.random() * 2 ** 32) >>> 0;
      let random = mulberry32(seed);
      let rayList: Ray[] = [];
      const dustList: Mote[] = [];
      let width = 0;
      let height = 0;
      let rgb = readRgb(dustCanvas);
      let raf = 0;
      let last = 0;
      let time = 0;
      let inView = true;
      // Recomputed per frame: where each beam points right now.
      let angles: number[] = [];

      const geometry = () => {
        const [fx, fy] = anchors[live.current.origin] ?? anchors.top;
        const ox = fx * width;
        const oy = fy * height;
        const aim = Math.atan2(height * 0.62 - oy, width / 2 - ox);
        const reach = Math.max(
          Math.hypot(ox, oy),
          Math.hypot(width - ox, oy),
          Math.hypot(ox, height - oy),
          Math.hypot(width - ox, height - oy),
        );
        return { ox, oy, aim, reach };
      };

      const buildRays = () => {
        random = mulberry32(seed);
        const count = Math.max(1, Math.round(live.current.rays));
        const fan = live.current.spread * DEG;
        rayList = Array.from({ length: count }, (_, i) => {
          // Evenly spaced slots, jittered, so beams never clump or leave a hole.
          const slot = count === 1 ? 0 : (i / (count - 1) - 0.5) * fan;
          return {
            offset: slot + (random() - 0.5) * (fan / count) * 0.7,
            width: (1.8 + random() * 4.6) * DEG,
            strength: 0.45 + random() * 0.55,
            sway: 0.5 + random() * 0.5,
            period: 9 + random() * 9,
            phase: random() * Math.PI * 2,
          };
        });
      };

      const buildDust = () => {
        const target = Math.round(((width * height) / 10000) * 3.2 * live.current.dustAmount);
        while (dustList.length < target) {
          dustList.push({
            x: random() * width,
            y: random() * height,
            vx: (random() - 0.5) * 6,
            vy: (random() - 0.5) * 6,
            size: 0.8 + random() ** 2 * 2,
            phase: random() * Math.PI * 2,
          });
        }
        dustList.length = Math.min(dustList.length, target);
      };

      const aimRays = () => {
        const { aim } = geometry();
        const amplitude = live.current.sway * DEG;
        angles = rayList.map(
          (ray) => aim + ray.offset + Math.sin((time / ray.period) * Math.PI * 2 + ray.phase) * amplitude * ray.sway,
        );
      };

      // How lit a point is: the sum of every beam's angular profile, times distance falloff.
      const lightAt = (x: number, y: number, g: ReturnType<typeof geometry>) => {
        const angle = Math.atan2(y - g.oy, x - g.ox);
        const distance = Math.hypot(x - g.ox, y - g.oy) / g.reach;
        let light = 0;
        for (let i = 0; i < rayList.length; i++) {
          let delta = angle - angles[i];
          delta = Math.atan2(Math.sin(delta), Math.cos(delta));
          const ratio = delta / (rayList[i].width * 1.6);
          light += Math.exp(-ratio * ratio) * rayList[i].strength;
        }
        return Math.min(1.2, light) * Math.max(0, 1 - distance) ** 1.4;
      };

      const draw = () => {
        const g = geometry();
        const [r, gr, b] = rgb;
        const level = Math.max(0, Math.min(1, live.current.intensity));
        aimRays();

        // Beams: one soft conic wedge per ray, added together, then faded with distance.
        const sw = beamCanvas.width;
        const sh = beamCanvas.height;
        beams.setTransform(1, 0, 0, 1, 0, 0);
        beams.globalCompositeOperation = "source-over";
        beams.clearRect(0, 0, sw, sh);
        beams.setTransform(BEAM_SCALE, 0, 0, BEAM_SCALE, 0, 0);
        beams.globalCompositeOperation = "lighter";
        const supportsConic = typeof beams.createConicGradient === "function";
        // The air itself: one wide, faint wedge under the beams so the room reads as lit.
        const fan = live.current.spread * DEG * 1.3;
        if (supportsConic) {
          const haze = beams.createConicGradient(g.aim - fan / 2, g.ox, g.oy);
          const span = fan / (Math.PI * 2);
          haze.addColorStop(0, `rgb(${r} ${gr} ${b} / 0)`);
          haze.addColorStop(span * 0.3, `rgb(${r} ${gr} ${b} / ${0.16 * level})`);
          haze.addColorStop(span * 0.7, `rgb(${r} ${gr} ${b} / ${0.16 * level})`);
          haze.addColorStop(span, `rgb(${r} ${gr} ${b} / 0)`);
          haze.addColorStop(1, `rgb(${r} ${gr} ${b} / 0)`);
          beams.fillStyle = haze;
          beams.beginPath();
          beams.moveTo(g.ox, g.oy);
          beams.arc(g.ox, g.oy, g.reach * 1.1, g.aim - fan / 2, g.aim + fan / 2);
          beams.closePath();
          beams.fill();
        }
        rayList.forEach((ray, i) => {
          const alpha = ray.strength * level * (0.82 + 0.18 * Math.sin(time * 0.7 + ray.phase));
          const start = angles[i] - ray.width * 2;
          if (supportsConic) {
            const wedge = beams.createConicGradient(start, g.ox, g.oy);
            const span = (ray.width * 4) / (Math.PI * 2);
            wedge.addColorStop(0, `rgb(${r} ${gr} ${b} / 0)`);
            wedge.addColorStop(span * 0.3, `rgb(${r} ${gr} ${b} / ${alpha * 0.36})`);
            wedge.addColorStop(span * 0.5, `rgb(${r} ${gr} ${b} / ${alpha * 0.7})`);
            wedge.addColorStop(span * 0.7, `rgb(${r} ${gr} ${b} / ${alpha * 0.36})`);
            wedge.addColorStop(span, `rgb(${r} ${gr} ${b} / 0)`);
            wedge.addColorStop(1, `rgb(${r} ${gr} ${b} / 0)`);
            beams.fillStyle = wedge;
          } else {
            beams.fillStyle = `rgb(${r} ${gr} ${b} / ${alpha * 0.3})`;
          }
          beams.beginPath();
          beams.moveTo(g.ox, g.oy);
          beams.arc(g.ox, g.oy, g.reach * 1.1, start, start + ray.width * 4);
          beams.closePath();
          beams.fill();
        });

        beams.globalCompositeOperation = "destination-in";
        const falloff = beams.createRadialGradient(g.ox, g.oy, 0, g.ox, g.oy, g.reach);
        falloff.addColorStop(0, "rgb(0 0 0 / 1)");
        falloff.addColorStop(0.4, "rgb(0 0 0 / 0.75)");
        falloff.addColorStop(1, "rgb(0 0 0 / 0)");
        beams.fillStyle = falloff;
        beams.fillRect(0, 0, width, height);

        // The source: a hot, whitened core with a wide colored bloom around it.
        beams.globalCompositeOperation = "lighter";
        const bloom = beams.createRadialGradient(g.ox, g.oy, 0, g.ox, g.oy, g.reach * 0.7);
        bloom.addColorStop(0, `rgb(${r + (255 - r) * 0.7} ${gr + (255 - gr) * 0.7} ${b + (255 - b) * 0.7} / ${0.95 * level})`);
        bloom.addColorStop(0.12, `rgb(${r + (255 - r) * 0.3} ${gr + (255 - gr) * 0.3} ${b + (255 - b) * 0.3} / ${0.42 * level})`);
        bloom.addColorStop(0.4, `rgb(${r} ${gr} ${b} / ${0.1 * level})`);
        bloom.addColorStop(1, `rgb(${r} ${gr} ${b} / 0)`);
        beams.fillStyle = bloom;
        beams.fillRect(0, 0, width, height);
        beams.globalCompositeOperation = "source-over";

        // Dust: almost invisible in the dark, bright where a beam catches it.
        motes.clearRect(0, 0, width, height);
        if (dustList.length === 0) return;
        const core = `rgb(${r + (255 - r) * 0.7} ${gr + (255 - gr) * 0.7} ${b + (255 - b) * 0.7})`;
        motes.fillStyle = core;
        for (const mote of dustList) {
          const light = lightAt(mote.x, mote.y, g);
          const sparkle = 0.7 + 0.3 * Math.sin(time * 1.7 + mote.phase);
          const alpha = Math.min(1, (0.05 + light * 1.8) * sparkle * (0.4 + level * 0.6));
          if (alpha < 0.02) continue;
          motes.globalAlpha = alpha;
          motes.beginPath();
          motes.arc(mote.x, mote.y, mote.size / 2, 0, Math.PI * 2);
          motes.fill();
        }
        motes.globalAlpha = 1;
      };

      const step = (dt: number) => {
        const pace = Math.max(0, live.current.speed);
        time += dt * pace;
        for (const mote of dustList) {
          // Brownian drift with a lazy downward settle, wrapping at the edges.
          mote.vx += (random() - 0.5) * 14 * dt;
          mote.vy += ((random() - 0.5) * 14 + 1.2) * dt;
          mote.vx *= 1 - 0.6 * dt;
          mote.vy *= 1 - 0.6 * dt;
          mote.x += mote.vx * dt * pace;
          mote.y += mote.vy * dt * pace;
          if (mote.x < -4) mote.x = width + 4;
          else if (mote.x > width + 4) mote.x = -4;
          if (mote.y < -4) mote.y = height + 4;
          else if (mote.y > height + 4) mote.y = -4;
        }
      };

      const running = () =>
        inView && !document.hidden && !motion.matches && width > 0 && live.current.speed > 0;

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
        beamCanvas.width = Math.max(1, Math.round(width * BEAM_SCALE));
        beamCanvas.height = Math.max(1, Math.round(height * BEAM_SCALE));
        dustCanvas.width = Math.round(width * dpr);
        dustCanvas.height = Math.round(height * dpr);
        motes.setTransform(dpr, 0, 0, dpr, 0, 0);
        buildDust();
        draw();
        sync();
      };

      recolor.current = () => {
        rgb = readRgb(dustCanvas);
        if (!raf && width > 0) draw();
      };
      refresh.current = () => {
        buildRays();
        buildDust();
        sync();
      };
      const onTransition = (event: TransitionEvent) => {
        if (event.target === dustCanvas) recolor.current();
      };

      buildRays();
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
      dustCanvas.addEventListener("transitionend", onTransition);

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
        dustCanvas.removeEventListener("transitionend", onTransition);
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
        <canvas ref={beamRef} className="absolute inset-0 size-full [mix-blend-mode:screen]" />
        {/* The color transition is a change detector: when --neon changes upstream, transitionend fires. */}
        <canvas
          ref={dustRef}
          className="absolute inset-0 size-full"
          style={{ color: "rgb(var(--neon))", transition: "color 1ms linear" }}
        />
      </div>
    );
  },
);
LightRays.displayName = "LightRays";

export { LightRays };
