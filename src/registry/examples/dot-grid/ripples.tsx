import { DotGrid } from "@/components/ui/dot-grid";

export default function DotGridRipples() {
  return (
    <div className="relative flex h-[320px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center">
      <DotGrid radius={0} spacing={18} />
      <p className="relative text-5xl font-semibold tabular-nums tracking-[-0.04em] text-white/95 sm:text-6xl">41 days</p>
      <p className="relative mt-3 max-w-[38ch] text-[15px] leading-relaxed text-white/60">
        since the last incident on api.halyard.dev. All 14 regions are answering under 90 ms.
      </p>
    </div>
  );
}
