"use client";

import * as React from "react";
import { StatusLight } from "@/components/ui/status-light";
import { Button } from "@/components/ui/button";

export default function StatusLightLive() {
  const [live, setLive] = React.useState(true);

  return (
    <div className="flex w-full max-w-[560px] flex-wrap items-center justify-between gap-x-6 gap-y-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <StatusLight
          variant="pulse"
          color="red"
          state={live ? "on" : "off"}
          stateLabel={live ? "Live" : "Off air"}
          label={live ? "Live" : "Off air"}
        />
        <span className="font-mono text-[13px] tabular-nums text-white/60">{live ? "1:12:48" : "0:00:00"}</span>
        <StatusLight variant="dot" state={live ? "standby" : "off"} label="Recording to cloud" />
      </div>
      <Button size="sm" variant={live ? "outline" : "solid"} color={live ? "red" : undefined} onClick={() => setLive((v) => !v)}>
        {live ? "End stream" : "Go live"}
      </Button>
    </div>
  );
}
