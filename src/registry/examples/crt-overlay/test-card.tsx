"use client";

import * as React from "react";
import { CrtOverlay } from "@/components/ui/crt-overlay";
import { Switch } from "@/components/ui/switch";

const bars = ["#c0c0c0", "#c0c000", "#00c0c0", "#00c000", "#c000c0", "#c00000", "#0000c0"];
const effects = [
  { key: "scanlines", label: "Scanlines" },
  { key: "flicker", label: "Flicker" },
  { key: "chromatic", label: "Chromatic" },
  { key: "glow", label: "Glow" },
  { key: "curvature", label: "Curvature" },
] as const;
type Effect = (typeof effects)[number]["key"];

export default function CrtOverlayTestCard() {
  const [enabled, setEnabled] = React.useState<Record<Effect, boolean>>({
    scanlines: true,
    flicker: true,
    chromatic: true,
    glow: true,
    curvature: true,
  });

  return (
    <div className="flex w-full max-w-xl flex-col gap-5">
      <CrtOverlay {...enabled} className="aspect-video">
        <div className="flex h-full flex-col">
          <div className="flex flex-[3]">
            {bars.map((bar) => (
              <div key={bar} className="flex-1" style={{ background: bar }} />
            ))}
          </div>
          <div className="relative flex flex-1 items-center justify-center bg-[#101012]">
            <p className="rounded-[3px] bg-black px-3 py-1 font-mono text-sm uppercase tracking-[0.3em] text-white">
              NK-TV · Ch 12
            </p>
          </div>
        </div>
      </CrtOverlay>

      <div className="flex flex-wrap gap-x-5 gap-y-3">
        {effects.map(({ key, label }) => (
          <Switch
            key={key}
            size="sm"
            label={label}
            checked={enabled[key]}
            onCheckedChange={(checked) => setEnabled((current) => ({ ...current, [key]: checked }))}
          />
        ))}
      </div>
    </div>
  );
}
