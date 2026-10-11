"use client";

import * as React from "react";
import { Knob } from "@/components/ui/knob";
import { cn } from "@/lib/utils";

// The knobs run 0–100; these map that travel onto musical units.
const hertz = (v: number) => {
  const f = 20 * Math.pow(1000, v / 100);
  return f < 1000 ? `${Math.round(f)} Hz` : `${(f / 1000).toFixed(f < 10000 ? 2 : 1)} kHz`;
};
const time = (v: number) => {
  const ms = Math.pow(10, v / 25);
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
};
const percent = (v: number) => `${v}%`;
const signed = (v: number) => (v > 0 ? `+${v}` : String(v));

const filter = [
  { id: "cutoff", label: "Cutoff", size: "lg", initial: 62, format: hertz },
  { id: "resonance", label: "Reso", size: "md", initial: 35, format: percent },
  { id: "envelope", label: "Env amt", size: "md", initial: 18, min: -50, max: 50, detents: [0], format: signed },
] as const;

const envelope = [
  { id: "attack", label: "A", name: "Attack", initial: 12, format: time },
  { id: "decay", label: "D", name: "Decay", initial: 58, format: time },
  { id: "sustain", label: "S", name: "Sustain", initial: 70, format: percent },
  { id: "release", label: "R", name: "Release", initial: 64, format: time },
] as const;

type Param = (typeof filter)[number] | (typeof envelope)[number];
const all: Param[] = [...filter, ...envelope];

/** The envelope the four knobs describe, drawn like the trace on the synth's screen. */
function EnvelopeShape({ a, d, s, r }: { a: number; d: number; s: number; r: number }) {
  const w = 266;
  const h = 48;
  const segments = [12 + a * 0.7, 12 + d * 0.7, 46, 12 + r * 0.7];
  const scale = w / segments.reduce((sum, x) => sum + x, 0);
  const [aw, dw, sw] = segments.map((x) => x * scale);
  const level = h - 3 - (s / 100) * (h - 8);
  const line = `M0 ${h - 1} L${aw} 4 L${aw + dw} ${level} L${aw + dw + sw} ${level} L${w} ${h - 1}`;

  return (
    <div
      aria-hidden
      className="rounded-md border border-black/70 bg-[#05070a] bg-[linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] bg-[size:100%_12px,19px_100%] px-2 pb-1.5 pt-2 shadow-[inset_0_1px_4px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.05)]"
    >
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-10 w-full overflow-visible">
        <path d={`${line} Z`} className="fill-[rgb(var(--neon-accent,34_211_238)/0.08)]" />
        <path
          d={line}
          fill="none"
          strokeWidth={1.25}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="[stroke:color-mix(in_srgb,rgb(var(--neon-accent,34_211_238))_45%,white)] [filter:drop-shadow(0_0_3px_rgb(var(--neon-accent,34_211_238)))]"
        />
      </svg>
    </div>
  );
}

function Screw({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute size-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#454a57,#0f1117)] shadow-[0_1px_1px_rgb(0_0_0/0.8),0_0_0_1px_rgb(0_0_0/0.4)]",
        "after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-1.5 after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-[30deg] after:bg-black/80",
        className,
      )}
    />
  );
}

export default function KnobDemo() {
  const [values, setValues] = React.useState<Record<string, number>>(() =>
    Object.fromEntries(all.map((p) => [p.id, p.initial])),
  );
  const [active, setActive] = React.useState<string>("cutoff");
  const current = all.find((p) => p.id === active) ?? all[0];
  const update = (id: string) => (value: number) => {
    setActive(id);
    setValues((v) => ({ ...v, [id]: value }));
  };

  return (
    <div className="relative w-full max-w-[700px] rounded-2xl border border-white/[0.07] bg-[linear-gradient(180deg,#151821,#0b0d12)] px-5 pb-7 pt-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_30px_60px_-30px_rgb(0_0_0/0.9)] sm:px-7">
      <Screw className="left-2.5 top-2.5" />
      <Screw className="right-2.5 top-2.5" />
      <Screw className="bottom-2.5 left-2.5" />
      <Screw className="bottom-2.5 right-2.5" />

      <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
        <div className="flex items-baseline gap-3">
          <span className="text-sm font-semibold tracking-[0.08em] text-white/85">NK-1</span>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-white/35 sm:inline">
            Monophonic synthesizer
          </span>
        </div>
        <div
          aria-hidden
          className="w-40 rounded-md border border-black/70 bg-[#05070a] px-3 py-1.5 font-mono shadow-[inset_0_1px_4px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.05)]"
        >
          <div className="text-[9px] uppercase tracking-[0.2em] text-[rgb(var(--neon-accent,34_211_238)/0.6)]">
            {"name" in current ? current.name : current.label}
          </div>
          <div className="text-[15px] leading-5 tabular-nums [color:color-mix(in_srgb,rgb(var(--neon-accent,34_211_238))_35%,white)] [text-shadow:0_0_6px_rgb(var(--neon-accent,34_211_238)/0.8),0_0_14px_rgb(var(--neon-accent,34_211_238)/0.4)]">
            {current.format(values[current.id])}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-stretch justify-center gap-x-7 gap-y-8">
        <section aria-label="Filter" className="flex flex-col justify-between gap-4">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/35">Filter</h3>
          <div className="flex items-end gap-5">
            {filter.map((p) => (
              <Knob
                key={p.id}
                label={p.label}
                size={p.size}
                min={"min" in p ? p.min : undefined}
                max={"max" in p ? p.max : undefined}
                detents={"detents" in p ? [...p.detents] : undefined}
                defaultValue={p.initial}
                formatValue={p.format}
                onValueChange={update(p.id)}
                onFocus={() => setActive(p.id)}
              />
            ))}
          </div>
        </section>
        <span aria-hidden className="hidden w-px bg-white/[0.06] sm:block" />
        <section aria-label="Amp envelope" className="flex flex-col justify-between gap-4">
          <h3 className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/35">Amp envelope</h3>
          <EnvelopeShape a={values.attack} d={values.decay} s={values.sustain} r={values.release} />
          <div className="flex items-end gap-3.5">
            {envelope.map((p) => (
              <Knob
                key={p.id}
                label={p.label}
                aria-label={p.name}
                size="sm"
                defaultValue={p.initial}
                formatValue={p.format}
                onValueChange={update(p.id)}
                onFocus={() => setActive(p.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
