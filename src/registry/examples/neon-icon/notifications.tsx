"use client";

import * as React from "react";
import { NeonIcon } from "@/components/ui/neon-icon";
import { Button } from "@/components/ui/button";

const incoming = [
  "Deploy 4f2c1a finished on fra1",
  "Mara Okafor mentioned you in #billing",
  "Certificate for halcyon.dev renews in 7 days",
  "Weekly usage report is ready",
];

export default function NeonIconNotifications() {
  const [count, setCount] = React.useState(2);
  const [ringing, setRinging] = React.useState(false);

  React.useEffect(() => {
    if (!ringing) return;
    const timeout = setTimeout(() => setRinging(false), 2400);
    return () => clearTimeout(timeout);
  }, [ringing, count]);

  const latest = incoming[(count - 1) % incoming.length];

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 pr-4">
        <button
          type="button"
          aria-label={count ? `${count} unread notifications` : "Notifications"}
          onClick={() => setCount(0)}
          className="relative grid size-10 shrink-0 place-items-center rounded-lg outline-none transition-colors hover:bg-white/[0.05] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)]"
        >
          <NeonIcon icon="bell" value={count > 0 ? 1 : 0} animated={ringing} aria-hidden />
          {count > 0 && (
            <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[rgb(255_77_94)] px-1 text-[10px] font-semibold tabular-nums text-white shadow-[0_0_8px_rgb(255_77_94/0.7)]">
              {count}
            </span>
          )}
        </button>
        <div className="min-w-0">
          <p className="text-sm text-white/90">{count ? `${count} unread` : "All caught up"}</p>
          <p className="truncate text-xs text-white/45">{count ? latest : "Nothing new since 9:12"}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setCount((value) => value + 1);
          setRinging(true);
        }}
      >
        Simulate a notification
      </Button>
    </div>
  );
}
