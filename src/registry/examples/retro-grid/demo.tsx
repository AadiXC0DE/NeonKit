import { RetroGrid } from "@/components/ui/retro-grid";

export default function RetroGridDemo() {
  return (
    <div className="relative flex h-80 w-full flex-col items-center overflow-hidden rounded-xl bg-[#05060a] px-6 pt-12 text-center sm:h-96 sm:pt-16">
      <RetroGrid />
      <h3 className="relative text-4xl font-semibold tracking-[-0.03em] text-white/95 sm:text-5xl">Nightcall, side B</h3>
      <p className="relative mt-3 max-w-sm text-[15px] leading-relaxed text-white/60">
        Nine tracks at 118 BPM. Out Friday on tape and everywhere else.
      </p>
    </div>
  );
}
