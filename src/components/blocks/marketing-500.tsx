"use client";

import * as React from "react";
import { ArrowUpRight, RotateCw } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { HardwareSwitch } from "@/components/ui/hardware-switch";
import { NeonText } from "@/components/ui/neon-text";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const STATUS_URL = "https://status.gridwell.dev/incidents/2231";
const INCIDENT = { id: "#2231", title: "Elevated 5xx in eu-west-2", since: "21:47 UTC", fixed: "21:58 UTC" };
const CIRCUITS = ["API", "Auth", "Edge", "DB-1", "Queue", "Search", "Mail", "Billing"];
const TRIPPED = "API";
const FAULT = "255 77 94";

// The whole room sags and stutters while the mains are out.
const css = `
@keyframes nk-marketing-500-brownout {
  0%, 100% { opacity: 0.55 } 7% { opacity: 0.2 } 8% { opacity: 0.7 } 9% { opacity: 0.3 }
  31% { opacity: 0.45 } 32% { opacity: 0.85 } 33.5% { opacity: 0.35 } 58% { opacity: 0.6 }
  59% { opacity: 0.15 } 60% { opacity: 0.75 } 61% { opacity: 0.5 } 83% { opacity: 0.55 } 84% { opacity: 0.25 }
}
@keyframes nk-marketing-500-sputter {
  0%, 100% { opacity: 0.06 } 6% { opacity: 0.55 } 7% { opacity: 0.08 } 9% { opacity: 0.35 } 10% { opacity: 0.05 }
  48% { opacity: 0.05 } 49% { opacity: 0.7 } 50% { opacity: 0.2 } 51.5% { opacity: 0.45 } 52.5% { opacity: 0.04 }
}
@keyframes nk-marketing-500-fault { 0%, 49% { opacity: 1 } 50%, 100% { opacity: 0.15 } }
.nk-marketing-500-room { animation: nk-marketing-500-brownout 3.4s linear infinite; }
.nk-marketing-500-sputter { animation: nk-marketing-500-sputter 4.1s linear infinite; }
.nk-marketing-500-fault { animation: nk-marketing-500-fault 0.9s steps(1) infinite; }
@media (prefers-reduced-motion: reduce) {
  .nk-marketing-500-room { animation: none; opacity: 0.5; }
  .nk-marketing-500-sputter { animation: none; opacity: 0.12; }
  .nk-marketing-500-fault { animation: none; }
}
`;

function Screw({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute size-2 rounded-full bg-[radial-gradient(circle_at_30%_30%,#4a4f5c,#14161d)] shadow-[0_0_0_1px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.08)]",
        className,
      )}
    />
  );
}

function Breaker({ label, on, tripped, index }: { label: string; on: boolean; tripped: boolean; index: number }) {
  const lit = on && !tripped;
  return (
    <div className="flex flex-col items-center gap-2">
      <span
        aria-hidden
        style={{ transitionDelay: lit ? `${280 + index * 90}ms` : "0ms", ...(tripped ? { "--neon": FAULT } : {}) } as React.CSSProperties}
        className={cn(
          "size-1.5 rounded-full transition-[background-color,box-shadow] duration-150",
          lit || tripped
            ? "bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_10px_rgb(var(--neon)/0.7)]"
            : "bg-[rgb(var(--neon)/0.14)]",
          tripped && "nk-marketing-500-fault",
        )}
      />
      <span aria-hidden className="relative h-14 w-8 rounded-md border border-black/70 bg-[linear-gradient(180deg,#1d2028,#0e0f14)] shadow-[inset_0_1px_0_rgb(255_255_255/0.07),0_4px_8px_-4px_rgb(0_0_0/0.9)]">
        <span className="absolute inset-x-[7px] inset-y-[7px] rounded-[3px] bg-[#040507] shadow-[inset_0_1px_3px_rgb(0_0_0/0.9)]" />
        <span
          style={{ transitionDelay: lit ? `${200 + index * 90}ms` : "0ms" }}
          className={cn(
            "absolute inset-x-[9px] h-4 rounded-[2px] bg-[linear-gradient(180deg,#c9ced8,#6b717d)] shadow-[0_1px_2px_rgb(0_0_0/0.8)] transition-[top] duration-150 ease-out motion-reduce:transition-none",
            lit ? "top-[9px]" : tripped ? "top-[19px]" : "top-[29px]",
          )}
        />
      </span>
      <span className={cn("text-[12px]", tripped ? "text-[#ff4d5e]" : "text-white/55")}>
        {label}
      </span>
    </div>
  );
}

