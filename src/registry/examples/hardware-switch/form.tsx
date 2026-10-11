"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { HardwareSwitch } from "@/components/ui/hardware-switch";

export default function HardwareSwitchForm() {
  const [submitted, setSubmitted] = React.useState<string | null>(null);

  return (
    <form
      className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-6"
      onSubmit={(event) => {
        event.preventDefault();
        const on = [...new FormData(event.currentTarget).keys()];
        setSubmitted(on.length ? `Enabled: ${on.join(", ")}` : "Everything is off");
      }}
    >
      <h3 className="text-sm font-medium text-white/90">Release controls</h3>
      <p className="mt-1 text-xs text-white/55">Only switches that are on are submitted, like checkboxes.</p>
      <div className="mt-6 flex items-end justify-around gap-6">
        <HardwareSwitch variant="rocker" name="read-only" label="Read-only" />
        <HardwareSwitch variant="flip" name="migrations" label="Migrations" defaultChecked />
        <HardwareSwitch variant="key" name="deploys" label="Deploys" />
      </div>
      <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
        <p aria-live="polite" className="min-w-0 truncate text-xs text-white/55">
          {submitted ?? "Nothing submitted yet"}
        </p>
        <Button type="submit" size="sm">
          Apply
        </Button>
      </div>
    </form>
  );
}
