"use client";

import * as React from "react";
import { Stat, StatGroup } from "@/components/ui/stat";

const START = { seed: 7, history: [412, 398, 431, 446, 420, 409, 455, 470, 452, 461, 488, 474], queue: 38 };

// A seeded walk, so the server and the first client render agree.
function tick(state: typeof START) {
  const seed = (state.seed * 9301 + 49297) % 233280;
  const r = seed / 233280;
  const last = state.history[state.history.length - 1];
  return {
    seed,
    history: [...state.history.slice(1), Math.max(300, Math.min(620, last + Math.round((r - 0.48) * 46)))],
    queue: Math.max(0, state.queue + Math.round((r - 0.5) * 12)),
  };
}

export default function StatLive() {
  const [state, setState] = React.useState(START);

  React.useEffect(() => {
    const timer = setInterval(() => setState(tick), 2000);
    return () => clearInterval(timer);
  }, []);

  const { history, queue } = state;
  const rps = history[history.length - 1];
  const change = ((rps - history[0]) / history[0]) * 100;

  return (
    <StatGroup variant="framed" columns={2} className="w-full max-w-xl">
      <Stat live label="Requests per second" value={rps} delta={change} trend={history} helper="Edge, all regions, last 24 s" />
      <Stat live label="Jobs in queue" value={queue} positive="down" helper="ingest-worker, 6 replicas" />
    </StatGroup>
  );
}
