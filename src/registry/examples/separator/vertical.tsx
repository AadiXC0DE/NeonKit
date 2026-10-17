import { Separator } from "@/components/ui/separator";

const stats = [
  { label: "Requests", value: "1.28M" },
  { label: "Error rate", value: "0.04%" },
  { label: "p95 latency", value: "182 ms" },
];

export default function SeparatorVertical() {
  return (
    <div className="grid w-full max-w-md gap-8">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/55 [&>span]:whitespace-nowrap">
        <span className="font-medium text-white/85">neonkit@1.1.0</span>
        <Separator orientation="vertical" className="h-3.5 self-center" />
        <span>MIT</span>
        <Separator orientation="vertical" className="h-3.5 self-center" />
        <span>4.2 kB gzipped</span>
        {/* On a phone the date wraps to its own line, so it doesn't need a rule before it. */}
        <Separator orientation="vertical" className="hidden h-3.5 self-center sm:block" />
        <span>Published 3 days ago</span>
      </div>

      <div className="flex items-stretch rounded-xl border border-white/10 bg-white/[0.03] py-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex min-w-0 flex-1 items-stretch">
            {index > 0 && <Separator orientation="vertical" />}
            <div className="grid min-w-0 flex-1 gap-1 px-4 sm:px-5">
              <span className="truncate text-xs text-white/50">{stat.label}</span>
              <span className="whitespace-nowrap text-base font-semibold tabular-nums text-white/90 sm:text-lg">
                {stat.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
