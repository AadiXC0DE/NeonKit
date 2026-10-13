"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/ui/starfield";

export default function StarfieldDemo() {
  const [warp, setWarp] = React.useState(false);

  return (
    <div className="relative flex h-[360px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center">
      <Starfield warp={warp} />
      <h2 className="relative max-w-md text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Far from everything
      </h2>
      <Button
        className="relative mt-6"
        variant={warp ? "solid" : "outline"}
        aria-pressed={warp}
        onClick={() => setWarp((on) => !on)}
      >
        {warp ? "Drop out" : "Engage warp"}
      </Button>
      <p aria-live="polite" className="relative mt-4 text-[13px] tabular-nums text-white/60">
        {warp ? "Jumping at 0.92 c" : "Holding at Kepler-442"}
      </p>
    </div>
  );
}
