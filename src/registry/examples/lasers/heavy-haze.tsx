import { Lasers } from "@/components/ui/lasers";

export default function LasersHeavyHaze() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
          <Lasers color="green" haze={1} beams={6} />
        </div>
        <p className="text-sm text-white/60">Green, heavy haze: the beams break up into clouds</p>
      </div>
      <div className="flex flex-col gap-2">
        <div className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
          <Lasers color="magenta" haze={0} beams={12} spread={110} />
        </div>
        <p className="text-sm text-white/60">Magenta, clean air: twelve unbroken lines</p>
      </div>
    </div>
  );
}
