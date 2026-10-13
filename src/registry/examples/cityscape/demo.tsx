import { Cityscape } from "@/components/ui/cityscape";

export default function CityscapeDemo() {
  return (
    <div className="relative flex h-[360px] w-full flex-col items-start overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-7 pt-8 sm:px-10 sm:pt-10">
      <Cityscape style={{ fontFamily: "var(--font-tilt-neon)" }} />
      <h2 className="relative max-w-[14ch] text-balance text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Still up? So is the city.
      </h2>
      <p className="absolute right-7 top-9 hidden font-mono text-xs tabular-nums text-white/60 sm:right-10 sm:top-11 sm:block">
        02:14 · 11 °C · clear
      </p>
    </div>
  );
}
