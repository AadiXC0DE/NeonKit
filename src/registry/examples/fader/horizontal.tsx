"use client";

import * as React from "react";
import { Fader } from "@/components/ui/fader";

const blend = (v: number) => (v === 0 ? "Center" : v < 0 ? `${-v}% A` : `${v}% B`);

export default function FaderHorizontal() {
  const [position, setPosition] = React.useState(-30);
  const a = 50 - position;
  const b = 50 + position;

  return (
    <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] px-6 pb-5 pt-4">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="text-white/55">
          Deck A <span className="tabular-nums text-white/90">{a}%</span>
        </span>
        <span className="text-white/55">
          <span className="tabular-nums text-white/90">{b}%</span> Deck B
        </span>
      </div>
      <Fader
        orientation="horizontal"
        aria-label="Crossfader"
        min={-50}
        max={50}
        value={position}
        defaultValue={0}
        onValueChange={setPosition}
        ticks={[
          { value: -50, label: "A" },
          { value: -25, label: null },
          { value: 0, label: null },
          { value: 25, label: null },
          { value: 50, label: "B" },
        ]}
        formatValue={blend}
        className="w-full"
      />
    </div>
  );
}
