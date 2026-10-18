"use client";

import { Heatmap } from "@/components/ui/heatmap";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOURS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));

// Failed CI runs by hour (UTC): the morning merge rush, a nightly e2e suite at 02:00, quiet weekends.
const FAILURES: number[][] = DAYS.map((_, d) =>
  HOURS.map((_, h) => {
    const weekend = d >= 5;
    const rush = Math.exp(-((h - 10) ** 2) / 6) * 14 + Math.exp(-((h - 15) ** 2) / 8) * 9;
    const nightly = h === 2 ? 6 : 0;
    const base = weekend ? rush * 0.12 + nightly * 0.5 : rush + nightly;
    return Math.round(base * (1 + ((d * 7 + h * 3) % 5) / 10));
  }),
);

export default function HeatmapMatrix() {
  return (
    <div className="grid w-full max-w-3xl gap-3">
      <p className="text-[13px] text-white/50">
        Failed CI runs by weekday and hour, UTC. Last 30 days.
      </p>
      <Heatmap
        aria-label="Failed CI runs by weekday and hour"
        rows={DAYS}
        columns={HOURS}
        values={FAILURES}
        unit={["failed run", "failed runs"]}
        formatLabel={(day, hour) => `${day} ${hour}:00 UTC`}
        cellSize={26}
        levels={5}
        footer="The 02:00 column is the nightly end-to-end suite."
      />
    </div>
  );
}
