"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { HardwareSwitch } from "@/components/ui/hardware-switch";
import { NeonSign } from "@/components/ui/neon-sign";
import { cn } from "@/lib/utils";
import { basePath, sections } from "./config";
import { Headline, formatCountdown, useWindowCountdown } from "./primitives";

const section = sections[5];

// Perforated steel, the wall of a server room. The lit copy is masked to the sign's light.
function Panel({ id, lit }: { id: string; lit?: boolean }) {
  return (
    <svg aria-hidden className="absolute inset-0 size-full">
      <defs>
        <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="1.6" style={{ fill: lit ? "rgb(var(--neon) / 0.4)" : "rgb(255 255 255 / 0.045)" }} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

function Screw({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute size-[6px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#4a4f5c,#121419)] shadow-[0_0_0_1px_rgb(0_0_0/0.5)]",
        className,
      )}
    />
  );
}

export function Cta() {
  const ref = React.useRef<HTMLElement>(null);
  const signRef = React.useRef<HTMLDivElement>(null);
  const [on, setOn] = React.useState(false);
  const touched = React.useRef(false);
  const left = useWindowCountdown();
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // The night crew arms it shortly after the wall comes into view, unless the visitor gets there first.
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let timer: ReturnType<typeof setTimeout>;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        timer = setTimeout(() => {
          if (!touched.current) setOn(true);
        }, 900);
      },
      { threshold: 0.45 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // Centre the light on the sign, wherever the layout puts it.
  React.useEffect(() => {
    const wall = ref.current;
    const sign = signRef.current;
    if (!wall || !sign || typeof ResizeObserver === "undefined") return;
    const place = () => {
      const w = wall.getBoundingClientRect();
      const s = sign.getBoundingClientRect();
      wall.style.setProperty("--sign-x", `${s.left - w.left + s.width / 2}px`);
      wall.style.setProperty("--sign-y", `${s.top - w.top + s.height / 2}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(wall);
    return () => observer.disconnect();
  }, []);

  function flip(next: boolean) {
    touched.current = true;
    setOn(next);
  }

  const at = "var(--sign-x, 30%) var(--sign-y, 40%)";
  const spill = `radial-gradient(640px 480px at ${at}, black, transparent)`;

  return (
    <section
      ref={ref}
      id={section.id}
      aria-labelledby="deploy-title"
      className="relative isolate scroll-mt-20 overflow-hidden px-5 pb-20 pt-24 sm:px-8 sm:pb-20 sm:pt-28 lg:pb-24 lg:pt-36"
    >
      <div aria-hidden className="absolute inset-0 -z-20">
        <Panel id={`${uid}-dark`} />
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ opacity: on ? 1 : 0, WebkitMaskImage: spill, maskImage: spill }}
        >
          <Panel id={`${uid}-lit`} lit />
        </div>
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            opacity: on ? 1 : 0,
            background: `radial-gradient(580px 440px at ${at}, rgb(var(--neon) / 0.16), rgb(var(--neon) / 0.05) 55%, transparent)`,
          }}
        />
        <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(#05060a,transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(transparent,#05060a)]" />
      </div>

      <div className="mx-auto grid max-w-[1120px] items-center gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-12">
        <div className="relative flex flex-col items-center gap-10 sm:flex-row sm:items-end sm:justify-center sm:gap-10 lg:justify-start">
          <NeonSign
            ref={signRef}
            on={on}
            frame="rounded"
            cable="bottom"
            flicker="stutter"
            lines={[{ text: "deploy" }, { text: "tonight", className: "-mt-[0.06em] text-[0.46em] tracking-[0.08em]" }]}
            className="text-[clamp(48px,12vw,92px)]"
            style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
          />

          {/* An arming switch under a guard, on a plate beside the sign */}
          <div className="relative rounded-[14px] border border-white/[0.08] bg-[linear-gradient(160deg,#16181f,#0c0d12)] px-6 pb-4 pt-3 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_18px_40px_-16px_rgb(0_0_0/0.9)] sm:mb-14">
            <Screw className="left-1/2 top-2 -translate-x-1/2" />
            <Screw className="bottom-2 left-1/2 -translate-x-1/2" />
            <HardwareSwitch variant="flip" checked={on} onCheckedChange={flip} label="Arm" size="lg" />
          </div>
        </div>

        <div>
          {/* The window's own hour: the one time on the page that lights, once it's armed */}
          <Headline id="deploy-title" clock={section.clock} lit={on} className="text-[clamp(2.5rem,5vw,4.25rem)]">
            Queue something tonight.
          </Headline>
          <p className="mt-7 max-w-[44ch] text-pretty text-[16px] leading-[1.6] text-white/60">
            Free for one project, and fourteen days of Crew with no card. Set it up before dinner, read the first report
            at breakfast.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild variant="solid" size="lg">
              <Link href={`${basePath}/pricing`}>
                Start free <ArrowRight aria-hidden />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <Link href={`${basePath}#install`}>Read the install</Link>
            </Button>
          </div>
          <p className="mt-10 border-t border-white/[0.08] pt-5 text-[14px] text-white/55">
            {on ? (
              <>
                Armed. The window opens in{" "}
                <span className="font-mono tabular-nums text-white/90">{formatCountdown(left)}</span>
              </>
            ) : (
              "Disarmed. Lift the guard to arm it."
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
