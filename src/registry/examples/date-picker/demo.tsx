"use client";

import * as React from "react";
import type { DateRange } from "@/components/ui/calendar";
import { DatePicker } from "@/components/ui/date-picker";

const presets = [
  { label: "Black Friday week", value: { from: new Date(2026, 10, 23), to: new Date(2026, 10, 29) } },
  { label: "Cyber Monday", value: { from: new Date(2026, 10, 30), to: new Date(2026, 10, 30) } },
  { label: "Holiday push", value: { from: new Date(2026, 11, 1), to: new Date(2026, 11, 24) } },
  { label: "Whole quarter", value: { from: new Date(2026, 9, 1), to: new Date(2026, 11, 31) } },
];

// Count on UTC day numbers so a daylight-saving change can't add or lose a day.
const daysIn = ({ from, to }: DateRange) =>
  from && to
    ? Math.round(
        (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
          Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
          86_400_000,
      ) + 1
    : 0;

export default function DatePickerDemo() {
  const [flight, setFlight] = React.useState<DateRange | undefined>({
    from: new Date(2026, 10, 23),
    to: new Date(2026, 10, 29),
  });
  const days = flight ? daysIn(flight) : 0;

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-sm font-medium text-white/90">Winter sale campaign</p>
      <p className="mt-1 text-xs leading-5 text-white/55">Ads run from the first day at 00:00 to the last day at 23:59.</p>
      <DatePicker
        mode="range"
        label="Flight dates"
        value={flight ?? null}
        onValueChange={setFlight}
        presets={presets}
        minDate={new Date(2026, 9, 1)}
        maxDate={new Date(2026, 11, 31)}
        containerClassName="mt-4"
        description={days ? `${days} ${days === 1 ? "day" : "days"} of delivery` : "Pick when the ads should run."}
      />
    </div>
  );
}
