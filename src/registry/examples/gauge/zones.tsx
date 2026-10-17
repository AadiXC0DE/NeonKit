"use client";

import * as React from "react";
import { Gauge } from "@/components/ui/gauge";
import { Slider } from "@/components/ui/slider";

const zones = [
  { from: 50, to: 70, color: "blue" },
  { from: 80, to: 105, color: "green" },
  { from: 115, to: 130, color: "red" },
];

export default function GaugeZones() {
  const [temp, setTemp] = React.useState(92);

  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-6">
      <Gauge label="Coolant" unit="°C" value={temp} min={50} max={130} ticks={8} zones={zones} />
      <Slider
        value={[temp]}
        onValueChange={([value]) => setTemp(value)}
        min={50}
        max={130}
        aria-label="Coolant temperature"
        formatValue={(v) => `${v} °C`}
      />
    </div>
  );
}
