"use client";

import * as React from "react";
import { CalendarPlus, Check, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { NeonText } from "@/components/ui/neon-text";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const EVENT = {
  name: "Nightline",
  edition: "Conf 2027",
  tagline: "Two nights of talks on graphics, light and the browser.",
  doors: "2027-03-19T19:00:00+01:00",
  date: "19 Mar 2027",
  time: "19:00 CET",
  venue: "Maassilo, Rotterdam",
  gate: "C",
  row: "G",
  seat: "14",
  holder: "Mara Lindqvist",
  tier: "Late Pass",
  number: "NL27-0419-G14",
};

const ICS = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "PRODID:-//Nightline//Ticket//EN",
  "BEGIN:VEVENT",
  "UID:NL27-0419-G14@nightline.example",
  "DTSTAMP:20261013T120000Z",
  "DTSTART:20270319T180000Z",
  "DTEND:20270320T000000Z",
  "SUMMARY:Nightline Conf 2027 (Gate C, Row G, Seat 14)",
  "LOCATION:Maassilo, Rotterdam",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

const SCHEDULE = [
  ["19:00", "Doors, coat check, badge pickup at Gate C"],
  ["19:40", "Opening talk: drawing with 40,000 particles"],
  ["23:30", "Last talk. Late kitchen open until 01:00"],
];

// The notches and perforation sit at --cut: across the ticket on wide screens, down it on narrow ones.
const css = `
.nk-marketing-event-ticket-shape {
  --cut: calc(100% - 153px);
  --r: 13px;
  -webkit-mask-image: radial-gradient(circle var(--r) at 0 var(--cut), transparent 97%, #000), radial-gradient(circle var(--r) at 100% var(--cut), transparent 97%, #000);
  mask-image: radial-gradient(circle var(--r) at 0 var(--cut), transparent 97%, #000), radial-gradient(circle var(--r) at 100% var(--cut), transparent 97%, #000);
  -webkit-mask-composite: source-in;
  mask-composite: intersect;
}
@media (min-width: 640px) {
  .nk-marketing-event-ticket-shape {
    --cut: calc(100% - 199px);
    -webkit-mask-image: radial-gradient(circle var(--r) at var(--cut) 0, transparent 97%, #000), radial-gradient(circle var(--r) at var(--cut) 100%, transparent 97%, #000);
    mask-image: radial-gradient(circle var(--r) at var(--cut) 0, transparent 97%, #000), radial-gradient(circle var(--r) at var(--cut) 100%, transparent 97%, #000);
  }
}
`;

// A seeded pattern with the three finder squares, so it reads as a code without encoding anything.
function QrPlaceholder({ seed, className }: { seed: string; className?: string }) {
  const size = 25;
  const cells = React.useMemo(() => {
    let state = Array.from(seed).reduce((hash, char) => Math.imul(hash ^ char.charCodeAt(0), 16777619), 2166136261) >>> 0;
    const next = () => {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    const finder = (x: number, y: number) =>
      [[0, 0], [size - 7, 0], [0, size - 7]].some(([fx, fy]) => x >= fx - 1 && x <= fx + 7 && y >= fy - 1 && y <= fy + 7);
    const out: [number, number][] = [];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        if (!finder(x, y) && next() > 0.52) out.push([x, y]);
      }
    }
    return out;
  }, [seed]);

  return (
    <svg aria-hidden viewBox={`-2 -2 ${size + 4} ${size + 4}`} className={cn("rounded-lg bg-[#ecebf2]", className)} shapeRendering="crispEdges">
      {[[0, 0], [size - 7, 0], [0, size - 7]].map(([x, y]) => (
        <g key={`${x}-${y}`} fill="#0a0b11">
          <path d={`M${x} ${y}h7v7h-7zM${x + 1} ${y + 1}v5h5v-5z`} fillRule="evenodd" />
          <rect x={x + 2} y={y + 2} width={3} height={3} />
        </g>
      ))}
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0a0b11" />
      ))}
    </svg>
  );
}

function Field({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <dt className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{label}</dt>
      <dd className="mt-1 text-[14px] font-medium text-white/90">{value}</dd>
    </div>
  );
}

