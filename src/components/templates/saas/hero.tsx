"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeonSign } from "@/components/ui/neon-sign";
import { Switch } from "@/components/ui/switch";
import { basePath } from "./config";
import { stats } from "./data";
import { formatCountdown, useWindowCountdown } from "./primitives";

const label = "font-mono text-[11px] uppercase tracking-[0.14em] text-white/60";

export function Hero() {
  const [on, setOn] = React.useState(true);
  const left = useWindowCountdown();

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden px-5 pt-28 sm:px-8 sm:pt-36"
    >
      {/* The wall, and the light the sign throws on it */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_75%_55%_at_50%_24%,#12121c,#05060a_72%)]"
      />
      <div
        aria-hidden
        className="absolute left-1/2 top-[22%] -z-10 h-[460px] w-[min(1080px,130%)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[rgb(var(--neon)/0.15)] blur-[110px] transition-opacity duration-700"
        style={{ opacity: on ? 1 : 0 }}
      />
      {/* Floor line the wall meets */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-[linear-gradient(transparent,#05060a)]" />

      <div className="mx-auto max-w-[1120px]">
        <div className="flex justify-center">
          <NeonSign
            on={on}
            lines={["nightshift"]}
            flicker="stutter"
            buzz
            className="text-[clamp(52px,14.5vw,128px)]"
            style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
          />
        </div>

        <div className="mt-14 grid gap-8 sm:mt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <h1
            id="hero-title"
            className="max-w-[12ch] text-balance text-[clamp(2.75rem,7vw,5.75rem)] font-semibold leading-[0.93] tracking-[-0.045em] text-white"
          >
            Deploys that land at 2am.
          </h1>
          <div className="lg:pb-2">
            <p className="max-w-[44ch] text-pretty text-[17px] leading-relaxed text-white/65">
              Queue it before you log off. Nightshift ships it in the quiet window, holds it to your health checks,
              rolls it back if it has to, and leaves a report to read with coffee.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild variant="solid" size="lg">
                <Link href={`${basePath}/pricing`}>
                  Start free <ArrowRight aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="px-4">
                <Link href={`${basePath}#instruments`}>
                  Watch a night run <ArrowDown aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* A status strip along the bottom edge, like the panel under a sign */}
        <div className="mt-16 grid gap-x-8 gap-y-4 border-t border-white/[0.07] py-5 sm:mt-20 sm:grid-cols-2 lg:grid-cols-[auto_1fr_auto]">
          <Switch size="sm" checked={on} onCheckedChange={setOn} label={<span className={label}>Sign power</span>} />
          <p className={`${label} lg:text-center`}>
            Next window 02:00 <span className="text-white/30">·</span> opens in{" "}
            <span className="tabular-nums text-white/90">{formatCountdown(left)}</span>
          </p>
          <p className={`${label} sm:col-span-2 lg:col-span-1`}>
            <span className="text-white/90">{stats.landed}</span> landed <span className="text-white/30">·</span>{" "}
            <span className="text-white/90">{stats.rolledBack}</span> rolled back
          </p>
        </div>
      </div>
    </section>
  );
}
