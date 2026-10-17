"use client";

import { Heatmap, type HeatmapDatum } from "@/components/ui/heatmap";

// Q3 2026, minutes of reading logged per day.
const MINUTES: HeatmapDatum[] = Array.from({ length: 92 }, (_, i) => {
  const date = new Date(Date.UTC(2026, 6, 1 + i));
  const dow = date.getUTCDay();
  const holiday = i >= 38 && i <= 47;
  const value = holiday ? 55 + ((i * 13) % 40) : dow === 0 || dow === 6 ? (i * 17) % 70 : i % 9 === 4 ? 0 : 12 + ((i * 11) % 28);
  return { date: date.toISOString().slice(0, 10), value };
});

const TOTAL = MINUTES.reduce((sum, d) => sum + d.value, 0);

export default function HeatmapQuarter() {
  return (
    <Heatmap
      color="lime"
      aria-label="Minutes read per day, July to September 2026"
      data={MINUTES}
      start="2026-07-01"
      end="2026-09-30"
      weekStart={1}
      cellSize={20}
      gap={4}
      formatValue={(v) => (v === 0 ? "Didn’t read" : `${v} min`)}
      legendLabels={["0 min", "90 min"]}
      max={90}
      footer={
        <span>
          <span className="tabular-nums text-white/80">{Math.round(TOTAL / 60)} hours</span> in Q3, weeks from Monday
        </span>
      }
    />
  );
}
