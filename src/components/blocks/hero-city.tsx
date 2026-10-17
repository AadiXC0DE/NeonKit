"use client";

import * as React from "react";
import { ArrowRight, Check } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Cityscape } from "@/components/ui/cityscape";
import { Countdown } from "@/components/ui/countdown";
import { Input } from "@/components/ui/input";
import { neonVars } from "@/lib/neon";

// Friday 19 March 2027, 22:00 in Lisbon (WET, UTC+0).
const LAUNCH = "2027-03-19T22:00:00Z";

const FACTS: { value: string; label: string; mono?: boolean }[] = [
  { value: "41", label: "stalls" },
  { value: "9", label: "neighbourhoods" },
  { value: "22:00–05:00", label: "every night", mono: true },
  { value: "€0", label: "delivery before 01:00" },
];

function NotifyForm() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<"idle" | "sending" | "done">("idle");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const statusRef = React.useRef<HTMLParagraphElement>(null);

  // The form unmounts on success, so hand focus to the confirmation instead of dropping it.
  React.useEffect(() => {
    if (state === "done") statusRef.current?.focus();
  }, [state]);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError("We need a real address to write to.");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setState("sending");
    window.setTimeout(() => setState("done"), 900);
  }

  if (state === "done") {
    return (
      <p ref={statusRef} tabIndex={-1} role="status" className="flex max-w-md items-start gap-3 text-sm leading-6 text-white/75 outline-none">
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
        ref={inputRef}
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
        <span className="text-[13px] text-white/60">Lisbon, from 19 March</span>
      </div>

      <div className="mx-auto w-full max-w-6xl flex-1 px-5 pb-[280px] pt-10 sm:px-8 sm:pb-[380px] sm:pt-14 lg:pb-[330px]">
        <h1
          id="afterhours-hero-title"
          className="text-[clamp(3.4rem,11vw,9.5rem)] font-[620] leading-[0.9] tracking-[-0.05em] text-white/95 [font-stretch:112%]"
        >
          Dinner,
          <br />
          after hours.
        </h1>

        <div className="mt-10 grid gap-12 lg:mt-14 lg:grid-cols-12 lg:gap-8">
          <div className="min-w-0 lg:col-span-5">
            <p className="max-w-[40ch] text-[17px] leading-[1.6] text-white/60">
              <span className="text-white/90">The stalls of Bairro Alto, Cais do Sodré and Intendente, open till five.</span>{" "}
              Order ahead, skip the queue, eat it while it&apos;s hot.
            </p>
            <div className="mt-8">
              <NotifyForm />
            </div>
          </div>

          {/* The countdown hangs lower than the copy, over the rooftops, like the sign it is. */}
          <div className="min-w-0 lg:col-span-7 lg:col-start-6 lg:translate-y-32 lg:justify-self-end">
            <p className="text-[14px] text-white/60">
              Doors open Friday 19 March, <span className="font-mono text-white/85">22:00</span>.{" "}
              <span className="text-white/85">The first 500 orders are on us.</span>
            </p>
            <Countdown
              to={LAUNCH}
              variant="sign"
              size="sm"
              className="mt-4 [--countdown-h:38px] sm:[--countdown-h:64px] lg:[--countdown-h:76px] [&_.uppercase]:text-[12px] [&_.uppercase]:font-normal [&_.uppercase]:normal-case [&_.uppercase]:tracking-normal"
              labels={{ days: "days", hours: "hours", minutes: "min", seconds: "sec" }}
            />
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 border-t border-white/[0.06] bg-[#05060a]/90 backdrop-blur-[6px]">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-2 px-5 py-4 text-[13px] text-white/55 sm:flex sm:justify-between sm:px-8">
          {FACTS.map((fact) => (
            <li key={fact.label}>
              <span className={fact.mono ? "font-mono text-white/85" : "font-medium text-white/85"}>{fact.value}</span>{" "}
              {fact.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
