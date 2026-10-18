"use client";

import * as React from "react";
import { Suggestion, Suggestions } from "@/components/ui/suggestions";

const ACTIONS = [
  "Explain this function",
  "Add tests",
  "Find callers",
  "Convert to async",
  "Add JSDoc",
  "Handle the null case",
  "Extract a hook",
];

export default function SuggestionsScroll() {
  const [picked, setPicked] = React.useState<string | null>(null);

  return (
    <div className="w-full max-w-[22rem] overflow-hidden rounded-xl border border-white/10 bg-[#0a0c12]">
      <pre tabIndex={0} className="overflow-x-auto border-b border-white/[0.06] px-4 py-3 font-mono text-[12px] leading-5 text-white/70 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]">
        <span className="text-white/55">{"// src/lib/billing.ts:41"}</span>
        {"\n"}
        <span className="text-[rgb(var(--neon))]">export function</span> prorate(plan, days) {"{"}
        {"\n"}
        {"  "}return plan.price * (days / plan.period);
        {"\n"}
        {"}"}
      </pre>
      <div className="grid gap-2 px-4 py-3">
        <Suggestions size="sm" aria-label="Actions for prorate" onSelect={setPicked}>
          {ACTIONS.map((action) => (
            <Suggestion key={action}>{action}</Suggestion>
          ))}
        </Suggestions>
        <p aria-live="polite" className="text-[12.5px] text-white/50">
          {picked ? `Queued “${picked}” for prorate().` : "Swipe or use the arrow keys for more."}
        </p>
      </div>
    </div>
  );
}
