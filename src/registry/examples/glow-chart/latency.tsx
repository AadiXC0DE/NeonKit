"use client";

import { GlowChart } from "@/components/ui/glow-chart";

// Hourly API latency percentiles for Oct 10 (UTC), in milliseconds. The 14:00
// deploy shipped an N+1 query; it was rolled back at 15:20.
const p50 = [42, 40, 39, 38, 38, 40, 44, 51, 58, 61, 63, 62, 64, 66, 88, 71, 63, 60, 57, 54, 50, 47, 45, 43];
const p95 = [118, 112, 109, 104, 106, 112, 127, 151, 176, 184, 190, 187, 192, 198, 341, 236, 194, 183, 172, 163, 150, 139, 131, 124];
const p99 = [204, 196, 188, 181, 186, 197, 226, 268, 309, 322, 331, 327, 336, 352, 612, 418, 344, 318, 301, 287, 262, 243, 229, 215];

const hours = Array.from({ length: 24 }, (_, hour) => new Date(Date.UTC(2026, 9, 10, hour)));
const series = (values: number[]) => values.map((y, i) => ({ x: hours[i], y }));

export default function GlowChartLatency() {
  return (
    <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <p className="text-sm font-medium text-white/90">api.halcyon.dev · response time</p>
          <p className="mt-0.5 text-xs text-white/50">Oct 10, UTC · 2.41M requests</p>
        </div>
        <p className="text-xs text-white/50">1 SLO breach · 14:00–15:20</p>
      </div>
      <GlowChart
        className="mt-5"
        type="line"
        data={[
          { name: "p50", data: series(p50) },
          { name: "p95", data: series(p95), color: "violet" },
          { name: "p99", data: series(p99), color: "pink" },
        ]}
        label="API response time by percentile, hourly"
        xLabel="Hour"
        height={240}
        yDomain={[0, 700]}
        thresholds={[{ y: 500, label: "p99 SLO · 500 ms", color: "red" }]}
        yFormat={(value) => `${value} ms`}
      />
    </div>
  );
}
