"use client";

import * as React from "react";
import { queue } from "../data";

export type Phase = "queued" | "deploying" | "checking" | "landed" | "rollingback" | "rolledback" | "held";

export type NightRun = {
  phases: Phase[];
  status: "idle" | "running" | "done";
  /** Simulated seconds since the window opened at 02:00. */
  clock: number;
  /** The last thing that happened, for the live region. */
  event: string;
  /** When each deploy finished, in simulated seconds, and how. */
  marks: { at: number; phase: Phase }[];
  run: () => void;
};

const seconds = (took: string) =>
  took.split(" ").reduce((sum, part) => sum + parseInt(part, 10) * (part.endsWith("m") ? 60 : 1), 0);

// Real milliseconds each phase is shown for. The simulated clock moves much faster.
const PACE = { deploy: 1200, check: 1200, rollback: 1000, gap: 350 };

/**
 * Plays tonight's queue: deploy, hold the health checks for a minute, then land
 * or roll back. Auto-rollback is read at the moment a check fails, so flipping
 * the switch mid-run changes what happens next.
 */
export function useNightRun(autoRollback: boolean): NightRun {
  const [phases, setPhases] = React.useState<Phase[]>(() => queue.map(() => "queued"));
  const [status, setStatus] = React.useState<NightRun["status"]>("idle");
  const [clock, setClock] = React.useState(0);
  const [event, setEvent] = React.useState("");
  const [marks, setMarks] = React.useState<NightRun["marks"]>([]);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const rollbackRef = React.useRef(autoRollback);

  React.useEffect(() => {
    rollbackRef.current = autoRollback;
  }, [autoRollback]);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  const run = React.useCallback(() => {
    clearTimeout(timer.current);
    const current: Phase[] = queue.map(() => "queued");
    const done: NightRun["marks"] = [];
    let elapsed = 0;
    const later = (ms: number, fn: () => void) => {
      timer.current = setTimeout(fn, ms);
    };
    const set = (i: number, phase: Phase, add: number, message: string) => {
      current[i] = phase;
      elapsed += add;
      setPhases([...current]);
      setClock(elapsed);
      setEvent(message);
      if (phase === "landed" || phase === "rolledback" || phase === "held") {
        done.push({ at: elapsed, phase });
        setMarks([...done]);
      }
    };

    const step = (i: number) => {
      const deploy = queue[i];
      if (!deploy) {
        setStatus("done");
        setEvent("Window closed. The report is ready.");
        return;
      }
      const name = `${deploy.service}@${deploy.sha}`;
      const took = seconds(deploy.took);
      set(i, "deploying", 20, `Deploying ${name}`);
      later(PACE.deploy, () => {
        set(i, "checking", Math.max(30, took - 60), `Holding ${name} at 10% canary`);
        later(PACE.check, () => {
          if (deploy.outcome === "land") {
            set(i, "landed", 60, `${name} landed`);
            later(PACE.gap, () => step(i + 1));
          } else if (rollbackRef.current) {
            set(
              i,
              "rollingback",
              60,
              `${name} failed its checks: p95 ${deploy.p95.toLocaleString("en-US")} ms. Rolling back`,
            );
            later(PACE.rollback, () => {
              set(i, "rolledback", took, `${name} rolled back in ${deploy.took}`);
              later(PACE.gap, () => step(i + 1));
            });
          } else {
            set(i, "held", 60, `${name} failed its checks and is held at 10%. On-call paged`);
            later(PACE.gap, () => step(i + 1));
          }
        });
      });
    };

    setPhases([...current]);
    setClock(0);
    setMarks([]);
    setStatus("running");
    later(250, () => step(0));
  }, []);

  return { phases, status, clock, event, marks, run };
}

export function formatClock(elapsed: number) {
  const total = 2 * 3600 + elapsed;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600) % 24)}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}
