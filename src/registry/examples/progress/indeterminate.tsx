"use client";

import * as React from "react";
import { CircularProgress, Progress } from "@/components/ui/progress";

const stages = [
  "Cloning repository",
  "Installing dependencies",
  "Building",
  "Uploading build output",
  "Assigning domains",
];

function formatElapsed(seconds: number) {
  const m = String(Math.floor(seconds / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${m}:${s}`;
}

export default function ProgressIndeterminate() {
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const stage = stages[Math.floor(elapsed / 3) % stages.length];

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <CircularProgress size={14} thickness={2} aria-hidden />
        <span className="text-sm font-medium text-white/90">acme-web</span>
        <span className="ml-auto text-xs tabular-nums text-white/45">
          {formatElapsed(elapsed)}
        </span>
      </div>
      <Progress label="Deploying to production" />
      <div className="mt-3 flex items-center justify-between gap-4 text-xs text-white/45">
        <span className="truncate">{stage}…</span>
        <span className="shrink-0 font-mono">main · 7f3c2a1</span>
      </div>
    </div>
  );
}
