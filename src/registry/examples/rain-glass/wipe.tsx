import { RainGlass } from "@/components/ui/rain-glass";

export default function RainGlassWipe() {
  return (
    <div className="relative flex h-72 w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center">
      <RainGlass wipe intensity={0.7} color="pink" />
      <p className="relative font-mono text-xs text-white/55">Move the pointer across the glass to wipe it</p>
    </div>
  );
}
