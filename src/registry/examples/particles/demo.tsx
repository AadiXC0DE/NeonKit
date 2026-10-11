import { Particles } from "@/components/ui/particles";

export default function ParticlesDemo() {
  return (
    <div className="relative flex h-[360px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center">
      <Particles connect />
      <p className="relative font-mono text-[11px] uppercase tracking-[0.32em] text-white/45">2,481 nodes online</p>
      <h2 className="relative mt-3 max-w-md text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Every edge, one mesh
      </h2>
      <p className="relative mt-3 max-w-sm text-sm text-white/55">Move your cursor through the field. The nodes make room.</p>
    </div>
  );
}
