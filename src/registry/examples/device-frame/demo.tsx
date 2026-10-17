import { DeviceFrame } from "@/components/ui/device-frame";

// Sized in cqw (a share of the screen's width), so the page scales like a screenshot at any frame size.
const hours = [38, 42, 35, 30, 27, 24, 26, 33, 48, 61, 72, 78, 81, 77, 74, 79, 86, 91, 84, 70, 62, 55, 49, 44];
const pipelines = [
  { name: "billing-events", route: "Stripe → Snowflake", rate: "412/min", ok: true },
  { name: "repo-activity", route: "GitHub → Postgres", rate: "268/min", ok: true },
  { name: "support-sync", route: "Linear → Slack", rate: "51/min", ok: true },
  { name: "lead-routing", route: "Webflow → HubSpot", rate: "12/min", ok: true },
  { name: "error-digest", route: "Sentry → Slack", rate: "paused", ok: false },
];

export default function DeviceFrameDemo() {
  return (
    <DeviceFrame url="relay.dev/acme/pipelines" className="max-w-2xl">
      <div className="flex h-full text-[1.75cqw] text-white/80">
        <aside className="w-[17cqw] shrink-0 border-r border-white/[0.06] p-[2.4cqw]">
          <p className="font-medium text-white/90">acme</p>
          <ul className="mt-[3cqw] space-y-[1.4cqw] text-white/50">
            <li className="-mx-[1cqw] rounded-[0.8cqw] bg-white/[0.05] px-[1cqw] py-[0.5cqw] text-white/90">Pipelines</li>
            <li>Endpoints</li>
            <li>Deliveries</li>
            <li>Replays</li>
            <li>Settings</li>
          </ul>
        </aside>
        <main className="min-w-0 flex-1 p-[2.8cqw]">
          <div className="flex items-baseline justify-between">
            <p className="text-[2.6cqw] font-semibold tracking-tight text-white/90">Pipelines</p>
            <p className="text-white/45">Last 24 h</p>
          </div>
          <dl className="mt-[2.4cqw] grid grid-cols-3 gap-[2cqw]">
            {[
              ["Events", "1.84M"],
              ["Delivered", "99.96%"],
              ["p95 latency", "212 ms"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-white/45">{label}</dt>
                <dd className="mt-[0.4cqw] font-mono text-[2.6cqw] tabular-nums text-white/90">{value}</dd>
              </div>
            ))}
          </dl>
          <div aria-hidden className="mt-[2.6cqw] flex h-[10cqw] items-end gap-[0.5cqw] border-b border-white/[0.06]">
            {hours.map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className={
                  i === hours.length - 1
                    ? "flex-1 rounded-t-[0.4cqw] bg-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]"
                    : "flex-1 rounded-t-[0.4cqw] bg-[rgb(var(--neon)/0.28)]"
                }
              />
            ))}
          </div>
          <ul className="mt-[2.2cqw] divide-y divide-white/[0.05]">
            {pipelines.map((p) => (
              <li key={p.name} className="flex items-center gap-[1.6cqw] py-[1.1cqw]">
                <span
                  className={
                    p.ok
                      ? "size-[1cqw] shrink-0 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1)))]"
                      : "size-[1cqw] shrink-0 rounded-full bg-white/20"
                  }
                />
                <span className="w-[22cqw] truncate font-mono text-white/85">{p.name}</span>
                <span className="flex-1 truncate text-white/45">{p.route}</span>
                <span className="font-mono tabular-nums text-white/60">{p.rate}</span>
              </li>
            ))}
          </ul>
        </main>
      </div>
    </DeviceFrame>
  );
}
