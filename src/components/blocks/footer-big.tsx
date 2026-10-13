"use client";

import * as React from "react";
import { ArrowRight, Check, Rss } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { neonVars } from "@/lib/neon";

const COLUMNS = [
  { title: "Product", links: ["Tracer", "Lint Farm", "Flake Radar", "Pricing", "Changelog"] },
  { title: "Developers", links: ["Docs", "API reference", "CLI", "Self-hosting", "Status"] },
  { title: "Company", links: ["About", "Careers", "Blog", "Press kit", "Contact"] },
  { title: "Community", links: ["Forum", "Office hours", "Open source", "Meetups"] },
];

const LEGAL = ["Privacy", "Terms", "DPA", "Security", "Cookie settings"];

const SOCIAL = [
  {
    label: "Halcyon on GitHub",
    path: "M12 .3a12 12 0 0 0-3.8 23.38c.6.12.82-.26.82-.57v-2.04c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.31-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.14-.3-.54-1.52.1-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.28-1.55 3.29-1.23 3.29-1.23.64 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .3",
  },
  {
    label: "Halcyon on X",
    path: "M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.4l-5.8-7.59-6.64 7.59H.47l8.6-9.83L0 1.15h7.59l5.24 6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3Z",
  },
];

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Mark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className={className}>
      <path d="M5 15a7 7 0 0 1 14 0" />
      <path d="M2.5 15h19M6 19h12" />
    </svg>
  );
}

function Newsletter({ onJoined }: { onJoined: () => void }) {
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
    if (!EMAIL.test(email.trim())) {
      setError("That doesn't look like an email address.");
      inputRef.current?.focus();
      return;
    }
    setError(null);
    setState("sending");
    setTimeout(() => {
      setState("done");
      onJoined();
    }, 900);
  }

  if (state === "done") {
    return (
      <p ref={statusRef} tabIndex={-1} role="status" className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-white/70 outline-none">
        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.8))]" />
        <span>
          You&apos;re on the list. Issue 31 lands on 3 November, from{" "}
          <span className="text-white">dispatch@halcyon.example</span>.
        </span>
      </p>
    );
  }

  return (
    <form noValidate onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start">
      <Input
        ref={inputRef}
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
        Subscribe {state === "idle" && <ArrowRight />}
      </Button>
    </form>
  );
}

export default function FooterBig() {
  const [joined, setJoined] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const lit = joined || hovered;

  return (
    <footer
      // Change the color here; everything inside follows it.
      style={neonVars("violet")}
      className="relative isolate overflow-hidden border-t border-white/[0.06] bg-[#05060a] text-white/90"
    >
      <div className="mx-auto box-content max-w-[1180px] px-6 pt-16 sm:px-10 sm:pt-20 lg:px-16">
        <div className="grid gap-12 border-b border-white/[0.07] pb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,440px)] lg:gap-20">
          <div>
            <a
              href="#"
              className="inline-flex items-center gap-2.5 rounded-md text-white outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
            >
              <Mark className="size-7 text-[rgb(var(--neon))]" />
              <span className="text-xl font-semibold tracking-[-0.03em]">Halcyon</span>
            </a>
            <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-white/55">
              Quiet tools for loud codebases. Tracing, linting and flaky-test triage for teams of 5 to 500.
            </p>
            <a
              href="#"
              className="mt-7 inline-flex min-h-9 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-3 pr-3.5 sm:min-h-0 text-xs text-white/70 outline-none transition-colors hover:border-white/20 hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
            >
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-[rgb(52_211_153/0.6)] [animation-duration:2.4s] motion-reduce:hidden" />
                <span className="relative size-2 rounded-full bg-[rgb(52_211_153)] shadow-[0_0_8px_rgb(52_211_153/0.8)]" />
              </span>
              All systems normal
              <span className="font-mono text-[11px] text-white/55">99.98% · 90d</span>
            </a>
          </div>

          <section aria-labelledby="footer-big-newsletter">
            <h2 id="footer-big-newsletter" className="text-lg font-semibold tracking-[-0.02em] text-white">
              The Dispatch
            </h2>
            <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-white/55">
              Once a month: what shipped, what broke, and what we learned fixing it. 11,400 engineers read it.
            </p>
            <Newsletter onJoined={() => setJoined(true)} />
          </section>
        </div>

        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 py-14 sm:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">{column.title}</h2>
              <ul className="mt-3 sm:mt-3.5">
                {column.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="inline-flex items-center gap-2 rounded-md py-2 text-sm text-white/65 outline-none sm:py-1.5 transition-colors duration-150 hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                    >
                      {link}
                      {link === "Careers" && (
                        <span className="rounded-full border border-[rgb(var(--neon)/0.3)] px-1.5 font-mono text-[10px] leading-4 text-[rgb(var(--neon))]">
                          4 open
                        </span>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-6 border-t border-white/[0.07] py-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-5 text-xs text-white/55">
            <span className="w-full text-white/60 sm:w-auto">© 2026 Halcyon Labs, Inc.</span>
            {LEGAL.map((item) => (
              <a
                key={item}
                href="#"
                className="rounded-md py-2.5 outline-none transition-colors hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
              >
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {SOCIAL.map((item) => (
              <a
                key={item.label}
                href="#"
                aria-label={item.label}
                className="grid size-9 place-items-center rounded-lg text-white/45 outline-none transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
              >
                <svg aria-hidden viewBox="0 0 24 24" className="size-4 fill-current">
                  <path d={item.path} />
                </svg>
              </a>
            ))}
            <a
              href="#"
              aria-label="Blog RSS feed"
              className="grid size-9 place-items-center rounded-lg text-white/45 outline-none transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
            >
              <Rss aria-hidden className="size-4" />
            </a>
          </div>
        </div>
      </div>

      {/* The name bent in glass tube along the bottom edge. Hover lights it; subscribing leaves it on. */}
      <style>{`
        .nk-footer-big-glass { -webkit-text-stroke: max(1.5px, 0.006em) rgb(var(--neon) / 0.3); }
        .nk-footer-big-tube {
          -webkit-text-stroke: max(1.5px, 0.006em) color-mix(in srgb, rgb(var(--neon)) 35%, white);
          filter: drop-shadow(0 0 1px rgb(var(--neon))) drop-shadow(0 0 8px rgb(var(--neon) / 0.85)) drop-shadow(0 0 28px rgb(var(--neon) / 0.45));
        }
        @keyframes nk-footer-big-ignite { 0% { opacity: 0; } 10% { opacity: 0.9; } 18% { opacity: 0.1; } 30% { opacity: 1; } 38% { opacity: 0.35; } 55%, 100% { opacity: 1; } }
        .nk-footer-big-on { animation: nk-footer-big-ignite 800ms linear both; }
        @media (prefers-reduced-motion: reduce) { .nk-footer-big-on { animation: none; } }
      `}</style>
      <div
        aria-hidden
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        className="relative -mb-[0.09em] select-none px-4 pt-6 text-center text-[clamp(4.5rem,24vw,22rem)] font-bold leading-[0.78] tracking-[-0.02em] text-transparent"
      >
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 -z-10 bg-[radial-gradient(50%_60%_at_50%_85%,rgb(var(--neon)/0.13),transparent)] transition-opacity duration-500"
          style={{ opacity: lit ? 1 : 0 }}
        />
        <span className="nk-footer-big-glass block">halcyon</span>
        {lit && <span className="nk-footer-big-tube nk-footer-big-on absolute inset-x-4 bottom-0 block">halcyon</span>}
      </div>
    </footer>
  );
}
