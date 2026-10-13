"use client";

import * as React from "react";
import { HardwareSwitch } from "@/components/ui/hardware-switch";
import { cn } from "@/lib/utils";

const breakers = [
  { id: "battery", label: "Batt" },
  { id: "gen1", label: "Gen 1" },
  { id: "gen2", label: "Gen 2" },
  { id: "fuel", label: "Fuel pump" },
] as const;

type Breaker = (typeof breakers)[number]["id"];

function Fastener({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute size-2.5 rounded-full bg-[radial-gradient(circle_at_35%_30%,#4a4f5b,#121419)] shadow-[0_1px_1px_rgb(0_0_0/0.8),0_0_0_1px_rgb(0_0_0/0.5)]",
        "after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:bg-black/80",
        className,
      )}
    />
  );
}

export default function HardwareSwitchDemo() {
  const [on, setOn] = React.useState<Record<Breaker, boolean>>({
    battery: true,
    gen1: true,
    gen2: false,
    fuel: false,
  });
  const [engine, setEngine] = React.useState(false);

  const generators = Number(on.gen1) + Number(on.gen2);
  const volts = !on.battery ? 0 : engine && generators > 0 ? 28.2 : 24.6;
  const canStart = on.battery && on.fuel;
  const running = engine && canStart;

  return (
    <div className="relative w-full max-w-[600px] rounded-xl border border-white/[0.07] bg-[linear-gradient(180deg,#1a1d24,#101217)] px-6 pb-6 pt-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_30px_60px_-30px_rgb(0_0_0/0.9)] sm:px-8">
      <Fastener className="left-2.5 top-2.5" />
      <Fastener className="right-2.5 top-2.5" />
      <Fastener className="bottom-2.5 left-2.5" />
      <Fastener className="bottom-2.5 right-2.5" />

      <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/60">
        <span className="h-px flex-1 bg-white/15" />
        Electrical
        <span className="h-px flex-1 bg-white/15" />
      </div>

      <div className="mt-6 flex flex-wrap items-end justify-center gap-x-7 gap-y-6">
        {breakers.map((b) => (
          <HardwareSwitch
            key={b.id}
            variant="flip"
            label={b.label}
            checked={on[b.id]}
            onCheckedChange={(checked) => {
              setOn((current) => ({ ...current, [b.id]: checked }));
              if (!checked && (b.id === "battery" || b.id === "fuel")) setEngine(false);
            }}
          />
        ))}
        <span aria-hidden className="hidden h-24 w-px self-center bg-white/[0.08] sm:block" />
        <HardwareSwitch
          variant="key"
          label="Start"
          checked={running}
          disabled={!canStart}
          onCheckedChange={setEngine}
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-black/60 bg-[#07080b] px-4 py-2.5 font-mono text-xs shadow-[inset_0_1px_4px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.05)]">
        <span className="text-white/50">
          DC bus{" "}
          <span
            className={cn(
              "tabular-nums transition-colors duration-200",
              volts > 0
                ? "[color:color-mix(in_srgb,rgb(var(--neon-accent,34_211_238))_35%,white)] [text-shadow:0_0_8px_rgb(var(--neon-accent,34_211_238)/0.7)]"
                : "text-white/25",
            )}
          >
            {volts.toFixed(1)} V
          </span>
        </span>
        <span className={cn("transition-colors duration-200", running ? "text-white/85" : "text-white/50")}>
          {running ? "Engine running" : canStart ? "Ready to start" : on.battery ? "Fuel pump off" : "Battery off"}
        </span>
      </div>
    </div>
  );
}
