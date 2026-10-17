"use client";

import { Knob } from "@/components/ui/knob";

const pan = (v: number) => (v === 0 ? "Center" : v < 0 ? `${-v} L` : `${v} R`);
const semitones = (v: number) => (v === 0 ? "0 st" : `${v > 0 ? "+" : "−"}${Math.abs(v)} st`);
const octaves = ["32′", "16′", "8′", "4′", "2′"];

export default function KnobDetents() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-10">
      <Knob label="Pan" min={-50} max={50} defaultValue={0} detents={[0]} formatValue={pan} showValue />
      <Knob
        label="Detune"
        min={-24}
        max={24}
        defaultValue={7}
        detents={[-12, 0, 12]}
        formatValue={semitones}
        showValue
      />
      <Knob
        label="Octave"
        min={0}
        max={4}
        defaultValue={2}
        arc={120}
        formatValue={(i) => octaves[i]}
        showValue
      />
    </div>
  );
}
