import { Haze } from "@/components/ui/haze";
import { Lasers } from "@/components/ui/lasers";

export default function HazeLayered() {
  return (
    <div className="relative flex h-[340px] w-full flex-col items-center justify-start overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 pt-10 text-center">
      <Haze density={0.5} intensity={0.7} />
      <Lasers beams={6} spread={60} intensity={0.7} />
      <h3 className="relative text-3xl font-semibold tracking-[-0.03em] text-white/95 sm:text-4xl">Smoke on, lasers in</h3>
      <p className="relative mt-2 max-w-[36ch] text-[15px] text-white/65">Haze under Lasers: the beams sit in the room, not on top of it.</p>
    </div>
  );
}
