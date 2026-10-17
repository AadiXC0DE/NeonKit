import { StatusLight, StatusLightGroup } from "@/components/ui/status-light";

const services = [
  { name: "API gateway", detail: "p95 182 ms across 4 regions", state: "on", word: "Operational" },
  { name: "Auth", detail: "Sign-ins, sessions and tokens", state: "on", word: "Operational" },
  { name: "Realtime", detail: "Elevated latency in eu-west-1", state: "warning", word: "Degraded" },
  { name: "Webhooks", detail: "Retrying 1,204 deliveries", state: "alert", word: "Investigating", color: "red" },
  { name: "Nightly backups", detail: "Next run at 02:00 UTC", state: "standby", word: "Scheduled" },
  { name: "Legacy v1 API", detail: "Retired on 30 September", state: "off", word: "Retired" },
] as const;

export default function StatusLightDemo() {
  return (
    <div className="w-full max-w-[520px]">
      <div className="flex items-baseline justify-between gap-4 pb-2">
        <h3 className="text-[17px] font-semibold text-white/90">Halcyon status</h3>
        <span className="font-mono text-[12px] tabular-nums text-white/50">14:02 UTC</span>
      </div>
      <p className="pb-3 text-[14px] leading-6 text-white/60">
        One incident open. Webhook deliveries are queued and will retry in order.
      </p>
      <StatusLightGroup aria-label="Services" className="border-t border-white/[0.06]">
        {services.map((service) => (
          <StatusLight
            key={service.name}
            state={service.state}
            stateLabel={service.word}
            label={service.name}
            description={service.detail}
            color={"color" in service ? service.color : undefined}
          />
        ))}
      </StatusLightGroup>
    </div>
  );
}
