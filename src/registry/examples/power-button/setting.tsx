"use client";

import * as React from "react";
import { PowerButton } from "@/components/ui/power-button";

export default function PowerButtonSetting() {
  const [on, setOn] = React.useState(true);

  return (
    <div className="flex w-full max-w-sm items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
      <div className="min-w-0 flex-1">
        <p id="kiosk-title" className="text-sm font-medium text-white/90">
          Lobby display
        </p>
        <p id="kiosk-description" className="text-[13px] leading-[18px] text-white/55">
          {on ? "On around the clock. Dims at 22:00." : "Off. Wakes when someone walks in."}
        </p>
      </div>
      <PowerButton
        pressed={on}
        onPressedChange={setOn}
        aria-labelledby="kiosk-title"
        aria-describedby="kiosk-description"
      />
    </div>
  );
}
