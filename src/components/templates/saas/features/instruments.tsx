"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { HardwareSwitch } from "@/components/ui/hardware-switch";
import { Heartbeat } from "@/components/ui/heartbeat";
import { SevenSegment } from "@/components/ui/seven-segment";
import { cn } from "@/lib/utils";
import { windowHour } from "../config";
import { queue, rules } from "../data";
import { focusRing, formatCountdown, useWindowCountdown } from "../primitives";
import type { NightRun, Phase } from "./night-run";

const label = "font-mono text-[11px] uppercase tracking-[0.16em] text-white/60";

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
      <div className="flex items-center justify-between gap-3">
        <span className={label}>Next window</span>
        <span className={cn(label, "tabular-nums")}>02:00–04:00 local</span>
      </div>
      <div className="relative mt-5 flex flex-1 flex-col justify-center overflow-hidden rounded-xl border border-black/60 bg-[#040406] px-5 py-6 shadow-[inset_0_2px_12px_rgb(0_0_0/0.9)]">
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
        <p className="relative mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">
          {none
            ? "Pick a night below"
            : extra > 0
              ? `Plus ${extra} night${extra === 1 ? "" : "s"} · hrs min sec`
              : "hrs · min · sec"}
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
                  "h-8 cursor-pointer rounded-md border font-mono text-[12px] transition-[color,border-color,background-color,box-shadow] duration-200",
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
        <p className="mt-2.5 font-mono text-[11px] text-white/60">
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
          Health <span className="text-white/30">·</span> {deploy.service}
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
      <div className="relative mt-5 flex-1 rounded-xl border border-white/[0.06] bg-[#06070b] px-3 py-3 [background-image:linear-gradient(rgb(255_255_255/0.03)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.03)_1px,transparent_1px)] [background-size:18px_18px]">
        <Heartbeat
          bpm={alarm ? 138 : 62}
          height={78}
          color={alarm ? "red" : undefined}
          aria-label={`${deploy.service} health check trace`}
        />
      </div>
      <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.06]">
        {[
          { k: "p95", v: `${p95.toLocaleString("en-US")} ms`, bad: alarm },
          { k: "5xx", v: errors, bad: alarm },
          { k: "Checks", v: alarm ? "1 / 3" : "3 / 3", bad: alarm },
        ].map((item) => (
          <div key={item.k} className="bg-[#08090d] px-3 py-2.5">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/60">{item.k}</dt>
            <dd
              className={cn(
                "mt-1 font-mono text-[13px] tabular-nums",
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
      <span className={label}>Rollback</span>
      <div className="mt-5 flex flex-1 items-center gap-6 sm:gap-8">
        <div className="relative shrink-0 rounded-[14px] border border-white/[0.08] bg-[linear-gradient(160deg,#16181f,#0c0d12)] px-5 pb-3.5 pt-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_18px_40px_-16px_rgb(0_0_0/0.9)]">
          <HardwareSwitch checked={on} onCheckedChange={onChange} label="Auto" />
        </div>
        <ul className="min-w-0 flex-1 divide-y divide-white/[0.06] border-y border-white/[0.06]">
          {rules.map((rule, i) => {
            const broken = tripped && i < 2;
            return (
              <li key={rule.metric} className="flex items-baseline justify-between gap-3 py-2.5 font-mono text-[12px]">
                <span className="truncate text-white/70">{rule.metric}</span>
                <span className={cn("shrink-0 tabular-nums", broken ? "text-[rgb(255_77_94)]" : "text-white/60")}>
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
      <div className="flex items-center justify-between gap-3">
        <span className={label}>
          <span className="text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.55)]">07:30</span>
          <span className="text-white/30"> · </span>Morning report
        </span>
        <span className={cn(label, "hidden lg:inline")}>{report.title}</span>
      </div>
      <div className="mt-5 flex-1 rounded-xl border border-white/[0.07] bg-[linear-gradient(180deg,rgb(255_255_255/0.035),rgb(255_255_255/0.01))]">
        <p className="border-b border-white/[0.06] px-5 py-4 text-[15px] text-white/85">
          Good morning. {done ? "Here's tonight's window." : "Here's last night."}
          <span className="block text-[13px] text-white/60 lg:hidden">{report.title}</span>
        </p>
        <dl className="divide-y divide-white/[0.06] px-5">
          {report.rows.map((row) => (
            <div
              key={row.k}
              className="grid grid-cols-[5.5rem_2rem_minmax(0,1fr)] items-baseline gap-3 py-3 lg:grid-cols-[8rem_2.5rem_minmax(0,1fr)]"
            >
              <dt className="text-[13px] text-white/60">{row.k}</dt>
              <dd
                className={cn(
                  "text-xl font-semibold tabular-nums tracking-[-0.02em]",
                  row.n && row.k !== "Landed" ? "text-[rgb(255_77_94)]" : "text-white",
                )}
              >
                {row.n}
              </dd>
              <dd className="truncate font-mono text-[11px] text-white/60">{row.note}</dd>
            </div>
          ))}
        </dl>
        <p className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3 font-mono text-[11px] text-white/60">
          <span>Window used</span>
          <span className="tabular-nums text-white/85">{report.used}</span>
        </p>
      </div>
    </div>
  );
}
