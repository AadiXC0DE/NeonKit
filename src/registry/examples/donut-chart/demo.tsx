import { DonutChart } from "@/components/ui/donut-chart";

const channels = [
  { label: "Direct", value: 18240 },
  { label: "Organic search", value: 12906 },
  { label: "Referral", value: 6118 },
  { label: "Social", value: 3402 },
  { label: "Email", value: 1977 },
];

export default function DonutChartDemo() {
  return (
    <DonutChart
      data={channels}
      label="Sessions this week"
      size={240}
      className="w-full max-w-[600px] justify-center"
    />
  );
}
