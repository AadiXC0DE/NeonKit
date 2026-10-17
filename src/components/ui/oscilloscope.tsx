"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

export type OscilloscopeWave = "sine" | "square" | "saw" | "triangle" | "noise";

type Rgb = [number, number, number];

const TAU = Math.PI * 2;
const FALLBACK: Rgb = [34, 211, 238];
const COLUMNS = 10;
const ROWS = 8;
const LEVELS = 6;

// Edges ring like a real function generator's output seen through the
// scope's bandwidth: an underdamped step response, in fractions of a cycle.
const ZETA = 0.65;
const OMEGA = 150;
const DAMPED = OMEGA * Math.sqrt(1 - ZETA * ZETA);
const RATIO = ZETA / Math.sqrt(1 - ZETA * ZETA);

function settle(t: number) {
  if (t <= 0) return 0;
  return 1 - Math.exp(-ZETA * OMEGA * t) * (Math.cos(DAMPED * t) + RATIO * Math.sin(DAMPED * t));
}

function sample(wave: OscilloscopeWave, phase: number) {
  const u = phase - Math.floor(phase);
  if (wave === "square") return u < 0.5 ? -1 + 2 * settle(u) : 1 - 2 * settle(u - 0.5);
  if (wave === "saw") return 2 * u - 1 + 2 * (1 - settle(u));
  // A whisker under full scale rounds the triangle's corners.
  if (wave === "triangle") return (2 / Math.PI) * Math.asin(0.995 * Math.sin(TAU * u));
  return Math.sin(TAU * u);
}

// Each pass is [line width in px, steady-state alpha, core?]. Additive
// blending stacks them into a white-hot core inside a colored bloom.
const passes: [number, number, boolean][] = [
  [9, 0.08, false],
  [3.5, 0.32, false],
  [1.5, 1, true],
];
const BOOST = 2.6;

function readRgb(node: Element | null): Rgb {
  if (!node || typeof getComputedStyle === "undefined") return FALLBACK;
  const parts = getComputedStyle(node).color.match(/[\d.]+/g);
  return parts && parts.length >= 3 ? [+parts[0], +parts[1], +parts[2]] : FALLBACK;
}

/** The theme's glow multiplier. A finite check, not `|| 1`, so 0 stays 0. */
function readGlow(node: Element | null) {
  if (!node || typeof getComputedStyle === "undefined") return 1;
  const value = parseFloat(getComputedStyle(node).getPropertyValue("--neon-glow"));
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

function rgba([r, g, b]: Rgb, alpha: number) {
  return `rgba(${r | 0},${g | 0},${b | 0},${Math.min(1, Math.max(0, alpha)).toFixed(4)})`;
}

function crisp(value: number, dpr: number) {
  return (Math.round(value * dpr) + 0.5) / dpr;
}

export interface OscilloscopeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Phosphor color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Generated waveform. Ignored while `source` is set. */
  wave?: OscilloscopeWave;
  /** Cycles across the screen. */
  frequency?: number;
  /** Peak height as a fraction of half the screen. With `source`, the input gain. */
  amplitude?: number;
  /** Drift in cycles per second. 0 holds the trace still, like a triggered scope. */
  speed?: number;
  /** Share of each frame's light that survives into the next, 0 to 0.98. */
  persistence?: number;
  /** The graticule: a 10 by 8 division grid with a ticked center cross. */
  grid?: boolean;
  /** Live audio. Draws its time-domain data, triggered on a rising edge. */
  source?: AnalyserNode | null;
}

/**
 * A CRT trace. Children render over the screen, for readouts in the corners.
 */
