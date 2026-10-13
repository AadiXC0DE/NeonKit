"use client";

import * as React from "react";
import { NeonFrame } from "@/components/ui/neon-frame";

const regions = [
  { id: "fra1", city: "Frankfurt", latency: 18, note: "Closest to most of your users" },
  { id: "iad1", city: "Washington, D.C.", latency: 92, note: "Where your database lives" },
  { id: "hnd1", city: "Tokyo", latency: 241, note: "Lowest cost per request" },
];

export default function NeonFrameRegions() {
  const [region, setRegion] = React.useState("fra1");

  return (
    <fieldset className="grid w-full max-w-md gap-3">
      <legend className="mb-3 text-sm font-medium text-white/90">Deploy region</legend>
      {regions.map((r) => (
        <NeonFrame key={r.id} active={region === r.id} bracket={12} animate={false} className="p-0 has-[:focus-visible]:border-white/20">
          <label className="flex cursor-pointer items-center gap-4 px-4 py-3.5">
            <input
              type="radio"
              name="region"
              value={r.id}
              checked={region === r.id}
              onChange={() => setRegion(r.id)}
              className="peer sr-only"
            />
            <span className="w-9 font-mono text-xs text-white/55 peer-checked:text-[rgb(var(--neon))]">
              {r.id}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-white/90">{r.city}</span>
              <span className="block text-xs text-white/55">{r.note}</span>
            </span>
            <span className="text-sm tabular-nums text-white/70">{r.latency} ms</span>
          </label>
        </NeonFrame>
      ))}
    </fieldset>
  );
}
