"use client";

import * as React from "react";
import { Radar } from "@/components/ui/radar";

// Vessels on steady courses: start position and drift per update, in units of
// the scope's radius (x east, y north).
const vessels = [
  { label: "MV ARCTURUS", x: -0.6, y: 0.3, dx: 0.012, dy: -0.004 },
  { label: "TUG 7", x: 0.25, y: -0.5, dx: -0.002, dy: 0.008 },
  { label: "SV LORELEI", x: 0.55, y: 0.45, dx: -0.006, dy: -0.006 },
];

function toPolar(x: number, y: number) {
  const angle = (Math.atan2(x, y) * 180) / Math.PI;
  return { angle: (angle + 360) % 360, distance: Math.min(1, Math.hypot(x, y)) };
}

export default function RadarTracking() {
  const [step, setStep] = React.useState(0);

  // One update per sweep, like a real plot refresh.
  React.useEffect(() => {
    const timer = setInterval(() => setStep((value) => (value + 1) % 90), 4000);
    return () => clearInterval(timer);
  }, []);

  const blips = vessels.map((vessel) => ({
    label: vessel.label,
    ...toPolar(vessel.x + vessel.dx * step, vessel.y + vessel.dy * step),
  }));

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
      <Radar blips={blips} rings={5} label="Harbour approach" />
      <table className="font-mono text-xs text-white/70">
        <thead>
          <tr className="text-left text-[10px] uppercase tracking-[0.14em] text-white/40">
            <th className="pb-2 pr-5 font-normal">Contact</th>
            <th className="pb-2 pr-5 font-normal">Brg</th>
            <th className="pb-2 font-normal">Rng</th>
          </tr>
        </thead>
        <tbody>
          {blips.map((blip) => (
            <tr key={blip.label}>
              <td className="py-1 pr-5 text-white/85">{blip.label}</td>
              <td className="py-1 pr-5 tabular-nums">{String(Math.round(blip.angle)).padStart(3, "0")}°</td>
              <td className="py-1 tabular-nums">{(blip.distance * 6).toFixed(1)} nm</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
