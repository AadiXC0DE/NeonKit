"use client";

import { DonutChart } from "@/components/ui/donut-chart";

const usage = [
  { label: "Photos", value: 182 },
  { label: "Apps", value: 96 },
  { label: "System", value: 41 },
  { label: "Messages", value: 23 },
  { label: "Other", value: 12 },
];

export default function DonutChartStorage() {
  return (
    <DonutChart
      data={usage}
      max={512}
      label="Used of 512 GB"
      remainderLabel="Free"
      formatValue={(v) => `${v} GB`}
      size={220}
      thickness={0.11}
      className="w-full max-w-[600px] justify-center"
    />
  );
}
