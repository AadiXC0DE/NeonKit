"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";

import { event } from "./config";
import { agenda, rooms, speakers } from "./data";
import { slotStatus, useEvent, useNow, type Phase } from "./event-state";

const KIND = { doors: "doors", talk: "talk", workshop: "workshop, 30 seats", break: "break", panel: "panel" } as const;
const clock = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Amsterdam" });

const NOTE: Record<Phase, string> = {
  before: "The line lights up as the night runs.",
  live: "Lit up to",
  after: "That's a wrap. Every main hall session is on the replay.",
};

export function Agenda() {
  const { phase, ready } = useEvent();
  const now = useNow(30000);
  const [room, setRoom] = React.useState("all");
  const shown: Phase = ready ? phase : "before";
  const slots = agenda.filter((slot) => room === "all" || slot.room === room);

  return (
    <section id="agenda" aria-labelledby="agenda-title" className="scroll-mt-20 border-t border-white/[0.06] bg-[#07070c] px-5 py-24 sm:px-8 lg:py-32">
      <div className="mx-auto grid max-w-[1176px] gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:sticky lg:top-28 lg:col-span-4 lg:self-start">
          <h2
            id="agenda-title"
            className="text-[clamp(2.6rem,6vw,5rem)] font-[640] leading-[0.92] tracking-[-0.045em] text-white [font-stretch:112%]"
          >
            The running order.
          </h2>
          <p className="mt-7 max-w-[40ch] text-pretty text-[16px] leading-[1.6] text-white/70">
            {event.dateLabel}, Rotterdam time. Talks run 25 minutes with five for questions. The main hall is streamed; the Cellar
            isn&apos;t, so get there early.
          </p>

          <div className="mt-8 max-w-full overflow-x-auto">
            <ToggleGroup
              aria-label="Filter by room"
              value={room}
              onValueChange={(value) => value && setRoom(value)}
              size="sm"
            >
              <ToggleGroupItem value="all">All rooms</ToggleGroupItem>
              {rooms.map((name) => (
                <ToggleGroupItem key={name} value={name}>
                  {name}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <p className="mt-6 flex items-center gap-2.5 text-[13px] text-white/60">
            <span
              aria-hidden
              className={cn(
                "h-[3px] w-6 rounded-full",
                shown === "before"
                  ? "bg-white/[0.12]"
                  : "bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_10px_rgb(var(--neon)/0.6)]",
              )}
            />
            {NOTE[shown]}
            {shown === "live" && now !== null && <span className="font-mono tabular-nums text-white/90">{clock.format(now)}</span>}
          </p>
        </div>

        <div className="lg:col-span-7 lg:col-start-6">
          <p className="sr-only" aria-live="polite">
            {slots.length} sessions shown
          </p>
          <Timeline key={room} statusLabels={{ done: "Finished", upcoming: "Later" }}>
            {slots.map((slot) => {
              const status = shown === "before" ? "upcoming" : shown === "after" ? "done" : slotStatus(slot, now);
              const speaker = speakers.find((s) => s.id === slot.speaker);
              const quiet = slot.kind === "doors" || slot.kind === "break";
              return (
                <TimelineItem
                  key={slot.id}
                  id={`slot-${slot.id}`}
                  status={status}
                  className="scroll-mt-28"
                  title={
                    <span className="block">
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <time
                          dateTime={`${event.doorsAt.slice(0, 10)}T${slot.start}`}
                          className={cn(
                            "text-[17px] font-[620] tracking-[-0.01em] [font-stretch:112%]",
                            status === "current" ? "[color:color-mix(in_srgb,rgb(var(--neon))_40%,white)]" : "text-white/90",
                          )}
                        >
                          {slot.start}
                          <span className="font-normal text-white/50">–{slot.end}</span>
                        </time>
                        <span className="text-[14px] font-normal text-white/60">
                          {slot.room}
                          {slot.kind !== "talk" && <>, {KIND[slot.kind]}</>}
                        </span>
                        {status === "current" && (
                          <Badge variant="outline" size="sm" pulse className="ml-1">
                            Now
                          </Badge>
                        )}
                      </span>
                      <h3 className={cn("mt-2 text-[20px] font-semibold leading-tight tracking-[-0.02em] sm:text-[24px]", quiet ? "text-white/65" : "text-white")}>
                        {slot.title}
                      </h3>
                    </span>
                  }
                >
                  {speaker && slot.kind !== "panel" && (
                    <span className="mt-1 block text-[14px] text-white/80">
                      {speaker.name} <span className="text-white/60">· {speaker.role}, {speaker.company}</span>
                    </span>
                  )}
                  <span className="mt-2 block max-w-[58ch] text-pretty text-[15px] leading-relaxed text-white/65">{slot.note}</span>
                </TimelineItem>
              );
            })}
          </Timeline>
        </div>
      </div>
    </section>
  );
}
