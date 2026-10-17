"use client";

import * as React from "react";
import { TimeInput } from "@/components/ui/time-input";

const DAY = 24 * 60;

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

export default function TimeInputDemo() {
  const [from, setFrom] = React.useState("22:30");
  const [until, setUntil] = React.useState("07:00");

  const complete = from !== "" && until !== "";
  const start = complete ? toMinutes(from) : 0;
  const end = complete ? toMinutes(until) : 0;
  const length = complete ? (end - start + DAY) % DAY : 0;
  // A window that crosses midnight is drawn as two pieces.
  const pieces = !complete || length === 0 ? [] : start < end ? [[start, end]] : [[start, DAY], [0, end]];

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-5 [--neon:var(--neon-accent,34_211_238)]">
      <p className="text-sm font-medium text-white/90">Quiet hours</p>
      <p className="mt-1 text-xs leading-5 text-white/55">Notifications pause and calls go straight to voicemail.</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <TimeInput label="From" value={from} onValueChange={setFrom} minuteStep={15} />
        <TimeInput label="Until" value={until} onValueChange={setUntil} minuteStep={15} />
      </div>

      <div className="mt-5">
        <div aria-hidden className="relative h-2 rounded-full border border-white/10 bg-white/[0.04]">
          {pieces.map(([a, b]) => (
            <span
              key={a}
              style={{ left: `${(a / DAY) * 100}%`, width: `${((b - a) / DAY) * 100}%` }}
              className="absolute -inset-y-px rounded-full border border-[rgb(var(--neon)/0.6)] bg-[rgb(var(--neon)/0.35)] shadow-[0_0_12px_rgb(var(--neon)/0.5)]"
            />
          ))}
        </div>
        <div aria-hidden className="mt-1.5 flex justify-between text-[10px] tabular-nums text-white/35">
          <span>00</span>
          <span>06</span>
          <span>12</span>
          <span>18</span>
          <span>24</span>
        </div>
      </div>

      <p aria-live="polite" className="mt-3 text-xs text-white/55">
        {complete ? (
          <>
            <span className="font-medium tabular-nums text-white/90">
              {Math.floor(length / 60)} h {length % 60 ? `${length % 60} m` : ""}
            </span>{" "}
            of quiet every night
          </>
        ) : (
          "Fill in both times to set the window."
        )}
      </p>
    </div>
  );
}
