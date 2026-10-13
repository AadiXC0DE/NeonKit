"use client";

import { DonutChart } from "@/components/ui/donut-chart";

const spend = [
  { label: "Compute", value: 18420 },
  { label: "Managed Postgres", value: 9860 },
  { label: "Object storage", value: 4120 },
  { label: "Bandwidth", value: 2730 },
  { label: "Other", value: 1180 },
];

const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function DonutChartPie() {
  return (
    <DonutChart
      variant="pie"
      data={spend}
      label="Cloud spend, September"
      formatValue={(v) => dollars.format(v)}
      size={220}
      gap={4}
      className="w-full max-w-[600px] justify-center"
    />
  );
}
