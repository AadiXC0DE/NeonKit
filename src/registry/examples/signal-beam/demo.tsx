"use client";

import * as React from "react";
import { Bug, CreditCard, Database, Github, Snowflake, SquareKanban, Webhook } from "@/components/ui/icons";
import { SignalBeam } from "@/components/ui/signal-beam";

const sources = [
  { name: "GitHub", detail: "push, pull_request", icon: Github, curvature: 46 },
  { name: "Stripe", detail: "invoice.paid", icon: CreditCard, curvature: 22 },
  { name: "Postgres", detail: "orders, CDC", icon: Database, curvature: 0 },
  { name: "Linear", detail: "issue.updated", icon: SquareKanban, curvature: -22 },
  { name: "Sentry", detail: "paused", icon: Bug, curvature: -46, paused: true },
];

function Tile({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`relative z-10 grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#0b0d14] text-white/80 sm:size-11 [&_svg]:size-[18px] ${className}`}
    >
      {children}
    </span>
  );
}

export default function SignalBeamDemo() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const hubRef = React.useRef<HTMLSpanElement>(null);
  const sinkRef = React.useRef<HTMLSpanElement>(null);
  const r0 = React.useRef<HTMLSpanElement>(null);
  const r1 = React.useRef<HTMLSpanElement>(null);
  const r2 = React.useRef<HTMLSpanElement>(null);
  const r3 = React.useRef<HTMLSpanElement>(null);
  const r4 = React.useRef<HTMLSpanElement>(null);
  const refs = [r0, r1, r2, r3, r4];

  return (
    <div
      ref={containerRef}
      className="relative flex w-full max-w-2xl items-center justify-between gap-4 py-2"
    >
      <ul className="flex flex-col gap-4 sm:min-w-[132px] sm:gap-5">
        {sources.map((source, i) => {
          const Icon = source.icon;
          return (
            <li key={source.name} className="flex items-center justify-end gap-3">
              <span className="hidden min-w-0 text-right sm:block">
                <span className={`block text-sm ${source.paused ? "text-white/45" : "text-white/85"}`}>{source.name}</span>
                <span className="block font-mono text-[11px] text-white/45">{source.detail}</span>
              </span>
              <Tile className={source.paused ? "text-white/35" : ""}>
                <span ref={refs[i]} className="absolute inset-0 rounded-xl" />
                <Icon />
              </Tile>
            </li>
          );
        })}
      </ul>

      <div className="relative">
        <span
          ref={hubRef}
          className="relative z-10 grid size-16 place-items-center rounded-full border border-[rgb(var(--neon)/0.55)] bg-[#0b0d14] text-[rgb(var(--neon))] shadow-[0_0_0_4px_rgb(var(--neon)/0.06),0_0_28px_rgb(var(--neon)/CALC(0.35*var(--neon-glow,1)))] sm:size-20 [&_svg]:size-7"
        >
          <Webhook />
        </span>
        <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-center">
          <span className="block text-sm text-white/85">Relay</span>
          <span className="block font-mono text-[11px] tabular-nums text-white/55">1,284 events/min</span>
        </span>
      </div>

      <div className="flex items-center gap-3 sm:min-w-[132px]">
        <Tile>
          <span ref={sinkRef} className="absolute inset-0 rounded-xl" />
          <Snowflake />
        </Tile>
        <span className="hidden sm:block">
          <span className="block text-sm text-white/85">Snowflake</span>
          <span className="block font-mono text-[11px] text-white/45">RAW.EVENTS</span>
        </span>
      </div>

      {sources.map((source, i) => (
        <SignalBeam
          key={source.name}
          containerRef={containerRef}
          fromRef={refs[i]}
          toRef={hubRef}
          curvature={source.curvature}
          delay={[0, 1.3, 0.5, 1.9, 0][i]}
          duration={1.8}
          repeatDelay={1.4}
          active={!source.paused}
        />
      ))}
      <SignalBeam containerRef={containerRef} fromRef={hubRef} toRef={sinkRef} duration={1.1} repeatDelay={0.5} delay={0.9} pulseLength={0.45} />
    </div>
  );
}
