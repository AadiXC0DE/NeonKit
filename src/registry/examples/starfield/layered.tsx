import { Aurora } from "@/components/ui/aurora";
import { Starfield } from "@/components/ui/starfield";

export default function StarfieldLayered() {
  return (
    <div className="relative flex h-80 w-full flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-[#05060a] p-8">
      <Starfield density={9} speed={0.4} parallax={12} />
      <Aurora opacity={0.6} />
      <h3 className="relative max-w-sm text-balance text-2xl font-semibold tracking-tight text-white/90">
        Clear skies over the north ridge
      </h3>
      <p className="relative mt-2 text-sm text-white/60">Observatory log, night 212</p>
    </div>
  );
}
