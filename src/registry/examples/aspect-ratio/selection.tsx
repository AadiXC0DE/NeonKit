"use client";

import * as React from "react";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const shots = [
  { file: "hero-1440.png", w: 2880, h: 1800 },
  { file: "hero-768.png", w: 1536, h: 2048 },
  { file: "hero-390.png", w: 780, h: 1688 },
  { file: "og-image.png", w: 1200, h: 630 },
];

/** The lit corner marks the selected tile. */
export default function AspectRatioSelection() {
  const [selected, setSelected] = React.useState(0);
  return (
    <div role="group" aria-label="Screenshots" className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:gap-4">
      {shots.map((shot, i) => (
        <button
          key={shot.file}
          type="button"
          aria-pressed={selected === i}
          onClick={() => setSelected(i)}
          className="group cursor-pointer rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
        >
          <AspectRatio
            ratio={16 / 10}
            frame={selected === i}
            className="rounded-xl border border-white/10 bg-[#0a0c12] transition-colors group-hover:border-white/20"
          >
            {/* Each screenshot letterboxed at its own shape: a second AspectRatio, sized by height when it's taller. */}
            <span className="absolute inset-[8%] flex items-center justify-center">
              <AspectRatio
                ratio={shot.w / shot.h}
                className={
                  shot.w / shot.h < 1.6
                    ? "h-full w-auto rounded-md border border-white/[0.08] bg-white/[0.03]"
                    : "rounded-md border border-white/[0.08] bg-white/[0.03]"
                }
              >
                <span aria-hidden className="absolute inset-[10%] grid grid-rows-[auto_1fr] gap-[8%]">
                  <span className="h-1 w-1/2 rounded-full bg-white/[0.12]" />
                  <span className="rounded-[3px] bg-[rgb(var(--neon)/0.16)]" />
                </span>
              </AspectRatio>
            </span>
          </AspectRatio>
          <span className="mt-2 flex flex-col gap-0.5 text-[12.5px] sm:flex-row sm:items-baseline sm:justify-between sm:gap-2">
            <span className="truncate font-mono text-white/80">{shot.file}</span>
            <span className="shrink-0 tabular-nums text-white/45">
              {shot.w} × {shot.h}
            </span>
          </span>
        </button>
      ))}
    </div>
  );
}
