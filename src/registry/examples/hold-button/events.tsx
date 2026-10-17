"use client";

import * as React from "react";
import { HoldButton } from "@/components/ui/hold-button";

export default function HoldButtonEvents() {
  const [log, setLog] = React.useState<{ id: number; text: string }[]>([]);
  const push = (text: string) =>
    setLog((lines) => [{ id: (lines[0]?.id ?? 0) + 1, text }, ...lines].slice(0, 4));

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <HoldButton
        duration={1200}
        onHoldStart={() => push("Holding…")}
        onHoldCancel={(progress) => push(`Let go at ${Math.round(progress * 100)}%, draining`)}
        onComplete={() => push("Confirmed")}
      >
        Hold to sign off
      </HoldButton>
      <ol className="w-full space-y-1 rounded-lg border border-white/10 bg-[#0a0b11] p-3 font-mono text-xs text-white/55" aria-live="polite">
        {log.length === 0 ? (
          <li className="font-sans text-white/55">Press and hold, or focus and hold Space.</li>
        ) : (
          log.map((line, i) => (
            <li key={line.id} className={i === 0 ? "text-white/90" : undefined}>
              {line.text}
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
