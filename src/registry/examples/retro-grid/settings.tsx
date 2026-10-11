import { RetroGrid } from "@/components/ui/retro-grid";

export default function RetroGridSettings() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <RetroGrid color="cyan" angle={60} cellSize={40} speed={0.8} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">angle 60 · cell 40 · speed 0.8</p>
      </div>
      <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <RetroGrid color="amber" angle={78} cellSize={80} speed={0} horizon={false} opacity={0.35} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">angle 78 · cell 80 · still</p>
      </div>
    </div>
  );
}
