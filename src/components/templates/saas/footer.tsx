"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Rss } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { basePath, brand } from "./config";
import { Mark, focusRing } from "./primitives";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Instruments", href: `${basePath}#instruments` },
      { label: "Install", href: `${basePath}#install` },
      { label: "Pricing", href: `${basePath}/pricing` },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Docs", href: "#" },
      { label: "CLI reference", href: "#" },
      { label: "nightshift.toml", href: "#" },
      { label: "GitHub Action", href: "#" },
      { label: "API", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Customers", href: `${basePath}#customers` },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "Security", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
      { label: "DPA", href: "#" },
    ],
  },
];

const SOCIAL = [
  {
    label: "Nightshift on GitHub",
    path: "M12 .3a12 12 0 0 0-3.8 23.38c.6.12.82-.26.82-.57v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .3",
  },
  {
    label: "Nightshift on X",
    path: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.59l5.24 6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3Z",
  },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Newsletter({ onJoined }: { onJoined: () => void }) {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [state, setState] = React.useState<"idle" | "sending" | "done">("idle");
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  React.useEffect(() => () => clearTimeout(timer.current), []);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("That doesn't look like an email address.");
      return;
    }
    setError(null);
    setState("sending");
    timer.current = setTimeout(() => {
      setState("done");
      onJoined();
    }, 900);
  }

  if (state === "done") {
    return (
      <p role="status" className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-white/70">
        <Check
          aria-hidden
          className="mt-0.5 size-4 shrink-0 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.8))]"
        />
        <span>
          You&apos;re on the list. Issue 19 lands on 4 November, from{" "}
          <span className="text-white">log@nightshift.example</span>.
        </span>
      </p>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
      <Input
        type="email"
        name="email"
        autoComplete="email"
        placeholder="you@company.com"
        aria-label="Email address"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (error) setError(null);
        }}
        error={error}
        containerClassName="flex-1"
      />
      <Button type="submit" variant="solid" loading={state === "sending"}>
        Subscribe {state === "idle" && <ArrowRight aria-hidden />}
      </Button>
    </form>
  );
}

export function Footer() {
  const [joined, setJoined] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const lit = joined || hovered;

  return (
    <footer className="relative isolate overflow-hidden border-t border-white/[0.06]">
      <div className="px-5 pt-16 sm:px-8 sm:pt-20">
        <div className="mx-auto max-w-[1120px]">
          <div className="grid gap-12 border-b border-white/[0.07] pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-20">
            <div>
              <Link href={basePath} className={cn("inline-flex items-center gap-2.5 rounded-md text-white", focusRing)}>
                <Mark className="size-7 text-[color-mix(in_srgb,rgb(var(--neon))_45%,white)]" />
                <span className="text-xl font-semibold tracking-[-0.03em]">{brand}</span>
              </Link>
              <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-white/60">
                Scheduled deploys for teams who would rather be asleep. Made in Lisbon, on call in three time zones.
              </p>
              <a
                href="#"
                className={cn(
                  "mt-7 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-3 pr-3.5 text-xs text-white/75 transition-colors hover:border-white/20 hover:text-white",
                  focusRing,
                )}
              >
                <span className="relative flex size-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(52_211_153/0.6)] [animation-duration:2.4s] motion-reduce:hidden" />
                  <span className="relative size-2 rounded-full bg-[rgb(52_211_153)] shadow-[0_0_8px_rgb(52_211_153/0.8)]" />
                </span>
                Every window on schedule
                <span className="font-mono text-[11px] tabular-nums text-white/55">99.98% over 90 days</span>
              </a>
            </div>

            <section aria-labelledby="night-log-title">
              <h2 id="night-log-title" className="text-lg font-semibold tracking-[-0.02em] text-white">
                The Night Log
              </h2>
              <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-white/60">
                One postmortem a month from a team that ships at night: what tripped, what rolled back, what they
                changed. 9,800 engineers read it.
              </p>
              <Newsletter onJoined={() => setJoined(true)} />
            </section>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h2 className="text-[13px] text-white/55">{column.title}</h2>
                <ul className="mt-5 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-md text-sm text-white/70 transition-colors duration-150 hover:text-white",
                          focusRing,
                        )}
                      >
                        {link.label}
                        {link.label === "Careers" && (
                          <span className="text-[12px] text-white/50">2 open</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <div className="flex flex-col gap-6 border-t border-white/[0.07] py-7 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-pretty text-xs text-white/60">© 2026 Nightshift Systems, Lda. Deploys at 02:00, support at 09:00.</p>
            <div className="flex items-center gap-1">
              {SOCIAL.map((item) => (
                <a
                  key={item.label}
                  href="#"
                  aria-label={item.label}
                  className={cn(
                    "grid size-9 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white",
                    focusRing,
                  )}
                >
                  <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
                    <path d={item.path} />
                  </svg>
                </a>
              ))}
              <a
                href="#"
                aria-label="Changelog RSS feed"
                className={cn(
                  "grid size-9 place-items-center rounded-lg text-white/60 transition-colors hover:bg-white/[0.05] hover:text-white",
                  focusRing,
                )}
              >
                <Rss aria-hidden className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* The name bent in glass tube along the bottom edge. Hover lights it; subscribing leaves it on. */}
      <style>{`
        .nk-saas-glass { -webkit-text-stroke: max(1.5px, 0.006em) rgb(var(--neon) / 0.3); }
        .nk-saas-tube {
          -webkit-text-stroke: max(1.5px, 0.006em) color-mix(in srgb, rgb(var(--neon)) 35%, white);
          filter: drop-shadow(0 0 1px rgb(var(--neon))) drop-shadow(0 0 8px rgb(var(--neon) / 0.85)) drop-shadow(0 0 28px rgb(var(--neon) / 0.45));
        }
        @keyframes nk-saas-ignite { 0% { opacity: 0; } 10% { opacity: 0.9; } 18% { opacity: 0.1; } 30% { opacity: 1; } 38% { opacity: 0.35; } 55%, 100% { opacity: 1; } }
        .nk-saas-on { animation: nk-saas-ignite 800ms linear both; }
        @media (prefers-reduced-motion: reduce) { .nk-saas-on { animation: none; } }
      `}</style>
      <div
        aria-hidden
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className="relative -mb-[0.09em] select-none px-4 pt-6 text-center text-[clamp(4rem,19.5vw,17.5rem)] font-bold leading-[0.8] tracking-[-0.03em] text-transparent"
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 -z-10 bg-[radial-gradient(50%_60%_at_50%_85%,rgb(var(--neon)/0.13),transparent)] transition-opacity duration-500"
          style={{ opacity: lit ? 1 : 0 }}
        />
        <span className="nk-saas-glass block">nightshift</span>
        {lit && <span className="nk-saas-tube nk-saas-on absolute inset-x-4 bottom-0 block">nightshift</span>}
      </div>
    </footer>
  );
}
