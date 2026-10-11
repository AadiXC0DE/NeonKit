"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Knob } from "@/components/ui/knob";

const db = (v: number) => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)} dB`;

export default function KnobForm() {
  const [saved, setSaved] = React.useState<string | null>(null);

  return (
    <form
      className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaved(
          `Threshold ${data.get("threshold")} dB · Ratio ${data.get("ratio")}:1 · Makeup ${data.get("makeup")} dB`,
        );
      }}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium text-white/90">Vocal compressor</h3>
        <span className="text-xs text-white/40">Bus 2</span>
      </div>
      <div className="mt-6 flex justify-between gap-4">
        <Knob name="threshold" label="Threshold" min={-40} max={0} defaultValue={-18} formatValue={db} showValue />
        <Knob
          name="ratio"
          label="Ratio"
          min={1}
          max={20}
          step={0.5}
          defaultValue={4}
          detents={[2, 4, 8]}
          formatValue={(v) => `${v}:1`}
          showValue
        />
        <Knob name="makeup" label="Makeup" min={0} max={12} step={0.5} defaultValue={3} formatValue={db} showValue />
      </div>
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
        <p aria-live="polite" className="min-w-0 truncate text-xs text-white/55">
          {saved ?? "Double-click a knob to reset it."}
        </p>
        <Button type="submit" size="sm">
          Save preset
        </Button>
      </div>
    </form>
  );
}
