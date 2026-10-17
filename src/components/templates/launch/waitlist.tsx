"use client";

import * as React from "react";
import { ArrowRight, Check } from "@/components/ui/icons";

import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { SplitFlap } from "@/components/ui/split-flap";
import { cn } from "@/lib/utils";

import { event } from "./config";
import { agenda, replay, waitlist } from "./data";
import { slotStatus, useEvent, useNow, type Phase } from "./event-state";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const pad = (n: number) => String(n).padStart(5, "0");

function referralCode(email: string) {
  let h = 2166136261;
  for (const c of email.toLowerCase()) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(36).slice(0, 6);
}

const COPY: Record<Phase, { title: string; body: string; button: string; placeholder: string }> = {
  before: {
    title: "340 seats went in six days.",
    body: "Plans change. Every returned floor seat goes to the next number in line, and you get 24 hours to claim it before it moves on. Take a number and we'll write when it's called.",
    button: "Take a number",
    placeholder: "you@studio.com",
  },
  live: {
    title: "Can't make it tonight? Get the replay.",
    body: "Every session from the main hall, captioned, with the speakers' slides. One email when it's cut, usually by Monday, then we leave you alone.",
    button: "Send me the replay",
    placeholder: "you@studio.com",
  },
  after: {
    title: "Get the replay.",
    body: "Every session from the main hall, captioned, with the speakers' slides and the panel's list of things to delete. One email with the link, then we leave you alone.",
    button: "Send me the replay",
    placeholder: "you@studio.com",
  },
};

function Row({ label, value, lit, length = 5, big }: { label: string; value: string; lit?: boolean; length?: number; big?: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
      <span className="flex items-center gap-2.5 pb-1 text-[14px] text-white/60">
        <span
          aria-hidden
          className={cn(
            "size-1.5 rounded-full transition-[background-color,box-shadow] duration-300",
            lit
              ? "bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_12px_rgb(var(--neon)/0.7)]"
              : "bg-white/15",
          )}
        />
        {label}
      </span>
      <SplitFlap
        value={value}
        length={length}
        align="right"
        charset="numeric"
        flipDuration={65}
        stagger={45}
        flipOnMount
        className={big ? "[--flap-h:52px] sm:[--flap-h:72px]" : "[--flap-h:36px] sm:[--flap-h:44px]"}
      />
    </div>
  );
}

export function Waitlist() {
  const { phase, ready } = useEvent();
  const shown: Phase = ready ? phase : "before";
  // A new phase is a new form: a number taken before doors shouldn't show up as a replay request.
  return <WaitlistCard key={shown} shown={shown} />;
}

