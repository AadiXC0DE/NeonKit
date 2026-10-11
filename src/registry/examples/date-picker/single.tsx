"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";

const longDate: Intl.DateTimeFormatOptions = { weekday: "short", month: "long", day: "numeric", year: "numeric" };

export default function DatePickerSingle() {
  const [status, setStatus] = React.useState("");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const due = new FormData(event.currentTarget).get("due");
    setStatus(due ? `Invoice due ${due}.` : "Pick a due date first.");
  }

  return (
    <form onSubmit={submit} className="grid w-full max-w-xs gap-3">
      <DatePicker
        name="due"
        label="Invoice due"
        placeholder="No due date"
        formatOptions={longDate}
        isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}
        description="Weekdays only. Submits as yyyy-mm-dd."
        onValueChange={() => setStatus("")}
      />
      <div className="flex items-center gap-3">
        <Button type="submit" variant="solid" size="sm">
          Save invoice
        </Button>
        <p aria-live="polite" className="text-xs text-white/55">
          {status}
        </p>
      </div>
    </form>
  );
}
