"use client";

import * as React from "react";
import { ArrowUpRight, MapPin } from "@/components/ui/icons";
import { Cityscape } from "@/components/ui/cityscape";
import { NeonSign } from "@/components/ui/neon-sign";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const LINKS = ["Late kitchens", "The map", "Night markets", "Newsletter", "Write for us", "Contact"];

// Opening times for the counter, in UK time. Index 0 is Sunday. Closing after midnight rolls into the next day.
const TIMEZONE = "Europe/London";
const HOURS: ({ open: string; close: string } | null)[] = [
  { open: "18:00", close: "00:00" },
  null,
  { open: "18:00", close: "01:00" },
  { open: "18:00", close: "01:00" },
  { open: "18:00", close: "02:00" },
  { open: "18:00", close: "04:00" },
  { open: "18:00", close: "04:00" },
];

const ROWS = [
  { label: "Tue – Wed", days: [2, 3], hours: "18:00 – 01:00" },
  { label: "Thu", days: [4], hours: "18:00 – 02:00" },
  { label: "Fri – Sat", days: [5, 6], hours: "18:00 – 04:00" },
  { label: "Sun", days: [0], hours: "18:00 – 00:00" },
  { label: "Mon", days: [1], hours: "Closed" },
];

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const minutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3));

function status(day: number, now: number) {
  const today = HOURS[day];
  const yesterday = HOURS[(day + 6) % 7];
  // Still serving from last night?
  if (yesterday && minutes(yesterday.close) < minutes(yesterday.open) && now < minutes(yesterday.close)) {
    return { open: true, text: `Open now, until ${yesterday.close}` };
  }
  if (today && now >= minutes(today.open)) return { open: true, text: `Open now, until ${today.close}` };
  if (today) return { open: false, text: `Closed, opens ${today.open}` };
  for (let i = 1; i <= 7; i++) {
    const next = HOURS[(day + i) % 7];
    if (next) return { open: false, text: `Closed, opens ${DAY_NAMES[(day + i) % 7]} ${next.open}` };
  }
  return { open: false, text: "Closed" };
}

// Reads the clock in the counter's timezone. Runs in an effect so the server and browser agree on first render.
function useCounterClock() {
  const [now, setNow] = React.useState<{ day: number; minutes: number } | null>(null);
  React.useEffect(() => {
    const format = new Intl.DateTimeFormat("en-GB", {
      timeZone: TIMEZONE,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
    const read = () => {
      const parts = Object.fromEntries(format.formatToParts(new Date()).map((p) => [p.type, p.value]));
      setNow({ day: DAY_NAMES.indexOf(parts.weekday), minutes: Number(parts.hour) * 60 + Number(parts.minute) });
    };
    read();
    const id = window.setInterval(read, 30_000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export default function FooterSign() {
  const clock = useCounterClock();
  const state = clock ? status(clock.day, clock.minutes) : null;

  return (
    <footer
      // Change the color here; everything inside follows it.
      style={neonVars("magenta")}
      className="relative isolate overflow-hidden bg-[#05060a] text-white/90"
    >
      <div className="relative px-6 pt-20 sm:px-10 sm:pt-24 lg:px-16">
        {/* The sign's light on the brickwork behind it */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-[-10%] top-0 -z-10 h-[520px] w-[80%] bg-[radial-gradient(closest-side,rgb(var(--neon)/0.13),transparent)]"
        />

        <div className="mx-auto grid max-w-[1180px] gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-end lg:gap-16">
          <div>
            <NeonSign
              buzz
              lines={[{ text: "Neon Alley" }, { text: "eat late", className: "mt-[0.06em] text-[0.36em] tracking-[0.08em]" }]}
              className="-ml-[0.1em] text-[clamp(52px,11vw,120px)]"
              style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
            />
            <p className="mt-8 max-w-[46ch] text-[17px] leading-[1.6] text-white/60">
              Eating after dark in Leeds since 2019.{" "}
              <span className="text-white/50">214 late kitchens reviewed, every bill paid by us.</span>
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <h2 className="text-[15px] font-medium text-white">The Counter</h2>
              <address className="mt-2 text-[15px] not-italic leading-relaxed text-white/60">
                41 Kiln Street, Leeds LS2 7HQ
                <br />
                Under the railway arch, follow the noodle steam.
              </address>
              <a
                href="#"
                className="-mb-2 mt-1 inline-flex items-center gap-1.5 rounded-md py-2 text-sm text-[rgb(var(--neon))] outline-none hover:underline hover:underline-offset-4 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
              >
                <MapPin aria-hidden className="size-4" /> Directions
              </a>
            </div>

            <div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-[15px] font-medium text-white">Hours</h2>
                <p role="status" className="flex h-5 items-center gap-2 text-[13px] text-white/60">
                  {state && (
                    <>
                      <span
                        aria-hidden
                        className={cn(
                          "size-1.5 rounded-full",
                          state.open
                            ? "bg-[rgb(52_211_153)] shadow-[0_0_8px_rgb(52_211_153/0.9)]"
                            : "bg-white/25",
                        )}
                      />
                      {state.text}
                    </>
                  )}
                </p>
              </div>
              <dl className="mt-4 divide-y divide-white/[0.06] border-y border-white/[0.06] text-sm">
                {ROWS.map((row) => {
                  const today = clock !== null && row.days.includes(clock.day);
                  return (
                    <div key={row.label} className="flex items-center justify-between py-2.5">
                      <dt className={cn("flex items-center gap-2", today ? "text-white" : "text-white/55")}>
                        {row.label}
                        {today && (
                          <span className="text-[12px] text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]">
                            Today
                          </span>
                        )}
                      </dt>
                      <dd className={cn("font-mono text-[13px] tabular-nums", today ? "text-white" : "text-white/55")}>
                        {row.hours}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </div>
        </div>

        <nav aria-label="Footer" className="mx-auto mt-16 max-w-[1180px] border-t border-white/[0.07] pt-4">
          <ul className="flex flex-wrap gap-x-7 gap-y-1 text-[15px] text-white/65">
            {LINKS.map((link) => (
              <li key={link}>
                <a
                  href="#"
                  className="inline-block rounded-md py-1.5 outline-none transition-colors duration-150 hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                >
                  {link}
                </a>
              </li>
            ))}
            <li className="sm:ml-auto">
              <a
                href="#"
                className="inline-flex items-center gap-1 rounded-md py-1.5 outline-none transition-colors duration-150 hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
              >
                Get the app <ArrowUpRight aria-hidden className="size-3.5" />
              </a>
            </li>
          </ul>
        </nav>
      </div>

      {/* Street level: the skyline the guide covers, with the small print on the pavement */}
      <div className="relative mt-6 h-[200px] sm:h-[240px]">
        <Cityscape seed={23} signs={["NOODLES", "OPEN"]} lights={0.22} className="absolute inset-0" />
        <div aria-hidden className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(#05060a,transparent)]" />
      </div>
      <div className="border-t border-white/[0.06] bg-[#05060a] px-6 py-5 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-2 text-[13px] text-white/55 sm:flex-row sm:justify-between">
          <span>© 2026 Neon Alley Ltd.</span>
          <span className="flex gap-5">
            <a href="#" className="-my-2 inline-block rounded-md py-2 outline-none hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
              Privacy
            </a>
            <a href="#" className="-my-2 inline-block rounded-md py-2 outline-none hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]">
              Terms
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
