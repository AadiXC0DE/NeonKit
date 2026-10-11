"use client";

import * as React from "react";
import { GlitchText } from "@/components/ui/glitch-text";

const levels = ["subtle", "medium", "heavy"] as const;

export default function GlitchTextIntensity() {
  const [active, setActive] = React.useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="grid w-full max-w-xl grid-cols-1 gap-8 sm:grid-cols-3">
        {levels.map((level) => (
          <div key={level} className="flex flex-col items-center gap-3">
            <GlitchText trigger="manual" active={active} intensity={level} className="text-4xl font-semibold tracking-tight text-white/90">
              Static
            </GlitchText>
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">{level}</span>
          </div>
        ))}
      </div>
      <button
        type="button"
        aria-pressed={active}
        onClick={() => setActive((value) => !value)}
        className="inline-flex h-9 cursor-pointer items-center rounded-full border border-white/10 bg-white/[0.03] px-4 font-mono text-[11px] uppercase tracking-[0.18em] text-white/60 outline-none transition-colors hover:border-white/20 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] active:scale-[0.97] aria-pressed:border-[rgb(var(--neon-accent)/0.5)] aria-pressed:text-white/90"
      >
        {active ? "Stop interference" : "Cause interference"}
      </button>
    </div>
  );
}
