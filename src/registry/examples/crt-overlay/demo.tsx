"use client";

import * as React from "react";
import { Power } from "@/components/ui/icons";
import { CrtOverlay } from "@/components/ui/crt-overlay";
import { cn } from "@/lib/utils";

const scores = [
  { rank: "1st", name: "AOK", score: "048 220" },
  { rank: "2nd", name: "MRA", score: "041 905" },
  { rank: "3rd", name: "JNO", score: "039 410" },
  { rank: "4th", name: "TKS", score: "031 775" },
  { rank: "5th", name: "ELI", score: "027 060" },
];

export default function CrtOverlayDemo() {
  const [on, setOn] = React.useState(true);

  return (
    <div className="w-full max-w-md rounded-[30px] [--neon:var(--neon-accent,34_211_238)] border border-white/10 bg-[linear-gradient(180deg,#17181f,#0b0c11)] p-4 pb-3 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.08)]">
      <CrtOverlay on={on} animateOnMount curvature className="aspect-[4/3]">
        <div className="flex h-full flex-col items-center justify-center px-6 font-mono uppercase sm:px-8">
          <p className="text-[11px] tracking-[0.3em] text-[rgb(var(--neon))] sm:text-[13px]">High scores</p>
          <ol className="mt-3 w-full max-w-60 space-y-1 text-[11px] tabular-nums tracking-[0.12em] text-white/90 sm:mt-5 sm:space-y-1.5 sm:text-[13px]">
            {scores.map((row, i) => (
              <li key={row.rank} className={cn("flex justify-between", i === 0 && "text-[rgb(var(--neon))]")}>
                <span className="w-10">{row.rank}</span>
                <span>{row.name}</span>
                <span>{row.score}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-[10px] tracking-[0.3em] text-white/90 motion-safe:animate-pulse motion-safe:[animation-duration:1.4s] sm:mt-6 sm:text-[12px]">
            Insert coin
          </p>
          <p className="absolute bottom-3 left-6 text-[9px] tracking-[0.2em] text-white/50 sm:bottom-4 sm:text-[10px]">Credit 0</p>
        </div>
      </CrtOverlay>

      <div className="mt-3 flex items-center justify-between px-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/50">NK-14 colour monitor</span>
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              "size-1.5 rounded-full transition-[background-color,box-shadow] duration-300",
              on
                ? "bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.6)]"
                : "bg-[rgb(var(--neon)/0.15)]",
            )}
          />
          <button
            type="button"
            aria-label="Power"
            aria-pressed={on}
            onClick={() => setOn((value) => !value)}
            className="grid size-8 cursor-pointer place-items-center rounded-full border border-white/10 bg-[linear-gradient(180deg,#22232b,#121319)] text-white/60 shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_2px_4px_rgb(0_0_0/0.5)] outline-none transition-[transform,color] duration-150 hover:text-white/90 active:scale-[0.94] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0c11]"
          >
            <Power className="size-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
