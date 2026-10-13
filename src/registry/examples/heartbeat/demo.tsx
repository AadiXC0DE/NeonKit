"use client";

import * as React from "react";
import { Heart } from "@/components/ui/icons";
import { Heartbeat } from "@/components/ui/heartbeat";

export default function HeartbeatDemo() {
  const heart = React.useRef<SVGSVGElement>(null);

  // Thump the heart icon on every R peak. onBeat never fires under reduced motion.
  const thump = React.useCallback(() => {
    heart.current?.animate([{ transform: "scale(1.28)" }, { transform: "scale(1)" }], {
      duration: 320,
      easing: "cubic-bezier(0.23, 1, 0.32, 1)",
    });
  }, []);

  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#06070b] shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
        <span>Bed 4 · Adult</span>
        <span>II · 25 mm/s</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto]">
        <div className="relative px-4 py-6 [background-image:linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] [background-size:20px_20px]">
          <Heartbeat bpm={72} height={132} onBeat={thump} />
        </div>
        <dl className="grid grid-cols-3 gap-px border-t border-white/[0.07] bg-white/[0.07] sm:w-44 sm:grid-cols-1 sm:border-l sm:border-t-0">
          <div className="bg-[#06070b] px-4 py-3">
            <dt className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">
              HR
              <Heart
                ref={heart}
                aria-hidden
                className="size-3.5 fill-[rgb(var(--neon-accent,34_211_238))] text-[rgb(var(--neon-accent,34_211_238))] [filter:drop-shadow(0_0_6px_rgb(var(--neon-accent,34_211_238)/0.8))]"
              />
            </dt>
            <dd className="mt-1 font-mono text-4xl font-medium tabular-nums leading-none text-[color-mix(in_srgb,rgb(var(--neon-accent,34_211_238))_40%,white)] [text-shadow:0_0_14px_rgb(var(--neon-accent,34_211_238)/0.7)]">
              72
            </dd>
          </div>
          <div className="bg-[#06070b] px-4 py-3">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">SpO₂ %</dt>
            <dd className="mt-1 font-mono text-2xl tabular-nums leading-none text-white/80">98</dd>
          </div>
          <div className="bg-[#06070b] px-4 py-3">
            <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">NIBP</dt>
            <dd className="mt-1 font-mono text-2xl tabular-nums leading-none text-white/80">
              118<span className="text-white/50">/</span>76
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
