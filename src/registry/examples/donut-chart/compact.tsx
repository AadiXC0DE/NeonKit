"use client";

import { DonutChart } from "@/components/ui/donut-chart";

const budgets = [
  { name: "Error budget left", value: 62, max: 100, format: (v: number) => `${v}%`, color: undefined },
  { name: "Seats taken", value: 44, max: 50, format: (v: number) => `${v}/50`, color: "amber" },
  { name: "Build minutes", value: 2780, max: 3000, format: (v: number) => `${(v / 1000).toFixed(1)}k`, color: "red" },
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
          <figcaption className="text-[14px] text-white/60">{b.name}</figcaption>
        </figure>
      ))}
    </div>
  );
}
