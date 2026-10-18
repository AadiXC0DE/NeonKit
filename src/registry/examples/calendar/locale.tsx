"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Select } from "@/components/ui/select";

const locales = [
  { value: "en-US", label: "English (US)", description: "Weeks start on Sunday" },
  { value: "en-GB", label: "English (UK)", description: "Weeks start on Monday" },
  { value: "de-DE", label: "Deutsch", description: "Montag bis Sonntag" },
  { value: "pt-BR", label: "Português (Brasil)", description: "Domingo a sábado" },
  { value: "ja-JP", label: "日本語", description: "日曜日から" },
];

export default function CalendarLocale() {
  const [locale, setLocale] = React.useState("de-DE");

  return (
    <div className="grid w-fit gap-4">
      <Select label="Language" options={locales} value={locale} onValueChange={setLocale} />
      <Calendar
        locale={locale}
        defaultSelected={new Date(2026, 9, 14)}
        className="rounded-xl border border-white/10 bg-white/[0.03]"
      />
    </div>
  );
}
