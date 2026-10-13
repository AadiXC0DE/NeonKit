"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeonText } from "@/components/ui/neon-text";
import { Switch } from "@/components/ui/switch";
import { HueKnob } from "@/components/site/hue-knob";
import { hueToRgb, resetAccent, rgbToHue, setAccent, useAccent } from "@/components/site/accent-store";
import { neonColorNames, neonColors } from "@/lib/neon";
import { cn } from "@/lib/utils";
import { InstallChip } from "./install-chip";

function Screw({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute size-[7px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#3b404d,#101219)] shadow-[0_0_0_1px_rgb(255_255_255/0.05)]",
        "after:absolute after:left-1/2 after:top-1/2 after:h-px after:w-[5px] after:-translate-x-1/2 after:-translate-y-1/2 after:rotate-45 after:bg-black/70",
        className,
      )}
    />
  );
}

export function Hero({ componentCount, blockCount }: { componentCount: number; blockCount: number }) {
  const accent = useAccent();
  const [on, setOn] = React.useState(true);

  return (
    <section className="grain relative isolate overflow-hidden border-b border-line">
      {/* The wall, and the light the sign throws on it */}
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_55%_at_50%_38%,#0e1119,#05060a_72%)]" />
      <div
        aria-hidden
        className="absolute left-1/2 top-[34%] -z-10 h-[55%] w-[85%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[rgb(var(--neon-accent)/0.17)] blur-[110px] transition-opacity duration-300"
        style={{ opacity: on ? 1 : 0 }}
      />

      <div className="mx-auto flex min-h-[calc(100svh-3.5rem)] max-w-[88rem] flex-col px-4 pb-10 pt-8 sm:px-6 lg:pb-14">
        <h1 className="sr-only">NeonKit: neon UI components for React and Tailwind CSS</h1>
        <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
          <span>Neon UI for React</span>
          <span className="hidden sm:inline">{componentCount} components · {blockCount} blocks · MIT</span>
        </div>

        {/* The sign */}
        <div className="flex flex-1 items-center justify-center py-14 sm:py-20">
          <div
            className={cn(
              "relative rounded-[28px] border border-white/[0.05] px-6 pb-4 pt-2 transition-shadow duration-300 sm:px-14 sm:pb-8 sm:pt-4",
              on && "shadow-[inset_0_1px_0_rgb(var(--neon-accent)/0.18)]",
            )}
          >
            <Screw className="left-3 top-3" />
            <Screw className="right-3 top-3" />
            <Screw className="bottom-3 left-3" />
            <Screw className="bottom-3 right-3" />
            <NeonText
              as="p"
              aria-hidden
              on={on}
              buzz
              className="font-neon text-[clamp(4.25rem,17vw,13.5rem)] leading-[1.05] tracking-[-0.01em]"
            >
              neonkit
            </NeonText>
          </div>
        </div>

        <div className="grid grid-cols-1 items-end gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="min-w-0 max-w-xl">
            <p className="text-balance text-[clamp(1.25rem,2.2vw,1.6rem)] leading-[1.35] tracking-[-0.02em] text-fg">
              Neon UI components for React and Tailwind.{" "}
              <span className="text-muted">Calm at rest, lit when it matters. The code lands in your repo and it&apos;s yours.</span>
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild variant="solid" size="lg" className="sm:shrink-0">
                <Link href="/components">
                  Browse components <ArrowRight />
                </Link>
              </Button>
              <InstallChip className="min-w-0 sm:max-w-[25rem]" />
            </div>
          </div>

          {/* Control panel */}
          <div className="w-full rounded-2xl border border-line bg-white/[0.015] backdrop-blur-sm lg:w-auto">
            <div className="grid grid-cols-2 sm:grid-cols-[auto_auto_1fr]">
              <div className="flex flex-col justify-between gap-4 border-r border-line p-4 sm:p-5">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Power</span>
                <div className="flex items-center gap-3">
                  <Switch size="lg" checked={on} onCheckedChange={setOn} aria-label="Sign power" />
                  <span className="w-6 font-mono text-[11px] uppercase text-muted">{on ? "on" : "off"}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 sm:border-r sm:border-line sm:p-5">
                <HueKnob
                  hue={accent.hue}
                  onChange={(hue) => setAccent({ hue, rgb: hueToRgb(hue) })}
                />
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Hue</span>
                  <span className="font-mono text-[13px] tabular-nums text-fg">{String(accent.hue).padStart(3, "0")}°</span>
                </div>
              </div>
              <div className="col-span-2 flex flex-col justify-between gap-3 border-t border-line p-4 sm:col-span-1 sm:border-t-0 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">Gels</span>
                  <button
                    type="button"
                    onClick={resetAccent}
                    className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.18em] text-dim transition-colors hover:text-fg"
                  >
                    Reset
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:grid sm:grid-cols-11">
                  {neonColorNames.map((name) => {
                    const rgb = neonColors[name];
                    const active = accent.rgb === rgb;
                    return (
                      <button
                        key={name}
                        type="button"
                        aria-label={`Use ${name}`}
                        aria-pressed={active}
                        title={name}
                        onClick={() => setAccent({ hue: rgbToHue(rgb), rgb, name })}
                        className="group grid h-6 w-4 cursor-pointer place-items-center"
                      >
                        <span
                          className={cn(
                            "h-5 w-1.5 rounded-full transition-[transform,box-shadow,opacity] duration-150",
                            active ? "scale-y-110" : "opacity-55 group-hover:opacity-100",
                          )}
                          style={{
                            background: `rgb(${rgb})`,
                            boxShadow: active ? `0 0 8px rgb(${rgb}), 0 0 16px rgb(${rgb} / 0.6)` : undefined,
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            <p className="border-t border-line px-4 py-2.5 font-mono text-[10.5px] text-dim sm:px-5">
              Turn the knob. Every component on the site follows.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
