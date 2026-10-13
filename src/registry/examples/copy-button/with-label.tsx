"use client";

import { CopyButton } from "@/components/ui/copy-button";

// In a real app this would come from your API, only when someone asks for it.
async function revealKey() {
  return "nk_live_7Hq2vT9xLm4RcW8pZs1Bd6Fy";
}

export default function CopyButtonWithLabel() {
  return (
    <div className="flex w-full min-w-0 max-w-md items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/90">Production key</p>
        <p className="truncate font-mono text-[13px] text-white/50">nk_live_••••••••••••••••d6Fy</p>
      </div>
      <CopyButton value={revealKey} variant="outline" size="sm" copiedLabel="Key copied">
        Copy key
      </CopyButton>
    </div>
  );
}
