import { BorderBeam } from "@/components/ui/border-beam";

export default function BorderBeamSettings() {
  return (
    <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
      <BorderBeam color="cyan" duration={8} className="rounded-xl border border-white/10 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Slow</p>
        <p className="mt-2 text-sm text-white/80">duration 8 · size 90</p>
      </BorderBeam>
      <BorderBeam color="pink" colorTo="violet" duration={2.5} size={160} reverse borderWidth={2} className="rounded-xl border border-white/10 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-white/40">Fast, reversed</p>
        <p className="mt-2 text-sm text-white/80">duration 2.5 · size 160 · 2px</p>
      </BorderBeam>
    </div>
  );
}
