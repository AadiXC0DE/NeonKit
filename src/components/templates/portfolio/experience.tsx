"use client";

import * as React from "react";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { cn } from "@/lib/utils";
import { experience } from "./data";
import { useLights } from "./lights";
import { SectionHeading, display } from "./section-heading";

const stats = [
  { value: "11", label: "Years shipping" },
  { value: "38", label: "Products launched" },
  { value: "3", label: "Design systems" },
];

export function Experience() {
  const { on } = useLights();

  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-16">
      <div className="mx-auto grid max-w-[1200px] gap-14 px-5 pb-28 pt-12 sm:px-10 sm:pb-40 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <SectionHeading
              id="experience-title"
              size="md"
              title="Eleven years on both sides of the handoff."
              lede="Trained as an interaction designer, hired as an engineer, and stubborn enough to keep doing both."
            />
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-6">
              {stats.map((stat) => (
                <div key={stat.label} className="flex flex-col-reverse justify-end">
                  <dt className="mt-2 text-[14px] leading-snug text-white/55">{stat.label}</dt>
                  <dd className={cn(display, "text-[clamp(40px,4.4vw,56px)] leading-none text-white")}>
                    {stat.value}
                  </dd>
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
              time={<span className="font-sans text-[14px] text-white/55">{job.period}</span>}
              title={<span className="text-[19px] font-medium tracking-[-0.015em]">{job.company}</span>}
              dateTime={job.dateTime}
            >
              <span className="block text-white/80">
                {job.title}, {job.place}
              </span>
              <span className="mt-1.5 block max-w-[52ch] text-white/60">{job.note}</span>
            </TimelineItem>
          ))}
        </Timeline>
      </div>
    </section>
  );
}
