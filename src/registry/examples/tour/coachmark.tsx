"use client";

import * as React from "react";
import { Command, Search } from "@/components/ui/icons";
import { Tour } from "@/components/ui/tour";

/** One step, so no count: a "what's new" pointer. */
export default function TourCoachmark() {
  const search = React.useRef<HTMLButtonElement>(null);
  const [seen, setSeen] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  return (
    <div className="grid w-full max-w-md justify-items-start gap-4">
      <button
        ref={search}
        type="button"
        className="flex h-9 w-full items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-[13px] text-white/50 outline-none hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
      >
        <Search aria-hidden className="size-4" />
        Search docs, issues and runs
        <kbd className="ml-auto inline-flex items-center gap-0.5 rounded-[4px] border border-white/10 px-1.5 font-mono text-[11px] text-white/55">
          <Command aria-hidden className="size-3" />K
        </kbd>
      </button>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md text-[13px] text-[rgb(var(--neon))] underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
      >
        {seen ? "Show it again" : "What’s new in 4.2"}
      </button>
      <Tour
        steps={[
          {
            target: search,
            title: "Search now covers CI runs",
            body: "Paste a run ID or a failing test name. Results from the last 90 days.",
            side: "bottom",
            align: "start",
          },
        ]}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSeen(true);
        }}
        labels={{ done: "Got it" }}
      />
    </div>
  );
}
