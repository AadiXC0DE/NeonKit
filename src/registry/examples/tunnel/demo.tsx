import { Button } from "@/components/ui/button";
import { Tunnel } from "@/components/ui/tunnel";

export default function TunnelDemo() {
  return (
    <div className="relative flex h-[440px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center sm:h-[480px]">
      <Tunnel />
      <h2 className="relative max-w-[14ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white/95 [text-shadow:0_2px_24px_rgb(5_6_10/0.9)] sm:text-[52px]">
        Lap one starts at 19:00 UTC
      </h2>
      <p className="relative mt-4 max-w-[40ch] text-[15px] leading-relaxed text-white/70 [text-shadow:0_1px_12px_rgb(5_6_10/0.95)]">
        Overdrive season four adds six night tracks and rain that pools in the corners. Free on PC and Deck this weekend.
      </p>
      <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button variant="solid">Add to library</Button>
        <Button variant="ghost">Watch the trailer</Button>
      </div>
    </div>
  );
}
