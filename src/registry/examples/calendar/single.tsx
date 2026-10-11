"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;
const formatDay = new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" });

export default function CalendarSingle() {
  const [day, setDay] = React.useState<Date>();

  return (
    <div className="grid w-fit gap-3">
      <Calendar
        selected={day ?? null}
        onSelect={setDay}
        disabled={isWeekend}
        className="rounded-xl border border-white/10 bg-white/[0.03]"
      />
      <p aria-live="polite" className="px-1 text-sm text-white/55">
        {day ? (
          <>
            Delivery on <span className="text-white/90">{formatDay.format(day)}</span>, 9am to 1pm.
          </>
        ) : (
          "We deliver on weekdays. Pick a day."
        )}
      </p>
    </div>
  );
}
