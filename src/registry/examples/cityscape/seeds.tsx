import { Cityscape } from "@/components/ui/cityscape";

const seeds = [3, 18, 42];

export default function CityscapeSeeds() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-3">
      {seeds.map((seed) => (
        <div key={seed} className="relative h-44 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
          <Cityscape seed={seed} signs={[]} stars={false} />
          <p className="absolute left-3 top-3 font-mono text-xs text-white/50">seed={seed}</p>
        </div>
      ))}
    </div>
  );
}
