import { Equalizer } from "@/components/ui/equalizer";

const bands = ["31", "63", "125", "250", "500", "1k", "2k", "4k", "8k", "16k"];

export default function EqualizerGraphicEq() {
  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#07080c] px-6 pb-4 pt-6">
      <Equalizer bars={10} segments={16} height={150} gap={10} />
      <div aria-hidden className="mt-3 grid grid-cols-10 gap-[10px] text-center font-mono text-[10px] text-white/45">
        {bands.map((band) => (
          <span key={band}>{band}</span>
        ))}
      </div>
    </div>
  );
}
