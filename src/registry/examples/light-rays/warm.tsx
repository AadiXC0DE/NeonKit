import { LightRays } from "@/components/ui/light-rays";

export default function LightRaysWarm() {
  return (
    <div className="relative flex h-72 w-full flex-col items-start justify-end overflow-hidden rounded-xl border border-white/10 bg-[#07060a] p-8">
      <LightRays color="amber" origin="top-left" rays={9} spread={48} sway={2} speed={0.6} />
      <p className="relative font-mono text-[11px] uppercase tracking-[0.32em] text-white/45">Reading room · open till late</p>
      <h3 className="relative mt-2 max-w-xs text-2xl font-semibold tracking-tight text-white/90">
        Afternoon light, any hour
      </h3>
    </div>
  );
}