export default function Marketing500() {
  const [power, setPower] = React.useState(false);
  const [retry, setRetry] = React.useState<"idle" | "loading" | "ok">("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  function flip(next: boolean) {
    setPower(next);
    setRetry("idle");
    clearTimeout(timer.current);
  }

  function retryRequest() {
    setRetry("loading");
    timer.current = setTimeout(() => setRetry("ok"), 900);
  }

  return (
    <section
      // Change the color here; everything inside follows it.
      style={neonVars("amber")}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-[#05060a] px-5 py-6 text-white/90 sm:px-10 lg:min-h-[max(780px,100svh)]"
    >
      <style>{css}</style>
      {/* Warm spill from the sign once it holds */}
      <div
        aria-hidden
        className={cn(
          "absolute left-[-10%] top-[5%] -z-10 h-[70%] w-[80%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.13),transparent)] transition-opacity duration-1000",
          power ? "opacity-100" : "opacity-0",
        )}
      />

      <header className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
          <svg aria-hidden viewBox="0 0 20 20" className="size-5" fill="none" stroke="rgb(var(--neon))" strokeWidth="1.6">
            <path d="M3 7h14M3 13h14M7 3v14M13 3v14" />
          </svg>
          gridwell
        </span>
        <a
          href={STATUS_URL}
          className="inline-flex items-center gap-2 rounded-md text-[13px] text-white/60 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          <span
            aria-hidden
            style={power ? undefined : ({ "--neon": FAULT } as React.CSSProperties)}
            className="size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))]"
          />
          {power ? "Monitoring" : "Major outage"}
        </a>
      </header>

      <main className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        <div className="max-w-[600px]">
          {/* Padded so the animated layer has room for the tube's halo */}
          <div aria-hidden className={cn("-m-12 w-fit p-12", !power && "nk-marketing-500-sputter")}>
            <NeonText
              key={power ? "on" : "off"}
              on
              className="block text-[clamp(6.5rem,22vw,13rem)] font-light leading-[0.85] tracking-[-0.04em]"
              style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
            >
              500
            </NeonText>
          </div>

          <h1 aria-live="polite" className="mt-10 text-balance text-[clamp(2.5rem,5.4vw,4.5rem)] font-[620] leading-[0.96] tracking-[-0.04em] [font-stretch:112%]">
            {power ? "Power's back. Try that again." : "We tripped a breaker."}
          </h1>
          <p className="mt-6 max-w-[46ch] text-[17px] leading-[1.6] text-white/60">
            {power
              ? "Your request didn't go through the first time. Nothing was charged or saved halfway, so it's safe to send again."
              : "Something on our side failed while handling your request. It's not your connection, and the on-call engineer was paged at 21:47."}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {power ? (
              <Button variant="solid" size="lg" loading={retry === "loading"} onClick={retryRequest}>
                {retry !== "loading" && <RotateCw />}
                Retry request
              </Button>
            ) : (
              <Button variant="solid" size="lg" disabled>
                <RotateCw /> Retry request
              </Button>
            )}
            <Button asChild variant="ghost" size="lg" className="border border-white/10">
              <a href={STATUS_URL}>
                Status page <ArrowUpRight />
              </a>
            </Button>
            {/* Lifted above the dimmed room so the way out stays readable */}
            <span aria-live="polite" className="relative z-10 text-[13px] text-white/60">
              {retry === "ok" ? (
                <>
                  <span className="font-mono text-[rgb(var(--neon))]">200 OK</span> in <span className="font-mono tabular-nums">182 ms</span>
                </>
              ) : !power ? (
                "Flip the main to restore power"
              ) : null}
            </span>
          </div>
        </div>

        <div className="relative z-10 w-full max-w-[420px] rounded-[18px] lg:justify-self-end border border-white/10 bg-[linear-gradient(180deg,#15171e,#0b0c11)] p-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_40px_80px_-30px_rgb(0_0_0/0.9)] sm:p-8">
          <Screw className="left-3 top-3" />
          <Screw className="right-3 top-3" />
          <Screw className="bottom-3 left-3" />
          <Screw className="bottom-3 right-3" />

          <div className="flex items-start justify-between gap-4 border-b border-white/[0.06] pb-5">
            <div>
              <p className="text-[13px] text-white/55">Panel B, eu-west-2</p>
              <p className="mt-1.5 text-balance text-[15px] text-white/85">
                Incident {INCIDENT.id}: {INCIDENT.title}
              </p>
              <p className="mt-1 text-[13px] text-white/55">
                {power ? "Monitoring since " : "Investigating since "}
                <span className="font-mono tabular-nums">{power ? INCIDENT.fixed : INCIDENT.since}</span>
              </p>
            </div>
            <HardwareSwitch variant="flip" size="md" checked={power} onCheckedChange={flip} label="Main" />
          </div>

          <div className="grid grid-cols-4 gap-x-3 gap-y-6 pt-6">
            {CIRCUITS.map((label, i) => (
              <Breaker key={label} label={label} index={i} on={power} tripped={!power && label === TRIPPED} />
            ))}
          </div>
        </div>
      </main>

      <footer className="flex flex-wrap justify-between gap-x-6 gap-y-2 border-t border-white/[0.06] pt-5 text-[13px] text-white/55">
        <span>
          Request <code className="font-mono text-[12px] text-white/70">req_01J9X4K2QW</code>,{" "}
          <code className="font-mono text-[12px] text-white/70">POST /v2/deploys</code>
        </span>
        <span>
          Served by <span className="font-mono text-[12px] text-white/70">lhr-3</span>
        </span>
      </footer>

      {/* The room itself dims and stutters until the main is back on */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-[#020205] transition-opacity duration-700",
          power ? "opacity-0" : "nk-marketing-500-room",
        )}
      />
    </section>
  );
}
