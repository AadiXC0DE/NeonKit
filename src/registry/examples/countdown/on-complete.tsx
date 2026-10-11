"use client";

import * as React from "react";
import { Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";

export default function CountdownOnComplete() {
  const [target, setTarget] = React.useState<number | null>(null);
  const [lifted, setLifted] = React.useState(false);

  const start = () => {
    setLifted(false);
    setTarget(Date.now() + 10_000);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Countdown
        key={target ?? 0}
        to={target ?? 0}
        units={["minutes", "seconds"]}
        labels={{ minutes: "Min", seconds: "Sec" }}
        onComplete={() => setLifted(target !== null)}
        size="sm"
      />
      <p aria-live="polite" className="h-5 text-sm text-white/55">
        {lifted ? "Liftoff. The tower is clear." : target ? "Holding for nothing. Ten seconds." : "Ready when you are."}
      </p>
      <Button onClick={start}>
        {target ? <RotateCcw /> : <Play />} {target ? "Restart" : "Start T-10"}
      </Button>
    </div>
  );
}
