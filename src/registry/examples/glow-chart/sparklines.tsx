import { Sparkline } from "@/components/ui/glow-chart";

// Requests per minute over the last hour, sampled every 5 minutes.
const services = [
  { name: "auth-gateway", region: "fra1", rpm: "4,182", trend: [3920, 4010, 3980, 4105, 4060, 4120, 4210, 4150, 4090, 4170, 4230, 4182] },
  { name: "search-indexer", region: "iad1", rpm: "1,906", trend: [2310, 2280, 2190, 2205, 2140, 2080, 2050, 1990, 2010, 1960, 1930, 1906] },
  { name: "billing-webhooks", region: "sfo1", rpm: "312", trend: [288, 296, 301, 290, 305, 298, 410, 386, 322, 318, 309, 312] },
  { name: "image-resizer", region: "hnd1", rpm: "8,740", trend: [6120, 6480, 6910, 7230, 7510, 7690, 7980, 8150, 8320, 8510, 8660, 8740], live: true },
];

export default function GlowChartSparklines() {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-baseline justify-between border-b border-white/[0.06] px-5 py-3.5">
        <p className="text-sm font-medium text-white/90">Services</p>
        <p className="text-xs text-white/45">Requests / min · last hour</p>
      </div>
      <ul className="divide-y divide-white/[0.06]">
        {services.map((service) => (
          <li key={service.name} className="flex items-center gap-4 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[13px] text-white/85">{service.name}</p>
              <p className="text-xs text-white/40">{service.region}</p>
            </div>
            <Sparkline
              data={service.trend}
              width={88}
              height={28}
              live={service.live}
              label={`${service.name} requests per minute, last hour`}
            />
            <p className="w-14 text-right text-sm font-medium tabular-nums text-white/90">{service.rpm}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
