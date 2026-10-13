"use client";

import * as React from "react";
import { Pause, Play } from "@/components/ui/icons";
import { Marquee } from "@/components/ui/marquee";

const regions = [
  { id: "fra1", latency: "41ms", ok: true },
  { id: "iad1", latency: "38ms", ok: true },
  { id: "sin1", latency: "112ms", ok: true },
  { id: "gru1", latency: "164ms", ok: false },
  { id: "hnd1", latency: "96ms", ok: true },
  { id: "syd1", latency: "128ms", ok: true },
];

export default function MarqueePauseControl() {
  const [paused, setPaused] = React.useState(false);

  return (
    <div className="flex w-full max-w-2xl items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-3 [--neon:var(--neon-accent,34_211_238)]">
      <button
        type="button"
        aria-label={paused ? "Play ticker" : "Pause ticker"}
        onClick={() => setPaused((value) => !value)}
        className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg text-white/60 outline-none transition-colors hover:bg-white/[0.06] hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
      >
        {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
      </button>
      <Marquee paused={paused} speed={32} gap={28} fade={32} aria-label="Region latency" className="min-w-0 flex-1 py-1">
        {regions.map((region) => (
          <span key={region.id} className="flex items-center gap-2 whitespace-nowrap font-mono text-xs">
            <span
              aria-hidden
              className={
                region.ok
                  ? "size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]"
                  : "size-1.5 rounded-full bg-[#fbbf24] shadow-[0_0_6px_#fbbf24]"
              }
            />
            <span className="text-white/80">{region.id}</span>
            <span className="text-white/55">{region.ok ? region.latency : `${region.latency} degraded`}</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
