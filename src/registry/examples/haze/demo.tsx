import { Button } from "@/components/ui/button";
import { Haze } from "@/components/ui/haze";

export default function HazeDemo() {
  return (
    <div className="relative flex h-[440px] w-full flex-col justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-7 sm:h-[480px] sm:px-14">
      <Haze />
      <h2 className="relative max-w-[13ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white/95 sm:text-[52px]">
        Every cue, on the frame
      </h2>
      <p className="relative mt-4 max-w-[44ch] text-[15px] leading-relaxed text-white/65">
        Lumen Board runs 2,048 DMX channels from one laptop and fires each cue within 4&nbsp;ms of the click track.
      </p>
      <div className="relative mt-7 flex flex-wrap items-center gap-3">
        <Button variant="solid">Download for macOS</Button>
        <Button variant="ghost">How the Barbican rig runs</Button>
      </div>
    </div>
  );
}
