"use client";

import * as React from "react";
import { Meter } from "@/components/ui/meter";

const resources = [
  { name: "CPU", base: 0.46, swing: 0.3 },
  { name: "Memory", base: 0.71, swing: 0.06 },
  { name: "Disk I/O", base: 0.22, swing: 0.4 },
];

// A host's load wanders once a second; the peak marker shows the recent high.
export default function MeterServerLoad() {
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => setTick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-white/90">edge-fra-02</p>
        <p className="text-xs text-white/50">Updated every second</p>
      </div>
      <div className="grid gap-3">
        {resources.map((resource, i) => {
          // Deterministic wobble, so the first render matches the server.
          const wobble = Math.sin(tick * (0.9 + i * 0.7) + i * 2) * Math.sin(tick * 0.37 + i);
          const value = Math.min(1, Math.max(0, resource.base + wobble * resource.swing));
          return (
            <div key={resource.name} className="grid grid-cols-[4.5rem_1fr_2.75rem] items-center gap-3">
              <span id={`load-${i}`} className="text-xs text-white/60">
                {resource.name}
              </span>
              <Meter aria-labelledby={`load-${i}`} size="sm" segments={20} value={value} peakHold={2500} className="w-full" />
              <span className="text-right font-mono text-xs tabular-nums text-white/75">{Math.round(value * 100)}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
