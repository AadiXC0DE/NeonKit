"use client";

import * as React from "react";
import { ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { NeonText } from "@/components/ui/neon-text";
import { Switch } from "@/components/ui/switch";
import { neonVars } from "@/lib/neon";

const LAST_NIGHT = [
  { time: "01:58", line: "14 deploys queued from 6 repos" },
  { time: "02:00", line: "Canary at 5% in fra1 and iad1" },
  { time: "02:41", line: "Promoted. Error rate 0.02%" },
  { time: "07:30", line: "Report in #releases" },
];

function Screw({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute size-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#4a505e,#0d0f15)] shadow-[0_1px_0_rgb(255_255_255/0.06),0_0_0_1px_rgb(0_0_0/0.6)] ${className}`}
    />
  );
}

export default function HeroSign() {
  const [on, setOn] = React.useState(true);

  return (
    <section
      // Change the sign's color here; everything inside follows it.
      style={neonVars("magenta")}
      className="relative isolate flex min-h-[720px] flex-col overflow-hidden bg-[#05060a] px-5 pb-12 pt-6 text-white sm:px-10 lg:px-14">
      {/* Brick-free wall: a faint vertical grain and the light the sign throws on it. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[repeating-linear-gradient(90deg,rgb(255_255_255/0.012)_0_1px,transparent_1px_7px),radial-gradient(ellipse_80%_60%_at_40%_38%,#0e0f17,#05060a_70%)]"
      />
      <div
        aria-hidden
        className="absolute left-[38%] top-[36%] -z-10 h-[46%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[rgb(var(--neon)/0.2)] blur-[110px] transition-opacity duration-500"
        style={{ opacity: on ? 1 : 0 }}
      />

      <header className="flex items-center justify-between">
        <span className="text-[15px] font-medium tracking-[-0.01em] text-white/90">Nightshift</span>
        <Switch
          size="sm"
          checked={on}
          onCheckedChange={setOn}
          label={<span className="text-[13px] text-white/60">{on ? "Sign on" : "Sign off"}</span>}
        />
      </header>

      <div className="flex flex-1 flex-col justify-center pb-6 pt-14 sm:pt-20">
        {/* The sign hangs off-axis, left of centre, the way a real one sits on a wall. */}
        <div className="relative -ml-2 w-fit max-w-full rounded-[28px] border border-white/[0.06] bg-white/[0.012] px-7 pb-4 pt-2 shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_40px_80px_-40px_rgb(0_0_0/0.9)] sm:-ml-4 sm:px-10 sm:pb-6 lg:px-14">
          <Screw className="left-3 top-3" />
          <Screw className="right-3 top-3" />
          <Screw className="bottom-3 left-3" />
          <Screw className="bottom-3 right-3" />
          <NeonText
            as="h1"
            on={on}
            buzz
            className="block whitespace-nowrap text-[clamp(3.4rem,17.5vw,15rem)] font-light leading-[1.02] tracking-[-0.035em]">
            nightshift
          </NeonText>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-12 lg:items-end lg:gap-8">
          <div className="lg:col-span-6">
            <p className="max-w-[30ch] text-balance text-[clamp(1.25rem,2vw,1.6rem)] leading-[1.3] tracking-[-0.015em] text-white/90">
              Deploys that land at 2am.{" "}
              <span className="text-white/50">Queue them, close the laptop, read the report with coffee.</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
              <Button variant="solid" size="lg">
                Start free <ArrowRight />
              </Button>
              <Button variant="ghost" size="lg">
                See last night&apos;s run
              </Button>
            </div>
          </div>

          <figure className="lg:col-span-5 lg:col-start-8">
            <figcaption className="mb-3 flex items-baseline justify-between text-[13px] text-white/55">
              <span>Last night, eu-central</span>
              <span className="tabular-nums">Tue 13 Oct</span>
            </figcaption>
            <ol className="border-t border-white/[0.08]">
              {LAST_NIGHT.map((entry, i) => {
                const last = i === LAST_NIGHT.length - 1;
                return (
                  <li
                    key={entry.time}
                    className="flex items-baseline gap-5 border-b border-white/[0.06] py-2.5 text-[14px]">
                    <span
                      className={`font-mono tabular-nums transition-[color,text-shadow] duration-300 ${
                        last && on
                          ? "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]"
                          : "text-white/50"
                      }`}>
                      {entry.time}
                    </span>
                    <span className={last ? "text-white/90" : "text-white/65"}>{entry.line}</span>
                  </li>
                );
              })}
            </ol>
          </figure>
        </div>
      </div>
    </section>
  );
}
