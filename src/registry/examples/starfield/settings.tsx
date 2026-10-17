import { Starfield } from "@/components/ui/starfield";

export default function StarfieldSettings() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Starfield density={3} tint={0} parallax={0} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">sparse · white · fixed</p>
      </div>
      <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Starfield density={12} tint={0.4} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">dense · 40% tinted</p>
      </div>
      <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Starfield speed={6} twinkle={false} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">speed 6 · cruising</p>
      </div>
    </div>
  );
}