const Oscilloscope = React.forwardRef<HTMLDivElement, OscilloscopeProps>(
  (
    {
      className,
      style,
      color,
      wave = "sine",
      frequency = 2,
      amplitude = 0.6,
      speed = 0.25,
      persistence = 0.85,
      grid = true,
      source = null,
      children,
      ...props
    },
    ref,
  ) => {
    const hostRef = React.useRef<HTMLDivElement>(null);
    const traceRef = React.useRef<HTMLCanvasElement>(null);
    const gridRef = React.useRef<HTMLCanvasElement>(null);
    const bloomRef = React.useRef<HTMLCanvasElement>(null);
    const probeRef = React.useRef<HTMLSpanElement>(null);
    const engine = React.useRef<{ redraw: () => void; recolor: () => void; sync: () => void } | null>(
      null,
    );
    const settings = React.useRef({ wave, frequency, amplitude, speed, persistence, source });

    React.useImperativeHandle(ref, () => hostRef.current as HTMLDivElement);

    React.useEffect(() => {
      settings.current = { wave, frequency, amplitude, speed, persistence, source };
      // A live source keeps the loop running even under reduced motion.
      engine.current?.sync();
      engine.current?.redraw();
    }, [wave, frequency, amplitude, speed, persistence, source]);

    React.useEffect(() => {
      engine.current?.recolor();
    }, [color]);

    React.useEffect(() => {
      const host = hostRef.current;
      const canvas = traceRef.current;
      const gridCanvas = gridRef.current;
      const probe = probeRef.current;
      if (!host || !canvas || !gridCanvas) return;
      const ctx = canvas.getContext("2d", { alpha: false });
      const gridCtx = gridCanvas.getContext("2d");
      const bloomCanvas = bloomRef.current;
      const bloomCtx = bloomCanvas?.getContext("2d", { alpha: false }) ?? null;
      if (!ctx || !gridCtx) return;

      const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
      let width = 0;
      let height = 0;
      let dpr = 1;
      let rgb = readRgb(probe);
      let glow = readGlow(probe);
      let raf = 0;
      let last = 0;
      let phase = 0;
      let throttle = 0;
      let onScreen = true;
      let xs = new Float32Array(0);
      let ys = new Float32Array(0);
      let levels = new Uint8Array(0);
      let samples: Float32Array<ArrayBuffer> | null = null;

      const area = () => {
        const inset = Math.max(10, Math.round(Math.min(width, height) * 0.05));
        return { x: inset, y: inset, w: width - inset * 2, h: height - inset * 2 };
      };

      const drawGrid = () => {
        gridCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
        gridCtx.clearRect(0, 0, width, height);
        const { x, y, w, h } = area();
        if (w <= 0 || h <= 0) return;
        const cx = x + w / 2;
        const cy = y + h / 2;
        gridCtx.lineWidth = 1 / dpr;
        gridCtx.shadowColor = rgba(rgb, 0.6 * glow);
        gridCtx.shadowBlur = glow > 0 ? 3 : 0;
        gridCtx.beginPath();
        for (let i = 0; i <= COLUMNS; i++) {
          const lx = crisp(x + (w * i) / COLUMNS, dpr);
          gridCtx.moveTo(lx, y);
          gridCtx.lineTo(lx, y + h);
        }
        for (let i = 0; i <= ROWS; i++) {
          const ly = crisp(y + (h * i) / ROWS, dpr);
          gridCtx.moveTo(x, ly);
          gridCtx.lineTo(x + w, ly);
        }
        gridCtx.strokeStyle = rgba(rgb, 0.16);
        gridCtx.stroke();

        // The center cross carries fifth-division ticks.
        gridCtx.beginPath();
        const tick = Math.max(3, Math.min(w, h) * 0.012);
        for (let i = 1; i < COLUMNS * 5; i++) {
          const tx = crisp(x + (w * i) / (COLUMNS * 5), dpr);
          gridCtx.moveTo(tx, crisp(cy, dpr) - tick);
          gridCtx.lineTo(tx, crisp(cy, dpr) + tick);
        }
        for (let i = 1; i < ROWS * 5; i++) {
          const ty = crisp(y + (h * i) / (ROWS * 5), dpr);
          gridCtx.moveTo(crisp(cx, dpr) - tick, ty);
          gridCtx.lineTo(crisp(cx, dpr) + tick, ty);
        }
        gridCtx.strokeStyle = rgba(rgb, 0.34);
        gridCtx.stroke();
      };

      // Fills xs/ys with one sweep of the beam and returns the point count.
      const trace = (at: number) => {
        const { wave, frequency, amplitude, source } = settings.current;
        const { x, y, w, h } = area();
        const count = Math.min(xs.length, Math.max(2, Math.ceil(w / 1.5) + 1));
        const mid = y + h / 2;
        const half = h / 2;
        // The whole beam shivers a fraction of a pixel per sweep, which
        // thickens the trace the way a real spot's focus does.
        const shiver = (Math.random() - 0.5) * 0.7;

        if (source) {
          if (!samples || samples.length !== source.fftSize) samples = new Float32Array(source.fftSize);
          source.getFloatTimeDomainData(samples);
          const span = samples.length >> 1;
          // Trigger on the first rising zero crossing, so periodic signals stand still.
          let start = 0;
          for (let i = 1; i < span; i++) {
            if (samples[i - 1] < 0 && samples[i] >= 0) {
              start = i;
              break;
            }
          }
          for (let i = 0; i < count; i++) {
            const value = samples[start + Math.floor((i / (count - 1)) * (span - 1))];
            xs[i] = x + (w * i) / (count - 1);
            ys[i] = Math.min(y + h, Math.max(y, mid - value * amplitude * half + shiver));
          }
          return count;
        }

        let noise = 0;
        for (let i = 0; i < count; i++) {
          const t = i / (count - 1);
          let value: number;
          if (wave === "noise") {
            noise = noise * 0.55 + (Math.random() * 2 - 1) * 0.62;
            value = noise;
          } else {
            value = sample(wave, t * frequency + at);
          }
          xs[i] = x + w * t;
          ys[i] = Math.min(y + h, Math.max(y, mid - value * amplitude * half + shiver));
        }
        return count;
      };

      const sweep = (count: number, gain: number) => {
        const step = xs[1] - xs[0];
        // A fast-moving beam deposits less light: steep edges draw faint.
        for (let i = 0; i < count - 1; i++) {
          const length = Math.hypot(xs[i + 1] - xs[i], ys[i + 1] - ys[i]);
          const brightness = Math.pow(Math.min(1, step / Math.max(length, 1e-4)), 0.75);
          levels[i] = Math.round(brightness * (LEVELS - 1));
        }
        const core: Rgb = [rgb[0] * 0.3 + 178.5, rgb[1] * 0.3 + 178.5, rgb[2] * 0.3 + 178.5];
        for (const [lineWidth, alpha, isCore] of passes) {
          // The wide passes are the bloom; the core is the trace itself and stays.
          const lit = isCore ? 1 : glow;
          if (lit === 0) continue;
          ctx.lineWidth = lineWidth;
          for (let level = 0; level < LEVELS; level++) {
            const intensity = 0.12 + (0.88 * level) / (LEVELS - 1);
            ctx.strokeStyle = rgba(isCore ? core : rgb, alpha * intensity * gain * lit);
            ctx.beginPath();
            let open = false;
            for (let i = 0; i < count - 1; i++) {
              if (levels[i] !== level) {
                open = false;
                continue;
              }
              if (!open) ctx.moveTo(xs[i], ys[i]);
              ctx.lineTo(xs[i + 1], ys[i + 1]);
              open = true;
            }
            ctx.stroke();
          }
        }
      };

      const draw = (dt: number, fade: number) => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.fillStyle = `rgba(0,0,0,${fade})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // 8-bit fades stall at faint values; color-burn against near-white
        // subtracts about one step, so old light actually reaches black.
        if (fade < 1) {
          ctx.globalCompositeOperation = "color-burn";
          ctx.fillStyle = "rgb(254,254,254)";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        const { wave, frequency, speed, source } = settings.current;
        const { w } = area();
        const shift = speed * dt;
        // A drifting trace is swept several times per frame, as a real beam
        // would be, so motion smears into light instead of strobing.
        const travel = Math.abs(shift) * (w / Math.max(frequency, 0.01));
        // A single still frame gets two sweeps, standing in for the light a
        // running trace accumulates.
        const sweeps =
          fade >= 1 ? 2 : source || wave === "noise" ? 1 : Math.min(8, Math.max(1, Math.ceil(travel / 0.6)));
        // Light builds up over repeated sweeps; at the default persistence a still
        // trace settles near BOOST times a pass's alpha. The beam deposits at least
        // that much per frame however long the glow, so the head stays bright.
        const gain = fade < 1 ? Math.min(1, (Math.max(fade, 0.15) * BOOST) / sweeps) : 1;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.globalCompositeOperation = "lighter";
        // Butt caps: runs of different brightness meet end to end. Round caps
        // would overlap there and print bright dots along the trace.
        ctx.lineCap = "butt";
        ctx.lineJoin = "round";
        for (let i = 1; i <= sweeps; i++) {
          const count = trace(phase + (shift * i) / sweeps);
          if (count >= 2) sweep(count, gain);
        }
        phase = (phase + shift) % 1;

        // Bloom: a quarter-size copy, blurred by CSS and screened back on top.
        if (bloomCtx && bloomCanvas) {
          bloomCtx.globalCompositeOperation = "copy";
          bloomCtx.drawImage(canvas, 0, 0, bloomCanvas.width, bloomCanvas.height);
        }
      };

      const still = () => !!motion?.matches;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
        last = now;
        if (still()) {
          // Reduced motion: a live source still updates, a few times a second, without trails.
          throttle += dt;
          if (throttle < 0.25) return;
          throttle = 0;
          draw(0, 1);
          return;
        }
        const keep = Math.min(0.98, Math.max(0, settings.current.persistence));
        draw(dt, 1 - Math.pow(keep, dt * 60));
      };

      const stop = () => {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      };

      const sync = () => {
        const live = onScreen && !document.hidden && (!still() || !!settings.current.source);
        if (live && !raf && width > 0) raf = requestAnimationFrame(frame);
        else if (!live && raf) stop();
      };

      const redraw = () => {
        if (raf || width === 0) return;
        draw(0, 1);
      };

      const resize = () => {
        const rect = host.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        for (const node of [canvas, gridCanvas]) {
          node.width = Math.max(1, Math.round(width * dpr));
          node.height = Math.max(1, Math.round(height * dpr));
        }
        if (bloomCanvas && bloomCtx) {
          bloomCanvas.width = Math.max(1, Math.round(width / 4));
          bloomCanvas.height = Math.max(1, Math.round(height / 4));
          bloomCtx.imageSmoothingQuality = "high";
        }
        const points = Math.ceil(width / 1.5) + 2;
        xs = new Float32Array(points);
        ys = new Float32Array(points);
        levels = new Uint8Array(points);
        drawGrid();
        redraw();
        sync();
      };

      const recolor = () => {
        rgb = readRgb(probe);
        glow = readGlow(probe);
        drawGrid();
        redraw();
      };

      engine.current = { redraw, recolor, sync };
      resize();

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

      const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
      resizeObserver?.observe(host);
      const intersection =
        typeof IntersectionObserver !== "undefined"
          ? new IntersectionObserver(([entry]) => {
              onScreen = entry.isIntersecting;
              sync();
            })
          : null;
      intersection?.observe(host);
      const onMotion = () => {
        sync();
        redraw();
      };
      // An ancestor's --neon-accent can change without a prop change; the
      // probe's color transition tells us when.
      const onProbe = (event: TransitionEvent) => {
        if (event.target === probe) recolor();
      };
      document.addEventListener("visibilitychange", sync);
      motion?.addEventListener?.("change", onMotion);
      probe?.addEventListener("transitionend", onProbe);

      return () => {
        stop();
        engine.current = null;
        resizeObserver?.disconnect();
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion?.removeEventListener?.("change", onMotion);
        dprQuery?.removeEventListener?.("change", onDpr);
        probe?.removeEventListener("transitionend", onProbe);
      };
    }, []);

    return (
      <div
        ref={hostRef}
        aria-hidden={props["aria-label"] || props["aria-labelledby"] ? undefined : true}
        role={props["aria-label"] || props["aria-labelledby"] ? "img" : undefined}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative isolate aspect-[16/10] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#030405]",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_24px_60px_-28px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1)))]",
          className,
        )}
        {...props}
      >
        <span
          ref={probeRef}
          aria-hidden
          // Color and --neon-glow both transition here, so a change on any ancestor repaints the canvases.
          className="pointer-events-none absolute size-0 text-[rgb(var(--neon))] [letter-spacing:CALC(var(--neon-glow,1)*1px)] [transition:color_1ms_linear,letter-spacing_1ms_linear]"
        />
        {/* Phosphor never reads as pure black: a faint tint and a hotter center. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_65%_at_50%_50%,rgb(var(--neon)/CALC(0.075*var(--neon-glow,1))),rgb(var(--neon)/CALC(0.02*var(--neon-glow,1)))_60%,transparent_100%)]"
        />
        <canvas
          ref={gridRef}
          aria-hidden
          className={cn("pointer-events-none absolute inset-0 size-full", !grid && "hidden")}
        />
        <canvas
          ref={traceRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full mix-blend-screen"
        />
        <canvas
          ref={bloomRef}
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full opacity-90 mix-blend-screen [filter:blur(5px)_opacity(var(--neon-glow,1))]"
        />
        {/* Curved glass: darker corners, an inner rim and a soft reflection. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_120%_110%_at_50%_50%,transparent_58%,rgb(0_0_0/0.62)_100%)] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.04),inset_0_0_42px_rgb(0_0_0/0.75)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_55%_38%_at_22%_8%,rgb(255_255_255/0.07),transparent_70%)]"
        />
        {children != null && (
          <div className="pointer-events-none absolute inset-0 font-mono text-[11px] leading-none tracking-[0.04em] text-[rgb(var(--neon)/0.85)] [text-shadow:0_0_8px_rgb(var(--neon)/CALC(0.65*var(--neon-glow,1)))]">
            {children}
          </div>
        )}
      </div>
    );
  },
);
Oscilloscope.displayName = "Oscilloscope";

export { Oscilloscope };
