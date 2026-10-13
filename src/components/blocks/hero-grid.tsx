"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RetroGrid } from "@/components/ui/retro-grid";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const CUSTOMERS = ["Ines Varga", "Tomas Brandt", "Aiko Sato", "Kwame Asante"];

// The live log cycles through these. A failed delivery comes back two rows later on its retry.
const EVENTS = [
  { type: "invoice.paid", host: "api.ledgerline.io", status: 200, ms: 184 },
  { type: "order.created", host: "hooks.tinbox.shop", status: 200, ms: 96 },
  { type: "user.deleted", host: "crm.fernway.app", status: 503, ms: 3012, note: "retrying in 16s" },
  { type: "payout.sent", host: "api.ledgerline.io", status: 200, ms: 211 },
  { type: "build.failed", host: "ci.slatehouse.dev", status: 200, ms: 142 },
  { type: "user.deleted", host: "crm.fernway.app", status: 200, ms: 388, note: "retry 2/8" },
  { type: "order.refunded", host: "hooks.tinbox.shop", status: 200, ms: 121 },
  { type: "subscription.renewed", host: "billing.quayside.co", status: 200, ms: 167 },
];
const VISIBLE = 6;
const START = 14 * 3600 + 2 * 60 + 11;

function clock(seconds: number) {
  const s = seconds % 86400;
  return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, "0")).join(":");
}

function DeliveryLog() {
  const [tick, setTick] = React.useState(VISIBLE);

  React.useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1800);
    return () => window.clearInterval(id);
  }, []);

  const rows = Array.from({ length: VISIBLE }, (_, i) => {
    const n = tick - i;
    return { n, time: clock(START + n * 2), ...EVENTS[n % EVENTS.length] };
  });

  return (
    <div className="relative rounded-2xl border border-white/10 bg-[#0a0b11]/90 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] backdrop-blur-[6px]">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">
        <span className="flex items-center gap-2">
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(var(--neon))] opacity-60 [animation-duration:1.8s] motion-reduce:animate-none" />
            <span className="relative size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))]" />
          </span>
          Live deliveries
        </span>
        <span className="normal-case tracking-normal text-white/30">us-east-1</span>
      </div>
      <ol aria-label="Recent webhook deliveries" className="divide-y divide-white/[0.05] font-mono text-[12px]">
        {rows.map((row, i) => (
          <li
            key={row.n}
            className={cn(
              "grid grid-cols-[1fr_auto] items-center gap-x-3 px-4 py-2.5 transition-colors duration-700 sm:grid-cols-[64px_1fr_auto]",
              i === 0 ? "bg-[rgb(var(--neon)/0.06)]" : "bg-transparent",
            )}
          >
            <span className="hidden text-white/30 sm:block">{row.time}</span>
            <span className="min-w-0">
              <span className="block truncate text-white/80">{row.type}</span>
              <span className="block truncate text-[11px] text-white/35">
                {row.host}
                {row.note && <span className={row.status >= 500 ? "text-[rgb(255_77_94)]" : "text-[rgb(var(--neon))]"}> · {row.note}</span>}
              </span>
            </span>
            <span className="text-right">
              <span className={cn("block", row.status >= 500 ? "text-[rgb(255_77_94)]" : "text-white/70")}>{row.status}</span>
              <span className="block text-[11px] text-white/30">{row.ms} ms</span>
            </span>
          </li>
        ))}
      </ol>
      <dl className="grid grid-cols-3 border-t border-white/[0.06] text-center">
        {[
          ["p99", "212 ms"],
          ["first try", "99.97%"],
          ["kept", "30 days"],
        ].map(([label, value]) => (
          <div key={label} className="px-2 py-3">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">{label}</dt>
            <dd className="mt-1 text-sm font-medium text-white/85">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function SignupForm() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<"idle" | "sending" | "sent">("idle");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("That doesn't look like a work email.");
      return;
    }
    setError(null);
    setState("sending");
    window.setTimeout(() => setState("sent"), 900);
  }

  if (state === "sent") {
    return (
      <div role="status" className="flex max-w-md items-start gap-3 rounded-xl border border-[rgb(var(--neon)/0.35)] bg-[rgb(var(--neon)/0.06)] px-4 py-3.5">
        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)))]" />
        <p className="text-sm leading-6 text-white/75">
          Test key sent to <span className="text-white">{email.trim()}</span>. It works for 10,000 deliveries, no card needed.{" "}
          <button
            type="button"
            onClick={() => {
              setEmail("");
              setState("idle");
            }}
            className="cursor-pointer rounded-md text-white/50 underline underline-offset-4 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            Use another email
          </button>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-start">
      <Input
        type="email"
        size="lg"
        autoComplete="email"
        aria-label="Work email"
        placeholder="you@company.com"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (error) setError(null);
        }}
        error={error}
        containerClassName="flex-1"
      />
      <Button
        type="submit"
        variant="solid"
        size="lg"
        loading={state === "sending"}
        className="shadow-[0_0_0_1px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.3),inset_0_1px_0_rgb(255_255_255/0.45)]"
      >
        Get a test key <ArrowRight />
      </Button>
    </form>
  );
}

