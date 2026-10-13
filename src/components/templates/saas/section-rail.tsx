"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { sections } from "./config";
import { focusRing, usePastElement } from "./primitives";

const toMinutes = (clock: string) => {
  const [h, m] = clock.split(":").map(Number);
  // Past midnight keeps counting, so the night interpolates forward.
  return (h < 12 ? h + 24 : h) * 60 + m;
};

// Where the night starts, at the top of the hero.
const DUSK = toMinutes("21:40");

/**
 * A thin rail of section names down the left edge on wide screens. Each lights
 * as you pass it, and the clock above it runs from dusk to 02:00 as you scroll.
 */
export function SectionRail() {
  const visible = usePastElement("top");
  const [active, setActive] = React.useState(-1);
  const clockRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const nodes = sections.map((s) => document.getElementById(s.id)).filter((n): n is HTMLElement => Boolean(n));
    const inBand = new Set<string>();
    // A thin band 40% down the viewport: whichever section crosses it is current.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inBand.add(entry.target.id);
          else inBand.delete(entry.target.id);
        }
        const index = sections.findIndex((s) => inBand.has(s.id));
        if (index >= 0) return setActive(index);
        // Between sections (or past the last one): the current one is the last that started above the band.
        const band = window.innerHeight * 0.4;
        setActive(nodes.reduce((found, node, i) => (node.getBoundingClientRect().top < band ? i : found), -1));
      },
      { rootMargin: "-40% 0px -59% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  React.useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = window.scrollY + window.innerHeight * 0.4;
      const stops = [
        { y: 0, m: DUSK },
        ...sections.map((s) => ({
          y: (document.getElementById(s.id)?.getBoundingClientRect().top ?? 0) + window.scrollY,
          m: toMinutes(s.clock),
        })),
      ];
      let minutes = stops[stops.length - 1].m;
      for (let i = 0; i < stops.length - 1; i++) {
        const a = stops[i];
        const b = stops[i + 1];
        if (y < b.y) {
          minutes = a.m + Math.max(0, Math.min(1, (y - a.y) / (b.y - a.y))) * (b.m - a.m);
          break;
        }
      }
      const whole = Math.floor(minutes);
      if (clockRef.current) {
        clockRef.current.textContent = `${String(Math.floor(whole / 60) % 24).padStart(2, "0")}:${String(whole % 60).padStart(2, "0")}`;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <nav
      aria-label="Sections"
      inert={!visible}
      className={cn(
        "fixed left-7 top-1/2 z-30 hidden -translate-y-1/2 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none min-[1360px]:block",
        visible ? "opacity-100" : "pointer-events-none -translate-x-2 opacity-0",
      )}
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/60">
        <span className="sr-only">Night clock </span>
        <span
          ref={clockRef}
          className="text-[13px] tabular-nums text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]"
        >
          21:40
        </span>
      </p>
      <ol className="relative mt-4 grid gap-1 border-l border-white/10 py-1">
        {/* The lit stretch of rail, down to the current section */}
        <span
          aria-hidden
          className="absolute -left-px top-0 w-px bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon))] transition-[height] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none"
          style={{ height: active < 0 ? 0 : `${((active + 0.5) / sections.length) * 100}%` }}
        />
        {sections.map((s, i) => {
          const current = i === active;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                aria-current={current ? "location" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md py-1.5 pl-4 pr-2 text-[12px] transition-colors duration-300",
                  current ? "text-white" : "text-white/60 hover:text-white/90",
                  focusRing,
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute -left-[3.5px] size-[6px] rounded-full transition-[background-color,box-shadow] duration-300",
                    current
                      ? "bg-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] shadow-[0_0_6px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.7)]"
                      : i < active
                        ? "bg-[rgb(var(--neon)/0.7)]"
                        : "bg-[#05060a] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.25)]",
                  )}
                />
                {s.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
