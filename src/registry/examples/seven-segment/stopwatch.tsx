"use client";

import * as React from "react";
import { Flag, Pause, Play, RotateCcw } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { SevenSegment } from "@/components/ui/seven-segment";

function format(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const hundredths = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(hundredths).padStart(2, "0")}`;
}

export default function SevenSegmentStopwatch() {
  const [elapsed, setElapsed] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const [laps, setLaps] = React.useState<number[]>([]);
  const started = React.useRef(0);

  React.useEffect(() => {
    if (!running) return;
    started.current = performance.now() - elapsed;
    // 30 updates a second is plenty for hundredths; the eye can't follow more.
    const id = setInterval(() => setElapsed(performance.now() - started.current), 33);
    return () => clearInterval(id);
    // elapsed is read once when the run starts.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <SevenSegment value={format(elapsed)} size={56} aria-live="off" />
      <div className="flex gap-2">
        <Button variant={running ? "outline" : "solid"} onClick={() => setRunning((value) => !value)}>
          {running ? <Pause /> : <Play />} {running ? "Stop" : "Start"}
        </Button>
        {running ? (
          <Button variant="ghost" onClick={() => setLaps((list) => [elapsed, ...list].slice(0, 4))}>
            <Flag /> Lap
          </Button>
        ) : (
          <Button
            variant="ghost"
            disabled={elapsed === 0}
            onClick={() => {
              setElapsed(0);
              setLaps([]);
            }}
          >
            <RotateCcw /> Reset
          </Button>
        )}
      </div>
      {laps.length > 0 && (
        <ol className="w-full divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {laps.map((lap, index) => (
            <li key={lap} className="flex items-center justify-between py-2">
              <span className="text-[13px] text-white/55">Lap {laps.length - index}</span>
              <SevenSegment value={format(lap)} size={18} unlit={0.05} />
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
