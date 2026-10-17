"use client";

import * as React from "react";
import { Check, LayoutGrid, CalendarDays, Users, ChartColumn, Settings } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { DeviceFrame } from "@/components/ui/device-frame";
import { Switch } from "@/components/ui/switch";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

type TableState = "free" | "booked" | "seated";
type Table = { id: string; seats: number; state: TableState; wide?: boolean };

// The floor at 20:14 on a Friday. Booked tables are waiting for the parties on the host's phone.
const TABLES: Table[] = [
  { id: "T1", seats: 2, state: "free" },
  { id: "T2", seats: 2, state: "seated" },
  { id: "T3", seats: 2, state: "booked" },
  { id: "T4", seats: 4, state: "seated" },
  { id: "T5", seats: 2, state: "booked" },
  { id: "T6", seats: 4, state: "seated" },
  { id: "T7", seats: 4, state: "booked" },
  { id: "T8", seats: 6, state: "seated", wide: true },
  { id: "T9", seats: 4, state: "booked" },
  { id: "T10", seats: 2, state: "free" },
  { id: "T11", seats: 4, state: "seated" },
  { id: "T12", seats: 6, state: "booked", wide: true },
  { id: "T13", seats: 2, state: "seated" },
];

const ARRIVALS = [
  { name: "Okafor", size: 4, at: "20:15", table: "T7" },
  { name: "Lindqvist", size: 2, at: "20:15", table: "T3" },
  { name: "Marchetti", size: 6, at: "20:30", table: "T12" },
  { name: "Tanaka", size: 2, at: "20:30", table: "T5" },
  { name: "Haddad", size: 4, at: "20:45", table: "T9" },
];

const EARLIER = [
  { at: "20:09", text: "Ruiz, 4 at T11", by: "Ana" },
  { at: "20:04", text: "Walk-in, 2 at T13", by: "Ana" },
  { at: "19:58", text: "Becker, 6 at T8", by: "Joel" },
  { at: "19:51", text: "Osei, 4 at T6", by: "Ana" },
];

const SEATED_AT_START = 34;

const WAITLIST = [
  { name: "Walk-in", size: 2, quoted: 20 },
  { name: "Brennan", size: 3, quoted: 35 },
];

// Covers booked per quarter hour, 18:00 to 23:00. The slot at index 8 (20:00) is the one running now.
const QUARTERS = [4, 6, 10, 8, 12, 16, 14, 18, 22, 16, 12, 14, 10, 8, 6, 4, 2, 2, 0, 0];
const NOW = 8;
// Page sizes the two screens are drawn at, then scaled to fit their frames like a screenshot.
const DESKTOP = { width: 1120, height: 680 };
const PHONE = { width: 390, height: 845 };

const useIsoLayoutEffect = typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;

/** Draws its children at a fixed page size and scales them to the width of the frame's screen. */
function Scaled({ width, height, children }: { width: number; height: number; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null);
  useIsoLayoutEffect(() => {
    const node = ref.current;
    const screen = node?.parentElement;
    if (!node || !screen || typeof ResizeObserver === "undefined") return;
    const fit = () => node.style.setProperty("transform", `scale(${screen.clientWidth / width})`);
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(screen);
    return () => observer.disconnect();
  }, [width]);
  return (
    <div ref={ref} style={{ width, height }} className="absolute left-0 top-0 origin-top-left">
      {children}
    </div>
  );
}

type Entry = { key: number; at: string; text: string; by: string; ms?: number };

