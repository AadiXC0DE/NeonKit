"use client";

import * as React from "react";
import { Rocket } from "lucide-react";
import { Countdown } from "@/components/ui/countdown";

// Two days, fourteen hours and change from whenever the page opens.
const WINDOW = ((2 * 24 + 14) * 60 + 7) * 60_000 + 33_000;

export default function CountdownDemo() {
  const [launch] = React.useState(() => Date.now() + WINDOW);

  return (
    <div className="flex flex-col items-center gap-7 [--neon:var(--neon-accent,34_211_238)]">
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]">
          <Rocket aria-hidden className="size-3.5" /> Orbital test flight 7
        </span>
        <span className="text-sm text-white/55">Launch window opens in</span>
      </div>
      <Countdown to={launch} aria-label="Time until the launch window opens" className="[--countdown-h:40px] lg:[--countdown-h:72px]" />
    </div>
  );
}
