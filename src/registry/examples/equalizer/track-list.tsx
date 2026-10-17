"use client";

import * as React from "react";
import { Equalizer } from "@/components/ui/equalizer";
import { cn } from "@/lib/utils";

const tracks = [
  { title: "Harbour Lights", artist: "Low Tide Radio", length: "3:52" },
  { title: "Glass Arcade", artist: "Mira Kestrel", length: "4:18" },
  { title: "Night Bus to Ostend", artist: "The Late Shift", length: "3:05" },
  { title: "Sodium", artist: "Paper Satellites", length: "2:47" },
];

export default function EqualizerTrackList() {
  const [current, setCurrent] = React.useState(1);
  const [playing, setPlaying] = React.useState(true);

  return (
    <ol className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.02] p-1.5">
      {tracks.map((track, i) => {
        const active = i === current;
        return (
          <li key={track.title}>
            <button
              type="button"
              aria-current={active ? "true" : undefined}
              onClick={() => {
                if (active) setPlaying((value) => !value);
                else {
                  setCurrent(i);
                  setPlaying(true);
                }
              }}
              className={cn(
                "grid w-full cursor-pointer grid-cols-[1.25rem_1fr_auto] items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)]",
                active && "bg-white/[0.04]",
              )}
            >
              {active ? (
                <Equalizer bars={4} height={14} gap={2} peaks={false} playing={playing} className="w-4" />
              ) : (
                <span className="text-center text-xs tabular-nums text-white/50">{i + 1}</span>
              )}
              <span className="min-w-0">
                <span
                  className={cn(
                    "block truncate text-sm",
                    active
                      ? "text-[color-mix(in_srgb,rgb(var(--neon-accent,34_211_238))_45%,white)] [text-shadow:0_0_12px_rgb(var(--neon-accent,34_211_238)/0.5)]"
                      : "text-white/85",
                  )}
                >
                  {track.title}
                </span>
                <span className="sr-only"> by </span>
                <span className="block truncate text-xs text-white/55">{track.artist}</span>
              </span>
              <span className="text-xs tabular-nums text-white/55">{track.length}</span>
              {active && <span className="sr-only">{playing ? ", playing" : ", paused"}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
