"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";

export default function SwitchControlled() {
  const [shared, setShared] = React.useState(false);

  return (
    <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <Switch checked={shared} onCheckedChange={setShared} label="Share with a public link" />
      <p className="mt-1.5 pl-12 text-[13px] leading-[18px] text-white/55">
        {shared
          ? "Anyone with the link can view this board."
          : "Only invited members can view this board."}
      </p>
      <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 font-mono text-xs">
        <span className="text-white/40">checked</span>
        <span className="text-white/90">{String(shared)}</span>
      </div>
    </div>
  );
}
