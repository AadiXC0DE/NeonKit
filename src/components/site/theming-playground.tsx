"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { neonVars, toNeonRgb, type NeonColorName } from "@/lib/neon";
import { AccentPicker } from "./accent-picker";

export function ThemingPlayground() {
  const [color, setColor] = React.useState<NeonColorName>("violet");
  const [hex, setHex] = React.useState("");
  const valid = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex);
  const active = valid ? (hex.startsWith("#") ? hex : `#${hex}`) : color;

  return (
    <figure className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pb-2">
        <AccentPicker
          label="Palette color"
          value={valid ? null : color}
          onChange={(next) => {
            setColor(next);
            setHex("");
          }}
          className="-ml-1"
        />
        <label className="flex items-center gap-2.5 text-[13.5px] text-muted">
          Or any hex
          <input
            value={hex}
            onChange={(e) => setHex(e.target.value.trim())}
            placeholder="#ff6a00"
            maxLength={7}
            spellCheck={false}
            aria-invalid={hex !== "" && !valid}
            className="h-8 w-[6.5rem] rounded-lg border border-white/10 bg-white/[0.03] px-2.5 font-mono text-[13px] text-fg outline-none transition-[border-color,box-shadow] placeholder:text-muted focus:border-[rgb(var(--neon-accent)/0.55)] focus:shadow-[0_0_0_3px_rgb(var(--neon-accent)/0.12)] aria-[invalid=true]:border-[#ff5c7a]/60"
          />
        </label>
      </div>
      <div
        style={neonVars(active)}
        className="nk-stage relative isolate grid gap-10 rounded-[14px] border border-white/[0.07] px-6 py-12 [--neon:var(--neon-accent)] sm:grid-cols-2 sm:px-10 sm:py-14"
      >
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <Button variant="solid" size="sm">
              Solid
            </Button>
            <Button size="sm">Outline</Button>
            <Button variant="soft" size="sm">
              Soft
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge dot pulse>
              Live
            </Badge>
            <Badge variant="outline">Beta</Badge>
            <Badge variant="solid">New</Badge>
          </div>
          <Progress value={68} label="Upload" showValue size="sm" />
        </div>
        <div className="flex flex-col items-start gap-6">
          <Switch defaultChecked label="Neon on" />
          <Checkbox defaultChecked label="Inherit the accent" />
          <Slider defaultValue={[40]} aria-label="Demo slider" className="w-full" />
        </div>
      </div>
      <figcaption className="mt-3 font-mono text-[12.5px] text-muted">
        --neon-accent: <span className="text-fg">{toNeonRgb(active)}</span>
      </figcaption>
    </figure>
  );
}
