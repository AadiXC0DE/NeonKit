"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/ui/starfield";

export default function StarfieldDemo() {
  const [warp, setWarp] = React.useState(false);

  return (
    <div className="relative flex h-[360px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center">
      <Starfield warp={warp} />
      <p className="relative font-mono text-[11px] uppercase tracking-[0.32em] text-white/45">
        {warp ? "Jumping · 0.92 c" : "Holding at Kepler-442"}
      </p>
      <h2 className="relative mt-3 max-w-md text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Far from everything
      </h2>
      <Button
        className="relative mt-7"
        variant={warp ? "solid" : "outline"}
        aria-pressed={warp}
        onClick={() => setWarp((on) => !on)}
      >
        {warp ? "Drop out" : "Engage warp"}
      </Button>
    </div>
  );
}
