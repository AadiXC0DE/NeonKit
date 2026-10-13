import { BorderBeam } from "@/components/ui/border-beam";

export default function BorderBeamDemo() {
  return (
    <BorderBeam colorTo="magenta" className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/55">Build #2841</p>
          <span className="font-mono text-xs text-white/55">main · 4f2a91c</span>
        </div>
        <p className="text-lg font-medium text-white/90">Compiling 214 modules</p>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-2/3 rounded-full bg-[rgb(var(--neon-accent,34_211_238))]" />
        </div>
        <p className="text-xs text-white/55">Started 38s ago by @mira</p>
      </div>
    </BorderBeam>
  );
}
