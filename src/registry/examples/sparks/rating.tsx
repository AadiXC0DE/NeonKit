"use client";

import * as React from "react";
import { Rating } from "@/components/ui/rating";
import { fireSparks } from "@/components/ui/sparks";

const verdicts = ["", "Not for me", "Could be better", "Decent", "Really good", "Perfect"];

export default function SparksRating() {
  const [value, setValue] = React.useState(0);
  const ratingRef = React.useRef<HTMLDivElement>(null);

  const rate = (next: number) => {
    setValue(next);
    // Only a full score earns a burst, and it comes off the star that was picked.
    if (next !== 5) return;
    const star = ratingRef.current?.querySelector(`[data-rating-index="${next - 1}"]`);
    fireSparks({ origin: star ?? ratingRef.current, count: 36, spread: 120, velocity: 420, gravity: 760 });
  };

  return (
    <div className="grid w-full max-w-[18rem] justify-items-center gap-3 text-center">
      <p className="text-sm font-medium text-white/90">Rate the onboarding call</p>
      <Rating ref={ratingRef} size="lg" value={value} onValueChange={rate} aria-label="Rate the onboarding call" />
      <p aria-hidden className={value ? "text-sm text-white/75" : "text-sm text-white/40"}>
        {value ? verdicts[value] : "Five stars sets it off"}
      </p>
    </div>
  );
}
