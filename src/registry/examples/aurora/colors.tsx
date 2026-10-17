import { Aurora } from "@/components/ui/aurora";

export default function AuroraColors() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Aurora colors={["green", "violet", "#9effd0"]} />
        <p className="absolute bottom-4 left-4 font-mono text-xs text-white/55">Polar · green, violet, mint</p>
      </div>
      <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
        <Aurora colors={["magenta", "orange", "pink"]} speed={0.6} />
        <p className="absolute bottom-4 left-4 font-mono text-xs text-white/55">Synthwave · magenta, orange, pink</p>
      </div>
    </div>
  );
}
