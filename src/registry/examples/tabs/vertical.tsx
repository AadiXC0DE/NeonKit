import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const sections = [
  {
    value: "general",
    label: "General",
    title: "lumen-dashboard",
    rows: [
      ["Framework", "Next.js 16"],
      ["Root directory", "apps/dashboard"],
      ["Node.js", "22.x"],
    ],
  },
  {
    value: "domains",
    label: "Domains",
    title: "3 domains",
    rows: [
      ["lumenlabs.dev", "Production"],
      ["www.lumenlabs.dev", "Redirects to apex"],
      ["preview.lumenlabs.dev", "Preview branch"],
    ],
  },
  {
    value: "env",
    label: "Environment",
    title: "14 variables",
    rows: [
      ["DATABASE_URL", "Production, Preview"],
      ["STRIPE_SECRET_KEY", "Production"],
      ["NEXT_PUBLIC_POSTHOG_KEY", "All environments"],
    ],
  },
  {
    value: "git",
    label: "Git",
    title: "lumen-labs/dashboard",
    rows: [
      ["Production branch", "main"],
      ["Ignored build step", "None"],
      ["Connected", "Mar 4, 2026"],
    ],
  },
];

export default function TabsVertical() {
  return (
    <Tabs defaultValue="general" orientation="vertical" variant="underline" className="w-full max-w-lg gap-5 sm:gap-8">
      <TabsList aria-label="Project settings">
        {sections.map((section) => (
          <TabsTrigger key={section.value} value={section.value}>
            {section.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {sections.map((section) => (
        <TabsContent key={section.value} value={section.value} className="rounded-md pt-1">
          <h3 className="truncate text-sm font-medium text-white/90">{section.title}</h3>
          <dl className="mt-3 grid gap-2.5 text-sm">
            {section.rows.map(([term, detail]) => (
              <div key={term} className="grid gap-0.5">
                <dt className={section.value === "env" ? "truncate font-mono text-[13px] text-white/80" : "truncate text-white/80"}>
                  {term}
                </dt>
                <dd className="truncate text-xs text-white/50">{detail}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>
      ))}
    </Tabs>
  );
}
