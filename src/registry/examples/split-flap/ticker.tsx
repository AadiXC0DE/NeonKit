"use client";

import * as React from "react";
import { TrainFront } from "lucide-react";
import { SplitFlap } from "@/components/ui/split-flap";

const stops = ["SHIBUYA", "HARAJUKU", "YOYOGI", "SHINJUKU", "TAKADANOBABA", "IKEBUKURO", "OTSUKA", "UENO", "AKIHABARA"];

export default function SplitFlapTicker() {
  const [stop, setStop] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setStop((index) => (index + 1) % stops.length), 4200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white/55">
        <TrainFront aria-hidden className="size-3.5" />
        Next stop
      </div>
      <SplitFlap
        aria-live="polite"
        value={stops[stop]}
        length={12}
        align="right"
        charset="letters"
        className="[--flap-h:30px] lg:[--flap-h:44px]"
      />
    </div>
  );
}
