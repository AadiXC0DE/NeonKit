"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { windowHour } from "./config";

export const focusRing =
  "outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]";

/** Mono label above a heading. `clock` is the time of night the section stands for. */
export function Eyebrow({
  clock,
  children,
  className,
}: {
  clock?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("font-mono text-[11px] uppercase tracking-[0.16em] text-white/60", className)}>
      {clock && (
        <>
          <span className="tabular-nums text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.55)]">
            {clock}
          </span>
          <span aria-hidden className="mx-2 text-white/30">
            /
          </span>
        </>
      )}
      {children}
    </p>
  );
}

/** A crescent with one star: the night shift. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M14.5 3.6a8.6 8.6 0 1 0 6 14.4 7 7 0 0 1-6-14.4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
        style={{ filter: "drop-shadow(0 0 3px rgb(var(--neon)))" }}
      />
      <circle cx="18.6" cy="6.2" r="1.25" fill="currentColor" />
    </svg>
  );
}

const everyNight = [true, true, true, true, true, true, true];

/**
 * Seconds until the next deploy window opens, local time. `nights` is indexed
 * like `Date#getDay()` (0 is Sunday). Null until mounted, so server and client
 * agree, and null when no night is selected.
 */
export function useWindowCountdown(hour = windowHour, nights: boolean[] = everyNight) {
  const [left, setLeft] = React.useState<number | null>(null);
  const key = nights.map(Number).join("");

  React.useEffect(() => {
    const tick = () => {
      const now = new Date();
      for (let offset = 0; offset < 8; offset++) {
        const target = new Date(now);
        target.setDate(now.getDate() + offset);
        target.setHours(hour, 0, 0, 0);
        if (target > now && key[target.getDay()] === "1") {
          setLeft(Math.round((target.getTime() - now.getTime()) / 1000));
          return;
        }
      }
      setLeft(null);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [hour, key]);

  return left;
}

export function formatCountdown(seconds: number | null) {
  if (seconds === null) return "--:--:--";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(seconds / 3600))}:${pad(Math.floor((seconds % 3600) / 60))}:${pad(seconds % 60)}`;
}

/** True once the element has scrolled past the top of the viewport (or never been seen yet, false). */
export function usePastElement(id: string) {
  const [past, setPast] = React.useState(false);

  React.useEffect(() => {
    const node = document.getElementById(id);
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      setPast(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [id]);

  return past;
}
