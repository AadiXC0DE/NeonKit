"use client";

import * as React from "react";
import { ArrowUpRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const STATS = [
  { value: "187", label: "issues" },
  { value: "18.4k", label: "readers" },
  { value: "9 min", label: "per issue" },
];
const NEXT = { number: 188, title: "Hit targets that lie", when: "Thursday at 21:00 CET" };
const ISSUES = [
  {
    number: 187,
    title: "The 4px problem",
    minutes: 9,
    excerpt:
      "Icon buttons look off-centre because they are centred. Why optical alignment beats the box model, and the three nudges we now ship by default.",
  },
  {
    number: 186,
    title: "Scroll-driven animation, minus the jank",
    minutes: 12,
    excerpt:
      "animation-timeline is finally everywhere that matters. What to drive with it, what to leave on the main thread, and a fallback that costs eleven lines.",
  },
  {
    number: 185,
    title: "What text-wrap: pretty actually does",
    minutes: 7,
    excerpt:
      "It isn't balance. We set the same paragraph in four browsers and counted the orphans, then read the spec so you don't have to.",
  },
  {
    number: 184,
    title: "A colour picker you can use with a keyboard",
    minutes: 11,
    excerpt:
      "Arrow keys on a 2D surface, announcing hue without reading out numbers, and why the hex field should win every argument.",
  },
  {
    number: 183,
    title: "Focus rings people don't hate",
    minutes: 8,
    excerpt:
      "Designers turn them off, auditors turn them back on. A ring that survives both: offset, two colours and a 120 ms fade.",
  },
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function MarketingNewsletter() {
  const [open, setOpen] = React.useState(ISSUES[0].number);
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string>();
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const doneRef = React.useRef<HTMLDivElement>(null);
  // The form and the confirmation swap places, so focus follows by hand instead of falling to <body>.
  const focusNext = React.useRef<"done" | "input" | null>(null);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  React.useEffect(() => {
    if (focusNext.current === "done") doneRef.current?.focus();
    if (focusNext.current === "input") inputRef.current?.select();
    focusNext.current = null;
  }, [status]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError(email ? "That doesn't look like an email address." : "Enter an email to get Thursday's issue.");
      inputRef.current?.focus();
      return;
    }
    setError(undefined);
    setStatus("loading");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      focusNext.current = "done";
      setStatus("done");
    }, 900);
  }

  return (
    <section
      aria-labelledby="night-desk-title"
      // Change the color here; everything inside follows it.
      style={neonVars("pink")}
      className="overflow-hidden bg-[#05060a] px-5 py-16 text-white/90 sm:px-10 lg:py-24"
    >
      <div className="relative isolate mx-auto max-w-[1180px]">
        {/* The desk lamp: a short tube above the masthead and the cone it throws down the page */}
        <div aria-hidden className="pointer-events-none absolute -top-16 left-[-4%] -z-10 h-[520px] w-[min(680px,100%)] sm:-top-16 lg:-top-24">
          <div className="absolute inset-0 blur-[12px]">
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgb(var(--neon)/0.18),rgb(var(--neon)/0.05)_50%,transparent)] [clip-path:polygon(32%_0,68%_0,100%_100%,0_100%)]" />
          </div>
          <span className="absolute inset-x-[32%] top-0 h-[3px] rounded-b-full bg-[color-mix(in_srgb,rgb(var(--neon))_30%,white)] shadow-[0_0_4px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.8),0_0_40px_6px_rgb(var(--neon)/0.35)]" />
        </div>

        <div className="flex flex-col gap-6 border-b border-white/[0.08] pb-8 lg:flex-row lg:items-end lg:justify-between lg:pb-10">
          <h2
            id="night-desk-title"
            className="text-[clamp(2.5rem,11vw,7.5rem)] font-[620] leading-[0.92] tracking-[-0.045em] [font-stretch:112%] sm:whitespace-nowrap"
          >
            The Night Desk
          </h2>
          <p className="max-w-[30ch] text-[15px] leading-[1.5] text-white/60 lg:mb-3 lg:max-w-[24ch] lg:shrink-0 lg:text-right">
            <span className="text-white/90">No.&nbsp;{NEXT.number}, &ldquo;{NEXT.title}&rdquo;</span> lands{" "}
            {NEXT.when}.
          </p>
        </div>

        <div className="grid gap-14 pt-10 lg:grid-cols-12 lg:gap-10 lg:pt-12">
          <div className="lg:col-span-5">
            <p className="max-w-[42ch] text-[17px] leading-[1.6] text-white/60">
              <span className="text-white/90">Frontend craft, filed after hours.</span> One essay a week on the details that
              make an interface feel right: optical alignment, motion curves, focus states, the 4px decisions.
            </p>

            <dl className="mt-9 grid max-w-[400px] grid-cols-3 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="grid gap-1.5">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-[30px] font-[620] leading-none tracking-[-0.04em] tabular-nums [font-stretch:112%]">{s.value}</dd>
                  <dd className="text-[13px] text-white/55">{s.label}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-10">
              {status === "done" ? (
                <div
                  ref={doneRef}
                  tabIndex={-1}
                  aria-live="polite"
                  className="border-l-2 border-[rgb(var(--neon))] pl-5 outline-none"
                >
                  <p className="text-[20px] font-[620] tracking-[-0.03em] text-white [font-stretch:112%]">You&apos;re on the desk.</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/65">
                    Confirm from the email we just sent to <span className="text-white/90 [overflow-wrap:anywhere]">{email}</span>. No.&nbsp;{NEXT.number},
                    &ldquo;{NEXT.title}&rdquo;, lands {NEXT.when}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      focusNext.current = "input";
                      setStatus("idle");
                    }}
                    className="mt-1 rounded-md py-2 text-[13px] text-white/60 underline decoration-white/20 underline-offset-4 outline-none hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                  >
                    Wrong address?
                  </button>
                </div>
              ) : (
                <form noValidate onSubmit={handleSubmit} className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                    <Input
                      ref={inputRef}
                      type="email"
                      name="email"
                      aria-label="Email address"
                      placeholder="you@yourdomain.dev"
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
                      Subscribe
                    </Button>
                  </div>
                  <p className="text-[13px] text-white/60">No tracking pixels. One-click unsubscribe. Free, always.</p>
                </form>
              )}
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h3 className="text-[15px] font-medium text-white/90">From the archive</h3>
            <ul className="mt-3 border-t border-white/[0.08]">
              {ISSUES.map((issue) => {
                const expanded = open === issue.number;
                return (
                  <li key={issue.number} className="border-b border-white/[0.06] last:border-b-0">
                    <button
                      type="button"
                      aria-expanded={expanded}
                      aria-controls={`issue-${issue.number}`}
                      onClick={() => setOpen(expanded ? 0 : issue.number)}
                      className="group grid w-full grid-cols-[3.25rem_1fr_auto] items-baseline gap-3 rounded-lg py-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                    >
                      <span className={cn("font-mono text-xs tabular-nums transition-colors", expanded ? "text-[rgb(var(--neon))]" : "text-white/55")}>
                        No.{issue.number}
                      </span>
                      <span className={cn("text-[16px] leading-snug transition-colors", expanded ? "text-white" : "text-white/70 group-hover:text-white/90")}>
                        {issue.title}
                      </span>
                      <span className="text-[13px] tabular-nums text-white/55">{issue.minutes} min</span>
                    </button>
                    <div
                      id={`issue-${issue.number}`}
                      hidden={!expanded}
                      className="pb-5 pl-[calc(3.25rem+0.75rem)]"
                    >
                      <p className="max-w-[56ch] text-[15px] leading-[1.6] text-white/60">{issue.excerpt}</p>
                      <a
                        href={`#issue-${issue.number}-full`}
                        className="mt-1 inline-flex items-center gap-1 rounded-md py-2 text-[13px] text-[rgb(var(--neon))] outline-none hover:[text-shadow:0_0_12px_rgb(var(--neon)/0.6)] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                      >
                        Read the issue <ArrowUpRight className="size-3.5" />
                      </a>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
