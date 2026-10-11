"use client";

import * as React from "react";
import { Fader } from "@/components/ui/fader";
import { Knob } from "@/components/ui/knob";

const scale = [
  { value: 10, label: "+10" },
  { value: 5, label: "+5" },
  { value: 0, label: "0" },
  { value: -5, label: "−5" },
  { value: -10, label: "−10" },
  { value: -20, label: "−20" },
  { value: -30, label: "−30" },
  { value: -40, label: "−40" },
  { value: -60, label: "−∞" },
];

const decibels = (v: number) =>
  v <= -60 ? "−∞ dB" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v).toFixed(1)} dB`;
const pan = (v: number) => (v === 0 ? "C" : v < 0 ? `L${-v}` : `R${v}`);

// A fake 120 BPM groove: each channel's amplitude (0–1) at time t, in seconds.
const sources: Record<string, (t: number) => number> = {
  kick: (t) => 0.9 * Math.exp(-((t * 2) % 1) * 9),
  snare: (t) => {
    const p = ((t * 2) % 2) - 1;
    return p >= 0 ? 0.75 * Math.exp(-p * 6) : 0.03;
  },
  bass: (t) => {
    const eighth = Math.floor(t * 4) % 8;
    return [1, 1, 0, 1, 1, 0, 1, 1][eighth] ? 0.55 * (0.6 + 0.4 * Math.exp(-((t * 4) % 1) * 4)) : 0.05;
  },
  keys: (t) => 0.45 * (0.35 + 0.65 * Math.exp(-((t / 2) % 1) * 1.6)),
  vox: (t) => ((t / 3) % 1 < 0.66 ? 0.5 + 0.15 * Math.sin(t * 11) + 0.08 * Math.sin(t * 3.7) : 0.02),
  fx: (t) => 0.3 + 0.08 * Math.sin(t * 1.3) + 0.05 * Math.sin(t * 5.1),
};

const channels = [
  { id: "kick", name: "Kick", gain: -4, pan: 0 },
  { id: "snare", name: "Snare", gain: -6, pan: -4 },
  { id: "bass", name: "Bass", gain: -3, pan: 0 },
  { id: "keys", name: "Keys", gain: -9, pan: 18 },
  { id: "vox", name: "Vox", gain: -2, pan: 0 },
  { id: "fx", name: "FX", gain: -14, pan: -12 },
];

const toMeter = (amplitude: number) => {
  const db = 20 * Math.log10(Math.max(amplitude, 1e-4));
  return Math.min(1, Math.max(0, (db + 48) / 48));
};
const gainOf = (db: number) => (db <= -60 ? 0 : Math.pow(10, db / 20));

export default function FaderDemo() {
  const [gains, setGains] = React.useState<Record<string, number>>(() =>
    Object.fromEntries([...channels.map((c) => [c.id, c.gain]), ["main", 0]]),
  );
  const [levels, setLevels] = React.useState<Record<string, number>>({});
  const gainsRef = React.useRef(gains);

  React.useEffect(() => {
    gainsRef.current = gains;
  }, [gains]);

  React.useEffect(() => {
    const start = performance.now();
    const id = window.setInterval(() => {
      const t = (performance.now() - start) / 1000;
      const g = gainsRef.current;
      const next: Record<string, number> = {};
      let sum = 0;
      for (const c of channels) {
        const amplitude = sources[c.id](t) * gainOf(g[c.id]);
        sum += amplitude * amplitude;
        next[c.id] = toMeter(amplitude);
      }
      next.main = toMeter(Math.sqrt(sum) * 0.7 * gainOf(g.main));
      setLevels(next);
    }, 50);
    return () => window.clearInterval(id);
  }, []);

  const setGain = (id: string) => (value: number) => setGains((g) => ({ ...g, [id]: value }));

  return (
    <div className="w-full max-w-[700px] overflow-x-auto rounded-2xl border border-white/[0.07] bg-[linear-gradient(180deg,#141720,#0b0d12)] shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_30px_60px_-30px_rgb(0_0_0/0.9)]">
      <div className="flex min-w-max">
        {channels.map((c, i) => (
          <div
            key={c.id}
            className="flex flex-1 flex-col items-center gap-4 border-r border-white/[0.05] px-3 pb-5 pt-4"
          >
            <span className="font-mono text-[10px] tabular-nums text-white/30">{String(i + 1).padStart(2, "0")}</span>
            <Knob
              size="sm"
              aria-label={`${c.name} pan`}
              min={-50}
              max={50}
              defaultValue={c.pan}
              detents={[0]}
              formatValue={pan}
            />
            <Fader
              label={c.name}
              min={-60}
              max={10}
              step={0.5}
              ticks={scale}
              value={gains[c.id]}
              defaultValue={0}
              onValueChange={setGain(c.id)}
              level={levels[c.id] ?? 0}
              formatValue={decibels}
              showValue
              size="sm"
              className="h-64"
            />
          </div>
        ))}
        <div className="flex flex-1 flex-col items-center gap-4 border-l border-white/[0.08] bg-white/[0.02] px-4 pb-5 pt-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">Main</span>
          <div className="h-14" aria-hidden />
          <Fader
            label="Stereo"
            min={-60}
            max={10}
            step={0.5}
            ticks={scale}
            value={gains.main}
            defaultValue={0}
            onValueChange={setGain("main")}
            level={levels.main ?? 0}
            formatValue={decibels}
            showValue
            size="sm"
            className="h-64"
          />
        </div>
      </div>
    </div>
  );
}
