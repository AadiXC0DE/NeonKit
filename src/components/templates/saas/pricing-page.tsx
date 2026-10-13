"use client";

import * as React from "react";
import { Compare } from "./compare";
import { Cta } from "./cta";
import { pricingFaqs, type Billing } from "./data";
import { Faq } from "./faq";
import { Plans } from "./plans";

export function SaasPricing() {
  // One toggle drives the plan cards and the comparison table's header.
  const [billing, setBilling] = React.useState<Billing>("yearly");

  return (
    <>
      <Plans
        as="h1"
        id="plans"
        title="Pay per seat. Deploys are on us."
        intro="Every plan schedules, checks and rolls back the same way. Paid plans add the rules, the people and the paper trail."
        billing={billing}
        onBillingChange={setBilling}
      />
      <Compare billing={billing} />
      <Faq
        id="pricing-faq"
        eyebrow="Billing"
        title="Money questions, answered plainly."
        intro="If yours isn't here, ask. A person who can actually change your invoice will reply."
        items={pricingFaqs}
        updated="9 Oct 2026"
      />
      <Cta />
    </>
  );
}
