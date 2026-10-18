"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, type DateRange } from "@/components/ui/calendar";

const NIGHTLY_RATE = 186;

// Nights that are already taken, as local yyyy-mm-dd.
const booked = new Set([
  "2026-12-04", "2026-12-05", "2026-12-06",
  "2026-12-24", "2026-12-25", "2026-12-26",
  "2026-12-31", "2027-01-01",
  "2027-01-15", "2027-01-16",
]);

const iso = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

// Count on UTC day numbers so a daylight-saving change can't add or lose a night.
const nightsBetween = (from: Date, to: Date) =>
  Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
      86_400_000,
  );

const formatDay = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
const formatMoney = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export default function CalendarDemo() {
  const [stay, setStay] = React.useState<DateRange>({
    from: new Date(2026, 11, 11),
    to: new Date(2026, 11, 15),
  });
  const nights = stay.from && stay.to ? nightsBetween(stay.from, stay.to) : 0;

  return (
    <div className="w-full max-w-[600px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] [--neon:var(--neon-accent,34_211_238)]">
      <div className="flex items-center gap-6 border-b border-white/10 px-5 py-4">
        <dl className="grid flex-1 grid-cols-2 gap-6">
          <div>
            <dt className="text-[13px] text-white/55">Check-in</dt>
            <dd className={stay.from ? "mt-1 text-sm text-white/90" : "mt-1 text-sm text-white/50"}>
              {stay.from ? formatDay.format(stay.from) : "Add date"}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-white/55">Check-out</dt>
            <dd className={stay.to ? "mt-1 text-sm text-white/90" : "mt-1 text-sm text-white/50"}>
              {stay.to ? formatDay.format(stay.to) : stay.from ? "Pick a day" : "Add date"}
            </dd>
          </div>
        </dl>
        <p aria-live="polite" className="text-right">
          <span
            className={
              nights
                ? "block text-2xl font-semibold leading-none tabular-nums text-[rgb(var(--neon))] [text-shadow:0_0_14px_rgb(var(--neon)/0.6)]"
                : "block text-2xl font-semibold leading-none tabular-nums text-white/25"
            }
          >
            {nights}
          </span>
          <span className="mt-1 block text-xs text-white/55">{nights === 1 ? "night" : "nights"}</span>
        </p>
      </div>

      <Calendar
        mode="range"
        numberOfMonths={2}
        selected={stay}
        onSelect={setStay}
        defaultMonth={new Date(2026, 11, 1)}
        disabled={(date) => booked.has(iso(date))}
        className="mx-auto"
      />

      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-5 py-3">
        <p className="text-xs text-white/55">
          {nights ? (
            <>
              {formatMoney.format(NIGHTLY_RATE)} × {nights} {nights === 1 ? "night" : "nights"}
              <span className="ml-2 font-medium text-white/90">{formatMoney.format(NIGHTLY_RATE * nights)}</span>
            </>
          ) : (
            "Struck-out nights are already booked."
          )}
        </p>
        <Button variant="ghost" size="sm" onClick={() => setStay({})} disabled={!stay.from}>
          Clear dates
        </Button>
      </div>
    </div>
  );
}
