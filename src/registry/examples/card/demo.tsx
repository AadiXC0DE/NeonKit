import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  { label: "Bandwidth", used: "182.4 GB", limit: "1 TB", percent: 18 },
  { label: "Edge requests", used: "1.24M", limit: "10M", percent: 12 },
  { label: "Build minutes", used: "4,410", limit: "6,000", percent: 74 },
  { label: "Image optimizations", used: "4,612", limit: "5,000", percent: 92, warn: true },
];

export default function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Usage this month</CardTitle>
          <span className="text-xs text-white/40">Oct 1 – 31</span>
        </div>
        <CardDescription>Pro plan · resets in 20 days</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-5">
        <div>
          <p className="text-3xl font-semibold tabular-nums tracking-tight text-white">$38.20</p>
          <p className="mt-1 text-xs text-white/50">Estimated bill, including $18.20 in overages</p>
        </div>
        <div className="grid gap-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="grid gap-2">
              <div className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-white/55">{metric.label}</span>
                <span className="tabular-nums text-white/90">
                  {metric.used} <span className="text-white/35">/ {metric.limit}</span>
                </span>
              </div>
              <div className="h-1 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={
                    metric.warn
                      ? "h-full rounded-full bg-[rgb(251_191_36)] shadow-[0_0_8px_rgb(251_191_36/0.6)]"
                      : "h-full rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/0.6)]"
                  }
                  style={{ width: `${metric.percent}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t border-white/[0.06] pt-4">
        <span className="text-xs text-white/40">Updated 4 minutes ago</span>
        <Button variant="ghost" size="sm" className="-mr-3">
          View breakdown
        </Button>
      </CardFooter>
    </Card>
  );
}
