"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Fader } from "@/components/ui/fader";
import { HardwareSwitch } from "@/components/ui/hardware-switch";
import { Knob } from "@/components/ui/knob";
import { Meter } from "@/components/ui/meter";
import type { OscilloscopeWave } from "@/components/ui/oscilloscope";
import { SevenSegment } from "@/components/ui/seven-segment";
import { cn } from "@/lib/utils";
import { useNearViewport, useReducedMotionPreference } from "./use-near-viewport";

// Canvas and flap displays load with the rack, not with the page.
const Oscilloscope = dynamic(() => import("@/components/ui/oscilloscope").then((m) => m.Oscilloscope), { ssr: false });
const LedMatrix = dynamic(() => import("@/components/ui/led-matrix").then((m) => m.LedMatrix), { ssr: false });
const SplitFlap = dynamic(() => import("@/components/ui/split-flap").then((m) => m.SplitFlap), { ssr: false });

const waves: { value: OscilloscopeWave; label: string; d: string }[] = [
  { value: "sine", label: "Sine", d: "M1 7C3.5 1 5.5 1 8 7s4.5 6 7 0" },
  { value: "triangle", label: "Triangle", d: "M1 7l3.5-5 7 10 3.5-5" },
  { value: "square", label: "Square", d: "M1 10V3h7v8h7V7" },
  { value: "saw", label: "Saw", d: "M1 11 8 3v8l7-8" },
];

const COUNT_FROM = 10;

function Screw({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("nk-screw absolute size-[9px] rounded-full", className)}>
      <span className="absolute left-1/2 top-1/2 h-px w-[6px] -translate-x-1/2 -translate-y-1/2 rotate-[30deg] bg-black/80" />
    </span>
  );
}

/** A printed panel legend: small, lowercase, like silkscreen. */
function Legend({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  return (
    <span id={id} className={cn("block text-[12.5px] lowercase leading-none tracking-[0.01em] text-[#9aa2b3]", className)}>
      {children}
    </span>
  );
}

const Jack = React.forwardRef<HTMLSpanElement, { label: string; className?: string }>(({ label, className }, ref) => (
  <span aria-hidden className={cn("flex flex-col items-center gap-1.5", className)}>
    <span
      ref={ref}
      className="grid size-[18px] place-items-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#5a606c,#22262f_65%)] shadow-[0_0_0_1px_rgb(0_0_0/0.7),0_1px_0_rgb(255_255_255/0.06)]"
    >
      <span className="size-[9px] rounded-full bg-[#030305] shadow-[inset_0_1px_2px_rgb(0_0_0/0.9)]" />
    </span>
    <span className="text-[11px] lowercase leading-none text-[#7d8597]">{label}</span>
  </span>
));
Jack.displayName = "Jack";

type JackId = "osc-out" | "osc-in" | "gain-out" | "gain-in" | "arm-out" | "arm-in";
const patches: { from: JackId; to: JackId; key: "osc" | "gain" | "arm" }[] = [
  { from: "osc-out", to: "osc-in", key: "osc" },
  { from: "gain-out", to: "gain-in", key: "gain" },
  { from: "arm-out", to: "arm-in", key: "arm" },
];

function useJacks(rootRef: React.RefObject<HTMLElement | null>) {
  const nodes = React.useRef<Partial<Record<JackId, HTMLElement | null>>>({});
  const callbacks = React.useRef<Partial<Record<JackId, (node: HTMLElement | null) => void>>>({});
  const [points, setPoints] = React.useState<Partial<Record<JackId, { x: number; y: number }>>>({});
  const frame = React.useRef(0);

  const measure = React.useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const root = rootRef.current;
      if (!root) return;
      const box = root.getBoundingClientRect();
      const next: Partial<Record<JackId, { x: number; y: number }>> = {};
      for (const [id, node] of Object.entries(nodes.current)) {
        if (!node) continue;
        const r = node.getBoundingClientRect();
        next[id as JackId] = { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      }
      setPoints(next);
    });
  }, [rootRef]);

  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new ResizeObserver(measure);
    observer.observe(root);
    document.fonts?.ready.then(measure);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [rootRef, measure]);

  const jack = React.useCallback(
    (id: JackId) =>
      (callbacks.current[id] ??= (node: HTMLElement | null) => {
        nodes.current[id] = node;
        if (node) measure();
      }),
    [measure],
  );

  return { jack, points };
}

