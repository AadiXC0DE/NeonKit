"use client";

import * as React from "react";
import { Pause, Play } from "@/components/ui/icons";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const LENGTH = 24 * 60 + 18;

function clock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function AspectRatioDemo() {
  const [playing, setPlaying] = React.useState(false);
  const [position, setPosition] = React.useState(9 * 60 + 41);

  React.useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setPosition((p) => (p + 1 >= LENGTH ? 0 : p + 1)), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  return (
    <figure className="w-full max-w-2xl">
      <AspectRatio ratio={16 / 9} frame className="bg-[#07080d] [container-type:inline-size]">
        {/* A stand-in poster drawn in CSS: the speaker's slide, with the camera feed picture-in-picture. */}
        <div aria-hidden className="absolute inset-0 grid grid-cols-[1.1fr_1fr] items-center gap-[6%] bg-[#0a0c13] px-[8%] pb-[12%] pt-[8%]">
          <div>
            <p className="text-[1.7cqw] text-white/45">Config 2026, main stage</p>
            <p className="mt-[3%] text-[4.4cqw] font-semibold leading-[1.02] tracking-[-0.03em] text-white/90">
              One variable,
              <br />
              every component
            </p>
          </div>
          <div className="flex h-[48%] items-end gap-[5%] border-b border-white/10">
            {[22, 30, 41, 38, 55, 63, 71, 96].map((h, i) => (
              <span
                key={i}
                style={{ height: `${h}%` }}
                className={i === 7 ? "flex-1 rounded-t-[2px] bg-[rgb(var(--neon))]" : "flex-1 rounded-t-[2px] bg-[rgb(var(--neon)/0.22)]"}
              />
            ))}
          </div>
        </div>
        <div aria-hidden className="absolute bottom-[17%] right-[4%] grid aspect-square w-[11%] place-items-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_50%_35%,#2a3142,#141824)] text-[2cqw] font-medium text-white/70">
          MK
        </div>

        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "Pause" : "Play"}
          className="absolute inset-0 grid cursor-pointer place-items-center outline-none [&:focus-visible>span]:ring-2 [&:focus-visible>span]:ring-[rgb(var(--neon)/0.7)]"
        >
          <span
            className={
              playing
                ? "grid size-12 place-items-center rounded-full bg-black/50 text-white/90 opacity-0 transition-opacity duration-200 hover:opacity-100"
                : "grid size-14 place-items-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-transform duration-150 active:scale-[0.96]"
            }
          >
            {playing ? <Pause aria-hidden className="size-5" /> : <Play aria-hidden className="ml-0.5 size-6" />}
          </span>
        </button>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-3 bg-[linear-gradient(0deg,rgb(0_0_0/0.7),transparent)] px-4 pb-3 pt-8">
          <span className="relative h-[3px] flex-1 rounded-full bg-white/15">
            <span
              style={{ width: `${(position / LENGTH) * 100}%` }}
              className="absolute inset-y-0 left-0 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1)))]"
            />
          </span>
          <span className="font-mono text-[11.5px] tabular-nums text-white/75">
            {clock(position)} / {clock(LENGTH)}
          </span>
        </div>
      </AspectRatio>
      <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-[13px]">
        <span className="text-white/85">Shipping a design system in 30 days</span>
        <span className="shrink-0 text-white/50">Main stage, 16:9</span>
      </figcaption>
    </figure>
  );
}
