import { Aurora } from "@/components/ui/aurora";

export default function AuroraSettings() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Aurora opacity={0.45} speed={0.5} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">opacity 0.45 · speed 0.5</p>
      </div>
      <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Aurora speed={0} />
        <p className="absolute left-4 top-4 font-mono text-xs text-white/50">speed 0 · still</p>
      </div>
    </div>
  );
}
