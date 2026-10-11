"use client";

import * as React from "react";
import { Gauge } from "@/components/ui/gauge";

// A five-speed car on a loop: launch, run through the gears, cruise, brake, idle.
const ratios = [0, 0.118, 0.07, 0.048, 0.037, 0.03];
const IDLE = 0.85;

type Car = { speed: number; rpm: number; gear: number; phase: "idle" | "accelerate" | "cruise" | "brake"; clock: number };

function step(car: Car): Car {
  const clock = car.clock + 0.1;
  let { speed, gear, phase } = car;

  if (phase === "idle" && clock > 2) phase = "accelerate";
  if (phase === "accelerate") {
    speed += Math.max(0.6, 4.2 - gear * 0.65);
    if (gear === 0) gear = 1;
    if (speed * ratios[gear] + IDLE > 6.4 && gear < 5) gear += 1;
    if (speed >= 168) phase = "cruise";
  } else if (phase === "cruise") {
    speed += (152 - speed) * 0.05;
    if (clock > 17) phase = "brake";
  } else if (phase === "brake") {
    speed = Math.max(0, speed - 4.5);
    while (gear > 1 && speed * ratios[gear - 1] + IDLE < 3.2) gear -= 1;
    if (speed === 0) return { speed: 0, rpm: IDLE, gear: 0, phase: "idle", clock: 0 };
  }

  const rpm = gear === 0 ? IDLE : Math.min(7.4, speed * ratios[gear] + IDLE);
  return { speed, rpm, gear, phase, clock };
}

export default function GaugeDemo() {
  const [car, setCar] = React.useState<Car>({ speed: 0, rpm: 0, gear: 0, phase: "idle", clock: 0 });

  React.useEffect(() => {
    // Ignition: every needle sweeps to the stop and back, then the engine idles.
    let interval = 0;
    const sweep = window.setTimeout(() => setCar((c) => ({ ...c, speed: 260, rpm: 8 })), 150);
    const settle = window.setTimeout(() => {
      setCar({ speed: 0, rpm: IDLE, gear: 0, phase: "idle", clock: 0 });
      interval = window.setInterval(() => setCar(step), 100);
    }, 850);
    return () => {
      window.clearTimeout(sweep);
      window.clearTimeout(settle);
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="relative w-full max-w-[680px] rounded-[40px] border border-white/[0.06] bg-[radial-gradient(ellipse_at_50%_0%,#161a22,#07080c_70%)] px-6 pb-8 pt-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),inset_0_-20px_40px_-20px_rgb(0_0_0/0.8),0_30px_60px_-30px_rgb(0_0_0/0.9)]">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-6">
        <Gauge
          label="×1000 r/min"
          value={car.rpm}
          min={0}
          max={8}
          ticks={8}
          redline={6.5}
          formatValue={(v) => String(Math.round((v * 1000) / 50) * 50)}
        />
        <div className="flex w-24 flex-col items-center gap-3">
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">Gear</span>
          <span
            aria-live="off"
            className="text-5xl font-semibold tabular-nums leading-none [color:color-mix(in_srgb,rgb(var(--neon-accent,34_211_238))_30%,white)] [text-shadow:0_0_8px_rgb(var(--neon-accent,34_211_238)),0_0_22px_rgb(var(--neon-accent,34_211_238)/0.6)]"
          >
            {car.gear === 0 ? "N" : car.gear}
          </span>
          <span className="font-mono text-[11px] tabular-nums text-white/40">
            {car.phase === "brake" ? "Braking" : car.phase === "idle" ? "Idle" : car.phase === "cruise" ? "Cruise" : "Launch"}
          </span>
        </div>
        <Gauge
          label="Speed"
          unit="km/h"
          value={car.speed}
          min={0}
          max={260}
          ticks={13}
          formatValue={(v) => String(Math.round(v))}
        />
      </div>
    </div>
  );
}
