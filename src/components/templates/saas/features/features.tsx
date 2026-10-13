"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { sections } from "../config";
import { Headline } from "../primitives";
import { HealthInstrument, ReportInstrument, RollbackInstrument, WindowCountdown } from "./instruments";
import { useNightRun } from "./night-run";
import { QueuePanel } from "./queue-panel";

const section = sections[0];

/** One region of the panel: what it is, one dry sentence, then the instrument itself. */
function Region({
  title,
  copy,
  className,
  children,
}: {
  title: string;
  copy: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative flex min-w-0 flex-col bg-[#08090d] p-5 sm:p-7", className)}>
      <h3 className="text-[15px] font-medium leading-snug text-white">{title}</h3>
      <p className="mt-1 max-w-[46ch] text-pretty text-[14px] leading-relaxed text-white/55">{copy}</p>
      <div className="mt-6 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

export function Features() {
  const [autoRollback, setAutoRollback] = React.useState(true);
  const night = useNightRun(autoRollback);

  return (
    <section
      id={section.id}
      aria-labelledby="instruments-title"
      className="relative scroll-mt-20 px-5 pb-24 pt-8 sm:px-8 lg:pb-40"
    >
      <div className="mx-auto max-w-[1120px]">
        <header className="max-w-[980px]">
          <Headline id="instruments-title" clock={section.clock} className="text-[clamp(2.25rem,5.4vw,4.5rem)]">
            Everything that happens while you sleep, on one panel.
          </Headline>
          <p className="mt-7 max-w-[52ch] text-pretty text-[16px] leading-[1.6] text-white/60">
            The queue, the window, the checks, and the switch that decides what happens when one fails. Press run and
            tonight plays out at a few hundred times the speed.
          </p>
        </header>

        {/* One panel, split by hairlines rather than a box per idea */}
        <div className="mt-14 grid gap-px overflow-hidden rounded-[14px] border border-white/[0.08] bg-white/[0.07] shadow-[0_40px_120px_-60px_rgb(0_0_0/0.9)] md:grid-cols-2 lg:mt-16 lg:grid-cols-12">
          <Region
            className="md:col-span-2 lg:col-span-7 lg:row-span-2"
            title="A queue, not a release train."
            copy="Merge whenever. Everything waits for the window, goes out one at a time, and each deploy has to earn the next."
          >
            <QueuePanel night={night} />
          </Region>

          <Region
            className="lg:col-span-5"
            title="Ship in the quiet hours."
            copy="Your users' 2am, not yours. Pick the nights; Fridays are off unless you insist."
          >
            <WindowCountdown />
          </Region>

          <Region
            className="lg:col-span-5"
            title="Checks that hold for a minute."
            copy="Each canary step is watched against your rules before any more traffic moves."
          >
            <HealthInstrument night={night} />
          </Region>

          <Region
            className="lg:col-span-5"
            title="One switch for the bad nights."
            copy="Flip it off mid-run to see what the 2am page used to feel like."
          >
            <RollbackInstrument on={autoRollback} onChange={setAutoRollback} night={night} />
          </Region>

          <Region
            className="lg:col-span-7"
            title="Read it with coffee."
            copy="What shipped, what didn't and the graph that decided it, waiting in Slack at 07:30."
          >
            <ReportInstrument night={night} />
          </Region>
        </div>
      </div>
    </section>
  );
}
