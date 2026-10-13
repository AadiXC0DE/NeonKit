"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Input } from "@/components/ui/input";
import { SplitFlap } from "@/components/ui/split-flap";
import { neonVars } from "@/lib/neon";

const NOW_INVITING = 1250;
const QUEUE_START = 4812;
const BATCH = 250;
const REFERRAL_BUMP = 25;
// The first batch after today, a Thursday. Batches go out weekly from here.
const NEXT_BATCH = Date.UTC(2026, 9, 15);
const LINK_BASE = "glasshouse.photo/r/";
// A fixed rhythm of sign-ups, so the counter ticks the same way on every load.
const ARRIVALS = [1, 0, 2, 1, 0, 1, 3, 0, 1, 1];
const FACTS = [
  { value: "38 ms", label: "to open a 61 MP RAW" },
  { value: "0", label: "frames uploaded, scored or trained on" },
  { value: "1 key", label: "per decision: P, X or U" },
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function pad(n: number) {
  return String(n).padStart(5, "0");
}

function referralCode(email: string) {
  let h = 2166136261;
  for (const c of email.toLowerCase()) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return (h >>> 0).toString(36).slice(0, 6);
}

function inviteWeek(position: number) {
  const weeks = Math.floor((position - NOW_INVITING - 1) / BATCH);
  return new Date(NEXT_BATCH + weeks * 7 * 864e5).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function Row({ label, value, lit }: { label: string; value: string; lit?: boolean }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <span className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
        <span
          aria-hidden
          className={
            lit
              ? "size-1.5 rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_12px_rgb(var(--neon)/0.7)]"
              : "size-1.5 rounded-full bg-[rgb(var(--neon)/0.15)]"
          }
        />
        {label}
      </span>
      <SplitFlap value={value} charset="numeric" flipDuration={70} stagger={45} className="[--flap-h:44px] sm:[--flap-h:52px]" />
    </div>
  );
}

export default function MarketingWaitlist() {
  const [queue, setQueue] = React.useState(QUEUE_START);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">("idle");
  const [position, setPosition] = React.useState<number | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const doneRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let tick = 0;
    const id = setInterval(() => setQueue((q) => q + ARRIVALS[tick++ % ARRIVALS.length]), 2600);
    return () => {
      clearInterval(id);
      clearTimeout(timer.current);
    };
  }, []);

  // The form unmounts on success, so hand focus to the confirmation rather than letting it fall to <body>.
  React.useEffect(() => {
    if (status === "done") doneRef.current?.focus();
  }, [status]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError(email ? "That doesn't look like an email address." : "Enter the email you'd like the invite sent to.");
      inputRef.current?.focus();
      return;
    }
    setError(undefined);
    setStatus("loading");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setPosition(queue + 1);
      setQueue((q) => q + 1);
      setStatus("done");
    }, 900);
  }

  const link = `${LINK_BASE}${referralCode(email || "you")}`;

  return (
    <section
      aria-labelledby="glasshouse-waitlist"
      // Change the color here; everything inside follows it.
      style={neonVars("lime")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 py-16 text-white/90 sm:px-10 lg:py-28"
    >
      <div className="mx-auto grid max-w-[1160px] grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,500px)] lg:items-start lg:gap-20">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">Glasshouse · macOS and iPad · spring 2027</p>
          <h2
            id="glasshouse-waitlist"
            className="mt-6 max-w-[14ch] text-[clamp(2.5rem,5.6vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
          >
            Cull a 2,000-frame wedding before the coffee&apos;s cold.
          </h2>
          <p className="mt-6 max-w-[48ch] text-[17px] leading-relaxed text-white/55">
            A photo culler that leaves the picking to you. Instant previews, focus peaking at 100%, bursts side by side
            and shortcuts that never move. Your frames stay on your disk.
          </p>
          <dl className="mt-10 grid max-w-[520px] gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.06] sm:grid-cols-3">
            {FACTS.map((f) => (
              <div key={f.label} className="flex items-baseline gap-3 bg-[#05060a] px-5 py-4 sm:flex-col sm:gap-1.5">
                <dt className="sr-only">{f.label}</dt>
                <dd className="shrink-0 text-2xl font-semibold tracking-[-0.03em] tabular-nums">{f.value}</dd>
                <dd className="text-[13px] leading-snug text-white/60">{f.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative lg:mt-12">
          <div
            aria-hidden
            className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.1),transparent)]"
          />
          <div className="rounded-[20px] border border-white/10 bg-[#0a0b11] p-5 shadow-[0_40px_80px_-30px_rgb(0_0_0/0.9)] sm:p-8">
            <div className="grid gap-5 rounded-xl border border-white/[0.06] bg-black/40 p-4 sm:p-5">
              <Row label="Now inviting" value={pad(NOW_INVITING)} lit />
              <div aria-hidden className="h-px bg-white/[0.06]" />
              <Row label="Your number" value={position ? pad(position) : "-----"} lit={!!position} />
            </div>

            <p className="mt-4 flex justify-between font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">
              <span>In line now</span>
              <span className="tabular-nums text-white/70">{queue.toLocaleString("en-US")}</span>
            </p>

            {status === "done" && position ? (
              <div
                ref={doneRef}
                tabIndex={-1}
                aria-live="polite"
                className="mt-6 grid gap-4 border-t border-white/[0.06] pt-6 outline-none"
              >
                <p className="text-[15px] leading-relaxed text-white/70">
                  You&apos;re in line. At {BATCH} invites a week, yours lands around{" "}
                  <span className="text-white/90">{inviteWeek(position)}</span>. Each photographer who joins with your
                  link moves you up {REFERRAL_BUMP} places.
                </p>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-1.5 pl-4 pr-1.5">
                  <span className="min-w-0 flex-1 truncate font-mono text-sm text-[rgb(var(--neon))]">{link}</span>
                  <CopyButton value={`https://${link}`} variant="outline" size="sm" copiedLabel="Link copied">
                    Copy link
                  </CopyButton>
                </div>
              </div>
            ) : (
              <form noValidate onSubmit={handleSubmit} className="mt-6 grid gap-3 border-t border-white/[0.06] pt-6 sm:grid-cols-[1fr_auto] sm:items-start">
                <Input
                  ref={inputRef}
                  type="email"
                  name="email"
                  aria-label="Email address"
                  placeholder="you@studio.com"
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
                  Take a number {status !== "loading" && <ArrowRight />}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
