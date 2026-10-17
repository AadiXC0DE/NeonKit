"use client";

import * as React from "react";
import { Volume1, Volume2, VolumeX } from "@/components/ui/icons";
import { Slider } from "@/components/ui/slider";

export default function SliderDemo() {
  const [volume, setVolume] = React.useState([64]);
  const level = volume[0];
  const Quiet = level === 0 ? VolumeX : Volume1;

  return (
    <div className="grid w-full max-w-xs gap-3">
      <div className="flex items-baseline justify-between">
        <span id="volume-label" className="text-sm font-medium text-white/80">
          Studio monitors
        </span>
        <span className="text-sm tabular-nums text-white/55">{level}%</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Mute"
          onClick={() => setVolume([0])}
          className="-m-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-white/55 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          <Quiet className="size-5" />
        </button>
        <Slider
          value={volume}
          onValueChange={setVolume}
          aria-labelledby="volume-label"
          formatValue={(value) => `${value}%`}
        />
        <button
          type="button"
          aria-label="Full volume"
          onClick={() => setVolume([100])}
          className="-m-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-white/55 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          <Volume2 className="size-5" />
        </button>
      </div>
    </div>
  );
}
