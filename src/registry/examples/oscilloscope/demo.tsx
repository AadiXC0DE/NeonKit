"use client";

import * as React from "react";
import { Oscilloscope, type OscilloscopeWave } from "@/components/ui/oscilloscope";
import { Slider } from "@/components/ui/slider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Little front-panel glyphs, one per waveform.
const waves: { value: OscilloscopeWave; label: string; path: string }[] = [
  { value: "sine", label: "Sine", path: "M1 6c2.5-6 4.5-6 7 0s4.5 6 7 0" },
  { value: "square", label: "Square", path: "M1 9V3h4.7v6h4.6V3H15" },
  { value: "saw", label: "Sawtooth", path: "M1 9l7-6v6l7-6" },
  { value: "triangle", label: "Triangle", path: "M1 9l3.5-6L8 9l3.5-6L15 9" },
  { value: "noise", label: "Noise", path: "M1 6l1.5-3 1.5 5 1.5-6 1.5 7 1.5-4 1.5 2 1.5-5 1.5 6 1.5-2" },
];

export default function OscilloscopeDemo() {
  const [wave, setWave] = React.useState<OscilloscopeWave>("sine");
  const [cycles, setCycles] = React.useState(2);
  const [amplitude, setAmplitude] = React.useState(0.6);

  // At 1 ms per division the ten divisions span 10 ms.
  const hertz = cycles * 100;
  const peakToPeak = amplitude * 4;

  return (
    <div className="w-full max-w-[640px] rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,#12141b,#0a0b10)] p-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_40px_80px_-40px_rgb(0_0_0/0.9)] sm:p-4">
      <Oscilloscope wave={wave} frequency={cycles} amplitude={amplitude}>
        <span className="absolute left-5 top-5 flex items-center gap-2">
          <span className="rounded-[3px] bg-[rgb(var(--neon)/0.85)] px-1 py-0.5 text-[#030405] [text-shadow:none]">CH1</span>
          500 mV/div
        </span>
        <span className="absolute right-5 top-5">M 1.00 ms/div</span>
        <span className="absolute bottom-5 left-5 tabular-nums">
          {wave === "noise" ? "f ---" : `f ${hertz.toFixed(0)} Hz`}
        </span>
        <span className="absolute bottom-5 right-5 tabular-nums">Vpp {peakToPeak.toFixed(2)} V</span>
      </Oscilloscope>

      <div className="mt-4 grid gap-5 px-1 pb-1 sm:grid-cols-[auto_1fr_1fr] sm:items-end">
        <div className="grid gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Waveform</span>
          <ToggleGroup
            size="sm"
            aria-label="Waveform"
            value={wave}
            onValueChange={(value) => value && setWave(value as OscilloscopeWave)}
          >
            {waves.map((item) => (
              <ToggleGroupItem key={item.value} value={item.value} aria-label={item.label} title={item.label}>
                <svg viewBox="0 0 16 12" className="h-3 w-4" fill="none" aria-hidden>
                  <path d={item.path} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="grid gap-3">
          <span className="flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Cycles <span className="tabular-nums text-white/60">{cycles.toFixed(1)}</span>
          </span>
          <Slider
            size="sm"
            aria-label="Cycles on screen"
            min={1}
            max={6}
            step={0.5}
            value={[cycles]}
            onValueChange={([value]) => setCycles(value)}
          />
        </div>
        <div className="grid gap-3">
          <span className="flex justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            Amplitude <span className="tabular-nums text-white/60">{Math.round(amplitude * 100)}%</span>
          </span>
          <Slider
            size="sm"
            aria-label="Amplitude"
            min={0.1}
            max={0.95}
            step={0.05}
            value={[amplitude]}
            onValueChange={([value]) => setAmplitude(value)}
            formatValue={(value) => `${Math.round(value * 100)}%`}
          />
        </div>
      </div>
    </div>
  );
}
