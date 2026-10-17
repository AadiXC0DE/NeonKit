"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Repeat } from "@/components/ui/icons";
import { Stat } from "@/components/ui/stat";

export default function StatLoading() {
  const [loading, setLoading] = React.useState(true);
  const [run, setRun] = React.useState(0);

  React.useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(timer);
  }, [loading, run]);

  return (
    <div className="grid w-full max-w-sm gap-6">
      <Stat
        key={run}
        size="lg"
        loading={loading}
        icon={Repeat}
        label="Net revenue retention"
        value={118.4}
        unit="%"
        delta={4.1}
        formatDelta={(d) => `${d.toFixed(1)} pts`}
        trend={[104, 106, 105, 109, 111, 110, 113, 115, 114, 117, 118.4]}
        helper="Trailing twelve months"
      />
      <Button
        variant="ghost"
        size="sm"
        className="w-fit border border-white/10"
        onClick={() => {
          setLoading(true);
          setRun((r) => r + 1);
        }}
      >
        <RefreshCw aria-hidden className="size-3.5" />
        Refresh
      </Button>
    </div>
  );
}
