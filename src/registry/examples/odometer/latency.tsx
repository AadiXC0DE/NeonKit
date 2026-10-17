"use client";

import * as React from "react";
import { Odometer } from "@/components/ui/odometer";

// Readings from a load test, one every two seconds.
const samples = [
  [38, 182, 412],
  [41, 176, 398],
  [37, 191, 455],
  [44, 204, 511],
  [40, 188, 430],
  [36, 171, 389],
];

const labels = ["p50", "p95", "p99"];

export default function OdometerLatency() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => setIndex((i) => (i + 1) % samples.length), 2000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <dl className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-10">
      {labels.map((label, i) => (
        <div key={label} className="flex items-center justify-between gap-6 sm:flex-col sm:items-start sm:gap-2.5">
          <dt className="text-[14px] text-white/60">{label} latency</dt>
          <dd>
            <Odometer value={samples[index][i]} minDigits={3} suffix="ms" size="sm" color={i === 2 && samples[index][i] > 500 ? "red" : undefined} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
