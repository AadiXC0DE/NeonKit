import { Separator } from "@/components/ui/separator";

const stats = [
  { label: "Requests", value: "1.28M" },
  { label: "Error rate", value: "0.04%" },
  { label: "p95 latency", value: "182 ms" },
];

export default function SeparatorVertical() {
  return (
    <div className="grid w-full max-w-md gap-8">
      <div className="flex h-5 items-center gap-3 text-xs text-white/55">
        <span className="font-medium text-white/85">neonkit@1.1.0</span>
        <Separator orientation="vertical" />
        <span>MIT</span>
        <Separator orientation="vertical" />
        <span>4.2 kB gzipped</span>
        <Separator orientation="vertical" />
        <span>Published 3 days ago</span>
      </div>

      <div className="flex items-stretch rounded-xl border border-white/10 bg-white/[0.03] py-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex flex-1 items-stretch">
            {index > 0 && <Separator orientation="vertical" variant="tube" />}
            <div className="grid flex-1 gap-1 px-5">
              <span className="text-xs text-white/45">{stat.label}</span>
              <span className="text-lg font-semibold tabular-nums text-white/90">{stat.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
