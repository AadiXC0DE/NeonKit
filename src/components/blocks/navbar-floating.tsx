"use client";

import * as React from "react";
import { ArrowRight, Menu, X } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const LINKS = [
  { label: "Overlay", href: "#overlay" },
  { label: "Pins", href: "#pins" },
  { label: "Pricing", href: "#pricing" },
  { label: "Changelog", href: "#changelog" },
];

const TEAMS = ["Halftone", "Orrery", "Bellwether", "Kiln & Co", "Tessellate"];

const FEATURES = [
  { title: "Overlay", stat: "0.5 px", body: "Drop the Figma frame on the live page and drag the split. Anything off by more than half a pixel lights up." },
  { title: "Pins on the DOM", stat: "1 click", body: "Comments attach to the element, not to a screenshot, so they survive the next deploy and the one after." },
  { title: "Fix tracking", stat: "14 min", body: "Parallax watches the preview URL and closes the thread when the fix lands. That's the median from pin to fix." },
];

const THREAD = [
  { who: "Maya Okafor", when: "13:41", text: "Radius is 10 in Figma, 8 here." },
  { who: "Dev Raman", when: "13:55", text: "Fixed in #2291, preview is up." },
];

function useScrolled(getTarget: () => HTMLElement | Window | null, threshold: number, onProgress?: (progress: number) => void) {
  const [scrolled, setScrolled] = React.useState(false);
  const progressRef = React.useRef(onProgress);
  React.useEffect(() => {
    progressRef.current = onProgress;
  });

  React.useEffect(() => {
    const target = getTarget();
    if (!target) return;
    const read = () => {
      const isWindow = target instanceof Window;
      const top = isWindow ? target.scrollY : target.scrollTop;
      const max = isWindow
        ? document.documentElement.scrollHeight - target.innerHeight
        : target.scrollHeight - target.clientHeight;
      setScrolled(top > threshold);
      progressRef.current?.(max > 0 ? Math.min(1, top / max) : 0);
    };
    read();
    target.addEventListener("scroll", read, { passive: true });
    return () => target.removeEventListener("scroll", read);
  }, [getTarget, threshold]);

  return scrolled;
}

function Wordmark() {
  return (
    <a
      href="#top"
      className="flex shrink-0 items-center gap-2 rounded-full py-2 pl-1 pr-1 text-[15px] font-semibold tracking-[-0.02em] text-white/90 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
    >
      {/* Two frames, one shifted: the parallax. */}
      <svg aria-hidden viewBox="0 0 24 24" className="size-[22px]" fill="none" strokeWidth={1.6}>
        <rect x="3" y="6" width="12" height="12" rx="3" stroke="rgb(255 255 255 / 0.7)" />
        <rect x="9" y="3" width="12" height="12" rx="3" stroke="rgb(var(--neon))" style={{ filter: "drop-shadow(0 0 3px rgb(var(--neon)))" }} />
      </svg>
      Parallax
    </a>
  );
}

