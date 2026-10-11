import { Aurora } from "@/components/ui/aurora";

export default function AuroraDemo() {
  return (
    <div className="relative flex h-[360px] w-full flex-col items-center justify-end overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 pb-14 text-center">
      <Aurora />
      <p className="relative font-mono text-[11px] uppercase tracking-[0.32em] text-white/45">Tromsø · 69° N</p>
      <h2 className="relative mt-3 max-w-md text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Quiet light for loud ideas
      </h2>
    </div>
  );
}
