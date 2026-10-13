"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { sections } from "../config";
import { Eyebrow } from "../primitives";
import { HealthInstrument, ReportInstrument, RollbackInstrument, WindowCountdown } from "./instruments";
import { useNightRun } from "./night-run";
import { QueuePanel } from "./queue-panel";

const section = sections[0];

function Cell({
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
    <article
      className={cn(
        "relative flex flex-col overflow-hidden rounded-[18px] border border-white/[0.08] bg-white/[0.025]",
        className,
      )}
    >
      <div className="relative flex flex-1 flex-col p-5 sm:p-6">{children}</div>
      <p className="border-t border-white/[0.06] px-5 py-4 text-sm leading-relaxed text-white/60 sm:px-6">
        <span className="font-medium text-white/90">{title}</span> {copy}
      </p>
    </article>
  );
}

export function Features() {
  const [autoRollback, setAutoRollback] = React.useState(true);
  const night = useNightRun(autoRollback);

  return (
    <section
      id={section.id}
      aria-labelledby="instruments-title"
      className="relative scroll-mt-20 px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mx-auto max-w-[1120px]">
        <header className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow clock={section.clock}>Instruments</Eyebrow>
            <h2
              id="instruments-title"
              className="mt-4 text-balance text-[clamp(2.25rem,5vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
            >
              Everything that happens while you sleep, on one panel.
            </h2>
          </div>
          <p className="max-w-md text-pretty text-[15px] leading-relaxed text-white/60 lg:col-span-4 lg:col-start-9 lg:pb-1.5">
            The queue, the window, the checks and the switch that decides what happens when one fails. Press run: this
            is tonight, at a few hundred times the speed.
          </p>
        </header>

        <div className="mt-14 grid gap-3 md:grid-cols-2 lg:grid-cols-12 lg:gap-4">
          <Cell
            className="md:col-span-2 lg:col-span-7 lg:row-span-2"
            title="A queue, not a release train."
            copy="Merge whenever. Everything waits for the window, goes out one at a time, and each deploy has to earn the next."
          >
            <QueuePanel night={night} />
          </Cell>

          <Cell
            className="lg:col-span-5"
            title="Ship in the quiet hours."
            copy="Your users' 2am, not yours. Pick the nights; Fridays are off unless you insist."
          >
            <WindowCountdown />
          </Cell>

          <Cell
            className="lg:col-span-5"
            title="Checks that hold for a minute."
            copy="Every canary step is watched against your rules before traffic moves on."
          >
            <HealthInstrument night={night} />
          </Cell>

          <Cell
            className="lg:col-span-5"
            title="One switch for the bad nights."
            copy="Flip it off mid-run and see what the 2am page used to feel like."
          >
            <RollbackInstrument on={autoRollback} onChange={setAutoRollback} night={night} />
          </Cell>

          <Cell
            className="lg:col-span-7"
            title="Read it with coffee."
            copy="What shipped, what didn't and the graph that decided it, waiting in Slack at 07:30."
          >
            <ReportInstrument night={night} />
          </Cell>
        </div>
      </div>
    </section>
  );
}
