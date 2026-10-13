"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { basePath } from "./config";
import { stats } from "./data";
import { display, formatCountdown, useWindowCountdown } from "./primitives";

// The hour in the headline is a tube on the wall. It strikes when power reaches it.
const css = `
.nk-ns-tube { transition: color 400ms, text-shadow 400ms; }
.nk-ns-tube[data-on="true"] {
  color: color-mix(in srgb, rgb(var(--neon)) 28%, white);
  text-shadow: 0 0 0.012em rgb(255 255 255 / 0.9), 0 0 max(2px, 0.03em) rgb(var(--neon)), 0 0 0.09em rgb(var(--neon)),
    0 0 0.26em rgb(var(--neon) / 0.6), 0 0 0.7em rgb(var(--neon) / 0.32);
  animation: nk-ns-strike 900ms linear both;
}
.nk-ns-tube[data-on="false"] { color: rgb(var(--neon) / 0.14); text-shadow: 0 -0.01em 0 rgb(255 255 255 / 0.07); }
.nk-ns-spill { transition: opacity 700ms cubic-bezier(0.23, 1, 0.32, 1); }
@keyframes nk-ns-strike { 0% { opacity: 0.2 } 9% { opacity: 1 } 15% { opacity: 0.25 } 27% { opacity: 0.95 } 34% { opacity: 0.4 } 52%, 100% { opacity: 1 } }
@media (prefers-reduced-motion: reduce) { .nk-ns-tube[data-on="true"] { animation: none; } }
`;

export function Hero() {
  const [on, setOn] = React.useState(true);
  const left = useWindowCountdown();

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden px-5 pb-16 pt-32 sm:px-8 sm:pb-20 sm:pt-44 lg:pt-48"
    >
      <style>{css}</style>
      {/* The wall. The only light on it comes from the hour. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_80%_60%_at_70%_30%,#100f17,#05060a_70%)]"
      />

      <div className="mx-auto max-w-[1120px]">
        <h1
          id="hero-title"
          className={cn(
            "max-w-[11ch] text-[clamp(3.1rem,11.6vw,8.75rem)] text-white sm:max-w-none",
            display,
            "leading-[0.94]",
          )}
        >
          Deploys that <br className="hidden sm:block" />
          land at{" "}
          <span className="relative inline-block">
            {/* The wall is only visible where the tube lights it: perforated steel, then the glow itself */}
            <span
              aria-hidden
              className="nk-ns-spill pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[min(820px,190vw)] w-[min(1240px,260vw)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,rgb(var(--neon)/0.34)_1.5px,transparent_2px)] bg-[length:16px_16px] [mask-image:radial-gradient(closest-side,black,rgb(0_0_0/0.35)_45%,transparent)]"
              style={{ opacity: on ? 1 : 0 }}
            />
            <span
              aria-hidden
              className="nk-ns-spill pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[2.8em] w-[5em] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--neon)/0.26),rgb(var(--neon)/0.08)_55%,transparent)]"
              style={{ opacity: on ? 1 : 0 }}
            />
            <span className="sr-only">2am.</span>
            <span
              aria-hidden
              data-on={on}
              className="nk-ns-tube font-normal tracking-[-0.01em] [font-stretch:100%]"
              style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
            >
              2am
            </span>
          </span>
        </h1>

        <div className="mt-12 grid gap-12 sm:mt-16 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6">
            <p className="max-w-[44ch] text-pretty text-[17px] leading-[1.6] text-white/65">
              Queue it before you log off. Nightshift ships it in the quiet window, holds it to your health checks,
              rolls it back if it has to, and leaves a report to read with coffee.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-3">
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

          {/* What the sign is wired to: the next window and the record so far */}
          <dl className="grid content-end gap-5 text-[14px] leading-snug sm:grid-cols-2 lg:col-span-5 lg:col-start-8 lg:grid-cols-1 lg:gap-0 lg:divide-y lg:divide-white/[0.07] lg:border-y lg:border-white/[0.07]">
            <div className="flex items-baseline justify-between gap-6 lg:py-3.5">
              <dt className="text-white/55">Next window opens in</dt>
              <dd className="font-mono text-[15px] tabular-nums text-white">{formatCountdown(left)}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 lg:py-3.5">
              <dt className="text-white/55">Deploys landed since 2023</dt>
              <dd className="font-mono text-[15px] tabular-nums text-white/90">{stats.landed}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-6 lg:py-3.5">
              <dt className="text-white/55">Rolled back on their own</dt>
              <dd className="font-mono text-[15px] tabular-nums text-white/90">{stats.rolledBack}</dd>
            </div>
            <div className="flex items-center justify-between gap-6 lg:py-3">
              <dt id="sign-power" className="text-white/55">
                Sign power
              </dt>
              <dd>
                <Switch size="sm" checked={on} onCheckedChange={setOn} aria-labelledby="sign-power" />
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
