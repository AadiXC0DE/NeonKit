"use client";

import * as React from "react";
import { ChevronDown, FileText, Folder, LayoutDashboard, Rocket, RotateCcw, Settings } from "@/components/ui/icons";
import { Tour, type TourStep } from "@/components/ui/tour";

const DEPLOYS = [
  { id: "dpl_8f3a", commit: "Cache product images at the edge", who: "ada", age: "12 min", live: true },
  { id: "dpl_7c21", commit: "Fix cart total rounding for JPY", who: "lin", age: "3 h", live: false },
  { id: "dpl_77e0", commit: "Move checkout to the new API", who: "ada", age: "yesterday", live: false },
];

export default function TourDemo() {
  const frame = React.useRef<HTMLDivElement>(null);
  const env = React.useRef<HTMLButtonElement>(null);
  const deploy = React.useRef<HTMLButtonElement>(null);
  const stats = React.useRef<HTMLDListElement>(null);
  const rollback = React.useRef<HTMLButtonElement>(null);
  const logs = React.useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = React.useState(false);
  const [finished, setFinished] = React.useState(false);

  const steps: TourStep[] = [
    {
      target: env,
      title: "This is production",
      body: "Changes here reach about 41,000 people a day. Switch to Preview to try a branch first.",
    },
    {
      target: deploy,
      title: "Ship from main",
      body: "Builds the latest commit on main in about two minutes. The current version keeps serving until the new one passes health checks.",
      side: "bottom",
      align: "end",
    },
    {
      target: stats,
      title: "Watch the first ten minutes",
      body: "These refresh every 10 seconds. An error rate over 1% rolls the deploy back on its own.",
    },
    {
      target: rollback,
      title: "Roll back in one click",
      body: "Any of the last 30 deploys can go live again. Nothing rebuilds, so it takes about 4 seconds.",
      side: "left",
    },
    {
      target: logs,
      title: "Logs stay for 14 days",
      body: "Every error links here with its request ID already filtered.",
      side: "right",
    },
  ];

  return (
    <div className="grid w-full max-w-3xl gap-3">
      <div
        ref={frame}
        className="relative flex min-h-[380px] overflow-hidden rounded-xl border border-white/10 bg-[#090a10] text-[13px] text-white/75"
      >
        <nav aria-label="Project" className="hidden w-44 shrink-0 flex-col gap-0.5 border-r border-white/[0.06] p-3 sm:flex">
          <p className="mb-3 px-2 pt-1 text-[13.5px] font-medium text-white/90">lumen-web</p>
          {[
            { icon: LayoutDashboard, label: "Overview", current: true },
            { icon: Rocket, label: "Deployments" },
            { icon: FileText, label: "Logs", ref: logs },
            { icon: Folder, label: "Storage" },
            { icon: Settings, label: "Settings" },
          ].map(({ icon: Icon, label, current, ref }) => (
            <a
              key={label}
              ref={ref}
              href={`#${label.toLowerCase()}`}
              onClick={(event) => event.preventDefault()}
              aria-current={current ? "page" : undefined}
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-white/55 outline-none hover:bg-white/[0.04] hover:text-white/85 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] aria-[current=page]:bg-white/[0.05] aria-[current=page]:text-white/90"
            >
              <Icon aria-hidden className="size-4" />
              {label}
            </a>
          ))}
        </nav>

        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2">
            <button
              ref={env}
              type="button"
              className="inline-flex h-8 items-center gap-2 rounded-md border border-white/10 px-2.5 text-white/85 outline-none hover:border-white/20 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
            >
              <span className="size-1.5 rounded-full bg-[#34d399] shadow-[0_0_6px_rgb(52_211_153/CALC(0.8*var(--neon-glow,1)))]" />
              Production
              <ChevronDown aria-hidden className="size-3.5 text-white/55" />
            </button>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFinished(false);
                  setOpen(true);
                }}
                className="h-8 rounded-md px-2.5 text-[rgb(var(--neon))] outline-none hover:bg-[rgb(var(--neon)/0.08)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
              >
                Take the tour
              </button>
              <button
                ref={deploy}
                type="button"
                className="inline-flex h-8 items-center gap-1.5 rounded-md bg-white/90 px-3 font-medium text-[#05060a] outline-none hover:bg-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#090a10]"
              >
                <Rocket aria-hidden className="size-3.5" />
                Deploy
              </button>
            </div>
          </div>

          <dl ref={stats} className="mt-5 grid grid-cols-3 gap-4 rounded-lg border border-white/[0.06] p-3.5">
            {[
              ["Requests", "1.24M", "last 24 h"],
              ["p95", "182 ms", "−11 ms"],
              ["Errors", "0.04%", "38 total"],
            ].map(([label, value, note]) => (
              <div key={label} className="min-w-0">
                <dt className="text-white/55">{label}</dt>
                <dd className="mt-1 font-mono text-[17px] tabular-nums text-white/90">{value}</dd>
                <dd className="mt-0.5 truncate text-[12px] text-white/55">{note}</dd>
              </div>
            ))}
          </dl>

          <p className="mt-5 text-white/55">Recent deployments</p>
          <ul className="mt-2 divide-y divide-white/[0.05]">
            {DEPLOYS.map((d, i) => (
              <li key={d.id} className="flex items-center gap-3 py-2.5">
                <span
                  aria-hidden
                  className={
                    d.live
                      ? "size-1.5 shrink-0 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1)))]"
                      : "size-1.5 shrink-0 rounded-full bg-white/20"
                  }
                />
                <span className="min-w-0 flex-1 truncate text-white/85">{d.commit}</span>
                <span className="hidden shrink-0 text-white/55 sm:inline">
                  {d.who}, {d.age}
                </span>
                {d.live ? (
                  <span className="w-[5.5rem] shrink-0 text-right text-[12px] text-[rgb(var(--neon))]">Live</span>
                ) : (
                  <button
                    ref={i === 1 ? rollback : undefined}
                    type="button"
                    className="inline-flex h-7 w-[5.5rem] shrink-0 items-center justify-center gap-1.5 rounded-md border border-white/10 text-[12px] text-white/70 outline-none hover:border-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                  >
                    <RotateCcw aria-hidden className="size-3" />
                    Roll back
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        <Tour
          container={frame}
          steps={steps}
          open={open}
          onOpenChange={setOpen}
          onComplete={() => setFinished(true)}
        />
      </div>
      <p aria-live="polite" className="px-1 text-[13px] text-white/50">
        {finished ? "That’s the tour. It’s under Take the tour if you want it again." : "Arrow keys step through it, Escape skips."}
      </p>
    </div>
  );
}