function Cables({
  points,
  active,
  reduced,
}: {
  points: Partial<Record<JackId, { x: number; y: number }>>;
  active: Record<"osc" | "gain" | "arm", boolean>;
  reduced: boolean;
}) {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible">
      {patches.map((patch) => {
        const a = points[patch.from];
        const b = points[patch.to];
        if (!a || !b) return null;
        const dist = Math.hypot(b.x - a.x, b.y - a.y);
        const sag = Math.min(54, 22 + dist * 0.16);
        const cx = (a.x + b.x) / 2;
        const cy = Math.max(a.y, b.y) + sag;
        const d = `M${a.x} ${a.y}Q${cx} ${cy} ${b.x} ${b.y}`;
        const on = active[patch.key];
        return (
          <g key={patch.key}>
            <path d={d} fill="none" stroke="#000" strokeOpacity={0.55} strokeWidth={7} strokeLinecap="round" transform="translate(0 5)" style={{ filter: "blur(3px)" }} />
            <path d={d} fill="none" stroke="#1b1e26" strokeWidth={5.5} strokeLinecap="round" />
            <path d={d} fill="none" stroke="rgb(255 255 255 / 0.09)" strokeWidth={1} strokeLinecap="round" transform="translate(0 -1.2)" />
            <path
              d={d}
              fill="none"
              stroke="rgb(var(--neon-accent))"
              strokeWidth={2}
              strokeLinecap="round"
              strokeDasharray="0.1 16"
              className={cn("transition-opacity duration-300", !reduced && "[animation:nk-flow_900ms_linear_infinite]")}
              style={{ opacity: on ? 1 : 0, filter: "drop-shadow(0 0 3px rgb(var(--neon-accent)))" }}
            />
            {[a, b].map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={7.5} fill="#15171e" stroke="#3b404c" strokeWidth={1} />
                <circle cx={p.x} cy={p.y} r={3} fill={on ? "rgb(var(--neon-accent))" : "#2b2f39"} style={{ transition: "fill 300ms" }} />
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

const toDb = (gain: number) => (gain <= 0 ? "-INF" : `${Math.round(40 * Math.log10(gain / 80))}`.replace(/^(\d)/, "+$1"));

export function Rack({ instrumentCount }: { instrumentCount: number }) {
  const [sectionRef, near, visible] = useNearViewport<HTMLElement>("700px");
  const reduced = useReducedMotionPreference();
  const panelRef = React.useRef<HTMLDivElement>(null);
  const { jack, points } = useJacks(panelRef);

  const [freq, setFreq] = React.useState(3);
  const [amp, setAmp] = React.useState(0.7);
  const [wave, setWave] = React.useState<OscilloscopeWave>("sine");
  const [gain, setGain] = React.useState(72);
  const [level, setLevel] = React.useState(0.6);
  const [armed, setArmed] = React.useState(false);
  const [remaining, setRemaining] = React.useState(COUNT_FROM);
  const [readout, setReadout] = React.useState("NK-11 READY");

  const hz = Math.round(freq * 110);
  const settle = React.useRef<number | undefined>(undefined);
  const say = React.useCallback((text: string, wait = 160) => {
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => setReadout(text), wait);
  }, []);
  React.useEffect(() => () => window.clearTimeout(settle.current), []);

  // The meter follows the fader with a little life in it, only while on screen.
  React.useEffect(() => {
    if (!visible || reduced) return;
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (t - last < 60) return;
      last = t;
      const wobble = 0.86 + 0.14 * (0.5 + 0.5 * Math.sin(t / 170) * Math.sin(t / 53));
      setLevel(Math.min(1, (gain / 100) * wobble));
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [gain, visible, reduced]);

  // Countdown while armed.
  React.useEffect(() => {
    if (!armed) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const left = Math.max(0, COUNT_FROM - (t - start) / 1000);
      setRemaining(left);
      if (left > 0) raf = requestAnimationFrame(tick);
      else setReadout("LIFTOFF");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [armed]);

  const shownLevel = visible && !reduced ? level : gain / 100;
  const done = armed && remaining === 0;
  const clock = remaining.toFixed(2).padStart(5, "0");

  return (
    <section ref={sectionRef} aria-labelledby="rack-title" className="relative overflow-hidden pb-32 pt-8 sm:pb-48">
      <div className="mx-auto max-w-[96rem] px-3 sm:px-4">
        {/* The rack */}
        <div ref={panelRef} className="nk-panel relative rounded-[14px] lg:mx-0">
          {near && <Cables points={points} active={{ osc: visible, gain: gain > 0, arm: armed && !done }} reduced={reduced} />}

          {/* Rack ears */}
          <div aria-hidden className="absolute inset-y-0 left-0 hidden w-9 border-r border-black/50 lg:block">
            <span className="absolute left-1/2 top-7 h-[9px] w-[16px] -translate-x-1/2 rounded-full bg-black/80 shadow-[0_1px_0_rgb(255_255_255/0.06)]" />
            <span className="absolute bottom-7 left-1/2 h-[9px] w-[16px] -translate-x-1/2 rounded-full bg-black/80 shadow-[0_1px_0_rgb(255_255_255/0.06)]" />
          </div>
          <div aria-hidden className="absolute inset-y-0 right-0 hidden w-9 border-l border-black/50 lg:block">
            <span className="absolute left-1/2 top-7 h-[9px] w-[16px] -translate-x-1/2 rounded-full bg-black/80 shadow-[0_1px_0_rgb(255_255_255/0.06)]" />
            <span className="absolute bottom-7 left-1/2 h-[9px] w-[16px] -translate-x-1/2 rounded-full bg-black/80 shadow-[0_1px_0_rgb(255_255_255/0.06)]" />
          </div>

          <div className="relative lg:mx-9">
            {/* Top rail: what you touched, and a ticker */}
            <div className="flex flex-col gap-4 border-b border-black/60 px-5 py-5 shadow-[0_1px_0_rgb(255_255_255/0.04)] sm:px-7 lg:flex-row lg:items-center lg:gap-8">
              <div className="flex items-center justify-between gap-4 lg:justify-start">
                <span className="text-[15px] font-semibold tracking-[-0.01em] text-[#c9ced8]">
                  NeonKit <span className="font-normal text-[#7d8597]">nk-11</span>
                </span>
              </div>
              <div className="min-w-0" aria-live="polite">
                <span className="sr-only">Readout: {readout}</span>
                {near ? (
                  <SplitFlap aria-hidden value={readout} length={14} size="sm" className="max-w-full" />
                ) : (
                  <span aria-hidden className="block h-7" />
                )}
              </div>
              <div aria-hidden className="hidden min-w-0 flex-1 rounded-md bg-[#040507] px-3 py-2 shadow-[inset_0_1px_3px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.05)] lg:block">
                {near && (
                  <LedMatrix
                    text={done ? "LIFTOFF   LIFTOFF   " : "KNOB  FADER  METER  OSCILLOSCOPE  HARDWARE SWITCH  SEVEN SEGMENT  SPLIT FLAP  LED MATRIX    "}
                    dotSize={3}
                    gap={1.5}
                    speed={reduced ? 0 : 42}
                  />
                )}
              </div>
            </div>

            {/* Modules */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[minmax(0,1.9fr)_minmax(0,0.85fr)_minmax(0,1fr)]">
              {/* Oscillator */}
              <div className="relative px-5 pb-16 pt-7 sm:px-7 md:col-span-2 lg:col-span-1">
                <Legend>oscillator</Legend>
                <div className="mt-6 flex flex-col gap-7 sm:flex-row sm:items-start">
                  <div className="relative min-w-0 flex-1">
                    <div className="aspect-[16/10] w-full overflow-hidden rounded-[10px] bg-black shadow-[0_0_0_1px_rgb(0_0_0/0.8),0_0_0_5px_#191c24,0_0_0_6px_rgb(255_255_255/0.05)]">
                      {near && (
                        <Oscilloscope
                          aria-label={`Oscilloscope showing a ${wave} wave at ${hz} hertz`}
                          wave={wave}
                          frequency={freq}
                          amplitude={amp}
                          speed={reduced ? 0 : 0.35}
                          className="size-full"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-row items-start justify-between gap-6 pt-1 sm:w-[184px] sm:flex-col sm:gap-8">
                    <div className="flex gap-5">
                      <div className="flex flex-col items-center gap-2.5">
                        <Knob
                          aria-label="Frequency"
                          size="md"
                          min={1}
                          max={10}
                          step={0.1}
                          value={freq}
                          onValueChange={(v) => {
                            setFreq(v);
                            say(`FREQ ${Math.round(v * 110)} HZ`);
                          }}
                          formatValue={(v) => `${Math.round(v * 110)} Hz`}
                        />
                        <Legend>freq</Legend>
                      </div>
                      <div className="flex flex-col items-center gap-2.5">
                        <Knob
                          aria-label="Amplitude"
                          size="sm"
                          min={0.1}
                          max={1}
                          step={0.01}
                          value={amp}
                          onValueChange={(v) => {
                            setAmp(v);
                            say(`AMP ${Math.round(v * 100)} PCT`);
                          }}
                          formatValue={(v) => `${Math.round(v * 100)}%`}
                        />
                        <Legend>amp</Legend>
                      </div>
                    </div>
                    <div role="radiogroup" aria-label="Waveform" className="grid grid-cols-2 gap-x-3 gap-y-3">
                      {waves.map((w) => {
                        const on = wave === w.value;
                        return (
                          <button
                            key={w.value}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            aria-label={w.label}
                            onClick={() => {
                              setWave(w.value);
                              say(`WAVE ${w.label.toUpperCase()}`, 0);
                            }}
                            className="group flex cursor-pointer items-center gap-2.5 rounded-md py-1 pr-2 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent)/0.6)]"
                          >
                            <span
                              aria-hidden
                              className={cn(
                                "size-[7px] shrink-0 rounded-full transition-[background-color,box-shadow] duration-200",
                                on
                                  ? "bg-[rgb(var(--neon-accent))] shadow-[0_0_2px_rgb(var(--neon-accent)),0_0_10px_rgb(var(--neon-accent)/0.8)]"
                                  : "bg-[#262a33] shadow-[inset_0_1px_1px_rgb(0_0_0/0.8)]",
                              )}
                            />
                            <svg aria-hidden viewBox="0 0 16 14" className="h-3.5 w-4 overflow-visible">
                              <path
                                d={w.d}
                                fill="none"
                                strokeWidth={1.5}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={cn("transition-colors", on ? "stroke-[#e8edf5]" : "stroke-[#7d8597] group-hover:stroke-[#b9c0cc]")}
                              />
                            </svg>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-end justify-between sm:pr-[132px]">
                  <Jack ref={jack("osc-in")} label="scope in" className="ml-4" />
                  <Jack ref={jack("osc-out")} label="osc out" />
                </div>
              </div>

              {/* Level */}
              <div className="relative border-t border-black/60 px-5 pb-16 pt-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] sm:px-7 lg:border-l lg:border-t-0 lg:shadow-[inset_1px_0_0_rgb(255_255_255/0.04)]">
                <Legend>level</Legend>
                <div className="mt-6 flex items-start justify-center gap-10 lg:justify-start">
                  <div className="flex flex-col items-center gap-3">
                    <Fader
                      aria-label="Gain"
                      value={gain}
                      onValueChange={(v) => {
                        setGain(v);
                        say(`GAIN ${toDb(v)} DB`);
                      }}
                      formatValue={(v) => `${toDb(v)} dB`}
                      ticks={5}
                      className="h-52"
                    />
                    <Legend>gain</Legend>
                    <Jack ref={jack("gain-out")} label="out" className="mt-6" />
                  </div>
                  <div className="flex flex-col items-center gap-3">
                    <Meter aria-label="Output level" value={shownLevel} orientation="vertical" peak className="h-52" />
                    <Legend>out</Legend>
                    <Jack ref={jack("gain-in")} label="in" className="mt-6" />
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="relative border-t border-black/60 px-5 pb-16 pt-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)] sm:px-7 md:border-l md:shadow-[inset_1px_1px_0_rgb(255_255_255/0.04)] lg:border-t-0 lg:shadow-[inset_1px_0_0_rgb(255_255_255/0.04)]">
                <Legend>launch</Legend>
                <div className="mt-6 grid w-fit grid-cols-[auto_auto] items-end justify-items-center gap-x-8 gap-y-3">
                  <HardwareSwitch
                    variant="flip"
                    checked={armed}
                    onCheckedChange={(next) => {
                      setArmed(next);
                      setRemaining(COUNT_FROM);
                      setReadout(next ? "ARMED T-10" : "SAFE");
                    }}
                    aria-label="Arm the countdown"
                  />
                  <div className="rounded-md bg-[#040507] px-3 py-2.5 shadow-[inset_0_1px_3px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.05)]">
                    <SevenSegment
                      aria-label={`${remaining.toFixed(1)} seconds`}
                      value={clock}
                      size={36}
                      unlit={0.07}
                      className={cn(!armed && "opacity-35", done && !reduced && "[animation:nk-blink_1s_steps(1)_infinite]")}
                    />
                  </div>
                  <Legend>arm</Legend>
                  <Legend>t minus</Legend>
                </div>
                <div aria-hidden className="mt-8 flex gap-6">
                  {[
                    { label: "safe", on: !armed },
                    { label: "armed", on: armed && !done },
                    { label: "go", on: done },
                  ].map((lamp) => (
                    <span key={lamp.label} className="flex items-center gap-2">
                      <span
                        className={cn(
                          "size-2 rounded-full transition-[background-color,box-shadow] duration-200",
                          lamp.on
                            ? "bg-[rgb(var(--neon-accent))] shadow-[0_0_2px_rgb(var(--neon-accent)),0_0_10px_rgb(var(--neon-accent)/0.8)]"
                            : "bg-[#262a33] shadow-[inset_0_1px_1px_rgb(0_0_0/0.8)]",
                        )}
                      />
                      <Legend>{lamp.label}</Legend>
                    </span>
                  ))}
                </div>
                <div className="mt-8 grid w-fit grid-cols-[auto_auto] gap-x-24">
                  <Jack ref={jack("arm-out")} label="out" />
                  <Jack ref={jack("arm-in")} label="in" />
                </div>
              </div>
            </div>
          </div>

          <Screw className="left-[13px] top-1/2 hidden -translate-y-1/2 lg:block" />
          <Screw className="right-[13px] top-1/2 hidden -translate-y-1/2 lg:block" />
        </div>

        {/* The words, under the hardware */}
        <div className="mt-16 px-1 sm:mt-24 lg:grid lg:grid-cols-12">
          <h2 id="rack-title" className="type-display text-balance text-[clamp(2.4rem,5.6vw,5.5rem)] text-fg lg:col-span-10">
            Knobs, faders and a working oscilloscope.
          </h2>
          <div className="mt-8 max-w-[34rem] lg:col-span-5 lg:col-start-6 lg:mt-12">
            <p className="text-[16.5px] leading-[1.6] text-muted">
              {instrumentCount} instruments for the parts of an interface that set, measure and count. Drag them, scroll
              them or use the arrow keys: underneath, a knob is a slider and a rocker is a switch.
            </p>
            <Link
              href="/components#instruments"
              className="mt-5 inline-block text-[15px] font-medium text-fg underline decoration-white/25 underline-offset-[5px] transition-colors hover:decoration-[rgb(var(--neon-accent))]"
            >
              All {instrumentCount} instruments
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
