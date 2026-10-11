"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

const stops = ["1 min", "5 min", "15 min", "30 min", "1 hour", "Never"];

export default function SliderSteps() {
  const [index, setIndex] = React.useState(2);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <span id="auto-lock" className="text-sm font-medium text-white/90">
          Auto-lock
        </span>
        <span className="text-sm text-white/55">{stops[index]}</span>
      </div>
      <Slider
        value={[index]}
        onValueChange={([next]) => setIndex(next)}
        max={stops.length - 1}
        formatValue={(i) => stops[i]}
        aria-labelledby="auto-lock"
      />
      {/* Inset by half the 18px thumb so each label sits under its stop. */}
      <div aria-hidden className="relative mx-[9px] mt-2.5 h-6">
        {stops.map((stop, i) => (
          <span
            key={stop}
            className="absolute top-0 flex -translate-x-1/2 flex-col items-center gap-1.5"
            style={{ left: `${(i / (stops.length - 1)) * 100}%` }}
          >
            <span className="h-1 w-px bg-white/20" />
            <span
              className={cn(
                "whitespace-nowrap text-[11px] leading-none transition-colors duration-150",
                i === index ? "text-white/90" : "text-white/35",
              )}
            >
              {stop}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
