import { RainGlass } from "@/components/ui/rain-glass";

export default function RainGlassDemo() {
  return (
    <div className="relative flex h-[360px] w-full flex-col items-start justify-end overflow-hidden rounded-xl border border-white/10 bg-[#05060a] p-8 sm:p-10">
      <RainGlass />
      <p className="relative font-mono text-[11px] uppercase tracking-[0.32em] text-white/55">Last train · 01:52</p>
      <h2 className="relative mt-3 max-w-sm text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Nobody&apos;s in a hurry tonight
      </h2>
    </div>
  );
}
