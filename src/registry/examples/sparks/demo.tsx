"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Check, GitCommitHorizontal } from "@/components/ui/icons";
import { useSparks } from "@/components/ui/sparks";

type Phase = "ready" | "deploying" | "live";

export default function SparksDemo() {
  const [phase, setPhase] = React.useState<Phase>("ready");
  const { ref, fire } = useSparks<HTMLButtonElement>({ count: 48, angle: -90, spread: 150, velocity: 560 });

  React.useEffect(() => {
    if (phase !== "deploying") return;
    const timer = setTimeout(() => {
      setPhase("live");
      fire();
    }, 1600);
    return () => clearTimeout(timer);
  }, [phase, fire]);

  return (
    <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-[15px] font-medium text-white/90">relay-web</p>
        <span className="shrink-0 font-mono text-xs text-white/45">main · 4f2a91c</span>
      </div>
      <p className="mt-1 flex items-center gap-1.5 text-[13px] text-white/55">
        <GitCommitHorizontal className="size-3.5 shrink-0" />
        <span className="truncate">Retry webhooks with jittered backoff</span>
      </p>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/[0.06] pt-4 text-[13px]">
        <div>
          <dt className="text-white/45">Build</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-white/85">41s</dd>
        </div>
        <div>
          <dt className="text-white/45">Checks</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-white/85">214/214</dd>
        </div>
        <div>
          <dt className="text-white/45">Bundle</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-white/85">−3.2 kB</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p aria-live="polite" className="text-[13px] text-white/55">
          {phase === "live" ? "Live on relay.dev in 12 regions" : phase === "deploying" ? "Promoting build…" : "Ready for production"}
        </p>
        <Button
          ref={ref}
          variant={phase === "live" ? "soft" : "solid"}
          loading={phase === "deploying"}
          onClick={() => setPhase(phase === "live" ? "ready" : "deploying")}
          className="w-[7.5rem]"
        >
          {phase === "live" ? (
            <>
              <Check /> Deployed
            </>
          ) : (
            "Deploy"
          )}
        </Button>
      </div>
    </div>
  );
}
