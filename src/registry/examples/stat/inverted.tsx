"use client";

import { Stat, StatGroup } from "@/components/ui/stat";

// For these, down is good: green arrows point down, red ones up.
export default function StatInverted() {
  return (
    <StatGroup columns={3} className="w-full max-w-3xl">
      <Stat
        label="Error rate"
        value={0.42}
        unit="%"
        delta={-31}
        positive="down"
        helper="5xx over all requests, this week"
      />
      <Stat
        label="Cloud spend"
        value={18940}
        formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
        delta={6.5}
        positive="down"
        helper="October to date, on track for $27.1k"
      />
      <Stat label="Deploys" value={286} delta={0} positive="neutral" helper="Same as last week" />
    </StatGroup>
  );
}
