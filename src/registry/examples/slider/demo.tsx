"use client";

import { Volume, Volume2 } from "@/components/ui/icons";
import { Slider } from "@/components/ui/slider";

export default function SliderDemo() {
  return (
    <div className="flex w-full max-w-xs items-center gap-3">
      <Volume className="size-4 shrink-0 text-white/40" />
      <Slider
        defaultValue={[64]}
        aria-label="Volume"
        showValue="hover"
        formatValue={(value) => `${value}%`}
      />
      <Volume2 className="size-4 shrink-0 text-white/40" />
    </div>
  );
}
