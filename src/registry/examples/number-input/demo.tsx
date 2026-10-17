"use client";

import * as React from "react";
import { NumberInput } from "@/components/ui/number-input";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function NumberInputDemo() {
  const [seats, setSeats] = React.useState<number | null>(12);
  const [price, setPrice] = React.useState<number | null>(24);
  const total = (seats ?? 0) * (price ?? 0);

  return (
    <div className="grid w-full max-w-sm gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="grid gap-1">
        <h3 className="text-sm font-medium text-white/90">Team plan</h3>
        <p className="text-sm text-white/55">Drag a label sideways to scrub. Hold Shift for bigger steps.</p>
      </div>
      <div className="grid gap-3 min-[420px]:grid-cols-2">
        <NumberInput label="Seats" value={seats} onValueChange={setSeats} min={1} max={500} />
        <NumberInput
          label="Price per seat"
          value={price}
          onValueChange={setPrice}
          min={0}
          max={999}
          formatOptions={{ style: "currency", currency: "USD" }}
          locale="en-US"
        />
      </div>
      <div className="flex items-baseline justify-between border-t border-white/10 pt-4">
        <span className="text-sm text-white/55">Billed monthly</span>
        <span className="text-xl font-semibold tabular-nums tracking-[-0.01em] text-white/90">{usd.format(total)}</span>
      </div>
    </div>
  );
}
