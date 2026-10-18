import { ContextMeter } from "@/components/ui/context-meter";

const SESSIONS = [
  {
    title: "Billing webhooks retry storm",
    model: "Argon 2",
    limit: 200_000,
    parts: [
      { label: "System prompt", tokens: 3_100 },
      { label: "Conversation", tokens: 61_200 },
      { label: "Files", tokens: 24_800 },
      { label: "Tools", tokens: 9_400 },
    ],
  },
  {
    title: "Migrate auth to passkeys",
    model: "Argon 2 Long",
    limit: 1_000_000,
    parts: [
      { label: "System prompt", tokens: 3_100 },
      { label: "Conversation", tokens: 212_000 },
      { label: "Files", tokens: 498_000 },
      { label: "Tools", tokens: 14_600 },
    ],
  },
];

export default function ContextMeterSidebar() {
  return (
    <div className="grid w-full max-w-[18rem] gap-5">
      {SESSIONS.map((session) => (
        <div key={session.title} className="grid gap-3">
          <div className="grid gap-0.5">
            <p className="truncate text-[14px] font-medium text-white/90">{session.title}</p>
            <p className="text-[12.5px] text-white/50">{session.model}</p>
          </div>
          <ContextMeter size="md" limit={session.limit} parts={session.parts} breakdown />
        </div>
      ))}
    </div>
  );
}
