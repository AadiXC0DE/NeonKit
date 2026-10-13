"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HardwareSwitch } from "@/components/ui/hardware-switch";
import { NeonSign } from "@/components/ui/neon-sign";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const TONIGHT = [
  { value: "212", label: "venues on the app" },
  { value: "64", label: "open past 2am" },
  { value: "6 min", label: "median wait" },
];


function Bricks({ id, lit }: { id: string; lit?: boolean }) {
  return (
    <svg aria-hidden className="absolute inset-0 size-full">
      <defs>
        <pattern id={id} width="72" height="56" patternUnits="userSpaceOnUse">
          <path
            d="M0 .5H72M0 28.5H72M.5 0V28M36.5 28V56"
            fill="none"
            strokeWidth="1"
            style={{ stroke: lit ? "rgb(var(--neon) / 0.32)" : "rgb(255 255 255 / 0.035)" }}
          />
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

export default function CtaSign() {
  const ref = React.useRef<HTMLElement>(null);
  const signRef = React.useRef<HTMLDivElement>(null);
  const [on, setOn] = React.useState(false);
  const touched = React.useRef(false);
  const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");

  // Someone flips it on shortly after the wall comes into view, unless the visitor gets there first.
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
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  // The light on the wall is centred on the sign, wherever the layout puts it.
  React.useEffect(() => {
    const section = ref.current;
    const sign = signRef.current;
    if (!section || !sign || typeof ResizeObserver === "undefined") return;
    const place = () => {
      const s = section.getBoundingClientRect();
      const r = sign.getBoundingClientRect();
      section.style.setProperty("--sign-x", `${r.left - s.left + r.width / 2}px`);
      section.style.setProperty("--sign-y", `${r.top - s.top + r.height / 2}px`);
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  function flip(next: boolean) {
    touched.current = true;
    setOn(next);
  }

  const at = "var(--sign-x, 32%) var(--sign-y, 40%)";
  const spill = `radial-gradient(620px 460px at ${at}, black, transparent)`;

  return (
    <section
      ref={ref}
      aria-labelledby="cta-sign-title"
      // Change the color here; everything inside follows it.
      style={neonVars("pink")}
      className="relative isolate overflow-hidden bg-[#05060a] px-6 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16 lg:py-28"
    >
      {/* The wall, then the same mortar lines catching the sign's light */}
      <div aria-hidden className="absolute inset-0 -z-20">
        <Bricks id={`${uid}-dark`} />
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{ opacity: on ? 1 : 0, WebkitMaskImage: spill, maskImage: spill }}
        >
          <Bricks id={`${uid}-lit`} lit />
        </div>
        <div
          className="absolute inset-0 transition-opacity duration-700 ease-out"
          style={{
            opacity: on ? 1 : 0,
            background: `radial-gradient(560px 420px at ${at}, rgb(var(--neon) / 0.16), rgb(var(--neon) / 0.05) 55%, transparent)`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(transparent,#05060a)]" />
      </div>

      <div className="mx-auto grid max-w-[1180px] items-center gap-16 xl:grid-cols-[minmax(0,1fr)_minmax(0,420px)] xl:gap-12">
        <div className="relative flex flex-col items-center gap-12 sm:flex-row sm:items-end sm:gap-10">
          <NeonSign
            ref={signRef}
            on={on}
            // A template literal, so the Tailwind 3/4 check doesn't read the prop value as the bare utility.
            frame="rounded"
            cable="bottom"
            flicker="stutter"
            lines={[{ text: "OPEN" }, { text: "till 4am", className: "-mt-[0.08em] text-[0.34em] tracking-[0.06em]" }]}
            className="text-[clamp(56px,14vw,116px)]"
            style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
          />

          {/* A switch plate on the wall beside the door */}
          <div className="relative rounded-[14px] border border-white/[0.08] bg-[linear-gradient(160deg,#16181f,#0c0d12)] px-6 pb-4 pt-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_18px_40px_-16px_rgb(0_0_0/0.9)] sm:mb-14">
            <Screw className="left-1/2 top-2 -translate-x-1/2" />
            <Screw className="bottom-2 left-1/2 -translate-x-1/2" />
            <HardwareSwitch checked={on} onCheckedChange={flip} label="Sign" size="lg" />
          </div>
        </div>

        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">The Late Shift · Lisbon</p>
          <h2
            id="cta-sign-title"
            className={cn(
              "mt-5 max-w-[14ch] text-balance text-[clamp(2.4rem,4.6vw,3.75rem)] font-semibold leading-[0.98] tracking-[-0.04em] transition-colors duration-700",
              on ? "text-white" : "text-white/25",
            )}
          >
            Your table is still open at 1:40am.
          </h2>
          <p
            className={cn(
              "mt-6 max-w-[44ch] text-pretty text-[15px] leading-relaxed transition-colors duration-700",
              on ? "text-white/60" : "text-white/20",
            )}
          >
            Book bars and kitchens that stay open past midnight. No deposit under six people, and you can cancel up
            to 30 minutes before.
          </p>

          <div className="relative">
            <div
              className={cn(
                "transition-[opacity,transform,visibility] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                on ? "visible translate-y-0 opacity-100 delay-300" : "invisible translate-y-2 opacity-0",
              )}
            >
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild variant="solid" size="lg">
                  <a href="#">
                    Find a table tonight <ArrowRight />
                  </a>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <a href="#">Get the app</a>
                </Button>
              </div>
              <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-white/[0.08] pt-5">
                {TONIGHT.map((stat) => (
                  <div key={stat.label} className="flex flex-col-reverse justify-end">
                    <dt className="mt-1 font-mono text-[11px] leading-snug text-white/55">{stat.label}</dt>
                    <dd className="text-xl font-semibold tabular-nums tracking-[-0.02em] text-white">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {!on && (
              <p className="absolute left-0 top-9 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
                Closed. Flip the switch.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
