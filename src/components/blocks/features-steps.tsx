"use client";

import * as React from "react";
import { Check, LoaderCircle, RotateCcw } from "@/components/ui/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Step, Stepper } from "@/components/ui/stepper";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const STEPS = [
  { title: "Connect", description: "Verify your domain", copy: "Add four DNS records. We check them and tell you which one is wrong, by name." },
  { title: "Template", description: "Write it once", copy: "Plain HTML or our editor. Variables are typed, so a typo fails the build, not the send." },
  { title: "Send", description: "One API call", copy: "One call from your backend. Every message gets a delivery log you can hand to support." },
];

const DNS = [
  { record: "TXT", host: "mr._domainkey", label: "DKIM" },
  { record: "TXT", host: "@", label: "SPF" },
  { record: "TXT", host: "_dmarc", label: "DMARC" },
  { record: "CNAME", host: "bounce", label: "Return-Path" },
];

const LOG = [
  { at: "0 ms", text: "queued msg_7Kq2v9" },
  { at: "38 ms", text: "rendered receipt v3 · 14.2 kB" },
  { at: "211 ms", text: "accepted by mx1.fieldcraft.co" },
  { at: "812 ms", text: "delivered · inbox, not promotions" },
];

// Runs `count` ticks `every` ms apart, then calls `done`. Cleans up if the block unmounts mid-run.
function useSequence() {
  const timers = React.useRef<ReturnType<typeof setTimeout>[]>([]);
  React.useEffect(() => () => timers.current.forEach(clearTimeout), []);
  return React.useCallback((count: number, every: number, tick: (i: number) => void, done: () => void) => {
    timers.current.forEach(clearTimeout);
    timers.current = Array.from({ length: count + 1 }, (_, i) =>
      setTimeout(() => (i < count ? tick(i) : done()), every * (i + 1)),
    );
  }, []);
}

function Panel({
  index,
  title,
  copy,
  children,
}: {
  index: number;
  state: "complete" | "current" | "upcoming";
  title: string;
  copy: string;
  children: React.ReactNode;
}) {
  return (
    <article
      aria-label={`Step ${index + 1}: ${title}`}
      className="relative flex min-h-[440px] flex-1 flex-col rounded-[14px] border border-white/[0.08] bg-[#08090d] p-5 shadow-[inset_0_1px_0_rgb(255_255_255/0.04),0_50px_100px_-50px_rgb(0_0_0/0.9)] sm:p-8"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[22px] font-[620] tracking-[-0.025em] text-white [font-stretch:112%]">{title}</h3>
        <span className="text-[13px] tabular-nums text-white/50">Step {index + 1} of 3</span>
      </div>
      <p className="mt-2 max-w-[52ch] text-[15px] leading-[1.55] text-white/60 lg:hidden">{copy}</p>
      <div className="mt-6 flex flex-1 flex-col">{children}</div>
    </article>
  );
}

function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-white/[0.07] bg-[#05060a] px-4 py-3.5 font-mono text-[13px] leading-6 text-white/70", className)}>
      {children}
    </div>
  );
}

function Done({ children }: { children: React.ReactNode }) {
  return (
    <p role="status" className="flex h-8 items-center gap-2 text-sm text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.45)]">
      <Check aria-hidden className="size-4" /> {children}
    </p>
  );
}

function Var({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[5px] bg-[rgb(var(--neon)/0.12)] px-1 font-mono text-[0.9em] text-[rgb(var(--neon))]">
      {children}
    </span>
  );
}

