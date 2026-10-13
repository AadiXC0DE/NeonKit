"use client";

import * as React from "react";
import { ArrowDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HardwareSwitch } from "@/components/ui/hardware-switch";
import { NeonSign } from "@/components/ui/neon-sign";
import { cn } from "@/lib/utils";
import { availability, brand, city, color, role } from "./config";
import { useLights } from "./lights";

function Screw({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute left-1/2 size-[7px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#4a4f5c,#101219)] shadow-[0_0_0_1px_rgb(0_0_0/0.6)]",
        className,
      )}
    >
      <span className="absolute inset-x-[1px] top-1/2 h-px -translate-y-1/2 rotate-[35deg] bg-black/60" />
    </span>
  );
}

/** The wall switch next to the sign. It's wired to the whole page, not just the sign. */
function WallSwitch() {
  const { on, setOn } = useLights();
  return (
    <div className="relative ml-auto flex flex-col items-center rounded-[14px] border border-white/[0.07] bg-[linear-gradient(180deg,#14151b,#0b0c10)] px-5 pb-4 pt-6 shadow-[0_18px_40px_-20px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.06)]">
      <Screw className="top-2" />
      <HardwareSwitch variant="rocker" checked={on} onCheckedChange={setOn} label="Lights" />
      <Screw className="bottom-2" />
    </div>
  );
}

export function Hero() {
  const { on } = useLights();

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      {/* The wall, and the light the sign throws on it */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_70%_at_35%_30%,#0e0f15,#05060a_70%)]"
      />
      <div
        aria-hidden
        className={cn(
          "absolute left-[8%] top-[6%] -z-10 h-[420px] w-[78%] rounded-[50%] bg-[rgb(var(--neon)/0.13)] blur-[110px] transition-opacity duration-700",
          on ? "opacity-100" : "opacity-0",
        )}
      />

      <div className="mx-auto max-w-[1200px] px-5 pb-16 pt-10 sm:px-10 sm:pb-20 sm:pt-16 lg:pb-32">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
          {role} · {city}, NL
        </p>

        <div className="mt-8 flex flex-wrap items-end justify-between gap-x-10 gap-y-5 sm:mt-10 lg:items-center">
          <div aria-hidden className="-ml-1 min-w-0">
            <NeonSign
              on={on}
              color={color}
              buzz
              lines={[brand]}
              style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
              className="text-[clamp(50px,12.4vw,168px)] tracking-[-0.01em]"
            />
          </div>
          <WallSwitch />
        </div>

        <div className="mt-16 grid gap-10 sm:mt-20 lg:grid-cols-12 lg:gap-8">
          <h1
            id="hero-title"
            className="text-balance text-[clamp(28px,3.6vw,46px)] font-medium leading-[1.08] tracking-[-0.035em] text-white lg:col-span-7"
          >
            <span className="sr-only">{brand}, {role.toLowerCase()} in {city}. </span>
            I design interfaces, then build them myself.{" "}
            <span className="text-white/60">The details survive the handoff because there isn&apos;t one.</span>
          </h1>

          <div className="border-t border-white/[0.08] pt-6 lg:col-span-4 lg:col-start-9 lg:self-end">
            <p className="flex items-center gap-2.5 text-[15px] font-medium text-white/90">
              <span aria-hidden className="relative flex size-2">
                <span
                  className={cn(
                    "absolute inset-0 rounded-full bg-[rgb(var(--neon))] opacity-60 motion-safe:animate-ping [animation-duration:2.4s]",
                    !on && "hidden",
                  )}
                />
                <span
                  className={cn(
                    "relative size-2 rounded-full transition-[background-color,box-shadow] duration-500",
                    on ? "bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]" : "bg-white/25",
                  )}
                />
              </span>
              {availability}
            </p>
            <p className="mt-2 text-[15px] leading-relaxed text-white/60">
              One product team at a time, twelve weeks or longer. Design and front end, start to ship.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild variant="solid">
                <a href="#contact">Start a project</a>
              </Button>
              <Button asChild variant="ghost">
                <a href="#work">
                  Selected work <ArrowDownRight aria-hidden />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
