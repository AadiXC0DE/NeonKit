"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Starfield } from "@/components/ui/starfield";

const regions = ["fra1", "iad1", "sfo1", "hnd1", "syd1", "gru1", "bom1", "cpt1"];

export default function StarfieldDeploy() {
  const [status, setStatus] = React.useState<"idle" | "deploying" | "live">("idle");
  const [done, setDone] = React.useState(0);

  React.useEffect(() => {
    if (status !== "deploying") return;
    const timer = setTimeout(() => {
      if (done + 1 >= regions.length) setStatus("live");
      setDone(done + 1);
    }, 380);
    return () => clearTimeout(timer);
  }, [status, done]);

  return (
    <div className="relative flex h-72 w-full max-w-xl flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center">
      <Starfield warp={status === "deploying"} density={5} />
      <p aria-live="polite" className="relative font-mono text-xs text-white/55">
        {status === "idle" && "main · 3f9c2e1 · ready"}
        {status === "deploying" && `Deploying · ${done}/${regions.length} regions · ${regions[Math.min(done, regions.length - 1)]}`}
        {status === "live" && `Live in ${regions.length} regions`}
      </p>
      <Button
        className="relative mt-5"
        variant={status === "live" ? "outline" : "solid"}
        disabled={status === "deploying"}
        onClick={() => {
          setDone(0);
          setStatus("deploying");
        }}
      >
        {status === "live" ? "Deploy again" : status === "deploying" ? "Deploying" : "Deploy to production"}
      </Button>
    </div>
  );
}
