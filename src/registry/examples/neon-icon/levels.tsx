"use client";

import * as React from "react";
import { NeonIcon, type NeonIconName } from "@/components/ui/neon-icon";
import { Slider } from "@/components/ui/slider";

type Readout = { icon: NeonIconName; name: string; value: number; animated?: boolean; reading: string };

export default function NeonIconLevels() {
  const [link, setLink] = React.useState(72);
  const quality = link / 100;
  const dbm = `${Math.round(-112 + link * 0.62)}`.replace("-", "−");
  const arcs = link === 0 ? 0 : Math.max(1, Math.round(quality * 3));

  const readouts: Readout[] = [
    { icon: "signal", name: "Signal", value: quality, reading: link === 0 ? "No link" : `${dbm} dBm` },
    { icon: "wifi", name: "Mesh", value: quality, reading: arcs === 0 ? "Off" : `${arcs} of 3` },
    { icon: "battery", name: "Cell", value: 0.64, animated: true, reading: "64%" },
    { icon: "bolt", name: "Supply", value: 1, animated: true, reading: "48 W" },
    { icon: "power", name: "Radio", value: 1, reading: "On" },
    { icon: "heart", name: "Watchdog", value: 1, animated: true, reading: "1.1 s" },
    { icon: "bell", name: "Alerts", value: 1, animated: true, reading: "3 new" },
  ];

  return (
    <div className="w-full max-w-2xl rounded-[18px] border border-white/[0.07] bg-[linear-gradient(180deg,#11131a,#0a0b10)] px-5 pb-5 pt-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_30px_60px_-30px_rgb(0_0_0/0.9)] sm:px-8 sm:pb-7 sm:pt-6">
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-sm font-medium text-white/90">Relay KX-7</p>
        <p className="text-[13px] text-white/55">Field unit, channel 4</p>
      </div>

      <ul className="mt-7 grid grid-cols-4 gap-x-2 gap-y-7 sm:grid-cols-7">
        {readouts.map((readout) => (
          <li key={readout.name} className="flex flex-col items-center gap-3 text-center">
            <NeonIcon icon={readout.icon} value={readout.value} animated={readout.animated} size={36} />
            <div className="grid gap-0.5">
              <span className="text-[13px] text-white/55">{readout.name}</span>
              <span className="text-[13px] tabular-nums text-white/90">{readout.reading}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center gap-4 border-t border-white/[0.06] pt-5">
        <span className="text-[13px] text-white/55">Link</span>
        <Slider
          value={[link]}
          onValueChange={([value]) => setLink(value)}
          aria-label="Link quality"
          formatValue={(value) => `${value}%`}
          size="sm"
        />
        <span className="w-[4.5rem] shrink-0 text-right font-mono text-xs tabular-nums text-white/70">
          {link === 0 ? "—" : `${dbm} dBm`}
        </span>
      </div>
    </div>
  );
}
