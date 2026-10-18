"use client";

import * as React from "react";
import { NeonSign } from "@/components/ui/neon-sign";
import { Switch } from "@/components/ui/switch";

const studios = [
  { id: "a", name: "Studio A", show: "Morning desk", live: "Live · 3 mics open", standby: "Next show 13:00" },
  { id: "b", name: "Studio B", show: "Late edit", live: "Live · 2 mics open", standby: "Standby" },
  { id: "c", name: "Booth 4", show: "Voice-over", live: "Recording · take 12", standby: "Free until 16:30" },
] as const;

export default function NeonSignOnAir() {
  const [live, setLive] = React.useState<Record<string, boolean>>({ a: true, b: false, c: false });

  return (
    <ul className="w-full max-w-md divide-y divide-white/[0.06] rounded-xl border border-white/10 bg-white/[0.03]">
      {studios.map((studio) => {
        const on = live[studio.id];
        return (
          <li key={studio.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="truncate text-sm text-white/90">
                {studio.name} <span className="hidden text-white/50 sm:inline">· {studio.show}</span>
              </span>
              <span className="truncate text-xs tabular-nums text-white/55">{on ? studio.live : studio.standby}</span>
            </div>
            <div className="flex shrink-0 items-center gap-4 sm:gap-5">
              <NeonSign
                on={on}
                color="red"
                size="sm"
                frame="pill"
                backplate={false}
                flicker="clean"
                className="text-[15px] font-semibold tracking-[0.18em]"
              >
                ON AIR
              </NeonSign>
              <Switch
                checked={on}
                onCheckedChange={(next) => setLive((state) => ({ ...state, [studio.id]: next }))}
                aria-label={`${studio.name} on air`}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
