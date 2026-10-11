"use client";

import * as React from "react";
import { FileArchive, FileImage, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const files = [
  { name: "q3-board-review.pdf", size: 8.4, icon: FileText, start: 100, rate: 0 },
  { name: "launch-hero@2x.png", size: 14.2, icon: FileImage, start: 38, rate: 6 },
  { name: "brand-assets.zip", size: 126, icon: FileArchive, start: 9, rate: 2.6 },
];

// Uneven steps so the bars move like a real network, not a metronome.
const steps = [1.4, 0.6, 1.1, 0.3, 1.6, 0.9, 0.5, 1.2];
const LOOP = 44;

function travelled(tick: number, offset: number) {
  let total = 0;
  for (let i = 0; i < tick; i++) total += steps[(i + offset) % steps.length];
  return total;
}

export default function ProgressDemo() {
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % LOOP), 500);
    return () => clearInterval(id);
  }, []);

  const uploads = files.map((file, i) => ({
    ...file,
    value: Math.min(100, file.start + file.rate * travelled(tick, i * 3)),
  }));
  const complete = uploads.filter((file) => file.value === 100).length;

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h3 className="text-sm font-medium text-white/90">Uploads</h3>
        <span className="text-xs tabular-nums text-white/45">
          {complete} of {files.length} complete
        </span>
      </div>
      <ul className="grid gap-5">
        {uploads.map(({ name, size, icon: Icon, value }) => {
          const done = value === 100;
          return (
            <li key={name} className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-white/50">
                <Icon className="size-4" />
              </span>
              <div className="grid min-w-0 flex-1 gap-1.5">
                <Progress
                  value={value}
                  label={name}
                  showValue
                  color={done ? "green" : undefined}
                />
                <p className="text-xs tabular-nums text-white/45">
                  {done
                    ? `${size} MB · Uploaded`
                    : `${((size * value) / 100).toFixed(1)} of ${size} MB`}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