export default function FeaturesSteps() {
  const [step, setStep] = React.useState(0);
  const [verified, setVerified] = React.useState(0);
  const [verifying, setVerifying] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [logged, setLogged] = React.useState(0);
  const [sending, setSending] = React.useState(false);
  const sequence = useSequence();
  const actions = React.useRef<(HTMLButtonElement | null)[]>([]);
  const moved = React.useRef(false);

  // Each step's button unmounts when it's done, so hand focus to the next one instead of dropping it on the page.
  React.useEffect(() => {
    if (!moved.current || (document.activeElement && document.activeElement !== document.body)) return;
    actions.current[Math.min(step, 3)]?.focus({ preventScroll: true });
  }, [step]);

  const stateOf = (i: number) => (i < step ? "complete" : i === step ? "current" : "upcoming");
  const dnsDone = step > 0 || verified === DNS.length;

  function verify() {
    moved.current = true;
    setVerifying(true);
    setVerified(0);
    sequence(DNS.length, 360, (i) => setVerified(i + 1), () => {
      setVerifying(false);
      setStep(1);
    });
  }

  function publish() {
    setPublishing(true);
    sequence(1, 700, () => {}, () => {
      setPublishing(false);
      setStep(2);
    });
  }

  function send() {
    setSending(true);
    setLogged(0);
    sequence(LOG.length, 420, (i) => setLogged(i + 1), () => {
      setSending(false);
      setStep(3);
    });
  }

  // Jumping steps from the stepper cancels whatever was mid-run, so a stale timer can't move it again.
  function goTo(next: number) {
    moved.current = true;
    sequence(0, 0, () => {}, () => {});
    setVerifying(false);
    setPublishing(false);
    setSending(false);
    setStep(next);
  }

  function reset() {
    goTo(0);
    setVerified(0);
    setLogged(0);
  }

  const panels = [
    <Panel
      key="connect"
      index={0}
      state={stateOf(0)}
      title="Connect"
      copy="Add four DNS records. We check them for you and tell you which one is wrong, by name."
    >
      <Mono>
        <span className="text-white/50">$</span> npm i <span className="text-white/90">@mailroom/node</span>
      </Mono>
      <ul className="mt-3 divide-y divide-white/[0.06] rounded-xl border border-white/[0.07]">
        {DNS.map((r, i) => {
          const ok = dnsDone || i < verified;
          return (
            <li key={r.label} className="flex items-center gap-3 px-4 py-3 text-[13px]">
              <span className="w-12 shrink-0 font-mono text-white/55">{r.record}</span>
              <span className="min-w-0 flex-1 truncate font-mono text-white/70">{r.host}</span>
              <span className={cn("flex items-center gap-1.5 transition-colors", ok ? "text-[rgb(var(--neon))]" : "text-white/55")}>
                {ok ? <Check aria-hidden className="size-3.5" /> : verifying && i === verified ? <LoaderCircle aria-hidden className="size-3.5 animate-spin" /> : null}
                {r.label}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto pt-5">
        {step > 0 ? (
          <Done>fieldcraft.co verified</Done>
        ) : (
          <Button ref={(el) => void (actions.current[0] = el)} size="sm" variant="solid" onClick={verify} loading={verifying}>
            {verifying ? "Checking DNS" : "Verify fieldcraft.co"}
          </Button>
        )}
      </div>
    </Panel>,

    <Panel
      key="template"
      index={1}
      state={stateOf(1)}
      title="Template"
      copy="Write the email once, in plain HTML or our editor. Variables are typed, so a typo fails the build, not the send."
    >
      <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#0b0c11]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
          <span className="font-mono text-[12px] text-white/55">receipt.mrml</span>
          <Badge size="sm" variant="outline">{step > 1 ? "v3 live" : "v3 draft"}</Badge>
        </div>
        <div className="space-y-3 px-5 py-5 text-[15px] leading-relaxed text-white/75">
          <p className="text-[19px] font-medium tracking-[-0.01em] text-white">Thanks, <Var>{"{{first_name}}"}</Var></p>
          <p>
            We charged <Var>{"{{amount}}"}</Var> to the card ending <Var>{"{{last4}}"}</Var>. Your order ships from
            Portland on <Var>{"{{ship_date}}"}</Var>.
          </p>
          <div className="flex items-center justify-between border-t border-dashed border-white/10 pt-3 font-mono text-[12px] text-white/55">
            <span>Order FC-30418</span>
            <span>2 items</span>
          </div>
        </div>
      </div>
      <div className="mt-auto pt-5">
        {step > 1 ? (
          <Done>v3 is live</Done>
        ) : (
          <Button
            ref={(el) => void (actions.current[1] = el)}
            size="sm"
            variant={step === 1 ? "solid" : "outline"}
            onClick={publish}
            disabled={step !== 1}
            loading={publishing}
          >
            Publish template
          </Button>
        )}
      </div>
    </Panel>,

    <Panel
      key="send"
      index={2}
      state={stateOf(2)}
      title="Send"
      copy="One call from your backend. Every message gets a delivery log you can hand to support."
    >
      <Mono>
        <span className="text-white/55">await</span> mailroom.<span className="text-white/90">send</span>({"{"}
        <br />
        <span className="pl-4">to: </span>
        <span className="text-[rgb(var(--neon))]">&quot;maya@fieldcraft.co&quot;</span>,
        <br />
        <span className="pl-4">template: </span>
        <span className="text-[rgb(var(--neon))]">&quot;receipt&quot;</span>,
        <br />
        {"});"}
      </Mono>
      <ol aria-live="polite" className="relative mt-3 min-h-[132px] space-y-1 rounded-xl border border-white/[0.07] px-4 py-3.5 font-mono text-[12.5px] leading-6">
        {step < 3 && logged === 0 && (
          <li className="absolute inset-0 grid place-items-center font-sans text-[13px] text-white/55">{sending ? "Connecting…" : "Delivery log appears here"}</li>
        )}
        {LOG.map((line, i) => {
          const shown = step > 2 || i < logged;
          return (
            <li key={line.at} className={cn("flex gap-3 transition-opacity duration-200", shown ? "opacity-100" : "opacity-0")}>
              <span className="w-12 shrink-0 text-right text-white/55">{line.at}</span>
              <span className={cn("truncate", i === LOG.length - 1 ? "text-[rgb(var(--neon))]" : "text-white/65")}>{line.text}</span>
            </li>
          );
        })}
      </ol>
      <div className="mt-auto flex items-center gap-3 pt-5">
        {step > 2 ? (
          <>
            <Done>Delivered in 812 ms</Done>
            <Button ref={(el) => void (actions.current[3] = el)} size="sm" variant="ghost" onClick={reset} className="ml-auto">
              <RotateCcw aria-hidden /> Start over
            </Button>
          </>
        ) : (
          <Button
            ref={(el) => void (actions.current[2] = el)}
            size="sm"
            variant={step === 2 ? "solid" : "outline"}
            onClick={send}
            disabled={step !== 2}
            loading={sending}
          >
            Send a test
          </Button>
        )}
      </div>
    </Panel>,
  ];

  return (
    <section
      aria-labelledby="features-steps-title"
      // Change the color here; everything inside follows it.
      style={neonVars("orange")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16"
    >
      <div className="mx-auto max-w-[1200px]">
        <header className="max-w-[900px]">
          <h2
            id="features-steps-title"
            className="max-w-[19ch] text-[clamp(2.4rem,5.6vw,4.5rem)] font-[620] leading-[0.96] tracking-[-0.04em] text-white [font-stretch:112%]"
          >
            From zero to a delivered receipt before lunch.
          </h2>
          <p className="mt-6 max-w-[50ch] text-[17px] leading-[1.6] text-white/90">
            Mailroom sends your transactional email.{" "}
            <span className="text-white/50">Three steps, and you can do all of them right here.</span>
          </p>
        </header>

        <div className="mt-14 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-4">
            <div className="lg:hidden">
              <Stepper value={step} onValueChange={goTo} clickable>
                {STEPS.map((s) => (
                  <Step key={s.title} title={s.title} description={s.description} />
                ))}
              </Stepper>
            </div>
            <div className="hidden lg:block">
              <Stepper value={step} onValueChange={goTo} clickable orientation="vertical">
                {STEPS.map((s) => (
                  <Step key={s.title} title={s.title} description={s.copy} />
                ))}
              </Stepper>
            </div>
            <p className="mt-12 hidden border-t border-white/[0.08] pt-6 lg:block">
              <span className="block text-[clamp(2.75rem,4vw,3.5rem)] font-[620] leading-none tracking-[-0.04em] text-white [font-stretch:112%]">
                22 min
              </span>
              <span className="mt-2 block max-w-[30ch] text-[14px] leading-[1.5] text-white/55">
                Median time from sign-up to a team&apos;s first real email.
              </span>
            </p>
          </div>

          {/* One stage: whichever step you're on, at full size. */}
          <div className="flex min-w-0 flex-col lg:col-span-8">
            {panels.map((panel, i) => (
              <div key={i} className={cn(i === Math.min(step, 2) ? "flex" : "hidden", "flex-1 flex-col")}>
                {panel}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
