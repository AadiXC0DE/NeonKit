"use client";

import { ArrowUpRight } from "lucide-react";

import { event } from "./config";
import { replay, speakers } from "./data";
import { slotAt, useEvent, useNow } from "./event-state";

const link =
  "group inline-flex shrink-0 items-center gap-1 rounded-md font-medium text-white outline-none underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]";

/** A strip over the header once doors open: what's on now, then where the replay is. */
export function LiveBanner() {
  const { phase, ready } = useEvent();
  const now = useNow(15000);
  if (!ready || phase === "before") return null;

  const slot = phase === "live" ? slotAt(now) : null;
  const speaker = slot?.speaker ? speakers.find((s) => s.id === slot.speaker) : undefined;

  return (
    <div
      role="region"
      aria-label={phase === "live" ? "Live now" : "Replay"}
      className="relative z-50 overflow-hidden border-b border-[rgb(var(--neon)/0.25)] bg-[linear-gradient(90deg,rgb(var(--neon)/0.16),rgb(var(--neon)/0.06)_60%,rgb(var(--neon)/0.12))]"
    >
      <div className="mx-auto flex max-w-[1240px] items-center gap-x-4 gap-y-1 px-5 py-2.5 text-[13px] leading-5 sm:px-8">
        <span className="flex shrink-0 items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] [color:color-mix(in_srgb,rgb(var(--neon))_45%,white)]">
          <span aria-hidden className="relative flex size-2">
            {phase === "live" && (
              <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--neon))] opacity-60 [animation-duration:1.6s] motion-reduce:animate-none" />
            )}
            <span className="relative size-2 rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_6px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.7)]" />
          </span>
          {phase === "live" ? "On air now" : "Replay is up"}
        </span>

        <p className="min-w-0 flex-1 truncate text-white/75">
          {phase === "live" ? (
            slot ? (
              <>
                <span className="hidden sm:inline">{slot.room}: </span>
                <span className="text-white">{slot.title}</span>
                {speaker && <span className="hidden md:inline">, {speaker.name}</span>}
              </>
            ) : (
              "Between talks. Back in a minute."
            )
          ) : (
            <>
              <span className="text-white">All {replay.talks} sessions</span>
              <span className="hidden sm:inline">, {replay.runtime}, captioned</span>
            </>
          )}
        </p>

        <a href={phase === "live" ? event.streamUrl : event.replayUrl} target="_blank" rel="noreferrer" className={link}>
          Watch
          <span className="hidden sm:inline">{phase === "live" ? " the stream" : " the replay"}</span>
          <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-200 group-hover:-translate-y-px group-hover:translate-x-px" />
        </a>
      </div>
    </div>
  );
}