export default function NavbarFloating() {
  const viewportRef = React.useRef<HTMLDivElement>(null);
  const progressRef = React.useRef<HTMLSpanElement>(null);
  const headerRef = React.useRef<HTMLElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // A tap anywhere outside the nav closes the menu.
  React.useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [menuOpen]);

  // The preview scrolls its own box. On a real page, return `window` here instead.
  const getScroller = React.useCallback(() => viewportRef.current, []);
  const scrolled = useScrolled(getScroller, 24, (progress) => {
    // Written straight to the DOM: no re-render per scroll event.
    if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
  });

  return (
    <div
      // Change the color here; everything inside follows it.
      style={neonVars("cyan")}
      className="relative isolate h-[640px] overflow-hidden bg-[#05060a] text-white"
    >
      <div ref={viewportRef} className="h-full overflow-y-auto [scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]">
        <header
          ref={headerRef}
          className="sticky top-0 z-20 px-4 pt-3 sm:px-8 sm:pt-5"
          onKeyDown={(event) => {
            if (event.key !== "Escape" || !menuOpen) return;
            setMenuOpen(false);
            menuButtonRef.current?.focus();
          }}
        >
          <nav
            aria-label="Main"
            className={cn(
              "relative mx-auto flex items-center gap-6 rounded-full border transition-[max-width,height,padding,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              scrolled || menuOpen
                ? "h-12 max-w-[720px] px-2 border-white/10 bg-[#0a0b11]/80 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.05)] backdrop-blur-[14px]"
                : "h-14 max-w-[1088px] border-transparent bg-transparent px-0",
            )}
          >
            <Wordmark />
            <ul className="hidden flex-1 items-center justify-center gap-1 md:flex">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="rounded-full px-3 py-1.5 text-sm text-white/60 outline-none transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="ml-auto flex items-center gap-1 md:ml-0">
              <Button
                asChild
                size="sm"
                variant={scrolled ? "solid" : "outline"}
                className={cn("rounded-full px-3.5", scrolled && "shadow-[0_0_0_1px_rgb(var(--neon)),inset_0_1px_0_rgb(255_255_255/0.45)]")}
              >
                <a href="#start">Start a review</a>
              </Button>
              <Button
                ref={menuButtonRef}
                variant="ghost"
                size="icon"
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                aria-controls="parallax-menu"
                onClick={() => setMenuOpen((open) => !open)}
                className="size-9 rounded-full md:hidden"
              >
                {menuOpen ? <X /> : <Menu />}
              </Button>
            </div>
            {/* The hairline: unlit until you scroll, then it fills with reading progress. */}
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-8 -bottom-px h-[1.5px] overflow-hidden rounded-full transition-opacity duration-500",
                scrolled ? "opacity-100" : "opacity-0",
              )}
            >
              <span className="absolute inset-0 bg-[rgb(var(--neon)/0.15)]" />
              <span
                ref={progressRef}
                className="absolute inset-0 origin-left bg-[linear-gradient(90deg,rgb(var(--neon)/0.5),color-mix(in_srgb,rgb(var(--neon))_30%,white))]"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
            {/* Its halo, kept outside the clipped line so it can spill onto the page below. */}
            <span
              aria-hidden
              className={cn(
                "pointer-events-none absolute inset-x-8 -bottom-px h-px shadow-[0_0_8px_1px_rgb(var(--neon)/0.55),0_0_28px_2px_rgb(var(--neon)/0.25)] transition-opacity duration-500",
                scrolled ? "opacity-100" : "opacity-0",
              )}
            />
          </nav>

          {menuOpen && (
            <ul
              id="parallax-menu"
              className="mx-auto mt-2 grid max-w-[720px] gap-0.5 rounded-2xl border border-white/10 bg-[#0a0b11] p-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] md:hidden"
            >
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-xl px-3 py-3 text-lg font-medium tracking-[-0.02em] text-white/85 outline-none hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </header>

        <main className="relative">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-[560px] bg-[radial-gradient(ellipse_60%_60%_at_70%_0%,rgb(var(--neon)/0.1),transparent_70%)]" />

          <section aria-labelledby="parallax-hero" className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-24">
            <h2 id="parallax-hero" className="text-[clamp(2.2rem,6.6vw,5.25rem)] font-[620] leading-[0.96] tracking-[-0.045em] text-white/90 [font-stretch:112%]">
              Review the build,
              <br />
              <span className="text-white/50">not the screenshot.</span>
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
              <p className="max-w-[48ch] text-[17px] leading-[1.6] text-white/60">
                Parallax lays the Figma frame over the deployed page, pins comments to real elements and tells you when the
                fix ships. <span className="text-white/90">Nobody types &ldquo;see attached&rdquo; again.</span>
              </p>
              <p className="text-[13px] text-white/50">Scroll the preview: the bar tightens.</p>
            </div>

            <div className="mt-14 grid gap-4 lg:grid-cols-[1fr_300px]">
              {/* A page under review, with the overlay split down the middle. */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-7">
                <div className="grid gap-3">
                  <div className="h-3 w-24 rounded-full bg-white/10" />
                  <div className="h-7 w-3/4 rounded-md bg-white/[0.07]" />
                  <div className="h-3 w-2/3 rounded-full bg-white/[0.05]" />
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-24 rounded-[10px] border border-white/[0.07] bg-white/[0.03]" />
                    ))}
                  </div>
                  <div className="relative mt-2 w-fit">
                    <div className="h-9 w-32 rounded-[10px] bg-white/[0.08]" />
                    {/* The diff: the live button is 2px tighter than the frame. */}
                    <div className="absolute -inset-1.5 rounded-xl border border-dashed border-[rgb(var(--neon)/0.6)]" />
                    <span className="absolute -right-4 top-1/2 translate-x-full -translate-y-1/2 whitespace-nowrap font-mono text-[10px] text-[rgb(var(--neon))]">
                      r 10 → 8
                    </span>
                    <span className="absolute -left-4 -top-4 grid size-6 place-items-center rounded-full bg-[rgb(var(--neon))] text-[11px] font-semibold text-[#05060a] shadow-[0_0_0_4px_rgb(var(--neon)/0.2),0_0_16px_rgb(var(--neon)/0.6)]">
                      1
                    </span>
                  </div>
                </div>
                <div className="absolute inset-y-0 left-[58%] w-px bg-[rgb(var(--neon)/0.7)] shadow-[0_0_10px_rgb(var(--neon)/0.6)]" />
                <span className="absolute left-[58%] top-4 flex -translate-x-1/2 gap-2.5 rounded-full border border-[rgb(var(--neon)/0.5)] bg-[#0a0b11] px-2.5 py-0.5 text-[11px] text-[rgb(var(--neon))]">
                  <span>Figma</span>
                  <span aria-hidden className="w-px bg-[rgb(var(--neon)/0.5)]" />
                  <span>Live</span>
                </span>

                <span className="absolute right-[12%] top-[44%] grid size-6 place-items-center rounded-full border border-[rgb(var(--neon)/0.5)] bg-[#0a0b11] text-[11px] font-semibold text-[rgb(var(--neon))]">
                  2
                </span>
              </div>
              <div className="flex flex-col rounded-2xl border border-white/10 bg-[#0a0b11] p-5">
                <p className="flex items-center justify-between text-[13px] text-white/55">
                  <span>
                    <span className="text-white/85">Pin 1</span> on Button
                  </span>
                  <span className="flex items-center gap-1.5 text-[rgb(52_211_153)]">
                    <span className="size-1.5 rounded-full bg-[rgb(52_211_153)] shadow-[0_0_6px_rgb(52_211_153)]" />
                    Fixed
                  </span>
                </p>
                <ul className="mt-4 grid gap-4 border-t border-white/[0.06] pt-4">
                  {THREAD.map((c) => (
                    <li key={c.when}>
                      <p className="flex justify-between text-xs text-white/55">
                        <span className="font-medium text-white/80">{c.who}</span>
                        <span className="font-mono tabular-nums">{c.when}</span>
                      </p>
                      <p className="mt-1 text-sm leading-5 text-white/65">{c.text}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-auto border-t border-white/[0.06] pt-4 text-[12px] leading-5 text-white/55">
                  Verified on <span className="font-mono text-white/75">preview-2291</span> at{" "}
                  <span className="font-mono text-white/75">14:02</span>
                </p>
              </div>
            </div>
          </section>

          <section aria-label="Teams using Parallax" className="mx-auto mt-20 max-w-6xl border-y border-white/[0.06] px-5 py-8 sm:px-8">
            <ul className="flex flex-wrap items-center justify-between gap-x-10 gap-y-4 text-white/55">
              {TEAMS.map((team, i) => (
                <li
                  key={team}
                  className={cn(
                    "text-lg",
                    i === 0 && "font-medium italic tracking-[-0.02em]",
                    i === 1 && "font-serif italic",
                    i === 2 && "font-semibold tracking-[-0.04em]",
                    i === 3 && "font-light tracking-[0.04em]",
                    i === 4 && "font-black tracking-[-0.06em]",
                  )}
                >
                  {team}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="parallax-features" className="mx-auto max-w-6xl px-5 py-24 sm:px-8">
            <h2 id="parallax-features" className="max-w-[24ch] text-[clamp(2rem,4vw,3rem)] font-[620] leading-[1] tracking-[-0.04em] text-white/90 [font-stretch:112%]">
              Three things, done properly.
            </h2>
            <dl className="mt-12 border-t border-white/[0.08]">
              {FEATURES.map((f) => (
                <div key={f.title} className="grid gap-2 border-b border-white/[0.08] py-7 sm:grid-cols-[minmax(0,5fr)_minmax(0,3fr)_minmax(0,6fr)] sm:items-baseline sm:gap-8">
                  <dt className="text-[15px] font-medium text-white/85 sm:order-2">{f.title}</dt>
                  <dd className="text-[clamp(2.25rem,5vw,3.5rem)] font-[620] leading-none tracking-[-0.045em] tabular-nums text-white/90 [font-stretch:112%] sm:order-1">
                    {f.stat}
                  </dd>
                  <dd className="max-w-[48ch] text-[15px] leading-[1.6] text-white/55 sm:order-3">{f.body}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section aria-labelledby="parallax-cta" className="mx-auto max-w-6xl px-5 pb-16 sm:px-8">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <h2 id="parallax-cta" className="text-[clamp(1.75rem,3.4vw,2.5rem)] font-[620] leading-[1.02] tracking-[-0.04em] text-white/90 [font-stretch:112%]">
                  Your next review starts with a URL.
                </h2>
                <p className="mt-3 text-[15px] text-white/55">Free for two editors, then $14 per editor a month.</p>
              </div>
              <Button asChild variant="solid">
                <a href="#start">
                  Paste a preview link <ArrowRight />
                </a>
              </Button>
            </div>
            <p className="mt-16 border-t border-white/[0.06] pt-6 text-[13px] text-white/50">© 2026 Parallax Labs. Made in Lisbon.</p>
          </section>
        </main>
      </div>
    </div>
  );
}
