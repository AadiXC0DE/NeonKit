"use client";

import * as React from "react";

import { NeonText } from "@/components/ui/neon-text";
import { cn } from "@/lib/utils";

import { basePath, contact, event } from "./config";
import { useEvent, type Phase } from "./event-state";
import { sections } from "./header";

const STATES: { phase: Phase; label: string }[] = [
  { phase: "before", label: "Before doors" },
  { phase: "live", label: "On air" },
  { phase: "after", label: "After" },
];

const link =
  "rounded-md text-[14px] text-white/70 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]";

/** The sign stays dark until the footer scrolls into view, then strikes once. */
function useLitWhenSeen() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [lit, setLit] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setLit(true);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, lit] as const;
}

export function Footer() {
  const { phase, ready } = useEvent();
  const [signRef, lit] = useLitWhenSeen();

  return (
    <footer className="relative isolate overflow-hidden border-t border-white/[0.06] px-5 pb-10 pt-20 sm:px-8 lg:pt-28">
      <div
        aria-hidden
        className={cn(
          "absolute left-1/2 top-0 -z-10 h-[420px] w-[min(1100px,140vw)] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(var(--neon)/0.13),transparent)] transition-opacity duration-1000",
          lit ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="mx-auto max-w-[1176px]">
        <div ref={signRef} className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <NeonText
            on={lit}
            className="block text-[clamp(72px,17vw,220px)] leading-[0.85] tracking-[-0.02em]"
            style={{ fontFamily: "var(--font-tilt-neon, inherit)" }}
          >
            low light
          </NeonText>
          <div className="lg:pb-6 lg:text-right">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
              {event.city} · 19.03.2027
            </p>
            <p className="mt-2 text-[15px] text-white/75">See you after dark.</p>
          </div>
        </div>

        <div className="mt-16 grid gap-10 border-t border-white/[0.07] pt-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <p className="max-w-[34ch] text-[14px] leading-relaxed text-white/60">
            Low Light is a one-night event on interface craft, run by Studio Grauw in Rotterdam. Tickets are sold at cost;
            the bar pays for the stream.
          </p>
          <nav aria-label="Footer">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">The night</p>
            <ul className="mt-4 grid gap-2.5">
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className={link}>
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">Write to us</p>
            <ul className="mt-4 grid gap-2.5">
              <li>
                <a href={`mailto:${contact.email}`} className={link}>
                  {contact.email}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.press}`} className={link}>
                  {contact.press}
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">On the night</p>
            <address className="mt-4 text-[14px] not-italic leading-relaxed text-white/70">
              {event.venue}
              <br />
              {event.address}
            </address>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-white/60">© 2026 Low Light. The code of conduct applies in the hall and on the stream.</p>
          {/* Lets you see the page in each state. Remove it before you ship. */}
          <nav aria-label="Preview page state" className="flex flex-wrap items-center gap-x-1 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em]">
            <span className="mr-2 text-white/55">Preview</span>
            {STATES.map((state) => {
              const current = ready && phase === state.phase;
              return (
                <a
                  key={state.phase}
                  href={`${basePath}?state=${state.phase}`}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "rounded-full border px-2.5 py-1 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                    current
                      ? "border-[rgb(var(--neon)/0.5)] bg-[rgb(var(--neon)/0.08)] text-[color:color-mix(in_srgb,rgb(var(--neon))_45%,white)]"
                      : "border-white/10 text-white/60 hover:border-white/20 hover:text-white/85",
                  )}
                >
                  {state.label}
                </a>
              );
            })}
          </nav>
        </div>
      </div>
    </footer>
  );
}
