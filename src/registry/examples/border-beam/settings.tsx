import { BorderBeam } from "@/components/ui/border-beam";

export default function BorderBeamSettings() {
  return (
    <div className="grid w-full max-w-lg gap-4 sm:grid-cols-2">
      <BorderBeam duration={8} className="rounded-xl border border-white/10 p-5">
        <p className="text-sm font-medium text-white/90">Slow</p>
        <p className="mt-1.5 font-mono text-xs text-white/55">duration 8 · size 90</p>
      </BorderBeam>
      <BorderBeam color="pink" colorTo="violet" duration={2.5} size={160} reverse borderWidth={2} className="rounded-xl border border-white/10 p-5">
        <p className="text-sm font-medium text-white/90">Fast, reversed, 2px</p>
        <p className="mt-1.5 font-mono text-xs text-white/55">duration 2.5 · size 160</p>
      </BorderBeam>
    </div>
  );
}
