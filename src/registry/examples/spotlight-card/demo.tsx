import { SpotlightCard } from "@/components/ui/spotlight-card";

const regions = [
  { code: "fra1", ms: 38 },
  { code: "iad1", ms: 44 },
  { code: "hnd1", ms: 51 },
  { code: "gru1", ms: 63 },
];

export default function SpotlightCardDemo() {
  return (
    <div className="grid w-full max-w-3xl gap-3 sm:grid-cols-[1.35fr_1fr]">
      <SpotlightCard className="flex flex-col justify-between gap-8 p-6 sm:row-span-2">
        <div>
          <p className="text-sm text-white/55">Median time to first byte</p>
          <p className="mt-2 text-5xl font-semibold tabular-nums tracking-tight text-white/90">
            41<span className="ml-1 text-xl font-medium text-white/55">ms</span>
          </p>
        </div>
        <ul className="grid gap-2.5">
          {regions.map((region) => (
            <li key={region.code} className="grid grid-cols-[3rem_1fr_3rem] items-center gap-3 text-xs">
              <span className="font-mono text-white/60">{region.code}</span>
              <span className="h-1 rounded-full bg-white/[0.06]">
                <span
                  className="block h-full rounded-full bg-[rgb(var(--neon-accent,34_211_238)/0.7)]"
                  style={{ width: `${(region.ms / 70) * 100}%` }}
                />
              </span>
              <span className="text-right font-mono tabular-nums text-white/70">{region.ms} ms</span>
            </li>
          ))}
        </ul>
      </SpotlightCard>
      <SpotlightCard className="p-5">
        <p className="text-sm font-medium text-white/90">Signed builds</p>
        <p className="mt-1 text-sm leading-relaxed text-white/55">1,284 artifacts this week, each traceable to its commit.</p>
      </SpotlightCard>
      <SpotlightCard className="p-5">
        <p className="text-sm font-medium text-white/90">A preview per branch</p>
        <p className="mt-1 text-sm leading-relaxed text-white/55">37 live right now. Delete the branch and its URL goes with it.</p>
      </SpotlightCard>
    </div>
  );
}
