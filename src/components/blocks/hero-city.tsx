"use client";

import * as React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Cityscape } from "@/components/ui/cityscape";
import { Countdown } from "@/components/ui/countdown";
import { Input } from "@/components/ui/input";
import { neonVars } from "@/lib/neon";

// Friday 19 March 2027, 22:00 in Lisbon (WET, UTC+0).
const LAUNCH = "2027-03-19T22:00:00Z";

const FACTS = ["41 stalls", "9 neighbourhoods", "22:00 – 05:00", "No delivery fee before 01:00"];

function NotifyForm() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<"idle" | "sending" | "done">("idle");

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("We need a real address to write to.");
      return;
    }
    setError(null);
    setState("sending");
    window.setTimeout(() => setState("done"), 900);
  }

  if (state === "done") {
    return (
      <p role="status" className="flex max-w-md items-start gap-3 text-sm leading-6 text-white/75">
        <Check aria-hidden className="mt-1 size-4 shrink-0 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)))]" />
        <span>
          You&apos;re on the list. One email on 19 March, the night we open, then we leave you alone.
        </span>
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="flex max-w-md flex-col gap-2 sm:flex-row sm:items-start">
      <Input
        type="email"
        size="lg"
        autoComplete="email"
        aria-label="Email address"
        placeholder="you@email.com"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (error) setError(null);
        }}
        error={error}
        containerClassName="flex-1"
        className="bg-[#05060a]/70 backdrop-blur-[6px]"
      />
      <Button
        type="submit"
        variant="solid"
        size="lg"
        loading={state === "sending"}
        className="shadow-[0_0_0_1px_rgb(var(--neon)),inset_0_1px_0_rgb(255_255_255/0.45)]"
      >
        Notify me <ArrowRight />
      </Button>
    </form>
  );
}

export default function HeroCity() {
  return (
    <section
      aria-labelledby="afterhours-hero-title"
      // Change the color here; everything inside follows it.
      style={neonVars("pink")}
      className="relative isolate flex min-h-[820px] flex-col overflow-hidden bg-[#05060a] text-white"
    >
      {/* Night sky over the city, then the skyline itself along the bottom. */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[linear-gradient(to_bottom,#05060a_0%,#0a0814_55%,#140a16_100%)]" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-[340px] sm:h-[380px] lg:h-[420px]">
        <Cityscape seed={23} lights={0.22} signs={["AFTERHOURS", "TASCA"]} style={{ fontFamily: "var(--font-tilt-neon, inherit)" }} />
      </div>

      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <span className="text-[19px] font-semibold lowercase tracking-[-0.04em] text-white/90">
          after<span className="text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]">hours</span>
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Lisbon · 2027</span>
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-5 pb-[360px] pt-12 sm:px-8 sm:pb-[400px] sm:pt-16 lg:pb-[420px]">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Late-night food market</p>
        <h1
          id="afterhours-hero-title"
          className="mt-5 text-[clamp(3.25rem,10vw,8.5rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-white/95"
        >
          Dinner,
          <br />
          after hours.
        </h1>

        <div className="mt-10 grid items-end gap-12 lg:mt-12 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
              The stalls of Bairro Alto, Cais do Sodré and Intendente, open till five. Order ahead, skip the queue, eat it
              while it&apos;s hot.
            </p>
            <div className="mt-8">
              <NotifyForm />
            </div>
          </div>

          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/45">Doors open in</p>
            <Countdown
              to={LAUNCH}
              variant="sign"
              size="sm"
              className="mt-5 sm:[--countdown-h:60px] lg:[--countdown-h:72px]"
              labels={{ days: "Days", hours: "Hrs", minutes: "Min", seconds: "Sec" }}
            />
            <p className="mt-5 text-sm text-white/45">Friday 19 March, 22:00. First 500 orders are on us.</p>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.06] bg-[#05060a]/90">
        <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-6 gap-y-1 px-5 py-4 font-mono text-[11px] uppercase tracking-[0.16em] text-white/50 sm:justify-between sm:px-8">
          {FACTS.map((fact, i) => (
            <li key={fact} className={i % 2 === 1 ? "hidden sm:block" : undefined}>
              {fact}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
