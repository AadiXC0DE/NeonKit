"use client";

import { GlowChart } from "@/components/ui/glow-chart";

// Monthly recurring revenue at the start of each month, in dollars.
const mrr = [
  182_400, 189_950, 196_200, 194_800, 203_600, 211_900, 218_300, 226_750, 233_100, 241_600, 256_480, 268_920,
];

const data = mrr.map((y, i) => ({ x: new Date(Date.UTC(2025, 10 + i, 1)), y }));

const compact = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: "compact", maximumFractionDigits: 0 });
const exact = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function GlowChartRevenue() {
  return (
    <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <p className="text-sm text-white/55">Monthly recurring revenue</p>
          <p className="mt-1 text-3xl font-semibold tracking-[-0.02em] text-white">$268,920</p>
        </div>
        <p className="text-xs text-white/45">
          <span className="font-medium text-[rgb(52_211_153)]">+4.9%</span> vs September · 47.4% year over year
        </p>
      </div>
      <GlowChart
        className="mt-6"
        type="bar"
        data={data}
        label="Monthly recurring revenue, November 2025 to October 2026"
        height={220}
        thresholds={[{ y: 250_000, label: "Q4 target · $250K" }]}
        yFormat={(value, context) => (context === "axis" ? compact.format(value) : exact.format(value))}
      />
    </div>
  );
}
