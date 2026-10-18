"use client";

import * as React from "react";
import { ArrowDownRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { availability, city, role } from "./config";
import { useLights } from "./lights";
import { display } from "./section-heading";

const CORE = "color-mix(in srgb, rgb(var(--neon)) 35%, white)";

// The cord gives a little when pulled, then springs back.
const css = `
@keyframes nk-portfolio-tug { 0% { transform: translateY(0) } 30% { transform: translateY(14px) } 62% { transform: translateY(-3px) } 100% { transform: translateY(0) } }
.nk-portfolio-tug { animation: nk-portfolio-tug 520ms cubic-bezier(0.23, 1, 0.32, 1); }
@keyframes nk-portfolio-sway { 0%, 100% { transform: rotate(0deg) } 25% { transform: rotate(1.6deg) } 70% { transform: rotate(-0.8deg) } }
.nk-portfolio-sway { animation: nk-portfolio-sway 900ms cubic-bezier(0.23, 1, 0.32, 1); }
@media (prefers-reduced-motion: reduce) { .nk-portfolio-tug, .nk-portfolio-sway { animation: none; } }
`;

/**
 * An enamel pendant over the desk, with its own pull cord. It's the page's
 * light: pulling the cord does what the header switch and the L key do.
 */
function Lamp() {
  const { on, toggle } = useLights();
  const [tugs, setTugs] = React.useState(0);

  const pull = () => {
    setTugs((count) => count + 1);
    toggle();
  };

  return (
    <div
      // The cord hangs from the very top of the page, behind the header.
      className="pointer-events-none absolute right-[6%] top-0 z-10 w-[120px] origin-top sm:right-[9%] sm:w-[150px] lg:right-[11%]"
    >
      <div key={tugs} className={cn("origin-top", tugs > 0 && "nk-portfolio-sway")}>
        <svg aria-hidden viewBox="0 0 150 300" className="block w-full overflow-visible">
          <defs>
            <linearGradient id="nk-portfolio-shade" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#0f1015" />
              <stop offset="0.38" stopColor="#2a2c34" />
              <stop offset="0.55" stopColor="#1a1b21" />
              <stop offset="1" stopColor="#0c0d11" />
            </linearGradient>
          </defs>
          {/* Cord and canopy */}
          <path d="M75 0 V 196" stroke="#2b2d35" strokeWidth="1.6" />
          <rect x="69" y="192" width="12" height="16" rx="2" fill="#17181e" stroke="rgb(255 255 255 / 0.08)" />
          {/* Enamel dome */}
          <path
            d="M75 206 C 52 206 40 220 36 238 L 16 270 C 15 272 16 274 19 274 L 131 274 C 134 274 135 272 134 270 L 114 238 C 110 220 98 206 75 206 Z"
            fill="url(#nk-portfolio-shade)"
            stroke="rgb(255 255 255 / 0.09)"
          />
          <path d="M44 232 C 50 218 60 212 70 210" stroke="rgb(255 255 255 / 0.14)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          {/* The underside: lit enamel when on, a dark mouth when off */}
          <ellipse
            cx="75"
            cy="274"
            rx="57"
            ry="5.5"
            className="transition-[fill] duration-500"
            style={{ fill: on ? CORE : "#08090c" }}
          />
          {/* Bulb */}
          <circle
            cx="75"
            cy="279"
            r="10"
            className="transition-[fill,filter] duration-500"
            style={{
              fill: on ? "#fffaf0" : "rgb(255 255 255 / 0.1)",
              filter: on
                ? "drop-shadow(0 0 3px rgb(var(--neon))) drop-shadow(0 0 14px rgb(var(--neon) / 0.9)) drop-shadow(0 0 36px rgb(var(--neon) / 0.5))"
                : "none",
            }}
          />
        </svg>

        {/* The beam, and where it lands */}
        <div
          aria-hidden
          className={cn(
            "absolute left-1/2 top-[90%] h-[560px] w-[620px] -translate-x-1/2 blur-[18px] transition-opacity duration-700 sm:w-[760px]",
            on ? "opacity-100" : "opacity-0",
          )}
        >
          <div className="size-full bg-[linear-gradient(rgb(var(--neon)/0.13),rgb(var(--neon)/0.05)_55%,transparent)] [clip-path:polygon(44%_0,56%_0,100%_100%,0_100%)]" />
        </div>
      </div>

      {/* The pull cord. A real button: it's the light switch. */}
      <div className="absolute left-[86%] top-[88%]">
        <button
          type="button"
          aria-pressed={on}
          aria-label="Lights (pull cord)"
          onClick={pull}
          className="group pointer-events-auto relative -ml-5 flex w-10 flex-col items-center rounded-full pb-1 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
        >
          <span key={tugs} className={cn("flex flex-col items-center", tugs > 0 && "nk-portfolio-tug")}>
            <span aria-hidden className="h-[86px] w-px bg-[linear-gradient(#2b2d35,#5b5e68)] lg:h-[110px]" />
            <span
              aria-hidden
              className="h-[18px] w-[9px] rounded-full bg-[linear-gradient(90deg,#6b5a3a,#d8bd85_45%,#7c6842)] shadow-[0_2px_6px_rgb(0_0_0/0.6)] transition-transform duration-200 group-hover:translate-y-0.5 group-active:translate-y-1.5"
            />
          </span>
        </button>
        <span
          aria-hidden
          className="pointer-events-none absolute right-6 top-[96px] whitespace-nowrap text-[13px] text-white/55 lg:left-4 lg:right-auto lg:top-[120px]"
        >
          {on ? "Pull for dark" : "Pull for light"}
        </span>
      </div>
    </div>
  );
}

export function Hero() {
  const { on } = useLights();

  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      // Slides up under the sticky header, so the lamp's cord reaches the top of the page.
      className="relative isolate -mt-16 overflow-hidden pt-16"
    >
      <style>{css}</style>
      <div aria-hidden className="absolute inset-0 -z-20 bg-[#05060a]" />
      {/* Where the lamp light falls on the wall */}
      <div
        aria-hidden
        className={cn(
          "absolute right-[-12%] top-[18%] -z-10 h-[620px] w-[min(1100px,120%)] rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--neon)/0.15),rgb(var(--neon)/0.04)_60%,transparent)] transition-opacity duration-700 sm:right-[-6%]",
          on ? "opacity-100" : "opacity-0",
        )}
      />

      <Lamp />

      <div className="relative mx-auto max-w-[1200px] px-5 pb-24 pt-[290px] sm:px-10 sm:pb-28 sm:pt-[340px] lg:pt-[310px] lg:pb-36">
        <h1
          id="hero-title"
          className={cn(display, "-ml-[0.04em] text-[25vw] leading-[0.86] tracking-[-0.05em] text-white sm:text-[clamp(88px,17vw,250px)] sm:leading-[0.86]")}
        >
          <span className="block sm:inline">Juno</span> <span className="block sm:inline">Park</span>
          <span className="sr-only">
            , {role.toLowerCase()} in {city}
          </span>
        </h1>

        <div className="mt-12 grid gap-10 sm:mt-16 lg:grid-cols-12 lg:gap-8">
          <p className="max-w-[24ch] text-pretty text-[clamp(24px,2.6vw,34px)] font-medium leading-[1.18] tracking-[-0.025em] text-white lg:col-span-7">
            I design interfaces, then build them myself.{" "}
            <span className="text-white/55">The details survive the handoff because there isn&apos;t one.</span>
          </p>

          <div className="lg:col-span-4 lg:col-start-9 lg:self-end">
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
            <p className="mt-2 max-w-[38ch] text-[15px] leading-relaxed text-white/60">
              A {role.toLowerCase()} in {city}, working with one product team at a time for twelve weeks or longer.
              Design and front end, start to ship.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button asChild variant="solid">
                <a href="#contact">Start a project</a>
              </Button>
              <Button asChild variant="ghost">
                <a href="#work">
                  See the work <ArrowDownRight aria-hidden />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
