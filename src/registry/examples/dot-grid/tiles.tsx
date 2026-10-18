import { DotGrid } from "@/components/ui/dot-grid";

const tiles = [
  { value: "312", label: "edge locations, each with a full copy of your traces" },
  { value: "0.4%", label: "CPU overhead at p99 with the default agent" },
];

export default function DotGridTiles() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      {tiles.map((tile, i) => (
        <div
          key={tile.value}
          className="relative flex h-52 flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-[#0a0c12] p-6"
        >
          <DotGrid spacing={14} size={1.25} radius={120} fade={false} ripples={i === 0} />
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,#0a0c12_25%,transparent_80%)]" />
          <p className="relative text-4xl font-semibold tabular-nums tracking-[-0.03em] text-white/95">{tile.value}</p>
          <p className="relative mt-1.5 max-w-[30ch] text-sm leading-relaxed text-white/60">{tile.label}</p>
        </div>
      ))}
    </div>
  );
}
