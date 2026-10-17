import { RainGlass } from "@/components/ui/rain-glass";

export default function RainGlassIntensity() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <RainGlass intensity={0.2} />
        <p className="absolute left-3 top-3 rounded-md bg-[#05060a]/80 px-2 py-1 font-mono text-xs text-white/70">intensity 0.2 · drizzle</p>
      </div>
      <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <RainGlass intensity={0.95} />
        <p className="absolute left-3 top-3 rounded-md bg-[#05060a]/80 px-2 py-1 font-mono text-xs text-white/70">intensity 0.95 · downpour</p>
      </div>
    </div>
  );
}
