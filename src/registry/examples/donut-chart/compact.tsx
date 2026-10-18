"use client";

import { DonutChart } from "@/components/ui/donut-chart";

const budgets = [
  {
    name: "Error budget left",
    detail: "99.9% SLO, 30-day window",
    value: 62,
    max: 100,
    format: (v: number) => `${v}%`,
    color: undefined,
  },
  { name: "Seats taken", detail: "6 left on the Team plan", value: 44, max: 50, format: (v: number) => `${v}/50`, color: "amber" },
  {
    name: "Build minutes",
    detail: "2,780 of 3,000, resets Nov 1",
    value: 2780,
    max: 3000,
    format: (v: number) => `${(v / 1000).toFixed(1)}k`,
    color: "red",
  },
];

export default function DonutChartCompact() {
  return (
    <div className="grid w-full max-w-[600px] grid-cols-1 gap-8 sm:grid-cols-3">
      {budgets.map((b) => (
        <figure key={b.name} className="flex items-center gap-4 sm:flex-col sm:gap-3">
          <DonutChart
            data={[{ label: b.name, value: b.value, color: b.color }]}
            max={b.max}
            label={b.name}
            centerLabel={null}
            formatValue={b.format}
            size={104}
            thickness={0.1}
            showLegend={false}
          />
          <figcaption className="grid gap-0.5 sm:text-center">
            <span className="text-[14px] text-white/80">{b.name}</span>
            <span className="text-xs text-white/50">{b.detail}</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
