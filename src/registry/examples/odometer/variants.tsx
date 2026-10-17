"use client";

import * as React from "react";
import { Odometer } from "@/components/ui/odometer";

function useTicker(start: number, step: number, every: number) {
  const [value, setValue] = React.useState(start);
  React.useEffect(() => {
    const id = window.setInterval(() => setValue((v) => Math.round((v + step) * 10) / 10), every);
    return () => window.clearInterval(id);
  }, [step, every]);
  return value;
}

export default function OdometerVariants() {
  const requests = useTicker(48213, 7, 1800);
  const trip = useTicker(428.6, 0.1, 1100);
  const total = useTicker(84213.7, 0.1, 1100);

  return (
    <div className="flex flex-wrap items-end justify-center gap-x-12 gap-y-10">
      <figure className="flex flex-col items-center gap-3">
        <Odometer value={requests} size="md" />
        <figcaption className="text-[13px] text-white/55">Lit, requests served</figcaption>
      </figure>
      <figure className="flex flex-col items-center gap-3">
        <Odometer value={trip} variant="backlit" color="amber" decimals={1} minDigits={4} suffix="km" size="md" />
        <figcaption className="text-[13px] text-white/55">Backlit, trip</figcaption>
      </figure>
      <figure className="flex flex-col items-center gap-3">
        <Odometer value={total} variant="cream" color="red" decimals={1} minDigits={6} size="md" />
        <figcaption className="text-[13px] text-white/55">Cream, total distance</figcaption>
      </figure>
    </div>
  );
}
