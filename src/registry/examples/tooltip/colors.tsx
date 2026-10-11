import { Tooltip } from "@/components/ui/tooltip";

const services = [
  { name: "API", color: "green", hex: "#34d399", detail: "Operational · 99.99% uptime this month" },
  { name: "Webhooks", color: "amber", hex: "#fbbf24", detail: "Degraded · p95 latency 1.8s in eu-west-1" },
  { name: "Edge network", color: "red", hex: "#ff4d5e", detail: "Outage · investigating 503s in ap-south-1" },
  { name: "Builds", color: "blue", hex: "#4f8bff", detail: "Maintenance · queue paused until 14:00 UTC" },
] as const;

export default function TooltipColors() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {services.map((service) => (
        <Tooltip key={service.name} color={service.color} content={service.detail}>
          <button
            type="button"
            className="inline-flex h-8 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-xs text-white/70 outline-none transition-colors duration-150 hover:border-white/20 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
          >
            <span
              aria-hidden
              className="size-1.5 rounded-full"
              style={{ backgroundColor: service.hex, boxShadow: `0 0 8px ${service.hex}` }}
            />
            {service.name}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
