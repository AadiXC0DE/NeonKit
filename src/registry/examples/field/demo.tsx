"use client";

import * as React from "react";
import { Field } from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-opacity='0.4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`;

export default function FieldDemo() {
  const [concurrency, setConcurrency] = React.useState([4]);

  return (
    <div className="grid w-full max-w-sm gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <Field
        orientation="horizontal"
        label="Preview deployments"
        description="Build every pull request on its own URL."
      >
        <Switch defaultChecked />
      </Field>

      <div className="h-px bg-white/[0.06]" />

      <Field label="Default region" description="New projects deploy here unless they say otherwise.">
        <select
          defaultValue="fra1"
          style={{ backgroundImage: chevron }}
          className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/[0.03] bg-[length:16px] bg-[right_12px_center] bg-no-repeat pl-3 pr-9 text-sm text-white/90 outline-none [color-scheme:dark] transition-[border-color,box-shadow] duration-150 hover:border-white/20 focus-visible:border-[rgb(var(--neon)/0.8)] focus-visible:shadow-[0_0_0_1px_rgb(var(--neon)/0.2),0_0_20px_-4px_rgb(var(--neon)/0.5)]"
        >
          <option value="fra1">Frankfurt · eu-central-1</option>
          <option value="lhr1">London · eu-west-2</option>
          <option value="iad1">Washington, D.C. · us-east-1</option>
          <option value="sfo1">San Francisco · us-west-1</option>
          <option value="hnd1">Tokyo · ap-northeast-1</option>
        </select>
      </Field>

      <Field
        label={
          <>
            Build concurrency
            <span aria-hidden className="ml-2 font-mono text-xs tabular-nums text-white/50">
              {concurrency[0]} of 8
            </span>
          </>
        }
        description="Builds that can run at once across the team."
      >
        <Slider value={concurrency} onValueChange={setConcurrency} min={1} max={8} />
      </Field>
    </div>
  );
}
