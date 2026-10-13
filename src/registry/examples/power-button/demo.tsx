"use client";

import * as React from "react";
import { PowerButton } from "@/components/ui/power-button";
import { cn } from "@/lib/utils";

function Screw({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute size-[7px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#3b404d,#101219)] shadow-[0_0_0_1px_rgb(255_255_255/0.05)]",
        "after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-[5px] after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:bg-black/70",
        className,
      )}
    />
  );
}

export default function PowerButtonDemo() {
  const [on, setOn] = React.useState(false);

  // Boot once shortly after it appears, so the preview shows the ignition.
  React.useEffect(() => {
    const timeout = setTimeout(() => setOn(true), 700);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="relative w-full max-w-[280px] rounded-[22px] border border-white/[0.06] bg-[linear-gradient(180deg,#12141b,#0a0b10)] px-6 pb-6 pt-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_30px_60px_-30px_rgb(0_0_0/0.9)]">
      <Screw className="left-3 top-3" />
      <Screw className="right-3 top-3" />
      <Screw className="bottom-3 left-3" />
      <Screw className="bottom-3 right-3" />

      <div className="flex items-center justify-between px-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/50">
        <span>Monitor A</span>
        <span>230V · 50Hz</span>
      </div>

      <div className="flex flex-col items-center gap-6 pb-3 pt-10">
        <PowerButton size="xl" pressed={on} onPressedChange={setOn} aria-label="Monitor A power" />
        <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em]">
          <span
            className={cn(
              "transition-colors duration-300",
              on ? "text-white/25" : "text-white/60",
            )}
          >
            Standby
          </span>
          <span aria-hidden className="h-3 w-px bg-white/10" />
          <span
            className={cn(
              "transition-[color,text-shadow] duration-300",
              on
                ? "text-[rgb(var(--neon-accent,34_211_238))] [text-shadow:0_0_10px_rgb(var(--neon-accent,34_211_238)/0.7)]"
                : "text-white/25",
            )}
          >
            Live
          </span>
        </p>
      </div>
    </div>
  );
}
