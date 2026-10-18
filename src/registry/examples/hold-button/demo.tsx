"use client";

import * as React from "react";
import { HoldButton } from "@/components/ui/hold-button";

export default function HoldButtonDemo() {
  const [promoted, setPromoted] = React.useState(false);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-mono text-[13px] text-white/90">checkout-web@a41f9c2</p>
          <p className="mt-0.5 text-[13px] text-white/55">Preview passed 214 checks · 3m ago</p>
        </div>
        <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-xs font-medium text-white/70">
          {promoted ? "Production" : "Preview"}
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[0.06] pt-4">
        <p className="text-[13px] leading-5 text-white/55">
          {promoted ? "Serving 100% of traffic in 12 regions." : "Goes live for every customer."}
        </p>
        <HoldButton
          completeLabel={promoted ? "Promoted" : "Rolled back"}
          resetDelay={2000}
          onComplete={() => setPromoted((value) => !value)}
          className="shrink-0"
        >
          {promoted ? "Hold to roll back" : "Hold to promote"}
        </HoldButton>
      </div>
    </div>
  );
}
