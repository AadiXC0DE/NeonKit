"use client";

import * as React from "react";
import { RotatingText } from "@/components/ui/rotating-text";

const plans = [
  { audience: "solo developers", price: "$0", note: "3 projects, community support" },
  { audience: "teams of ten", price: "$96", note: "per month, unlimited projects" },
  { audience: "500-seat orgs", price: "Custom", note: "SSO, audit log, 99.99% SLA" },
];

export default function RotatingTextControlled() {
  const [index, setIndex] = React.useState(0);
  const [pinned, setPinned] = React.useState(false);

  return (
    <div className="w-full max-w-lg">
      <p className="text-[clamp(1.6rem,4.6vw,2.4rem)] font-semibold leading-tight tracking-[-0.03em] text-white/90">
        Priced for{" "}
        <RotatingText
          words={plans.map((p) => p.audience)}
          index={index}
          onIndexChange={setIndex}
          paused={pinned}
          interval={3200}
        />
      </p>
      <div className="mt-6 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-mono text-2xl tabular-nums text-white/90">{plans[index].price}</span>
        <span className="text-sm text-white/55">{plans[index].note}</span>
      </div>
      <div role="group" aria-label="Plan" className="mt-5 flex gap-1.5">
        {plans.map((plan, i) => (
          <button
            key={plan.audience}
            type="button"
            aria-pressed={i === index}
            onClick={() => {
              setIndex(i);
              setPinned(true);
            }}
            className="h-8 cursor-pointer rounded-md border border-white/10 px-3 text-[13px] text-white/60 transition-colors hover:text-white/90 aria-pressed:border-[rgb(var(--neon)/0.5)] aria-pressed:text-[rgb(var(--neon))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            {["Solo", "Team", "Org"][i]}
          </button>
        ))}
      </div>
    </div>
  );
}
