"use client";

import { Gauge, LayoutGrid, LogOut, Wallet } from "@/components/ui/icons";
import { Stat, StatGroup } from "@/components/ui/stat";

const kpis = [
  {
    label: "Recurring revenue",
    icon: Wallet,
    value: 48210,
    formatOptions: { style: "currency", currency: "USD", maximumFractionDigits: 0 } as const,
    delta: 8.2,
    trend: [36.1, 37.4, 38.9, 38.2, 40.6, 41.9, 43.3, 44.0, 45.8, 46.4, 47.1, 48.2],
  },
  {
    label: "Active workspaces",
    icon: LayoutGrid,
    value: 1284,
    delta: 3.1,
    trend: [1102, 1131, 1150, 1162, 1190, 1201, 1222, 1236, 1251, 1260, 1277, 1284],
  },
  {
    label: "p95 API latency",
    icon: Gauge,
    value: 182,
    unit: "ms",
    delta: -12.4,
    positive: "down" as const,
    trend: [231, 224, 240, 219, 210, 214, 198, 205, 191, 188, 186, 182],
  },
  {
    label: "Logo churn",
    icon: LogOut,
    value: 1.9,
    unit: "%",
    delta: 0.3,
    positive: "down" as const,
    formatDelta: (d: number) => `${Math.abs(d).toFixed(1)} pts`,
    trend: [1.4, 1.5, 1.5, 1.6, 1.4, 1.7, 1.6, 1.8, 1.7, 1.8, 2.0, 1.9],
  },
];

export default function StatDemo() {
  return (
    <StatGroup variant="framed" className="w-full max-w-5xl">
      {kpis.map((kpi) => (
        <Stat key={kpi.label} {...kpi} helper="vs. the previous 30 days" />
      ))}
    </StatGroup>
  );
}
