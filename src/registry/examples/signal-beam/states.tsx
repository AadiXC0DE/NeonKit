"use client";

import * as React from "react";
import { GitFork, Server } from "@/components/ui/icons";
import { SignalBeam } from "@/components/ui/signal-beam";

const regions = [
  { name: "eu-west-1", detail: "1,920 req/s", curvature: 34, beam: { duration: 1.1, repeatDelay: 0.2 } },
  { name: "ap-south-1", detail: "40 req/s", curvature: 0, beam: { duration: 2.6, repeatDelay: 2.4 } },
  { name: "us-east-2", detail: "failover, idle", curvature: -34, beam: { active: false } },
];

export default function SignalBeamStates() {
  const container = React.useRef<HTMLDivElement>(null);
  const balancer = React.useRef<HTMLSpanElement>(null);
  const r0 = React.useRef<HTMLSpanElement>(null);
  const r1 = React.useRef<HTMLSpanElement>(null);
  const r2 = React.useRef<HTMLSpanElement>(null);
  const refs = [r0, r1, r2];

  return (
    <div ref={container} className="relative flex w-full max-w-md items-center justify-between gap-10">
      <div className="grid justify-items-center gap-2">
        <span
          ref={balancer}
          className="relative z-10 grid size-12 place-items-center rounded-full border border-[rgb(var(--neon)/0.5)] bg-[#0b0d14] text-[rgb(var(--neon))] [&_svg]:size-5"
        >
          <GitFork />
        </span>
        <span className="text-[13px] text-white/60">lb-prod</span>
      </div>
      <ul className="grid gap-5">
        {regions.map((region, i) => (
          <li key={region.name} className="flex items-center gap-3">
            <span
              ref={refs[i]}
              className={`relative z-10 grid size-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#0b0d14] [&_svg]:size-4 ${
                region.beam.active === false ? "text-white/30" : "text-white/75"
              }`}
            >
              <Server />
            </span>
            <span>
              <span className="block font-mono text-[12px] text-white/85">{region.name}</span>
              <span className="block text-[12px] text-white/45">{region.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      {regions.map((region, i) => (
        <SignalBeam
          key={region.name}
          containerRef={container}
          fromRef={balancer}
          toRef={refs[i]}
          curvature={region.curvature}
          {...region.beam}
        />
      ))}
    </div>
  );
}
