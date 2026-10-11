import { Particles } from "@/components/ui/particles";

export default function ParticlesColors() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <div className="relative h-52 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Particles color="lime" connect density={2} />
        <p className="absolute bottom-4 left-4 font-mono text-xs text-white/50">color=&quot;lime&quot;</p>
      </div>
      <div className="relative h-52 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Particles color="#ff8a3d" density={4} speed={0.6} />
        <p className="absolute bottom-4 left-4 font-mono text-xs text-white/50">color=&quot;#ff8a3d&quot;</p>
      </div>
    </div>
  );
}
