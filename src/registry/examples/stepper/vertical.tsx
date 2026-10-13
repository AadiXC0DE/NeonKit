"use client";

import * as React from "react";
import { RotateCw } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Step, Stepper } from "@/components/ui/stepper";

const pipeline = [
  { title: "Clone repository", running: "Fetching main…", done: "main · 8f3c2a1 · 1.2s" },
  { title: "Install dependencies", running: "Resolving packages…", done: "412 packages from cache · 6.8s" },
  {
    title: "Run checks",
    running: "Type-checking and running tests…",
    done: "Types, lint and 184 tests · 21.4s",
    failed: "2 type errors in src/app/page.tsx",
  },
  { title: "Deploy to production", running: "Uploading build output…", done: "Live at aurora.lumenlabs.dev" },
];

export default function StepperVertical() {
  const [value, setValue] = React.useState(2);
  const [failed, setFailed] = React.useState(true);
  const [active, setActive] = React.useState(false);
  const running = active && value < pipeline.length;
  const finished = value === pipeline.length;

  React.useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setValue((step) => step + 1), 1100);
    return () => window.clearTimeout(timer);
  }, [running, value]);

  function retry() {
    setFailed(false);
    setActive(true);
  }

  function redeploy() {
    setValue(0);
    setActive(true);
  }

  return (
    <div className="grid w-full max-w-sm gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="grid gap-0.5">
          <h3 className="text-sm font-medium text-white/90">Deployment #1284</h3>
          <p aria-live="polite" className="text-xs text-white/50">
            {finished ? "Ready" : running ? "Building" : "Failed after 29.4s"}
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={finished ? redeploy : retry}
          disabled={running}
          loading={running}
        >
          {!running && <RotateCw />}
          {finished ? "Redeploy" : running ? "Running" : "Retry"}
        </Button>
      </div>

      <Stepper orientation="vertical" value={value} aria-label="Deployment steps">
        {pipeline.map((step, index) => {
          const error = failed && "failed" in step && index === value;
          const description =
            index < value
              ? step.done
              : index > value
                ? "Waiting"
                : error
                  ? step.failed
                  : running
                    ? step.running
                    : "Waiting";
          return (
            <Step
              key={step.title}
              title={step.title}
              description={description}
              status={error ? "error" : undefined}
            />
          );
        })}
      </Stepper>
    </div>
  );
}
