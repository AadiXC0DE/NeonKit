"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];
type Graph = { context: AudioContext; analyser: AnalyserNode };

const FALLBACK: Rgb = [34, 211, 238];
const BLEED = 24;

// An element can feed only one MediaElementSource, ever, so the audio graph
// is kept per element and shared by every Equalizer listening to it.
const graphs = new WeakMap<HTMLMediaElement, Graph>();

function connect(audio: HTMLMediaElement): AnalyserNode | null {
  let graph = graphs.get(audio);
  if (!graph) {
    const Context =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Context) return null;
    try {
      const context = new Context();
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.72;
      context.createMediaElementSource(audio).connect(analyser);
      analyser.connect(context.destination);
      graph = { context, analyser };
      graphs.set(audio, graph);
    } catch {
      return null;
    }
  }
  if (graph.context.state === "suspended") void graph.context.resume();
  return graph.analyser;
}

function readRgb(node: Element | null): Rgb {
  if (!node || typeof getComputedStyle === "undefined") return FALLBACK;
  const parts = getComputedStyle(node).color.match(/[\d.]+/g);
  return parts && parts.length >= 3 ? [+parts[0], +parts[1], +parts[2]] : FALLBACK;
}

function rgba([r, g, b]: Rgb, alpha: number) {
  return `rgba(${r | 0},${g | 0},${b | 0},${Math.min(1, Math.max(0, alpha)).toFixed(4)})`;
}

const bump = (f: number, center: number, width: number) => Math.exp(-((f - center) ** 2) / width);

// A made-up track at 116 bpm: four-on-the-floor kick, backbeat snare, offbeat
// hats and a wandering midrange, shaped into a plausible spectrum.
function simulate(t: number, out: Float32Array, drift: Float32Array, random: () => number) {
  const beats = t / (60 / 116);
  const inBeat = beats % 1;
  const kick = Math.exp(-inBeat * 6.5);
  const snare = Math.floor(beats) % 2 === 1 ? Math.exp(-inBeat * 8) : 0;
  const hat = Math.exp(-((beats * 2) % 1) * 12);
  const center = 0.42 + 0.12 * Math.sin(t * 0.37);
  const n = out.length;
  for (let i = 0; i < n; i++) {
    // A handful of bars (an inline "now playing" glyph) samples the busy middle
    // of the spectrum, so every bar dances instead of the top end idling.
    const f = n <= 1 ? 0.3 : n <= 6 ? 0.08 + (0.5 * i) / (n - 1) : i / (n - 1);
    drift[i] = drift[i] * 0.86 + (random() - 0.5) * 0.42;
    const level =
      bump(f, 0.05, 0.015) * (0.3 + 0.62 * kick) +
      bump(f, 0.2, 0.02) * (0.44 + 0.12 * Math.sin(t * 2.1)) +
      bump(f, center, 0.035) * (0.36 + 0.14 * Math.sin(t * 1.3 + f * 9)) +
      bump(f, 0.6, 0.05) * 0.5 * snare +
      Math.max(0, (f - 0.55) / 0.45) * (0.14 + 0.46 * hat) +
      0.08 * (1 - f * 0.6);
    out[i] = Math.min(0.97, Math.max(0.02, level * (1 + 0.45 * drift[i] + 0.12 * (random() - 0.5))));
  }
}

// Log-spaced bands from 40 Hz to 16 kHz, with a gentle tilt so the top end,
// which always carries less energy, still moves.
function analyse(analyser: AnalyserNode, bins: Uint8Array<ArrayBuffer>, out: Float32Array) {
  analyser.getByteFrequencyData(bins);
  const nyquist = analyser.context.sampleRate / 2;
  const n = out.length;
  for (let i = 0; i < n; i++) {
    const lo = 40 * Math.pow(400, i / n);
    const hi = 40 * Math.pow(400, (i + 1) / n);
    const from = Math.min(bins.length - 1, Math.floor((lo / nyquist) * bins.length));
    const to = Math.min(bins.length - 1, Math.max(from, Math.ceil((hi / nyquist) * bins.length) - 1));
    let peak = 0;
    for (let b = from; b <= to; b++) peak = Math.max(peak, bins[b]);
    const tilt = 1 + (0.35 * i) / Math.max(1, n - 1);
    out[i] = Math.min(0.97, Math.pow(peak / 255, 1.6) * tilt);
  }
}

