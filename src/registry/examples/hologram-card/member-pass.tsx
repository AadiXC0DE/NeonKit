import { HologramCard } from "@/components/ui/hologram-card";

export default function HologramCardMemberPass() {
  return (
    <HologramCard foil="glitter" maxTilt={9} className="aspect-[86/54] w-full max-w-[22rem] p-5">
      <div aria-hidden className="absolute inset-0 overflow-hidden rounded-[inherit]">
        <div className="absolute -right-16 -top-20 size-56 rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.22),transparent)]" />
      </div>
      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-semibold tracking-[0.02em] text-white/75">NeonKit</span>
          <span className="rounded-full border border-[rgb(var(--neon)/0.4)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[rgb(var(--neon))]">
            Founding
          </span>
        </div>

        {/* Contact chip */}
        <div
          aria-hidden
          className="mt-5 grid h-8 w-11 grid-cols-3 gap-px overflow-hidden rounded-md border border-[#b8a46a]/50 bg-[linear-gradient(135deg,#e7d28f,#9c8545)] p-px"
        >
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="bg-[linear-gradient(135deg,#f0e0a8,#a88f4e)]" />
          ))}
        </div>

        <p className="mt-auto font-mono text-[15px] tracking-[0.18em] text-white/90 tabular-nums">0042 · 2026</p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Supporter</p>
            <p className="text-sm text-white/90">Mara Okafor</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">Since</p>
            <p className="font-mono text-sm text-white/90">10/26</p>
          </div>
        </div>
      </div>
    </HologramCard>
  );
}
