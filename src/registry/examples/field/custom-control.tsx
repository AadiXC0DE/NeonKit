"use client";

import * as React from "react";
import { Field, useFieldControl } from "@/components/ui/field";
import { cn } from "@/lib/utils";

const days = [
  { value: "mon", short: "Mo", name: "Monday" },
  { value: "tue", short: "Tu", name: "Tuesday" },
  { value: "wed", short: "We", name: "Wednesday" },
  { value: "thu", short: "Th", name: "Thursday" },
  { value: "fri", short: "Fr", name: "Friday" },
  { value: "sat", short: "Sa", name: "Saturday" },
  { value: "sun", short: "Su", name: "Sunday" },
];

// A custom control: the wrapper is a group, so it reads the field's id and
// aria wiring from the hook instead of from props.
function DayPicker({ value, onValueChange }: { value: string[]; onValueChange: (value: string[]) => void }) {
  const field = useFieldControl();

  return (
    <div role="group" {...field} className="flex flex-wrap gap-1.5">
      {days.map((day) => {
        const pressed = value.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            aria-pressed={pressed}
            onClick={() =>
              onValueChange(pressed ? value.filter((v) => v !== day.value) : [...value, day.value])
            }
            className={cn(
              "h-9 w-10 cursor-pointer rounded-lg border text-xs font-medium outline-none",
              "transition-[border-color,background-color,color,box-shadow,transform,scale] duration-150 ease-out active:scale-[0.97]",
              "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
              pressed
                ? "border-[rgb(var(--neon)/0.55)] bg-[rgb(var(--neon)/0.12)] text-[rgb(var(--neon))] shadow-[0_0_14px_-2px_rgb(var(--neon)/0.5)]"
                : "border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white/85",
            )}
          >
            {day.short}
            {/* Spoken as "Mo, Monday": the name starts with what's on the button, so voice control finds it. */}
            <span className="sr-only">, {day.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default function FieldCustomControl() {
  const [quiet, setQuiet] = React.useState(["sat", "sun"]);

  return (
    <Field
      label="Quiet days"
      description="No alerts on these days, except incidents marked critical."
      error={quiet.length === days.length ? "Leave at least one day for alerts to reach you." : undefined}
      className="max-w-sm"
    >
      <DayPicker value={quiet} onValueChange={setQuiet} />
    </Field>
  );
}
