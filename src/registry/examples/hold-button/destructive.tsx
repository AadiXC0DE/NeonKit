"use client";

import * as React from "react";
import { Trash2 } from "@/components/ui/icons";
import { HoldButton } from "@/components/ui/hold-button";

export default function HoldButtonDestructive() {
  const [deleted, setDeleted] = React.useState(false);

  return (
    <div className="flex w-full max-w-sm items-center justify-between gap-4 rounded-xl border border-[#ff4d5e]/20 bg-[#ff4d5e]/[0.04] px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/90">Delete workspace</p>
        <p className="text-[13px] leading-[18px] text-white/55">
          {deleted ? "Scheduled. You have 30 days to restore it." : "Removes 14 projects and their domains."}
        </p>
      </div>
      <HoldButton
        color="red"
        size="sm"
        duration={2000}
        completeLabel="Deleted"
        resetDelay={Infinity}
        onComplete={() => setDeleted(true)}
      >
        <Trash2 /> Hold to delete
      </HoldButton>
    </div>
  );
}
