"use client";

import * as React from "react";
import { Gauge } from "@/components/ui/gauge";

const hosts = ["api-1", "api-2", "worker"];

export default function GaugeLive() {
  const [load, setLoad] = React.useState([42, 67, 18]);

  React.useEffect(() => {
    // A random walk with a pull toward each host's usual load.
    const usual = [45, 70, 25];
    const id = window.setInterval(() => {
      setLoad((current) =>
        current.map((v, i) => {
          const next = v + (usual[i] - v) * 0.15 + (Math.random() - 0.5) * 22;
          return Math.round(Math.min(100, Math.max(0, next)));
        }),
      );
    }, 1400);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-6">
      {hosts.map((host, i) => (
        <Gauge
          key={host}
          size="sm"
          label={host}
          unit="CPU"
          value={load[i]}
          redline={90}
          formatValue={(v) => `${v}%`}
        />
      ))}
    </div>
  );
}
