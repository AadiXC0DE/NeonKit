import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/retro-grid";
import { Sunset } from "@/components/ui/sunset";

export default function SunsetDemo() {
  return (
    <div className="relative flex h-[520px] w-full flex-col justify-end overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-7 pb-8 sm:h-[500px] sm:px-10 sm:pb-10">
      <Sunset line={false} horizon={0.52} size={0.5} />
      <RetroGrid style={{ top: "4%" }} />
      {/* The floor sinks into shadow at the front, so the copy sits on dark ground. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-[linear-gradient(to_top,#05060a_30%,rgb(5_6_10/0.7)_65%,transparent)]"
      />
      <div className="relative flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
        <div>
          <h2 className="max-w-[18ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white/95 sm:text-5xl">
            Midnight Drive, on tape Friday
          </h2>
          <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-white/65">
            Nine tracks, all at 118 BPM. 300 cassettes, then it&apos;s streaming only.
          </p>
        </div>
        <div className="flex items-center gap-5">
          <span className="font-mono text-[13px] tabular-nums text-white/55">41:07</span>
          <Button variant="solid">Pre-save the album</Button>
        </div>
      </div>
    </div>
  );
}