export interface EqualizerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Bar color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Number of frequency bands. */
  bars?: number;
  /** Bars dance while true and settle to rest when false. */
  playing?: boolean;
  /** Drive the bars from this element's real spectrum once it plays. */
  audio?: HTMLAudioElement | null;
  /** Height in pixels. The width fills the container. */
  height?: number;
  /** Space between bars in pixels. */
  gap?: number;
  /** Split each bar into this many LED cells. 0 draws solid bars. */
  segments?: number;
  /** Peak caps that hold the recent high, then drop. */
  peaks?: boolean;
}

/**
 * Spectrum bars with falling peak caps. Without `audio` the motion is
 * simulated; with it, the AudioContext starts on the element's first play.
 */
const Equalizer = React.forwardRef<HTMLDivElement, EqualizerProps>(
  (
    {
      className,
      style,
      color,
      bars = 24,
      playing = true,
      audio = null,
      height = 120,
      gap = 3,
      segments = 0,
      peaks = true,
      ...props
    },
    ref,
  ) => {
    const hostRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const probeRef = React.useRef<HTMLSpanElement>(null);
    const settings = React.useRef({ bars, playing, audio, gap, segments, peaks });
    const engine = React.useRef<{ sync: () => void; recolor: () => void; redraw: () => void } | null>(
      null,
    );

    React.useImperativeHandle(ref, () => hostRef.current as HTMLDivElement);

    React.useEffect(() => {
      settings.current = { bars, playing, audio, gap, segments, peaks };
      engine.current?.sync();
      engine.current?.redraw();
    }, [bars, playing, audio, gap, segments, peaks]);

    React.useEffect(() => {
      engine.current?.recolor();
    }, [color]);

    // The analyser is created on the element's first play, which follows a
    // user gesture, so the AudioContext is allowed to start.
    const analyserRef = React.useRef<AnalyserNode | null>(null);
    React.useEffect(() => {
      analyserRef.current = null;
      if (!audio) return;
      const onPlay = () => {
        analyserRef.current = connect(audio);
        engine.current?.sync();
      };
      const onStop = () => engine.current?.sync();
      if (!audio.paused) onPlay();
      audio.addEventListener("play", onPlay);
      audio.addEventListener("pause", onStop);
      audio.addEventListener("ended", onStop);
      audio.addEventListener("emptied", onStop);
      return () => {
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onStop);
        audio.removeEventListener("ended", onStop);
        audio.removeEventListener("emptied", onStop);
      };
    }, [audio]);

    React.useEffect(() => {
      const host = hostRef.current;
      const canvas = canvasRef.current;
      const probe = probeRef.current;
      if (!host || !canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const motion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
      let width = 0;
      let h = 0;
      let dpr = 1;
      let rgb = readRgb(probe);
      let raf = 0;
      let last = 0;
      let clock = 0;
      let throttle = 0;
      let onScreen = true;
      let size = 0;
      let levels = new Float32Array(0);
      let targets = new Float32Array(0);
      let drift = new Float32Array(0);
      let caps = new Float32Array(0);
      let fall = new Float32Array(0);
      let hold = new Float32Array(0);
      let bins: Uint8Array<ArrayBuffer> | null = null;

      const ensure = () => {
        const n = Math.max(1, Math.round(settings.current.bars));
        if (n === size) return;
        size = n;
        levels = new Float32Array(n);
        targets = new Float32Array(n);
        drift = new Float32Array(n);
        caps = new Float32Array(n);
        fall = new Float32Array(n);
        hold = new Float32Array(n);
      };

      const active = () => {
        const { playing, audio } = settings.current;
        return playing && (!audio || !audio.paused);
      };

      const fill = (dt: number) => {
        const analyser = analyserRef.current;
        if (!active()) targets.fill(0);
        else if (settings.current.audio) {
          if (analyser) {
            if (!bins || bins.length !== analyser.frequencyBinCount) bins = new Uint8Array(analyser.frequencyBinCount);
            analyse(analyser, bins, targets);
          } else targets.fill(0);
        } else simulate(clock, targets, drift, dt > 0 ? Math.random : () => 0.5);
      };

      const step = (dt: number) => {
        let moving = false;
        for (let i = 0; i < size; i++) {
          const target = targets[i];
          // Fast attack, slower release, like a meter's ballistics.
          const rate = target > levels[i] ? 30 : 9;
          levels[i] += (target - levels[i]) * (dt > 0 ? 1 - Math.exp(-rate * dt) : 1);
          if (levels[i] >= caps[i]) {
            caps[i] = levels[i];
            fall[i] = 0;
            hold[i] = 0.32;
          } else if (hold[i] > 0) hold[i] -= dt;
          else {
            fall[i] += 2.6 * dt;
            caps[i] = Math.max(levels[i], caps[i] - fall[i] * dt);
          }
          if (dt === 0) caps[i] = levels[i];
          if (levels[i] > 0.003 || caps[i] > 0.003) moving = true;
        }
        return moving;
      };

      const roundRect = (x: number, y: number, w: number, hh: number, r: number) => {
        const radius = Math.min(r, w / 2, hh / 2);
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + w, y, x + w, y + hh, radius);
        ctx.arcTo(x + w, y + hh, x, y + hh, radius);
        ctx.arcTo(x, y + hh, x, y, radius);
        ctx.arcTo(x, y, x + w, y, radius);
        ctx.closePath();
      };

      const paint = () => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // The canvas overhangs the box by BLEED so glow can spill past the bars.
        ctx.setTransform(dpr, 0, 0, dpr, BLEED * dpr, BLEED * dpr);
        if (width <= 0 || h <= 0) return;
        const { gap, segments, peaks } = settings.current;
        const space = Math.max(0, gap);
        const barW = Math.max(1, (width - space * (size - 1)) / size);
        const capH = Math.min(4, Math.max(2, Math.round(barW * 0.2)));
        const top = peaks ? capH + 3 : 0;
        // Glow scales with the bars, so a tiny inline equalizer doesn't turn into a smudge.
        const glow = Math.min(16, Math.max(3, barW * 2.2));
        const span = h - top;
        const radius = Math.min(3, barW / 3);
        const core: Rgb = [rgb[0] * 0.3 + 178.5, rgb[1] * 0.3 + 178.5, rgb[2] * 0.3 + 178.5];
        const cells = Math.max(0, Math.round(segments));
        const cellGap = Math.max(1, Math.round(space * 0.6));
        const cellH = cells ? (h - cellGap * (cells - 1)) / cells : 0;

        let sum = 0;
        for (let i = 0; i < size; i++) sum += levels[i];
        const average = sum / size;

        // Light from the bars pools on the surface they stand on.
        // Two half-ellipses meeting at the baseline: tall behind the bars,
        // short below them, both fading out before the canvas edge.
        const wash = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        wash.addColorStop(0, rgba(rgb, 0.3 * average));
        wash.addColorStop(1, rgba(rgb, 0));
        for (const [reach, from] of [[h, -1], [BLEED, 0]]) {
          ctx.save();
          ctx.translate(width / 2, h);
          ctx.scale(width / 2 + BLEED, reach);
          ctx.fillStyle = wash;
          ctx.fillRect(-1, from, 2, 1);
          ctx.restore();
        }

        // Unlit glass.
        ctx.beginPath();
        for (let i = 0; i < size; i++) {
          const x = i * (barW + space);
          if (cells) {
            for (let c = 0; c < cells; c++) {
              const y = h - (c + 1) * cellH - c * cellGap;
              ctx.rect(x, y, barW, cellH);
            }
          } else roundRect(x, 0, barW, h, radius);
        }
        ctx.fillStyle = rgba(rgb, cells ? 0.1 : 0.07);
        ctx.fill();

        // Lit bars, in one path so the glow is a single blur.
        ctx.beginPath();
        for (let i = 0; i < size; i++) {
          const x = i * (barW + space);
          if (cells) {
            const count = Math.round(levels[i] * cells);
            for (let c = 0; c < count; c++) ctx.rect(x, h - (c + 1) * cellH - c * cellGap, barW, cellH);
          } else {
            const bh = levels[i] * span;
            if (bh > 0.5) roundRect(x, h - bh, barW, bh, radius);
          }
        }
        const lit = ctx.createLinearGradient(0, h, 0, 0);
        lit.addColorStop(0, rgba(rgb, 0.7));
        lit.addColorStop(1, rgba(rgb, 1));
        ctx.save();
        ctx.shadowColor = rgba(rgb, 0.9);
        ctx.shadowBlur = glow * dpr;
        ctx.fillStyle = lit;
        ctx.fill();
        // A second, wider and fainter pass blooms the whole display.
        ctx.globalCompositeOperation = "lighter";
        ctx.shadowColor = rgba(rgb, 0.55);
        ctx.shadowBlur = glow * 2.25 * dpr;
        ctx.fillStyle = rgba(rgb, 0.12);
        ctx.fill();
        ctx.restore();

        // A white-hot filament down the middle of each bar, like a tube's core.
        ctx.beginPath();
        const coreW = Math.max(1, Math.min(barW * (cells ? 0.6 : 0.36), barW - 2));
        for (let i = 0; i < size; i++) {
          const x = i * (barW + space) + (barW - coreW) / 2;
          if (cells) {
            const count = Math.round(levels[i] * cells);
            const inset = Math.min(1, cellH / 4);
            for (let c = 0; c < count; c++) {
              ctx.rect(x, h - (c + 1) * cellH - c * cellGap + inset, coreW, Math.max(0.5, cellH - inset * 2));
            }
          } else {
            const bh = levels[i] * span;
            if (bh > 3) roundRect(x, h - bh + 1.5, coreW, bh - 1.5, coreW / 2);
          }
        }
        const filament = ctx.createLinearGradient(0, h, 0, 0);
        filament.addColorStop(0, rgba(core, cells ? 0.25 : 0.35));
        filament.addColorStop(1, rgba(core, cells ? 0.6 : 0.95));
        ctx.fillStyle = filament;
        ctx.fill();

        if (!peaks) return;
        // Peak caps.
        ctx.beginPath();
        for (let i = 0; i < size; i++) {
          if (caps[i] <= 0.004) continue;
          const x = i * (barW + space);
          if (cells) {
            const c = Math.max(0, Math.round(caps[i] * cells) - 1);
            if (c >= Math.round(levels[i] * cells)) ctx.rect(x, h - (c + 1) * cellH - c * cellGap, barW, cellH);
          } else {
            ctx.rect(x, Math.max(0, h - caps[i] * span - capH - 2), barW, capH);
          }
        }
        ctx.save();
        ctx.shadowColor = rgba(rgb, 0.9);
        ctx.shadowBlur = glow * 0.65 * dpr;
        ctx.fillStyle = rgba(core, 1);
        ctx.fill();
        ctx.restore();
      };

      const still = () => !!motion?.matches;

      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        const dt = Math.min(0.05, last ? (now - last) / 1000 : 1 / 60);
        last = now;
        ensure();
        if (still()) {
          // Reduced motion: real audio still reads out, a few times a second, without tweening.
          throttle += dt;
          if (throttle < 0.3) return;
          throttle = 0;
          fill(0);
          step(0);
          paint();
          return;
        }
        clock += dt;
        fill(dt);
        const moving = step(dt);
        paint();
        if (!moving && !active()) stop();
      };

      const stop = () => {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      };

      const sync = () => {
        const live =
          onScreen && !document.hidden && width > 0 && (still() ? active() && !!settings.current.audio : true);
        if (live && !raf) raf = requestAnimationFrame(frame);
        else if (!live && raf) stop();
        if (still() && !raf) redraw();
      };

      // One still frame: a resting spectrum when playing, empty glass when not.
      const redraw = () => {
        if (raf || width === 0) return;
        ensure();
        if (still() && !active()) {
          levels.fill(0);
          caps.fill(0);
        } else if (still() && !settings.current.audio) {
          simulate(1.1, targets, drift.fill(0), () => 0.5);
          levels.set(targets);
          caps.set(targets);
        }
        paint();
      };

      const resize = () => {
        const rect = host.getBoundingClientRect();
        width = rect.width;
        h = rect.height;
        dpr = Math.min(2, window.devicePixelRatio || 1);
        canvas.width = Math.max(1, Math.round((width + BLEED * 2) * dpr));
        canvas.height = Math.max(1, Math.round((h + BLEED * 2) * dpr));
        ensure();
        paint();
        sync();
      };

      const recolor = () => {
        rgb = readRgb(probe);
        if (!raf) paint();
      };

      engine.current = { sync, recolor, redraw };
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
      const onProbe = (event: TransitionEvent) => {
        if (event.target === probe) recolor();
      };
      document.addEventListener("visibilitychange", sync);
      motion?.addEventListener?.("change", sync);
      probe?.addEventListener("transitionend", onProbe);

      return () => {
        stop();
        engine.current = null;
        resizeObserver?.disconnect();
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion?.removeEventListener?.("change", sync);
        dprQuery?.removeEventListener?.("change", onDpr);
        probe?.removeEventListener("transitionend", onProbe);
      };
    }, []);

    const labelled = Boolean(props["aria-label"] || props["aria-labelledby"]);

    return (
      <div
        ref={hostRef}
        aria-hidden={labelled ? undefined : true}
        role={labelled ? "img" : undefined}
        style={neonVars(color, { height, ...style })}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "relative w-full min-w-0", className)}
        {...props}
      >
        <span
          ref={probeRef}
          aria-hidden
          className="pointer-events-none absolute size-0 text-[rgb(var(--neon))] [transition:color_1ms_linear]"
        />
        <canvas
          ref={canvasRef}
          aria-hidden
          style={{ inset: -BLEED, width: `calc(100% + ${BLEED * 2}px)`, height: `calc(100% + ${BLEED * 2}px)` }}
          className="pointer-events-none absolute"
        />
      </div>
    );
  },
);
Equalizer.displayName = "Equalizer";

export { Equalizer };
