"use client";

import * as React from "react";
import { Check } from "@/components/ui/icons";
import { Spinner } from "@/components/ui/spinner";

export default function SpinnerInline() {
  const [syncing, setSyncing] = React.useState(true);

  React.useEffect(() => {
    const id = setInterval(() => setSyncing((s) => !s), 2600);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex w-full max-w-md items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-white/90">Q4 launch plan</p>
        <p className="text-xs text-white/50">Edited by Maya Chen</p>
      </div>
      <p role="status" className="flex shrink-0 items-center gap-2 text-xs text-white/55">
        {syncing ? (
          <>
            <Spinner size="sm" variant="orbit" aria-hidden />
            Syncing…
          </>
        ) : (
          <>
            <Check className="size-4 text-white/40" aria-hidden />
            All changes saved
          </>
        )}
      </p>
    </div>
  );
}
