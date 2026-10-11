"use client";

import * as React from "react";
import { SplitFlap } from "@/components/ui/split-flap";

// A fixed sequence of arrivals, so server and client agree and every run looks the same.
const bursts = [1, 3, 1, 2, 1, 1, 4, 2, 1, 3];

export default function SplitFlapCounter() {
  const [count, setCount] = React.useState(48_206);

  React.useEffect(() => {
    let tick = 0;
    const id = setInterval(() => {
      setCount((value) => value + bursts[tick++ % bursts.length]);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <SplitFlap
        value={String(count).padStart(7, "0")}
        charset="0123456789"
        color="amber"
        flipDuration={70}
        className="[--flap-h:48px] sm:[--flap-h:60px]"
      />
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">Passengers through gate B today</p>
    </div>
  );
}
