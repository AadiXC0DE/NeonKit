"use client";

import * as React from "react";
import { Terminal, Typewriter } from "@/components/ui/terminal";
import { cn } from "@/lib/utils";
import { city } from "./config";
import { nowSession, nowWords } from "./data";
import { useLights } from "./lights";
import { display } from "./section-heading";

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

  return (
    <section id="now" aria-labelledby="now-title" className="relative scroll-mt-16 overflow-hidden">
      <div className="mx-auto max-w-[1200px] px-5 py-28 sm:px-10 sm:py-36">
        <h2 id="now-title" className="max-w-[30ch] text-[17px] leading-relaxed text-white/60">
          <span className="text-white">What has my attention this month.</span> A now page: what I&apos;d tell you if
          we met this week.
        </h2>

        <p
          className={cn(
            display,
            "mt-8 min-h-[3.1em] text-[clamp(40px,6vw,84px)] leading-[1.02] text-white/50 sm:min-h-[2.1em]",
            !on && "[&_[aria-hidden]]:[text-shadow:none]",
          )}
        >
          Right now I&apos;m{" "}
          <span className="text-white">
            <Typewriter words={nowWords} pause={2400} />
          </span>
        </p>

        <div className="mt-16 grid gap-12 sm:mt-24 lg:grid-cols-12 lg:gap-8">
          <p className="max-w-[34ch] text-[16px] leading-[1.65] text-white/60 lg:col-span-4">
            It&apos;s{" "}
            <time className="font-mono text-[15px] tabular-nums text-white/90" suppressHydrationWarning>
              {time ?? "--:--"}
            </time>{" "}
            at my desk in Katendrecht, {city}: an old harbour quarter, a ferry ride from the centre. This page was last
            updated on <time dateTime="2026-10-06" className="text-white/90">6 October 2026</time>.
          </p>

          <div className="lg:col-span-7 lg:col-start-6">
            <Terminal
              title={<span className="text-white/60">juno@katendrecht: ~</span>}
              lines={nowSession}
              typingSpeed={42}
              className="text-[12.5px] sm:text-[13px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
