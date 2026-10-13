import { Particles } from "@/components/ui/particles";

export default function ParticlesDemo() {
  return (
    <div className="relative flex h-[360px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center">
      <Particles connect />
      <h2 className="relative max-w-md text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Every edge, one mesh
      </h2>
      <p className="relative mt-3 max-w-sm text-sm text-white/60">Move your cursor through the field. The nodes make room.</p>
      <p className="absolute bottom-5 left-6 flex items-center gap-2 text-xs tabular-nums text-white/60">
        <span aria-hidden className="size-1.5 rounded-full bg-[rgb(var(--neon-accent,34_211_238))] shadow-[0_0_6px_rgb(var(--neon-accent,34_211_238))]" />
        2,481 nodes online
      </p>
    </div>
  );
}
