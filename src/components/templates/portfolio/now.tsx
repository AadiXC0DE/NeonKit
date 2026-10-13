"use client";

import * as React from "react";
import { Terminal, Typewriter } from "@/components/ui/terminal";
import { cn } from "@/lib/utils";
import { city } from "./config";
import { nowSession, nowWords } from "./data";
import { useLights } from "./lights";
import { Eyebrow } from "./section-heading";

const timeFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Amsterdam",
});

// Rendered as a placeholder on the server, then ticks on the client.
function useLocalTime() {
  const [time, setTime] = React.useState<string | null>(null);
  React.useEffect(() => {
    const tick = () => setTime(timeFormat.format(new Date()));
    tick();
    const timer = window.setInterval(tick, 15_000);
    return () => window.clearInterval(timer);
  }, []);
  return time;
}

export function Now() {
  const { on } = useLights();
  const time = useLocalTime();

  const facts = [
    { label: "Local time", value: <span className="tabular-nums">{time ?? "--:--"}</span> },
    { label: "Desk", value: `Katendrecht, ${city}` },
    { label: "Updated", value: <time dateTime="2026-10-06">6 Oct 2026</time> },
  ];

  return (
    <section id="now" aria-labelledby="now-title" className="scroll-mt-16 border-t border-white/[0.06]">
      <div className="mx-auto grid max-w-[1200px] gap-12 px-5 py-24 sm:px-10 sm:py-32 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-5">
          <Eyebrow index={2}>Now</Eyebrow>
          <h2
            id="now-title"
            className="mt-5 text-[clamp(32px,4.6vw,56px)] font-medium leading-[1.02] tracking-[-0.04em] text-white"
          >
            What has my attention this month.
          </h2>
          <p
            className={cn(
              "mt-8 min-h-[2.7em] text-[clamp(20px,2vw,24px)] leading-[1.35] tracking-[-0.02em] text-white/70",
              !on && "[&_[aria-hidden]]:[text-shadow:none]",
            )}
          >
            Right now I&apos;m <Typewriter words={nowWords} pause={2400} />
          </p>
          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-white/[0.08] pt-5">
            {facts.map((fact) => (
              <div key={fact.label} className="min-w-0">
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/55">{fact.label}</dt>
                <dd className="mt-1.5 text-sm text-white/85">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <Terminal
            title={<span className="text-white/60">juno@katendrecht: ~</span>}
            lines={nowSession}
            typingSpeed={42}
            className="text-[12.5px] sm:text-[13px]"
          />
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
            A now page: what I&apos;d tell you if we met this week.
          </p>
        </div>
      </div>
    </section>
  );
}
