"use client";

import * as React from "react";
import { Odometer } from "@/components/ui/odometer";

// Card payments arriving through the afternoon: small, uneven amounts.
const payments = [41.2, 129, 18.5, 412.8, 64.99, 9.5, 230, 87.45, 1250, 22, 318.6, 54];

export default function OdometerDemo() {
  const [total, setTotal] = React.useState(1284903.2);
  const [last, setLast] = React.useState<number | null>(null);

  React.useEffect(() => {
    let i = 0;
    const id = window.setInterval(() => {
      const amount = payments[i++ % payments.length];
      setLast(amount);
      setTotal((t) => Math.round((t + amount) * 100) / 100);
    }, 2400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-baseline gap-3">
        <span className="text-[15px] font-medium text-white/85">Processed today</span>
        <span className="text-[13px] text-white/50">since 00:00 UTC</span>
      </div>
      <Odometer
        value={total}
        from={1280000}
        decimals={2}
        prefix="$"
        className="[--odo-h:34px] sm:[--odo-h:56px]"
      />
      <p className="h-5 text-[13px] text-white/55">
        {last !== null && (
          <>
            Last payment <span className="font-mono tabular-nums text-white/80">${last.toFixed(2)}</span>
          </>
        )}
      </p>
    </div>
  );
}
