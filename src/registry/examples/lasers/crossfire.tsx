import { Lasers } from "@/components/ui/lasers";

export default function LasersCrossfire() {
  return (
    <div className="relative flex h-[340px] w-full flex-col items-center justify-end overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 pb-10 text-center">
      <Lasers origin="top" sources={3} beams={5} spread={44} />
      <p className="relative font-mono text-[13px] tabular-nums text-white/60">00:41:12 into the set</p>
      <h3 className="relative mt-2 text-3xl font-semibold tracking-[-0.03em] text-white/95 sm:text-4xl">Three heads, crossing</h3>
    </div>
  );
}
