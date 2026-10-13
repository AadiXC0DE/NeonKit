import { Heartbeat } from "@/components/ui/heartbeat";

const services = [
  { name: "api", region: "eu-west-1", pulse: 66, latency: "42 ms" },
  { name: "billing-worker", region: "us-east-1", pulse: 54, latency: "118 ms" },
  { name: "search-indexer", region: "eu-west-1", pulse: 0, latency: "no response for 3 min" },
];

export default function HeartbeatServiceStatus() {
  return (
    <ul className="w-full max-w-md divide-y divide-white/[0.07] rounded-xl border border-white/10 bg-white/[0.02]">
      {services.map((service) => (
        <li key={service.name} className="grid grid-cols-[1fr_7rem] items-center gap-4 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate font-mono text-[13px] text-white/90">{service.name}</p>
            <p className={service.pulse ? "text-xs text-white/55" : "text-xs text-[#ff4d5e]"}>
              {service.region} · {service.latency}
            </p>
          </div>
          {/* Each service's check-in rate drives its pulse; no check-ins flatlines it. */}
          <Heartbeat
            bpm={service.pulse}
            height={36}
            color={service.pulse ? undefined : "red"}
            aria-label={service.pulse ? `${service.name} is up` : `${service.name} is down`}
          />
        </li>
      ))}
    </ul>
  );
}
