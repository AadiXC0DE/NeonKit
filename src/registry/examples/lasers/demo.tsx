import { Button } from "@/components/ui/button";
import { Lasers } from "@/components/ui/lasers";

export default function LasersDemo() {
  return (
    <div className="relative flex h-[440px] w-full flex-col items-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 pt-14 text-center sm:h-[480px] sm:pt-16">
      <Lasers />
      <h2 className="relative max-w-[16ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white/95 sm:text-[52px]">
        Twelve hours, one room, no phones
      </h2>
      <p className="relative mt-4 max-w-[42ch] text-[15px] leading-relaxed text-white/65">
        Halle 7, Berlin. 4 to 6 April, doors at 22:00. 1,800 tickets a night, stickers on every camera.
      </p>
      <Button variant="solid" className="relative mt-7">
        Tickets from €48
      </Button>
    </div>
  );
}