function clock(minutesAfter: number) {
  const total = 20 * 60 + 14 + minutesAfter;
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export default function MarketingDevice() {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [seated, setSeated] = React.useState<string[]>([]);
  const [lit, setLit] = React.useState<string[]>([]);
  const [feed, setFeed] = React.useState<Entry[]>([]);
  const [walkIns, setWalkIns] = React.useState(true);
  const touched = React.useRef(false);
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);

  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // The host taps on the phone; the office sees it a beat later, like the real round trip.
  const seat = React.useCallback((name: string) => {
    const party = ARRIVALS.find((p) => p.name === name);
    if (!party) return;
    setSeated((prev) => (prev.includes(name) ? prev : [...prev, name]));
    const ms = 96 + Math.round(Math.random() * 44);
    timers.current.push(
      setTimeout(() => {
        setLit((prev) => (prev.includes(party.table) ? prev : [...prev, party.table]));
        setFeed((prev) => [
          { key: Date.now(), at: clock(prev.length + 1), text: `${party.name}, ${party.size} at ${party.table}`, by: "Ana", ms },
          ...prev,
        ]);
      }, ms),
    );
  }, []);

  // Until someone presses a button, the host works through the list on their own, one party every few seconds.
  React.useEffect(() => {
    const node = sectionRef.current;
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inView = false;
    let step = 0;
    const tick = () => {
      timer = undefined;
      if (touched.current) return;
      if (step < ARRIVALS.length) {
        seat(ARRIVALS[step].name);
        step += 1;
        timer = setTimeout(tick, 3200);
      } else {
        // Everyone's in. Clear the floor and start the evening again.
        step = 0;
        setSeated([]);
        setLit([]);
        setFeed([]);
        timer = setTimeout(tick, 2400);
      }
    };
    const sync = () => {
      const run = inView && !document.hidden && !touched.current;
      if (run && !timer) timer = setTimeout(tick, 2000);
      else if (!run && timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    }, { threshold: 0.3 });
    io.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      if (timer) clearTimeout(timer);
    };
  }, [seat]);

  const tables = TABLES.map((t) => ({ ...t, state: lit.includes(t.id) ? ("seated" as const) : t.state }));
  const seatedNow = SEATED_AT_START + ARRIVALS.filter((p) => lit.includes(p.table)).reduce((sum, p) => sum + p.size, 0);
  const next = ARRIVALS.filter((p) => !seated.includes(p.name));
  const entries: Entry[] = [...feed, ...EARLIER.map((e, i) => ({ ...e, key: -i - 1 }))].slice(0, 6);

  return (
    <section
      ref={sectionRef}
      aria-labelledby="covers-devices-title"
      // Change the color here; everything inside follows it.
      style={neonVars("amber")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-24 text-white sm:px-8 lg:py-32"
    >
      <div className="mx-auto max-w-[1180px]">
        <div className="max-w-[620px]">
          <h2
            id="covers-devices-title"
            className="text-[clamp(2.5rem,5.4vw,4.25rem)] font-[620] leading-[0.98] tracking-[-0.042em] text-white [font-stretch:112%]"
          >
            Tap it on the floor.
            <br />
            See it in the office.
          </h2>
          <p className="mt-6 max-w-[50ch] text-pretty text-[17px] leading-[1.6] text-white/60">
            Covers puts the host stand on a phone and the book on a laptop. Seat a party on one and the other lights the
            table about 120&nbsp;ms later. <span className="text-white/85">Press Seat on the phone to try it.</span>
          </p>
        </div>

        <div className="relative mt-14 lg:mt-20 lg:pr-[230px]">
          {/* The office: tonight's floor on a laptop. */}
          <DeviceFrame url="app.covers.co/tonight" className="isolate" aspectRatio={`${DESKTOP.width} / ${DESKTOP.height}`}>
            <Scaled {...DESKTOP}>
              <div className="flex size-full text-[14px] text-white/80">
                <aside className="flex w-[196px] shrink-0 flex-col border-r border-white/[0.06] px-5 py-6">
                  <p className="text-[17px] font-semibold tracking-[-0.02em] text-white/90">
                    Covers <span className="font-normal text-white/45">· Sorrel</span>
                  </p>
                  <ul className="mt-8 space-y-1 text-white/55">
                    {[
                      { icon: LayoutGrid, label: "Tonight", on: true },
                      { icon: CalendarDays, label: "Bookings" },
                      { icon: Users, label: "Guests" },
                      { icon: ChartColumn, label: "Reports" },
                      { icon: Settings, label: "Settings" },
                    ].map(({ icon: Icon, label, on }) => (
                      <li
                        key={label}
                        className={cn("-mx-2.5 flex items-center gap-3 rounded-lg px-2.5 py-2", on && "bg-white/[0.05] text-white/90")}
                      >
                        <Icon aria-hidden className="size-4" />
                        {label}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto border-t border-white/[0.06] pt-4">
                    <Switch size="sm" checked={walkIns} onCheckedChange={setWalkIns} label="Walk-ins" />
                    <p className="mt-1.5 pl-[38px] text-[12px] text-white/45">{walkIns ? "Host can add to the waitlist" : "Closed for tonight"}</p>
                  </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col px-8 py-6">
                  <div>
                    <p className="text-[22px] font-semibold tracking-[-0.02em] text-white/95">Tonight</p>
                    <p className="mt-0.5 text-[13px] text-white/50">Friday 12 March · 20:14</p>
                  </div>

                  <dl className="mt-6 grid grid-cols-4 gap-6 border-y border-white/[0.06] py-4">
                    {[
                      ["Booked", "184"],
                      ["Seated now", String(seatedNow)],
                      ["Avg. turn", "1 h 38"],
                      ["No-shows", "3.1%"],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-[12.5px] text-white/50">{label}</dt>
                        <dd className="mt-1 text-[24px] font-medium tabular-nums tracking-[-0.03em] text-white/90">{value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6 grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_250px] gap-8">
                    <div>
                      <p className="text-[13px] text-white/50">Floor · 13 tables</p>
                      <ul className="mt-3 grid grid-cols-5 gap-3">
                        {tables.map((t) => (
                          <li
                            key={t.id}
                            className={cn(
                              "flex h-[78px] flex-col justify-between rounded-[10px] border px-3 py-2.5 transition-[border-color,background-color,box-shadow] duration-500",
                              t.wide && "col-span-2",
                              t.state === "seated" &&
                                "border-[rgb(var(--neon)/0.55)] bg-[rgb(var(--neon)/0.1)] shadow-[0_0_18px_-4px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1)))]",
                              t.state === "booked" && "border-white/[0.14] border-dashed",
                              t.state === "free" && "border-white/[0.06] bg-white/[0.015]",
                            )}
                          >
                            <span className={cn("text-[13px] font-medium", t.state === "seated" ? "text-[rgb(var(--neon))]" : "text-white/75")}>
                              {t.id}
                            </span>
                            <span className="text-[12px] text-white/50">
                              {t.state === "booked"
                                ? `${ARRIVALS.find((p) => p.table === t.id)?.at} · ${t.seats}`
                                : t.state === "seated"
                                  ? `${t.seats} seated`
                                  : `${t.seats} seats, free`}
                            </span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-7 flex items-baseline justify-between text-[13px] text-white/50">
                        <p>Covers booked per 15 min</p>
                        <p className="font-mono text-[12px] tabular-nums">18:00 – 23:00</p>
                      </div>
                      <div aria-hidden className="mt-3 flex h-[64px] items-end gap-[5px] border-b border-white/[0.06]">
                        {QUARTERS.map((n, i) => (
                          <span
                            key={i}
                            style={{ height: `${Math.max(3, (n / 22) * 100)}%` }}
                            className={cn(
                              "flex-1 rounded-t-[3px]",
                              i < NOW && "bg-white/[0.14]",
                              i === NOW && "bg-[rgb(var(--neon))] shadow-[0_0_12px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))]",
                              i > NOW && "bg-[rgb(var(--neon)/0.28)]",
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[13px] text-white/50">
                        <span
                          aria-hidden
                          className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/CALC(0.9*var(--neon-glow,1)))]"
                        />
                        From the floor
                      </p>
                      <ul className="mt-3 divide-y divide-white/[0.05]">
                        {entries.map((e) => (
                          <li key={e.key} className="py-2.5">
                            <p className="truncate text-white/85">{e.text}</p>
                            <p className="mt-0.5 text-[12px] text-white/45">
                              <span className="font-mono tabular-nums">{e.at}</span> · {e.by}&apos;s phone
                              {e.ms !== undefined && (
                                <>
                                  {" · "}
                                  <span className="font-mono tabular-nums text-[rgb(var(--neon)/0.85)]">{e.ms} ms</span>
                                </>
                              )}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </Scaled>
          </DeviceFrame>

          {/* Phones: the phone overlaps the laptop's corner and the notes follow. Tablets: the notes sit beside it.
              Desktop: it hangs off the laptop's right edge and the notes run underneath. */}
          <div className="flex flex-col gap-14 sm:flex-row-reverse sm:items-start sm:gap-10 lg:block">
            <DeviceFrame
              variant="phone"
              time="20:14"
              className="relative z-10 -mt-[16%] ml-auto mr-3 w-[50%] max-w-[300px] sm:mr-6 sm:w-[36%] lg:absolute lg:right-0 lg:top-[150px] lg:m-0 lg:w-[260px] xl:w-[290px]"
            >
              <Scaled {...PHONE}>
                <div className="flex size-full flex-col px-6 pb-10 pt-16 text-[15px]">
                  <p className="text-[14px] text-white/50">Sorrel · host stand</p>
                  <p className="mt-1 text-[30px] font-semibold leading-tight tracking-[-0.03em] text-white/95">Arriving next</p>
                  <p className="mt-1 text-[14px] text-white/50">
                    {next.length ? `${next.length} parties in the next 30 min` : "Everyone booked is in."}
                  </p>
                  <ul className="mt-6 divide-y divide-white/[0.06] border-y border-white/[0.06]">
                    {ARRIVALS.map((p) => {
                      const done = seated.includes(p.name);
                      return (
                        <li key={p.name} className="flex items-center gap-3 py-3.5">
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-[16px] font-medium", done ? "text-white/50" : "text-white/90")}>
                              {p.name}, {p.size}
                            </p>
                            <p className="text-[13px] text-white/50">
                              <span className="font-mono tabular-nums">{p.at}</span> · {p.table}
                            </p>
                          </div>
                          {done ? (
                            <span className="flex h-9 items-center gap-1.5 text-[14px] text-[rgb(var(--neon))]">
                              <Check aria-hidden className="size-4" /> Seated
                            </span>
                          ) : (
                            <Button
                              size="md"
                              variant="outline"
                              aria-label={`Seat ${p.name}, party of ${p.size}, at ${p.table}`}
                              onClick={() => {
                                touched.current = true;
                                seat(p.name);
                              }}
                              className="h-9"
                            >
                              Seat
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                  <div className="mt-7 flex items-baseline justify-between">
                    <p className="text-[16px] font-medium text-white/90">Waitlist</p>
                    <p className="text-[13px] text-white/50">{walkIns ? `${WAITLIST.length} waiting` : "Closed by the office"}</p>
                  </div>
                  {walkIns ? (
                    <ul className="mt-2 divide-y divide-white/[0.06] border-y border-white/[0.06]">
                      {WAITLIST.map((w) => (
                        <li key={w.name} className="flex items-baseline justify-between py-3">
                          <span className="text-[15px] text-white/80">
                            {w.name}, {w.size}
                          </span>
                          <span className="text-[13px] text-white/50">
                            quoted <span className="font-mono tabular-nums text-white/70">{w.quoted}</span> min
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 border-y border-white/[0.06] py-3 text-[14px] leading-snug text-white/50">
                      Walk-ins were switched off in the office at 20:14. Turn them back on from the laptop.
                    </p>
                  )}
                  <p className="mt-auto text-center text-[13px] text-white/45">Synced 20:14 · works offline</p>
                </div>
              </Scaled>
            </DeviceFrame>

            <div className="grid min-w-0 flex-1 gap-x-16 gap-y-8 sm:pt-12 lg:mt-28 lg:max-w-[820px] lg:grid-cols-2 lg:pr-[100px] lg:pt-0 xl:pr-0">
              <p className="max-w-[44ch] text-[15px] leading-[1.6] text-white/55">
                <span className="font-medium text-white/90">Built for Friday at eight.</span> The busiest restaurant on Covers
                seats 640 people a night from two phones and one laptop.
              </p>
              <p className="max-w-[44ch] text-[15px] leading-[1.6] text-white/55">
                <span className="font-medium text-white/90">No signal in the cellar?</span> The phone keeps working for six
                hours and syncs the moment it finds Wi-Fi again.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
