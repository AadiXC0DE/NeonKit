import { HologramCard, type HologramFoil } from "@/components/ui/hologram-card";

const gases: { symbol: string; name: string; number: number; glow: string; color: string; foil: HologramFoil }[] = [
  { symbol: "Ne", name: "Neon", number: 10, glow: "Red-orange", color: "#ff5a36", foil: "lines" },
  { symbol: "Ar", name: "Argon", number: 18, glow: "Lavender", color: "violet", foil: "dots" },
  { symbol: "Kr", name: "Krypton", number: 36, glow: "Silver white", color: "white", foil: "glitter" },
];

export default function HologramCardFoils() {
  return (
    <div className="grid w-full max-w-2xl grid-cols-1 justify-items-center gap-6 sm:grid-cols-3">
      {gases.map((gas) => (
        <HologramCard key={gas.symbol} color={gas.color} foil={gas.foil} className="aspect-[5/7] w-44 p-4">
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between font-mono text-[11px] text-white/50">
              <span>{gas.number}</span>
              <span className="uppercase tracking-[0.16em]">{gas.foil}</span>
            </div>
            <p className="mt-auto text-6xl font-light leading-none tracking-tight [color:color-mix(in_srgb,rgb(var(--neon))_35%,white)] [text-shadow:0_0_6px_rgb(var(--neon)),0_0_22px_rgb(var(--neon)/0.6)]">
              {gas.symbol}
            </p>
            <p className="mt-3 text-sm text-white/90">{gas.name}</p>
            <p className="mt-0.5 text-xs text-white/45">Glows {gas.glow.toLowerCase()}</p>
          </div>
        </HologramCard>
      ))}
    </div>
  );
}
