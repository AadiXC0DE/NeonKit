"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Fader } from "@/components/ui/fader";

const bands = ["31", "63", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

const presets: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  Vocal: [-6, -4, -2, 0, 2, 4, 5, 4, 2, 0],
  "Bass boost": [8, 7, 5, 2, 0, 0, 0, 0, 1, 2],
};

const scale = [
  { value: 12, label: null },
  { value: 6, label: null },
  { value: 0, label: null },
  { value: -6, label: null },
  { value: -12, label: null },
];

const gain = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)} dB`;

export default function FaderEqualizer() {
  const [gains, setGains] = React.useState(presets.Vocal);

  return (
    <div className="w-full max-w-[560px] rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-white/90">Graphic EQ</span>
        <div className="flex gap-1.5">
          {Object.keys(presets).map((name) => (
            <Button key={name} size="sm" variant="ghost" onClick={() => setGains(presets[name])}>
              {name}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex justify-between overflow-x-auto">
        {bands.map((band, i) => (
          <Fader
            key={band}
            size="sm"
            label={band}
            aria-label={`${band} Hz`}
            min={-12}
            max={12}
            step={0.5}
            defaultValue={0}
            value={gains[i]}
            onValueChange={(value) => setGains((current) => current.map((g, j) => (j === i ? value : g)))}
            ticks={scale}
            formatValue={gain}
            className="h-44"
          />
        ))}
      </div>
    </div>
  );
}
