import { ArrowUpRight } from "@/components/ui/icons";
import { HologramCard } from "@/components/ui/hologram-card";

export default function HologramCardReleaseLink() {
  return (
    <HologramCard foil="dots" intensity={0.8} className="w-full max-w-xs">
      <a
        href="#changelog"
        className="block rounded-[inherit] p-5 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
      >
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-medium text-[rgb(var(--neon))]">Release 1.2</span>
          <ArrowUpRight className="size-4 text-white/55" />
        </div>
        <h3 className="mt-5 text-lg font-medium tracking-tight text-white/90">Signature neon</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-white/55">
          Signs, meters, a CRT and a split-flap board. Components that read as real objects made of light.
        </p>
        <p className="mt-6 text-xs text-white/50">Shipped 11 Oct 2026</p>
      </a>
    </HologramCard>
  );
}
