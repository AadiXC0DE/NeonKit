import { Cityscape } from "@/components/ui/cityscape";

export default function CityscapeHours() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Cityscape seed={4} lights={0.42} signs={["DINER"]} style={{ fontFamily: "var(--font-tilt-neon)" }} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">lights 0.42 · 10pm</p>
      </div>
      <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Cityscape seed={4} lights={0.05} signs={[]} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">lights 0.05 · 4am, signs off</p>
      </div>
    </div>
  );
}
