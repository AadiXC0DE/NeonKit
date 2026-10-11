import { Cityscape } from "@/components/ui/cityscape";

export default function CityscapeDemo() {
  return (
    <div className="relative flex h-[360px] w-full flex-col items-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 pt-12 text-center">
      <Cityscape style={{ fontFamily: "var(--font-tilt-neon)" }} />
      <p className="relative font-mono text-[11px] uppercase tracking-[0.32em] text-white/45">02:14 · 11 °C · clear</p>
      <h2 className="relative mt-3 max-w-md text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Still up? So is the city.
      </h2>
    </div>
  );
}
