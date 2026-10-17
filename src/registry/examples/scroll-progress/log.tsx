"use client";

import * as React from "react";
import { ScrollProgress } from "@/components/ui/scroll-progress";

const lines = Array.from({ length: 28 }, (_, i) => {
  const t = new Date(Date.UTC(2026, 9, 17, 14, 2, 11) + i * 1370);
  const stamp = t.toISOString().slice(11, 19);
  const codes = [200, 200, 200, 202, 200, 409, 200, 200, 500, 200];
  const code = codes[i % codes.length];
  return `${stamp}  ${code}  POST /hooks/invoice.paid  ${32 + ((i * 37) % 180)}ms`;
});

export default function ScrollProgressLog() {
  const logRef = React.useRef<HTMLPreElement>(null);

  return (
    <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#07080d]">
      <div className="flex items-center justify-between px-4 py-2.5 text-[13px]">
        <span className="text-white/80">Deliveries</span>
        <span className="text-white/45">last 40 s</span>
      </div>
      <ScrollProgress color="lime" target={logRef} thickness={2} aria-label="Log position" />
      <pre
        ref={logRef}
        tabIndex={0}
        aria-label="Delivery log"
        className="h-48 overflow-auto px-4 py-3 font-mono text-[12px] leading-6 text-white/60 outline-none"
      >
        {lines.join("\n")}
      </pre>
    </div>
  );
}
