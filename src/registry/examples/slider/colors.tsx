"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";

const channels = [
  { key: "r", label: "Red", color: "red" },
  { key: "g", label: "Green", color: "green" },
  { key: "b", label: "Blue", color: "blue" },
] as const;

type Rgb = Record<(typeof channels)[number]["key"], number>;

export default function SliderColors() {
  const [rgb, setRgb] = React.useState<Rgb>({ r: 34, g: 211, b: 238 });
  const hex = `#${[rgb.r, rgb.g, rgb.b].map((n) => n.toString(16).padStart(2, "0")).join("")}`;

  return (
    <div className="flex w-full max-w-sm items-center gap-6">
      <div className="flex shrink-0 flex-col items-center gap-2">
        <div
          className="size-16 rounded-xl border border-white/10"
          style={{ backgroundColor: hex, boxShadow: `0 0 28px ${hex}55` }}
        />
        <span className="font-mono text-xs uppercase text-white/55">{hex}</span>
      </div>
      <div className="grid flex-1 gap-4">
        {channels.map((channel) => (
          <div key={channel.key} className="grid grid-cols-[2.75rem_1fr_1.75rem] items-center gap-3">
            <span className="text-xs text-white/55">{channel.label}</span>
            <Slider
              color={channel.color}
              size="sm"
              max={255}
              value={[rgb[channel.key]]}
              onValueChange={([value]) => setRgb((current) => ({ ...current, [channel.key]: value }))}
              aria-label={channel.label}
            />
            <span className="text-right text-xs tabular-nums text-white/90">{rgb[channel.key]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
