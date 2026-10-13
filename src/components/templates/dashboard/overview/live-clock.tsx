"use client";

import * as React from "react";

const format = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23", timeZone: "UTC" });

/** "Production, 14:02:31 UTC". The clock starts after mount, so the server and client agree on the first paint. */
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
    <span className="inline-flex items-center gap-2.5">
      <span aria-hidden className="relative flex size-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--neon)/0.7)] [animation-duration:2.4s] motion-reduce:hidden" />
        <span className="relative size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" />
      </span>
      <span className="text-white/80">Production</span>
      <span className="inline-block min-w-[12ch] font-mono text-xs tabular-nums text-white/60">{now ?? "--:--:--"} UTC</span>
    </span>
  );
}
