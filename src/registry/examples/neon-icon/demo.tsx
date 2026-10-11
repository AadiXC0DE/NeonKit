"use client";

import * as React from "react";
import { NeonIcon, type NeonIconName } from "@/components/ui/neon-icon";
import { Slider } from "@/components/ui/slider";

function Screw({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute size-[7px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#3b404d,#101219)] shadow-[0_0_0_1px_rgb(255_255_255/0.05)] after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-[5px] after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:bg-black/70 ${className}`}
    />
  );
}

type Readout = { icon: NeonIconName; name: string; value: number; animated?: boolean; reading: string };

export default function NeonIconDemo() {
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
    <div className="relative w-full max-w-2xl rounded-[22px] border border-white/[0.07] bg-[linear-gradient(180deg,#12141b,#0a0b10)] px-6 pb-6 pt-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.05),0_30px_60px_-30px_rgb(0_0_0/0.9)] sm:px-9 sm:pb-8">
      <Screw className="left-3 top-3" />
      <Screw className="right-3 top-3" />
      <Screw className="bottom-3 left-3" />
      <Screw className="bottom-3 right-3" />

      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        <span>Relay KX-7 · field unit</span>
        <span>Ch 04</span>
      </div>

      <ul className="mt-7 grid grid-cols-4 gap-x-2 gap-y-7 sm:grid-cols-7">
        {readouts.map((readout) => (
          <li key={readout.name} className="flex flex-col items-center gap-3 text-center">
            <span className="relative grid place-items-center">
              {/* The light each icon throws on the panel */}
              <span
                aria-hidden
                className="absolute -inset-5 rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon-accent,34_211_238)/0.13),transparent)] transition-opacity duration-300"
                style={{ opacity: readout.value > 0 ? 1 : 0 }}
              />
              <NeonIcon icon={readout.icon} value={readout.value} animated={readout.animated} size={36} />
            </span>
            <div className="grid gap-0.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">{readout.name}</span>
              <span className="text-xs tabular-nums text-white/80">{readout.reading}</span>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex items-center gap-4 border-t border-white/[0.06] pt-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Link</span>
        <Slider
          value={[link]}
          onValueChange={([value]) => setLink(value)}
          aria-label="Link quality"
          formatValue={(value) => `${value}%`}
          size="sm"
        />
        <span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-white/70">
          {link === 0 ? "—" : `${dbm} dBm`}
        </span>
      </div>
    </div>
  );
}
