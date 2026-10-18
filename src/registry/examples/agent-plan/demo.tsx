"use client";

import * as React from "react";
import { AgentPlan, type PlanStep, type PlanStepStatus } from "@/components/ui/agent-plan";

type Frame = { at: number; statuses: PlanStepStatus[]; subs: PlanStepStatus[] };

// Each frame is where the plan stands at a moment: step statuses, then the patch step's substeps.
const FRAMES: Frame[] = [
  { at: 0, statuses: ["active", "pending", "pending", "pending"], subs: ["pending", "pending"] },
  { at: 2200, statuses: ["done", "active", "pending", "pending"], subs: ["pending", "pending"] },
  { at: 4600, statuses: ["done", "done", "active", "pending"], subs: ["active", "pending"] },
  { at: 6000, statuses: ["done", "done", "active", "pending"], subs: ["done", "active"] },
  { at: 7400, statuses: ["done", "done", "done", "active"], subs: ["done", "done"] },
  { at: 9400, statuses: ["done", "done", "done", "done"], subs: ["done", "done"] },
];

function stepsFor(frame: Frame): PlanStep[] {
  const [reproduce, cause, patch, rerun] = frame.statuses;
  return [
    {
      id: "reproduce",
      title: "Reproduce with TZ=Europe/Berlin",
      status: reproduce,
      meta: reproduce === "done" ? "1 failed" : undefined,
    },
    {
      id: "cause",
      title: "Find why addDays is an hour short",
      status: cause,
      description:
        cause === "done" ? "It adds 86,400,000 ms per day. October 25 is 25 hours long in Berlin." : undefined,
    },
    {
      id: "patch",
      title: "Step by calendar day in src/date.ts",
      status: patch,
      meta: patch === "done" ? "+3 −1" : undefined,
      substeps: [
        { title: "Replace the millisecond math with setDate", status: frame.subs[0] },
        { title: "Keep the addDays(date, days) signature", status: frame.subs[1] },
      ],
    },
    {
      id: "rerun",
      title: "Re-run the suite",
      status: rerun,
      meta: rerun === "done" ? "14 passed" : undefined,
    },
  ];
}

export default function AgentPlanDemo() {
  const [frame, setFrame] = React.useState(0);
  const [run, setRun] = React.useState(0);

  React.useEffect(() => {
    const timers = FRAMES.slice(1).map((next, index) => setTimeout(() => setFrame(index + 1), next.at + 600));
    return () => timers.forEach(clearTimeout);
  }, [run]);

  const finished = frame === FRAMES.length - 1;

  return (
    <div className="grid w-full max-w-md gap-5">
      <AgentPlan title="Fix the failing date test" steps={stepsFor(FRAMES[frame])} />
      <button
        type="button"
        onClick={() => {
          setFrame(0);
          setRun((n) => n + 1);
        }}
        tabIndex={finished ? 0 : -1}
        className={`w-fit cursor-pointer rounded-md text-[13px] text-white/55 underline decoration-white/20 underline-offset-4 outline-none transition-[color,opacity] hover:text-white/85 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] ${finished ? "opacity-100" : "pointer-events-none opacity-0"}`}
      >
        Run it again
      </button>
    </div>
  );
}
