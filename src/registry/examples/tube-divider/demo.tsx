"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { TubeDivider } from "@/components/ui/tube-divider";

const lineup = [
  { time: "21:30", act: "Ivory Static", note: "Opening set" },
  { time: "22:45", act: "Mara & the Late Shift", note: "Live, two sets" },
  { time: "00:15", act: "Neon Parish", note: "DJ until close" },
];

export default function TubeDividerDemo() {
  const [on, setOn] = React.useState(true);

  return (
    <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.07] bg-[#08090d] px-6 pb-7 pt-6 sm:px-9">
      {/* Mortar lines on the wall */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(255_255_255/0.022)_0_1px,transparent_1px_30px)]"
      />

      <div className="relative flex items-center justify-between gap-4">
        <span className="text-sm font-medium text-white/70">The Halcyon Room</span>
        <Switch size="sm" label="Lights" checked={on} onCheckedChange={setOn} />
      </div>

      <div className="relative mt-6">
        <p className="text-3xl font-semibold tracking-[-0.02em] text-white/90" style={{ fontFamily: "var(--font-tilt-neon)" }}>
          Friday, Oct 16
        </p>
        <p className="mt-1 text-sm text-white/50">Doors 21:00 · 18+ · £14 on the door</p>
      </div>

      <TubeDivider shape="wave" on={on} flow className="my-7" />

      <ol className="relative grid gap-4">
        {lineup.map((slot) => (
          <li key={slot.time} className="grid grid-cols-[3.5rem_1fr] items-baseline gap-3">
            <span className="font-mono text-sm tabular-nums text-white/60">{slot.time}</span>
            <span>
              <span className="block text-base font-medium text-white/90">{slot.act}</span>
              <span className="block text-xs text-white/55">{slot.note}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