function WaitlistCard({ shown }: { shown: Phase }) {
  const now = useNow(30000);
  const filmedDone = agenda.filter((slot) => slot.room === "Main hall" && slotStatus(slot, now) === "done").length;
  const replayMode = shown !== "before";
  const copy = COPY[shown];

  const [queue, setQueue] = React.useState(waitlist.inLine);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">("idle");
  const [position, setPosition] = React.useState<number | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  React.useEffect(() => {
    if (replayMode) return;
    let tick = 0;
    const id = setInterval(() => setQueue((q) => q + waitlist.arrivals[tick++ % waitlist.arrivals.length]), 2800);
    return () => clearInterval(id);
  }, [replayMode]);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError(email ? "That doesn't look like an email address." : "We need an email to write to.");
      return;
    }
    setError(undefined);
    setStatus("loading");
    timer.current = setTimeout(() => {
      setPosition(queue + 1);
      setQueue((q) => q + 1);
      setStatus("done");
    }, 900);
  }

  const referral = `${event.referralBase}${referralCode(email || "you")}`;
  const done = status === "done";

  const facts = replayMode
    ? [
        { value: String(replay.talks), label: "sessions, all of the main hall" },
        { value: replay.runtime, label: "captioned, with the slides" },
        { value: "Free", label: "no account, link works for anyone" },
      ]
    : [
        { value: String(waitlist.called), label: "seats handed back so far" },
        { value: "24 h", label: "to claim yours when it's called" },
        { value: `+${waitlist.bump}`, label: "places for each friend who joins" },
      ];

  return (
    <section id="waitlist" aria-labelledby="waitlist-title" className="relative isolate scroll-mt-20 overflow-hidden px-5 pb-24 pt-20 sm:px-8 lg:pb-36 lg:pt-28">
      <div
        aria-hidden
        className="absolute -right-40 top-10 -z-10 h-[520px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.07),transparent)]"
      />
      <div className="mx-auto grid max-w-[1176px] gap-14 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-6">
          <h2
            id="waitlist-title"
            className="max-w-[12ch] text-balance text-[clamp(2.6rem,6vw,5rem)] font-[640] leading-[0.92] tracking-[-0.045em] text-white [font-stretch:112%]"
          >
            {copy.title}
          </h2>
          <p className="mt-7 max-w-[46ch] text-pretty text-[17px] leading-[1.6] text-white/70">{copy.body}</p>

          <dl className="mt-12 grid max-w-[560px] grid-cols-3 gap-6 border-t border-white/[0.08] pt-6">
            {facts.map((fact) => (
              <div key={fact.label} className="flex flex-col gap-2">
                <dt className="sr-only">{fact.label}</dt>
                <dd className="text-[28px] font-[620] leading-none tracking-[-0.03em] text-white [font-stretch:112%] sm:text-[34px]">
                  {fact.value}
                </dd>
                <dd className="text-[13px] leading-snug text-white/60">{fact.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="lg:col-span-5 lg:col-start-8 lg:pt-2">
          {/* The ticket machine by the door: one housing, the number being called and yours. */}
          <div className="relative rounded-[18px] border border-white/10 bg-[linear-gradient(to_bottom,#0e0f15,#08090d)] px-5 py-6 shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_40px_80px_-30px_rgb(0_0_0/0.9)] sm:px-7 sm:py-7">
            {replayMode ? (
              <div className="grid gap-6">
                <Row label="Sessions" value={String(replay.talks).padStart(2, "0")} length={2} lit big />
                {shown === "after" ? (
                  <Row label="Runtime" value="4:12" length={4} lit />
                ) : (
                  <Row label="Already in the can" value={String(filmedDone).padStart(2, "0")} length={2} lit={filmedDone > 0} />
                )}
              </div>
            ) : (
              <div className="grid gap-6">
                <Row label="Now calling" value={pad(waitlist.called)} lit big />
                <Row label="Your number" value={position ? pad(position) : "-----"} lit={!!position} />
              </div>
            )}
            {!replayMode && (
              <p className="mt-6 border-t border-white/[0.07] pt-4 text-[13px] text-white/60">
                <span className="font-mono tabular-nums text-white/90">{queue.toLocaleString("en-US")}</span> people in line right now
              </p>
            )}
          </div>

          {done ? (
            <div aria-live="polite" className="mt-6 grid gap-4">
              <p className="flex gap-3 text-[15px] leading-relaxed text-white/75">
                <Check aria-hidden className="mt-1 size-4 shrink-0 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_4px_rgb(var(--neon)))]" />
                {replayMode ? (
                  <span>
                    {shown === "after" ? "Sent" : "Noted"}. {shown === "after" ? "The link is in your inbox" : "The link lands in your inbox when the edit's done"}, and
                    it works for anyone, so pass it on.
                  </span>
                ) : (
                  <span>
                    You&apos;re number <span className="text-white">{position?.toLocaleString("en-US")}</span>. Each person who joins with
                    your link moves you up {waitlist.bump} places.
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-1.5 pl-4 pr-1.5">
                <span className="min-w-0 flex-1 truncate font-mono text-sm text-[color:color-mix(in_srgb,rgb(var(--neon))_45%,white)]">
                  {replayMode ? event.replayUrl.replace("https://", "") : referral}
                </span>
                <CopyButton
                  value={replayMode ? event.replayUrl : `https://${referral}`}
                  variant="outline"
                  size="sm"
                  copiedLabel="Link copied"
                >
                  Copy link
                </CopyButton>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={submit} className="mt-6 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <Input
                type="email"
                name="email"
                aria-label="Email address"
                placeholder={copy.placeholder}
                autoComplete="email"
                size="lg"
                value={email}
                error={error}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(undefined);
                }}
              />
              <Button type="submit" variant="solid" size="lg" loading={status === "loading"}>
                {copy.button} {status !== "loading" && <ArrowRight aria-hidden />}
              </Button>
            </form>
          )}
          <p className="mt-4 text-[13px] leading-relaxed text-white/60">
            {replayMode
              ? "No account, no tracking pixels. Unsubscribe is one click and we mean it."
              : "One email when your number's called. Numbers are never sold or swapped."}
          </p>
        </div>
      </div>
    </section>
  );
}
