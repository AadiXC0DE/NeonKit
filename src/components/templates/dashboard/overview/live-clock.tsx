"use client";

import * as React from "react";

const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone: "UTC" });

/** "Production · 14:02:31 UTC". The clock starts after mount, so the server and client agree on the first paint. */
export function LiveClock() {
  const [now, setNow] = React.useState<string | null>(null);

  React.useEffect(() => {
    const tick = () => setNow(format.format(new Date()));
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />
      Production
      <span aria-hidden className="text-white/30">·</span>
      <span className="inline-block min-w-[10.5ch] tabular-nums">{now ?? "--:--:--"} UTC</span>
    </span>
  );
}
