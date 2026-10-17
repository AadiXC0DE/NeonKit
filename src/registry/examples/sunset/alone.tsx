import { Sunset } from "@/components/ui/sunset";

export default function SunsetAlone() {
  return (
    <div className="relative flex h-[380px] w-full flex-col items-start justify-end overflow-hidden rounded-xl border border-white/10 bg-[#05060a] p-7 sm:p-10">
      <Sunset horizon={0.5} size={0.5} />
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-[linear-gradient(to_top,#05060a_35%,transparent)]" />
      <p className="relative font-mono text-[13px] tabular-nums text-white/60">19:42 · 31 °C · Route 62</p>
      <h3 className="relative mt-2 max-w-[20ch] text-3xl font-semibold tracking-[-0.03em] text-white/95">
        Last fuel for 140 km, then nothing but road
      </h3>
    </div>
  );
}
