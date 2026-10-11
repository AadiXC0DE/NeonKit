import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const panels = [
  { value: "overview", label: "Overview", text: "3 projects, 12 members and 41 deployments this week." },
  { value: "deployments", label: "Deployments", text: "The last production deploy went live 2 minutes ago from main." },
  { value: "logs", label: "Logs", text: "Streaming runtime logs from 4 regions. Nothing above warning level today." },
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
        <TabsContent key={panel.value} value={panel.value} className="rounded-md text-sm leading-relaxed text-white/55">
          {panel.text}
        </TabsContent>
      ))}
    </Tabs>
  );
}
