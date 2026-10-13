"use client";

import * as React from "react";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import { experience } from "./data";
import { useLights } from "./lights";
import { Eyebrow } from "./section-heading";

const stats = [
  { value: "11", label: "Years shipping" },
  { value: "38", label: "Products launched" },
  { value: "3", label: "Design systems" },
];

export function Experience() {
  const { on } = useLights();

  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-16 border-t border-white/[0.06]">
      <div className="mx-auto grid max-w-[1200px] gap-14 px-5 py-24 sm:px-10 sm:py-32 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <Eyebrow index={3}>Experience</Eyebrow>
            <h2
              id="experience-title"
              className="mt-5 text-balance text-[clamp(32px,4.6vw,56px)] font-medium leading-[1.02] tracking-[-0.04em] text-white"
            >
              Eleven years on both sides of the handoff.
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-white/60">
              Trained as an interaction designer, hired as an engineer, and stubborn enough to keep doing both.
            </p>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/[0.08] pt-5">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse justify-end">
                  <dt className="mt-1 text-[13px] text-white/60">{stat.label}</dt>
                  <dd className="text-[28px] font-medium tabular-nums tracking-[-0.03em] text-white">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <Timeline
          aria-label="Work history"
          className={cn(
            "lg:col-span-6 lg:col-start-7",
            "[&>li>div:first-child]:transition-opacity [&>li>div:first-child]:duration-500",
            !on && "[&>li>div:first-child]:opacity-30",
          )}
        >
          {/* Oldest first, so the tube lights up from the start to now */}
          {[...experience].reverse().map((job) => (
            <TimelineItem
              key={job.company}
              status={job.current ? "current" : "done"}
              time={<span className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/60">{job.period}</span>}
              title={<span className="text-[17px] tracking-[-0.01em]">{job.company}</span>}
              dateTime={job.dateTime}
            >
              <span className="block text-white/80">
                {job.title} · {job.place}
              </span>
              <span className="mt-1.5 block max-w-[52ch] text-white/60">{job.note}</span>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </section>
  );
}
