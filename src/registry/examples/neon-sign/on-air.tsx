"use client";

import * as React from "react";
import { NeonSign } from "@/components/ui/neon-sign";
import { Switch } from "@/components/ui/switch";

export default function NeonSignOnAir() {
  const [live, setLive] = React.useState(false);

  return (
    <div className="flex w-full max-w-md items-center justify-between gap-6 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-sm text-white/90">Studio B</span>
        <span className="font-mono text-[11px] text-white/50">{live ? "Live · 2 mics open" : "Standby"}</span>
      </div>
      <div className="flex items-center gap-5">
        <NeonSign
          on={live}
          color="red"
          size="sm"
          frame="pill"
          backplate={false}
          flicker="clean"
          className="text-[15px] font-semibold tracking-[0.18em]"
        >
          ON AIR
        </NeonSign>
        <Switch checked={live} onCheckedChange={setLive} aria-label="Go live" />
      </div>
    </div>
  );
}
