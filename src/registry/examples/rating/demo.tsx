"use client";

import * as React from "react";
import { Rating } from "@/components/ui/rating";

const verdicts = ["", "Not for me", "Could be better", "Decent", "Really good", "Perfect"];

export default function RatingDemo() {
  const [value, setValue] = React.useState(4);
  const [hover, setHover] = React.useState<number | null>(null);
  const shown = hover ?? value;

  return (
    <div className="grid w-full max-w-[18rem] justify-items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-6 py-6 text-center">
      <div className="grid gap-1">
        <p className="text-sm font-medium text-white/90">How was your order?</p>
        <p className="text-xs text-white/55">Flat white, oat · Halden Street Roasters</p>
      </div>
      <Rating
        size="lg"
        value={value}
        onValueChange={setValue}
        onHoverChange={setHover}
        aria-label="Rate your order"
        formatValue={(v, max) => (v ? `${v} of ${max}, ${verdicts[v]}` : "No rating")}
      />
      <p aria-hidden className={shown ? "text-sm text-white/80" : "text-sm text-white/35"}>
        {shown ? verdicts[shown] : "Tap a star to rate"}
      </p>
    </div>
  );
}
