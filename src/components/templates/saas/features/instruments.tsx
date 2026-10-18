"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { HardwareSwitch } from "@/components/ui/hardware-switch";
import { Heartbeat } from "@/components/ui/heartbeat";
import { SevenSegment } from "@/components/ui/seven-segment";
import { cn } from "@/lib/utils";
import { windowHour } from "../config";
import { queue, rules } from "../data";
import { Mark, focusRing, formatCountdown, useWindowCountdown } from "../primitives";
import type { NightRun, Phase } from "./night-run";

const label = "text-[13px] text-white/55";

// Monday first, mapped to Date#getDay() indexes.
const NIGHTS = [
  { day: 1, short: "M", name: "Monday" },
  { day: 2, short: "T", name: "Tuesday" },
  { day: 3, short: "W", name: "Wednesday" },
  { day: 4, short: "T", name: "Thursday" },
  { day: 5, short: "F", name: "Friday" },
  { day: 6, short: "S", name: "Saturday" },
  { day: 0, short: "S", name: "Sunday" },
];

export function WindowCountdown() {
  // Sunday-first, like getDay(): Monday to Thursday nights by default.
  const [nights, setNights] = React.useState([false, true, true, true, true, false, false]);
  const left = useWindowCountdown(windowHour, nights);
  const extra = left === null ? 0 : Math.floor(left / 86400);
  const shown = left === null ? null : left % 86400;
  const none = nights.every((n) => !n);

  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <span className={label}>Next window</span>
        <span className={label}>
          <span className="font-mono tabular-nums text-white/85">02:00–04:00</span> local
        </span>
      </div>
      <div className="relative mt-3 flex flex-1 flex-col justify-center overflow-hidden rounded-xl border border-black/60 bg-[#040406] px-5 py-6 shadow-[inset_0_2px_12px_rgb(0_0_0/0.9)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_35%_50%,rgb(var(--neon)/0.1),transparent_70%)]"
        />
        <SevenSegment
          value={none ? "--:--:--" : formatCountdown(shown)}
          colonBlink={!none}
          unlit={0.07}
          className="relative [--segment-h:38px] sm:[--segment-h:46px]"
          aria-label={none ? "No nights selected" : `Window opens in ${formatCountdown(left)}`}
        />
        <p className="relative mt-3 text-[12px] text-white/50">
          {none
            ? "Pick a night below"
            : extra > 0
              ? `Hours, minutes, seconds, plus ${extra} night${extra === 1 ? "" : "s"}`
              : "Hours, minutes, seconds"}
        </p>
      </div>
      <div className="mt-4" role="group" aria-label="Nights the window runs">
        <div className="grid grid-cols-7 gap-1.5">
          {NIGHTS.map((night) => {
            const on = nights[night.day];
            return (
              <button
                key={night.day}
                type="button"
                aria-pressed={on}
                aria-label={night.name}
                onClick={() => setNights((all) => all.map((value, i) => (i === night.day ? !value : value)))}
                className={cn(
                  "h-8 cursor-pointer rounded-lg border text-[13px] font-medium transition-[color,border-color,background-color,box-shadow] duration-200",
                  on
                    ? "border-[rgb(var(--neon)/0.55)] bg-[rgb(var(--neon)/0.1)] text-[color-mix(in_srgb,rgb(var(--neon))_35%,white)] shadow-[0_0_14px_-4px_rgb(var(--neon)/0.7)]"
                    : "border-white/[0.08] text-white/60 hover:border-white/20 hover:text-white/80",
                  focusRing,
                )}
              >
                {night.short}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-[13px] text-white/55">
          {nights[5] ? "Friday night deploys. Brave." : "No Friday nights. Obviously."}
        </p>
      </div>
    </>
  );
}

const ACTIVE: Phase[] = ["deploying", "checking", "rollingback", "held"];

export function HealthInstrument({ night }: { night: NightRun }) {
  // Follow whichever deploy is on the wire; before a run, watch the first one.
  const lastStarted = night.phases.reduce((found, phase, i) => (phase !== "queued" ? i : found), 0);
  const deploy = queue[lastStarted];
  const phase = night.phases[lastStarted];
  const alarm = deploy.outcome === "regress" && ACTIVE.includes(phase) && phase !== "deploying";
  const p95 = deploy.outcome === "regress" && !alarm ? 204 : deploy.p95;
  const errors = deploy.outcome === "regress" && !alarm ? "0.03%" : deploy.errors;

  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className={cn(label, "truncate")}>
          Watching <span className="font-mono text-white/85">{deploy.service}</span>
        </span>
        {alarm ? (
          <Badge size="sm" color="red" dot pulse>
            Failing
          </Badge>
        ) : (
          <Badge size="sm" color="green" dot>
            Passing
          </Badge>
        )}
      </div>
      <div className="relative mt-4 flex-1 py-3 [background-image:linear-gradient(rgb(255_255_255/0.035)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.035)_1px,transparent_1px)] [background-size:18px_18px] [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <Heartbeat
          bpm={alarm ? 138 : 62}
          height={78}
          color={alarm ? "red" : undefined}
          aria-label={`${deploy.service} health check trace`}
        />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-white/[0.07] pt-4">
        {[
          { k: "p95", v: `${p95.toLocaleString("en-US")} ms`, bad: alarm },
          { k: "5xx", v: errors, bad: alarm },
          { k: "Checks", v: alarm ? "1 of 3" : "3 of 3", bad: alarm },
        ].map((item) => (
          <div key={item.k} className="min-w-0">
            <dt className="text-[12px] text-white/50">{item.k}</dt>
            <dd
              className={cn(
                "mt-1 font-mono text-[14px] tabular-nums",
                item.bad ? "text-[rgb(255_77_94)]" : "text-white/85",
              )}
            >
              {item.v}
            </dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export function RollbackInstrument({
  on,
  onChange,
  night,
}: {
  on: boolean;
  onChange: (on: boolean) => void;
  night: NightRun;
}) {
  const regressIndex = queue.findIndex((d) => d.outcome === "regress");
  const regress = queue[regressIndex];
  const phase = night.phases[regressIndex];
  const tripped = phase === "checking" || phase === "rollingback" || phase === "held";

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 items-center gap-6 sm:gap-8">
        <div className="relative shrink-0 rounded-[14px] border border-white/[0.08] bg-[linear-gradient(160deg,#16181f,#0c0d12)] px-5 pb-3.5 pt-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_18px_40px_-16px_rgb(0_0_0/0.9)]">
          <HardwareSwitch checked={on} onCheckedChange={onChange} label="Auto" />
        </div>
        <ul className="min-w-0 flex-1 divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {rules.map((rule, i) => {
            const broken = tripped && i < 2;
            return (
              <li key={rule.metric} className="flex items-baseline justify-between gap-3 py-2.5 text-[13px]">
                <span className="truncate text-white/70">{rule.metric}</span>
                <span
                  className={cn("shrink-0 font-mono tabular-nums", broken ? "text-[rgb(255_77_94)]" : "text-white/60")}
                >
                  {broken ? (i === 0 ? `${regress.p95.toLocaleString("en-US")} ms` : regress.errors) : rule.limit}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
      <p className={cn("mt-5 min-h-10 text-[13px] leading-5", on ? "text-white/60" : "text-[rgb(255_77_94)]")}>
        {on
          ? "Armed. Break a rule for 60 seconds and the release is rolled back before the next step."
          : "Off. A failing release holds at 10% canary and pages whoever is on call."}
      </p>
    </div>
  );
}

const LAST_NIGHT = {
  title: "Night of 12 Oct",
  rows: [
    { k: "Landed", n: 5, note: "checkout, storefront, search, auth, mobile-bff" },
    { k: "Rolled back", n: 0, note: "nothing tripped" },
    { k: "Paged", n: 0, note: "nobody woke up" },
  ],
  used: "14 min of 120",
};

export function ReportInstrument({ night }: { night: NightRun }) {
  const done = night.status === "done";
  const pick = (phase: Phase) => queue.filter((_, i) => night.phases[i] === phase).map((d) => d.service);
  const regress = queue.find((d) => d.outcome === "regress")!;
  const report = done
    ? {
        title: "Tonight, simulated",
        rows: [
          { k: "Landed", n: pick("landed").length, note: pick("landed").join(", ") },
          {
            k: "Rolled back",
            n: pick("rolledback").length,
            note: pick("rolledback").length
              ? `${regress.service} · p95 ${regress.p95.toLocaleString("en-US")} ms > 400`
              : "nothing tripped",
          },
          {
            k: "Paged",
            n: pick("held").length,
            note: pick("held").length ? `${regress.service} held at 10%` : "nobody woke up",
          },
        ],
        used: `${Math.max(1, Math.round(night.clock / 60))} min of 120`,
      }
    : LAST_NIGHT;

  return (
    <div className="flex flex-1 flex-col">
      {/* Set like the Slack message it arrives as */}
      <div className="flex gap-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-[10px] bg-[rgb(var(--neon)/0.1)] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.25)]">
          <Mark className="size-[18px] text-[color-mix(in_srgb,rgb(var(--neon))_45%,white)]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-baseline gap-x-2 text-[14px]">
            <span className="font-medium text-white">Nightshift</span>
            <span className="font-mono text-[12px] tabular-nums text-white/50">07:30</span>
            <span className="text-[13px] text-white/55">{report.title}</span>
          </p>
          <p className="mt-0.5 text-[15px] text-white/85">
            Good morning. {done ? "Here's tonight's window." : "Here's last night."}
          </p>
          <dl className="mt-4 grid gap-2.5">
            {report.rows.map((row) => (
              // Below lg the note drops under its label instead of being cut off.
              <div
                key={row.k}
                className="grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-x-2 gap-y-0.5 sm:grid-cols-[2.25rem_minmax(0,1fr)] lg:grid-cols-[2.25rem_7rem_minmax(0,1fr)]"
              >
                <dt className="col-start-2 row-start-1 text-[14px] text-white/70">{row.k.toLowerCase()}</dt>
                <dd
                  className={cn(
                    "col-start-1 row-start-1 text-[22px] font-[620] leading-none tracking-[-0.02em] [font-stretch:112%]",
                    row.n && row.k !== "Landed" ? "text-[rgb(255_77_94)]" : "text-white",
                  )}
                >
                  {row.n}
                </dd>
                <dd className="col-start-2 text-pretty text-[13px] text-white/50 lg:col-start-3 lg:row-start-1">{row.note}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[13px] text-white/50">
            Window used: <span className="font-mono tabular-nums text-white/80">{report.used}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
