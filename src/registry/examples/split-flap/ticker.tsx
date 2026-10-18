"use client";

import * as React from "react";
import { TrainFront } from "@/components/ui/icons";
import { SplitFlap } from "@/components/ui/split-flap";

const stops = ["SHIBUYA", "HARAJUKU", "YOYOGI", "SHINJUKU", "TAKADANOBABA", "IKEBUKURO", "OTSUKA", "UENO", "AKIHABARA"];

export default function SplitFlapTicker() {
  const [stop, setStop] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setStop((index) => (index + 1) % stops.length), 4200);
    return () => clearInterval(id);
  }, []);

  return (
    // Hung from the left like a platform sign, so the name reads from the same edge every stop.
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-2 text-sm font-medium text-white/65">
        <TrainFront aria-hidden size={18} />
        Next stop
      </div>
      <SplitFlap
        aria-live="polite"
        value={stops[stop]}
        length={12}
        charset="letters"
        className="[--flap-h:30px] lg:[--flap-h:44px]"
      />
    </div>
  );
}
