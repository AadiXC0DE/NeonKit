"use client";

import * as React from "react";
import { Rating } from "@/components/ui/rating";

export default function RatingHalfSteps() {
  const [score, setScore] = React.useState(3.5);

  return (
    <div className="flex w-full max-w-xs items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5">
      <div className="grid min-w-0 gap-0.5">
        <p className="truncate text-sm font-medium text-white/90">Past Lives</p>
        <p className="text-xs text-white/55">2023 · Celine Song</p>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        <Rating allowHalf size="sm" value={score} onValueChange={setScore} aria-label="Your score for Past Lives" />
        <span className="w-6 text-right text-xs tabular-nums text-white/70">
          {score ? score.toFixed(1) : "–"}
        </span>
      </div>
    </div>
  );
}
