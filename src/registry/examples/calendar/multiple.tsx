"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

const formatDay = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });

export default function CalendarMultiple() {
  const [shifts, setShifts] = React.useState<Date[]>([]);

  return (
    <div className="flex w-fit flex-col gap-4 sm:flex-row sm:items-start">
      <Calendar
        mode="multiple"
        selected={shifts}
        onSelect={setShifts}
        className="rounded-xl border border-white/10 bg-white/[0.03]"
      />
      <div className="grid w-56 gap-2">
        <p className="text-sm font-medium text-white/90">On-call shifts</p>
        <p aria-live="polite" className="text-xs text-white/55">
          {shifts.length
            ? `${shifts.length} ${shifts.length === 1 ? "day" : "days"} covered`
            : "Click days to take the pager. Click again to hand it back."}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {shifts.map((day) => (
            <li
              key={day.toISOString()}
              className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs tabular-nums text-white/75"
            >
              {formatDay.format(day)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
