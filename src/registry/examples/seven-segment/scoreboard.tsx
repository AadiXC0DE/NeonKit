"use client";

import * as React from "react";
import { Minus, Plus } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { SevenSegment } from "@/components/ui/seven-segment";

function Team({
  name,
  score,
  onChange,
}: {
  name: string;
  score: number;
  onChange: (score: number) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">{name}</span>
      <SevenSegment
        value={score}
        digits={2}
        color="red"
        aria-label={`${name} ${score}`}
        className="[--segment-h:52px] lg:[--segment-h:72px]"
      />
      <div className="flex gap-1">
        <Button size="icon" variant="ghost" className="size-8" aria-label={`${name} minus one`} onClick={() => onChange(Math.max(0, score - 1))}>
          <Minus />
        </Button>
        <Button size="icon" variant="ghost" className="size-8" aria-label={`${name} plus one`} onClick={() => onChange(Math.min(99, score + 1))}>
          <Plus />
        </Button>
      </div>
    </div>
  );
}

export default function SevenSegmentScoreboard() {
  const [home, setHome] = React.useState(3);
  const [away, setAway] = React.useState(1);

  return (
    <div className="grid w-full max-w-lg grid-cols-[1fr_auto_1fr] items-start gap-3 rounded-2xl border border-white/10 bg-[#07080b] px-3 py-6 lg:gap-4 lg:px-8">
      <Team name="Harbour" score={home} onChange={setHome} />
      <div className="flex flex-col items-center gap-3 pt-7">
        <SevenSegment
          value="12:48"
          color="amber"
          aria-label="12 minutes 48 seconds left"
          className="[--segment-h:22px] lg:[--segment-h:30px]"
        />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">Period</span>
          <SevenSegment value={3} size={20} color="amber" />
        </div>
      </div>
      <Team name="Visitors" score={away} onChange={setAway} />
    </div>
  );
}
