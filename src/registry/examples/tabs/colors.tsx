import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const charts = [
  {
    color: "violet",
    metric: "Visitors",
    values: { "24h": "1,284", "7d": "9,617", "30d": "41,902" },
  },
  {
    color: "lime",
    metric: "Deployments",
    values: { "24h": "38", "7d": "214", "30d": "906" },
  },
  {
    color: "pink",
    metric: "Errors",
    values: { "24h": "3", "7d": "27", "30d": "112" },
  },
] as const;

const ranges = ["24h", "7d", "30d"] as const;

export default function TabsColors() {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {charts.map((chart) => (
        <Tabs key={chart.color} color={chart.color} defaultValue="7d" className="items-center gap-5">
          <TabsList aria-label={`${chart.metric} time range`}>
            {ranges.map((range) => (
              <TabsTrigger key={range} value={range} className="tabular-nums">
                {range}
              </TabsTrigger>
            ))}
          </TabsList>
          {ranges.map((range) => (
            <TabsContent key={range} value={range} className="rounded-md text-center">
              <p className="text-2xl font-semibold tabular-nums tracking-tight text-white">{chart.values[range]}</p>
              <p className="mt-1 text-xs text-white/50">{chart.metric}</p>
            </TabsContent>
          ))}
        </Tabs>
      ))}
    </div>
  );
}
