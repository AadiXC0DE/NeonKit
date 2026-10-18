import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const panels = [
  {
    value: "overview",
    label: "Overview",
    text: "3 projects, 12 members and 41 deployments this week.",
    facts: [
      ["Projects", "3"],
      ["Deploys this week", "41"],
      ["Build minutes", "4,410 / 6,000"],
    ],
  },
  {
    value: "deployments",
    label: "Deployments",
    text: "The last production deploy went live 2 minutes ago from main.",
    facts: [
      ["Production", "a41f9c2 · 2m ago"],
      ["Previews open", "7"],
      ["Median build", "1m 12s"],
    ],
  },
  {
    value: "logs",
    label: "Logs",
    text: "Streaming runtime logs from 4 regions. Nothing above warning level today.",
    facts: [
      ["Regions", "fra1, iad1, hnd1, sfo1"],
      ["Warnings, 24h", "12"],
      ["Errors, 24h", "0"],
    ],
  },
];

export default function TabsManual() {
  return (
    <Tabs defaultValue="overview" activationMode="manual" variant="underline" className="w-full max-w-md">
      <TabsList>
        {panels.map((panel) => (
          <TabsTrigger key={panel.value} value={panel.value}>
            {panel.label}
          </TabsTrigger>
        ))}
        <TabsTrigger value="billing" disabled>
          Billing
        </TabsTrigger>
      </TabsList>
      {panels.map((panel) => (
        <TabsContent key={panel.value} value={panel.value} className="rounded-md">
          <p className="text-sm leading-relaxed text-white/55">{panel.text}</p>
          <dl className="mt-4 grid gap-2 text-sm">
            {panel.facts.map(([term, value]) => (
              <div key={term} className="flex items-baseline justify-between gap-4 border-b border-white/[0.06] pb-2">
                <dt className="text-white/55">{term}</dt>
                <dd className="truncate tabular-nums text-white/90">{value}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>
      ))}
    </Tabs>
  );
}
