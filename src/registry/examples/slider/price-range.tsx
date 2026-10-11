"use client";

import * as React from "react";
import { Slider } from "@/components/ui/slider";

const price = (value: number) => `$${value.toLocaleString("en-US")}`;

export default function SliderPriceRange() {
  const [range, setRange] = React.useState([120, 480]);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-4 flex items-baseline justify-between">
        <span id="price-range" className="text-sm font-medium text-white/90">
          Price
        </span>
        <span className="text-sm tabular-nums text-white/55">
          {price(range[0])} – {price(range[1])}
        </span>
      </div>
      <Slider
        value={range}
        onValueChange={setRange}
        min={0}
        max={1000}
        step={10}
        formatValue={price}
        showValue="hover"
        aria-labelledby="price-range"
        thumbLabels={["Minimum price", "Maximum price"]}
      />
    </div>
  );
}
