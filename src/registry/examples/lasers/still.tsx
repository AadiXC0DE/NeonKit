import { Lasers } from "@/components/ui/lasers";

export default function LasersStill() {
  return (
    <div className="relative flex h-[300px] w-full flex-col items-start justify-start overflow-hidden rounded-xl border border-white/10 bg-[#05060a] p-7 sm:p-10">
      <Lasers speed={0} beams={4} spread={30} intensity={0.6} style={{ left: "35%" }} />
      <h3 className="relative max-w-[16ch] text-3xl font-semibold tracking-[-0.03em] text-white/95">Your set times are in</h3>
      <p className="relative mt-2 max-w-[34ch] text-[15px] leading-relaxed text-white/60">
        Main room, Saturday, 02:30 to 04:00. Soundcheck at 17:15, bring your own USB.
      </p>
    </div>
  );
}
