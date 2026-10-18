"use client";

import * as React from "react";
import { HoldButton } from "@/components/ui/hold-button";
import { useSparks } from "@/components/ui/sparks";

export default function SparksHold() {
  const [merged, setMerged] = React.useState(false);
  const { ref, fire } = useSparks<HTMLButtonElement>({ count: 70, spread: 360, velocity: 480, gravity: 700 });

  return (
    <div className="flex w-full max-w-sm flex-col items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 min-[400px]:flex-row min-[400px]:items-center min-[400px]:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/90">#1287 Usage-based billing</p>
        <p className="mt-0.5 text-[13px] text-white/55">{merged ? "Merged into main" : "2 approvals · 0 conflicts"}</p>
      </div>
      <HoldButton
        ref={ref}
        duration={1200}
        resetDelay={2400}
        completeLabel="Merged"
        onComplete={() => {
          setMerged(true);
          fire();
        }}
        onHoldStart={() => setMerged(false)}
        className="shrink-0"
      >
        Hold to merge
      </HoldButton>
    </div>
  );
}
