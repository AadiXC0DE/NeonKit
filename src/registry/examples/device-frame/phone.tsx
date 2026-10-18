"use client";

import * as React from "react";
import { DeviceFrame } from "@/components/ui/device-frame";
import { Switch } from "@/components/ui/switch";

export default function DeviceFramePhone() {
  const [paused, setPaused] = React.useState(false);

  return (
    <DeviceFrame variant="phone" time="9:41" className="w-[260px]">
      <div className="flex h-full flex-col px-[7cqw] pb-[10cqw] pt-[17cqw] text-[4.4cqw]">
        <p className="text-white/50">Relay · acme</p>
        <p className="mt-[1.5cqw] text-[8cqw] font-semibold leading-[1.05] tracking-tight text-white/90">
          Stripe deliveries failing
        </p>
        <p className="mt-[3cqw] leading-snug text-white/55">
          api.acme.dev/hooks returned 503 for 214 of the last 230 attempts.
        </p>
        <dl className="mt-[6cqw] grid grid-cols-2 gap-[4cqw]">
          <div>
            <dt className="text-white/45">Queued</dt>
            <dd className="font-mono text-[6.4cqw] tabular-nums text-white/90">1,906</dd>
          </div>
          <div>
            <dt className="text-white/45">Oldest</dt>
            <dd className="font-mono text-[6.4cqw] tabular-nums text-white/90">11 min</dd>
          </div>
        </dl>
        <ul className="mt-[6cqw] divide-y divide-white/[0.06] border-y border-white/[0.06] font-mono text-[3.9cqw]">
          {[
            ["09:41:02", "503", "1,204 ms"],
            ["09:40:31", "503", "1,198 ms"],
            ["09:39:58", "200", "88 ms"],
            ["09:39:20", "503", "1,211 ms"],
          ].map(([at, code, took]) => (
            <li key={at} className="flex justify-between py-[2.4cqw]">
              <span className="text-white/45">{at}</span>
              <span className={code === "200" ? "text-white/60" : "text-[rgb(var(--neon))]"}>{code}</span>
              <span className="w-[20cqw] text-right text-white/60">{took}</span>
            </li>
          ))}
        </ul>
        <div className="mt-auto flex items-center justify-between rounded-[4cqw] border border-white/10 bg-white/[0.03] px-[4.5cqw] py-[3.5cqw]">
          <span className="text-white/85">{paused ? "Retries paused" : "Pause retries"}</span>
          <Switch size="sm" checked={paused} onCheckedChange={setPaused} aria-label="Pause retries" />
        </div>
      </div>
    </DeviceFrame>
  );
}