function Ticket() {
  return (
    <div className="relative">
      {/* The sign on the ticket lights the table it's lying on */}
      <div aria-hidden className="absolute -inset-x-6 bottom-[-12%] top-[30%] -z-10 rounded-[50%] bg-[rgb(var(--neon)/0.22)] blur-[70px]" />
      <article
        aria-label={`Ticket for ${EVENT.name} ${EVENT.edition}, ${EVENT.holder}`}
        className="nk-marketing-event-ticket-shape relative flex flex-col overflow-hidden rounded-[22px] border border-white/10 bg-[#0b0b12] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] sm:flex-row"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_12%_0%,rgb(var(--neon)/0.16),transparent_70%),repeating-linear-gradient(0deg,rgb(255_255_255/0.018)_0_1px,transparent_1px_4px)]" />

        <div className="relative flex-1 p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <NeonText
              buzz
              className="text-[46px] leading-none tracking-[-0.01em] sm:text-[54px]"
              style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
            >
              nightline
            </NeonText>
            <p className="pt-1 text-right font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-white/50">
              {EVENT.edition}
              <br />
              <span className="text-[rgb(var(--neon))]">Admit one</span>
            </p>
          </div>
          <p className="mt-3 max-w-[30ch] text-[13px] leading-relaxed text-white/50">{EVENT.tagline}</p>

          <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/[0.07] pt-5 sm:grid-cols-[1.25fr_1fr_1fr_1fr]">
            <Field label="Date" value={EVENT.date} />
            <Field label="Doors" value={EVENT.time} />
            <Field label="Row" value={EVENT.row} />
            <Field label="Seat" value={EVENT.seat} />
            <Field label="Holder" value={EVENT.holder} className="col-span-2" />
            <Field label="Venue" value={EVENT.venue} className="col-span-2" />
          </dl>
        </div>

        {/* Perforation */}
        <div aria-hidden className="relative mx-[13px] h-0 border-t-2 border-dashed border-white/[0.14] sm:mx-0 sm:my-[13px] sm:h-auto sm:w-0 sm:border-l-2 sm:border-t-0" />

        <div className="relative flex items-center gap-5 p-6 sm:w-[198px] sm:flex-col sm:items-stretch sm:justify-between sm:gap-4 sm:p-6">
          <div className="flex items-baseline justify-between gap-3 sm:order-none">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">Gate</p>
            <p className="text-[34px] font-semibold leading-none tracking-[-0.03em] text-white">{EVENT.gate}</p>
          </div>
          <QrPlaceholder seed={EVENT.number} className="order-first size-[104px] shrink-0 sm:order-none sm:aspect-square sm:h-auto sm:w-full" />
          <div className="min-w-0 flex-1 sm:flex-none">
            <p className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-white/40">{EVENT.tier}</p>
            <p className="mt-1 truncate font-mono text-[12px] text-white/80">{EVENT.number}</p>
          </div>
        </div>
      </article>
    </div>
  );
}

export default function MarketingEventTicket() {
  const [wallet, setWallet] = React.useState<"idle" | "adding" | "added">("idle");
  const timer = React.useRef<number | undefined>(undefined);
  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  function addToWallet() {
    if (wallet !== "idle") return;
    setWallet("adding");
    timer.current = window.setTimeout(() => setWallet("added"), 900);
  }

  return (
    <section
      aria-labelledby="nightline-ticket-title"
      // Change the color here; everything inside follows it.
      style={neonVars("magenta")}
      className="relative isolate overflow-hidden bg-[#05060a] px-6 py-20 text-white/90 sm:px-10 sm:py-28"
    >
      <style>{css}</style>
      <div className="mx-auto grid max-w-[1200px] items-center gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Nightline Conf 2027 · Your ticket</p>
          <h2
            id="nightline-ticket-title"
            className="mt-5 text-[clamp(2.4rem,5.4vw,4rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
          >
            See you
            <br />
            after dark.
          </h2>

          <div className="mt-9">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">Doors open in</p>
            <Countdown to={EVENT.doors} size="sm" className="mt-3 sm:[--countdown-h:52px]" />
          </div>

          <div className="mt-9 flex flex-wrap gap-3">
            <Button variant={wallet === "added" ? "outline" : "solid"} onClick={addToWallet} loading={wallet === "adding"} aria-live="polite" className="min-w-[172px]">
              {wallet === "added" ? <Check aria-hidden /> : wallet === "idle" ? <Wallet aria-hidden /> : null}
              {wallet === "added" ? "In your wallet" : wallet === "adding" ? "Adding" : "Add to wallet"}
            </Button>
            <Button variant="ghost" asChild>
              <a href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ICS)}`} download="nightline-2027.ics">
                <CalendarPlus aria-hidden /> Add to calendar
              </a>
            </Button>
          </div>

          <ol className="mt-10 border-t border-white/[0.08]">
            {SCHEDULE.map(([time, text]) => (
              <li key={time} className="flex gap-5 border-b border-white/[0.06] py-3 text-[13px]">
                <span className="w-11 shrink-0 font-mono text-white/45">{time}</span>
                <span className="text-white/70">{text}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-7 lg:pl-6">
          <div className="mx-auto max-w-[640px] lg:rotate-[-2.5deg]">
            <Ticket />
          </div>
          <p className="mx-auto mt-8 max-w-[640px] text-center font-mono text-[10px] uppercase tracking-[0.16em] text-white/35 lg:mt-12">
            Non-transferable after Mar 12 · Show the code at Gate {EVENT.gate}
          </p>
        </div>
      </div>
    </section>
  );
}
