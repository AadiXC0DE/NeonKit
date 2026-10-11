"use client";

import * as React from "react";
import { SevenSegment } from "@/components/ui/seven-segment";

const pad = (n: number) => String(n).padStart(2, "0");

export default function SevenSegmentDemo() {
  // Dashes until the first tick, so the server and the browser render the same thing.
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(new Date());
      timer = setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timer = setTimeout(tick, 0);
    return () => clearTimeout(timer);
  }, []);

  // A 12-hour face: the leading digit stays dark before ten o'clock.
  const hours = now ? now.getHours() % 12 || 12 : 0;
  const time = now ? `${String(hours).padStart(2, " ")}:${pad(now.getMinutes())}` : "--:--";
  const seconds = now ? pad(now.getSeconds()) : "--";
  const pm = now ? now.getHours() >= 12 : false;

  return (
    <div className="relative rounded-2xl border [--neon:var(--neon-accent,34_211_238)] border-white/10 bg-[linear-gradient(to_bottom,#0b0c11,#07080b)] p-2 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.05)]">
      <div className="relative overflow-hidden rounded-xl bg-[#040406] px-6 py-6 shadow-[inset_0_2px_12px_rgb(0_0_0/0.9)] lg:px-10 lg:py-8">
        {/* Light from the segments, spilling onto the smoked glass */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_45%_55%,rgb(var(--neon)/0.12),transparent_70%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-[linear-gradient(to_bottom,rgb(255_255_255/0.035),transparent)]" />
        <div className="relative flex items-end gap-3 lg:gap-4">
          <SevenSegment value={time} colonBlink={Boolean(now)} className="[--segment-h:64px] lg:[--segment-h:104px]" />
          <div className="flex flex-col items-start gap-2 pb-1">
            <span className="flex gap-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.18em]">
              <span className={pm ? "text-white/25" : "text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.8)]"}>am</span>
              <span className={pm ? "text-[rgb(var(--neon))] [text-shadow:0_0_8px_rgb(var(--neon)/0.8)]" : "text-white/25"}>pm</span>
            </span>
            <SevenSegment value={seconds} className="[--segment-h:28px] lg:[--segment-h:44px]" />
          </div>
        </div>
      </div>
    </div>
  );
}
