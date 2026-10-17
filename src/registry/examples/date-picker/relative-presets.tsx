"use client";

import * as React from "react";
import type { DateRange } from "@/components/ui/calendar";
import { DatePicker } from "@/components/ui/date-picker";

const daysAgo = (days: number) => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
};

export default function DatePickerRelativePresets() {
  const [range, setRange] = React.useState<DateRange>();
  const today = daysAgo(0);
  const presets = [
    { label: "Today", value: { from: today, to: today } },
    { label: "Yesterday", value: { from: daysAgo(1), to: daysAgo(1) } },
    { label: "Last 7 days", value: { from: daysAgo(6), to: today } },
    { label: "Last 30 days", value: { from: daysAgo(29), to: today } },
    { label: "Month to date", value: { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today } },
  ];

  return (
    <DatePicker
      mode="range"
      label="Traffic"
      placeholder="All time"
      value={range ?? null}
      onValueChange={setRange}
      presets={presets}
      maxDate={today}
      containerClassName="max-w-xs"
    />
  );
}