export default function HeroGrid() {
  return (
    <section
      aria-labelledby="relay-hero-title"
      // Change the color here; everything inside follows it.
      style={neonVars("cyan")}
      className="relative isolate overflow-hidden bg-[#05060a] text-white"
    >
      {/* The floor, and the sky glow where it meets the horizon. */}
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[420px] sm:h-[460px]">
        <div className="absolute inset-x-0 top-1/2 h-48 -translate-y-full bg-[radial-gradient(ellipse_50%_100%_at_50%_100%,rgb(var(--neon)/0.16),transparent_70%)]" />
        <RetroGrid angle={72} cellSize={64} opacity={0.4} speed={1.6} />
      </div>

      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex h-16 items-center justify-between">
          <span className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em] text-white/90">
            <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h11M10 6l6 6-6 6" stroke="rgb(255 255 255 / 0.85)" />
              <circle cx="19.5" cy="12" r="1.8" fill="rgb(var(--neon))" style={{ filter: "drop-shadow(0 0 4px rgb(var(--neon)))" }} />
            </svg>
            Relay
          </span>
          <a
            href="#status"
            className="flex items-center gap-2 rounded-md font-mono text-[11px] uppercase tracking-[0.16em] text-white/45 outline-none hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            <span className="size-1.5 rounded-full bg-[rgb(52_211_153)] shadow-[0_0_6px_rgb(52_211_153)]" />
            <span className="hidden sm:inline">All regions delivering</span>
            <span className="sm:hidden">Operational</span>
          </a>
        </div>

        <div className="grid items-start gap-14 pb-56 pt-14 sm:pb-64 lg:grid-cols-[1fr_400px] lg:gap-16 lg:pt-20">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Webhook infrastructure</p>
            <h1
              id="relay-hero-title"
              className="mt-5 max-w-2xl [text-wrap:balance] text-[clamp(2.75rem,6.4vw,5.25rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white/95"
            >
              <span className="block">Send the event.</span>
              <span className="block">We&apos;ll make sure it lands.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-white/55 sm:text-lg">
              Relay signs, queues and retries every webhook with per-endpoint backoff, then keeps 30 days of logs with a
              replay button for the bad days.
            </p>
            <div className="mt-9">
              <SignupForm />
            </div>
            <div className="mt-10 flex items-center gap-4">
              <AvatarGroup size="md">
                {CUSTOMERS.map((name) => (
                  <Avatar key={name} alt={name} />
                ))}
              </AvatarGroup>
              <p className="text-sm leading-5 text-white/55">
                <span className="font-medium text-white/85">2.1B webhooks</span> delivered last month
                <span className="hidden sm:inline"> for 3,912 teams</span>
              </p>
            </div>
          </div>

          <div className="lg:mt-6">
            <DeliveryLog />
          </div>
        </div>
      </div>
    </section>
  );
}
