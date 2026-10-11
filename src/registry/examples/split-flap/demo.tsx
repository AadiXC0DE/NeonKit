"use client";

import * as React from "react";
import { PlaneTakeoff } from "lucide-react";
import { SplitFlap, SplitFlapBoard, type SplitFlapColumn, type SplitFlapRow } from "@/components/ui/split-flap";

// Minutes after 22:00, so the night can run past midnight.
const flights = [
  { at: 35, city: "OSAKA KIX", code: "JL 226", gate: "B12" },
  { at: 45, city: "TOKYO HND", code: "NH 860", gate: "C03" },
  { at: 50, city: "SEOUL ICN", code: "KE 618", gate: "A07" },
  { at: 65, city: "SINGAPORE", code: "SQ 891", gate: "D21", delay: 25 },
  { at: 80, city: "TAIPEI TPE", code: "CI 916", gate: "B04" },
  { at: 100, city: "HONOLULU", code: "HA 458", gate: "E10" },
  { at: 115, city: "SYDNEY", code: "QF 128", gate: "D15" },
  { at: 130, city: "BANGKOK BKK", code: "TG 607", gate: "A02" },
  { at: 145, city: "MANILA MNL", code: "PR 301", gate: "C11", cancelled: true },
  { at: 160, city: "DOHA", code: "QR 815", gate: "E04" },
  { at: 175, city: "LONDON LHR", code: "BA 32", gate: "D09" },
  { at: 195, city: "ZURICH", code: "LX 139", gate: "B07" },
];

const columns: SplitFlapColumn[] = [
  { label: "Time", length: 5, charset: "numeric" },
  { label: "Destination", length: 11 },
  { label: "Flight", length: 6, className: "max-lg:hidden" },
  { label: "Gate", length: 3, className: "max-lg:hidden" },
  { label: "Remarks", length: 9 },
];

const remarkColor = {
  "ON TIME": undefined,
  BOARDING: "green",
  "LAST CALL": "amber",
  DELAYED: "orange",
  CANCELLED: "red",
  DEPARTED: "white",
} as const;

const START = 26;
const STEP = 3;
const ROWS = 6;

const clock = (minutes: number) => {
  const total = (22 * 60 + minutes) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
};

function boardAt(now: number): SplitFlapRow[] {
  const showing = flights
    .map((flight) => ({ ...flight, leaves: flight.at + (flight.delay ?? 0) }))
    .filter((flight) => now <= flight.leaves + STEP)
    .slice(0, ROWS);

  return showing.map((flight) => {
    const until = flight.leaves - now;
    const remark: keyof typeof remarkColor = flight.cancelled
      ? "CANCELLED"
      : until <= 0
        ? "DEPARTED"
        : flight.delay && until > 20
          ? "DELAYED"
          : until <= 8
            ? "LAST CALL"
            : until <= 20
              ? "BOARDING"
              : "ON TIME";
    return {
      cells: [clock(flight.at), flight.city, flight.code, flight.gate, remark],
      colors: [undefined, undefined, undefined, undefined, remarkColor[remark]],
    };
  });
}

export default function SplitFlapDemo() {
  const [now, setNow] = React.useState(START);

  React.useEffect(() => {
    const id = setInterval(() => {
      setNow((minutes) => {
        const next = minutes + STEP;
        return boardAt(next).length < ROWS ? START : next;
      });
    }, 5200);
    return () => clearInterval(id);
  }, []);

  return (
    <SplitFlapBoard
      aria-label="Departures"
      flipOnMount
      columns={columns}
      rows={boardAt(now)}
      className="[--flap-h:14px] sm:[--flap-h:17px] lg:[--flap-h:21px] xl:[--flap-h:24px]"
      header={
        <>
          <div className="flex items-center gap-2.5 text-white/90">
            <PlaneTakeoff aria-hidden className="size-[1.1em] text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.7))]" />
            <span className="text-[13px] font-semibold uppercase tracking-[0.28em] sm:text-[15px]">Departures</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.16em] text-white/45 sm:inline">Local time</span>
            <SplitFlap value={clock(now)} charset="numeric" stagger={40} />
          </div>
        </>
      }
    />
  );
}
