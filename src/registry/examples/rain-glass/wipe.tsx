import { RainGlass } from "@/components/ui/rain-glass";

export default function RainGlassWipe() {
  return (
    <div className="relative flex h-72 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center">
      <RainGlass wipe intensity={0.7} color="pink" />
      <p className="relative rounded-full bg-[#05060a]/80 px-3.5 py-1.5 text-[13px] text-white/75">Move across the glass to wipe it clear</p>
    </div>
  );
}
