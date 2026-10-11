import { Particles } from "@/components/ui/particles";

export default function ParticlesSettings() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Particles connect={70} density={3} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">connect 70 · repel</p>
      </div>
      <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Particles interaction="attract" density={2.5} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">attract</p>
      </div>
      <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Particles interaction="none" speed={2.5} density={4} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">none · speed 2.5</p>
      </div>
    </div>
  );
}
