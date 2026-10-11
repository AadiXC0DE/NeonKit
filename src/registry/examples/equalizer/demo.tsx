"use client";

import * as React from "react";
import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { Equalizer } from "@/components/ui/equalizer";

export default function EqualizerDemo() {
  const [playing, setPlaying] = React.useState(true);

  return (
    <div className="w-full max-w-xl overflow-hidden rounded-[22px] border border-white/10 bg-[linear-gradient(180deg,#0e1016,#08090d)] shadow-[inset_0_1px_0_rgb(255_255_255/0.05)]">
      <div className="relative px-6 pb-4 pt-8">
        <Equalizer playing={playing} bars={36} height={168} gap={6} />
      </div>
      <div className="flex items-center gap-4 border-t border-white/[0.07] px-6 py-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white/90">Harbour Lights</p>
          <p className="truncate text-xs text-white/50">Low Tide Radio · Side B</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Previous track"
            className="grid size-9 cursor-pointer place-items-center rounded-full text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)]"
          >
            <SkipBack className="size-4" />
          </button>
          <button
            type="button"
            aria-label={playing ? "Pause" : "Play"}
            onClick={() => setPlaying((value) => !value)}
            className="grid size-11 cursor-pointer place-items-center rounded-full border border-[rgb(var(--neon-accent,34_211_238)/0.5)] bg-[rgb(var(--neon-accent,34_211_238)/0.12)] text-[rgb(var(--neon-accent,34_211_238))] shadow-[0_0_18px_rgb(var(--neon-accent,34_211_238)/0.35)] transition-[transform,box-shadow] duration-150 hover:shadow-[0_0_26px_rgb(var(--neon-accent,34_211_238)/0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)] active:scale-[0.97]"
          >
            {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 translate-x-px fill-current" />}
          </button>
          <button
            type="button"
            aria-label="Next track"
            className="grid size-9 cursor-pointer place-items-center rounded-full text-white/55 transition-colors hover:bg-white/[0.06] hover:text-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)]"
          >
            <SkipForward className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
