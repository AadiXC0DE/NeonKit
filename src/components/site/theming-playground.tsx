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
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <AccentPicker
          value={color}
          onChange={(next) => {
            setColor(next);
            setHex("");
          }}
        />
        <label className="flex items-center gap-2 font-mono text-[11px] text-dim">
          or hex
          <input
            value={hex}
            onChange={(e) => setHex(e.target.value.trim())}
            placeholder="#ff6a00"
            maxLength={7}
            spellCheck={false}
            className="h-7 w-24 rounded-md border border-line bg-background px-2 text-fg outline-none placeholder:text-dim focus:border-line-strong"
          />
        </label>
      </div>
      <div style={neonVars(active)} className="grid gap-8 bg-background bg-dots p-6 sm:grid-cols-2 sm:p-8">
        <div className="space-y-5">
          <div className="flex flex-wrap gap-2">
            <Button variant="solid" size="sm">Solid</Button>
            <Button size="sm">Outline</Button>
            <Button variant="soft" size="sm">Soft</Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge dot pulse>Live</Badge>
            <Badge variant="outline">Beta</Badge>
            <Badge variant="solid">New</Badge>
          </div>
          <Progress value={68} label="Upload" showValue size="sm" />
        </div>
        <div className="space-y-5">
          <Switch defaultChecked label="Neon on" />
          <Checkbox defaultChecked label="Inherit the accent" />
          <Slider defaultValue={[40]} aria-label="Demo slider" />
        </div>
      </div>
      <p className="border-t border-line px-4 py-2.5 font-mono text-[11px] text-dim">
        --neon-accent: <span className="text-muted">{toNeonRgb(active)}</span>
      </p>
    </div>
  );
}
