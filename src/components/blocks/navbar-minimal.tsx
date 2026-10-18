"use client";

import * as React from "react";
import { ArrowRight, Menu } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const LOG = [
  { time: "06:42", text: "Kestrel hovering, NE ridge." },
  { time: "06:51", text: "Second bird stoops, misses." },
  { time: "07:08", text: "Wind backs west. Cloud 3/8." },
];

const LINKS = [
  { label: "Notebooks", href: "#notebooks" },
  { label: "Field kit", href: "#field-kit" },
  { label: "Pricing", href: "#pricing" },
  { label: "Journal", href: "#journal" },
];

// A lit tube: near-white core, colored halo.
const tube =
  "bg-[color-mix(in_srgb,rgb(var(--neon))_35%,white)] shadow-[0_0_3px_rgb(var(--neon)),0_0_10px_rgb(var(--neon)/0.8),0_0_26px_rgb(var(--neon)/0.45)]";

function Wordmark() {
  return (
    <a
      href="#top"
      className="flex items-center gap-2.5 rounded-md py-1.5 text-[17px] font-semibold tracking-[-0.02em] text-white/90 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]"
    >
      {/* A kestrel hovering: two wing strokes over a tail. */}
      <svg aria-hidden viewBox="0 0 24 24" className="size-6" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.8 10.2C5.6 7.4 9.4 8 12 11.6 14.6 8 18.4 7.4 22.2 10.2" stroke="rgb(255 255 255 / 0.85)" strokeWidth={1.6} />
        <path d="M12 11.6 10.4 19M12 11.6 13.6 19" stroke="rgb(255 255 255 / 0.85)" strokeWidth={1.6} />
        <circle cx="12" cy="7" r="1.4" fill="rgb(var(--neon))" style={{ filter: "drop-shadow(0 0 3px rgb(var(--neon)))" }} />
      </svg>
      Kestrel
    </a>
  );
}

export default function NavbarMinimal() {
  const [active, setActive] = React.useState(LINKS[0].href);
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <div
      // Change the color here; everything inside follows it.
      style={neonVars("amber")}
      className="relative isolate min-h-[420px] overflow-hidden bg-[#05060a] text-white"
    >
      <header className="relative z-10 border-b border-white/[0.07]">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-10 px-5 sm:px-8">
          <Wordmark />

          <nav aria-label="Main" className="hidden h-full md:block">
            <ul className="flex h-full items-center gap-1">
              {LINKS.map((link) => {
                const current = link.href === active;
                return (
                  <li key={link.href} className="relative flex h-full items-center">
                    <a
                      href={link.href}
                      aria-current={current ? "page" : undefined}
                      onClick={() => setActive(link.href)}
                      className={cn(
                        "group rounded-md px-3 py-1.5 text-sm outline-none transition-colors duration-150",
                        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                        current ? "text-white" : "text-white/55 hover:text-white/90",
                      )}
                    >
                      {link.label}
                      {/* Sits on the header's hairline: unlit glass on hover, lit when current. */}
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-x-3 -bottom-px h-[2px] origin-center rounded-full transition-[opacity,transform,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                          current
                            ? cn(tube, "scale-x-100 opacity-100")
                            : "scale-x-50 bg-[rgb(var(--neon)/0.16)] opacity-0 group-hover:scale-x-100 group-hover:opacity-100",
                        )}
                      />
                      <span
                        aria-hidden
                        className={cn(
                          "pointer-events-none absolute -bottom-6 left-1/2 h-12 w-24 -translate-x-1/2 rounded-[50%] bg-[rgb(var(--neon)/0.22)] blur-[18px] transition-opacity duration-300",
                          current ? "opacity-100" : "opacity-0",
                        )}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-4">
            <a
              href="#sign-in"
              className="hidden rounded-md px-2 py-1.5 text-sm text-white/55 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] sm:block"
            >
              Sign in
            </a>
            <Button asChild variant="solid" size="sm" className="hidden px-3.5 shadow-[0_0_0_1px_rgb(var(--neon)),inset_0_1px_0_rgb(255_255_255/0.45)] sm:inline-flex">
              <a href="#start">Start a notebook</a>
            </Button>

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open menu" className="-mr-2 md:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" size="sm">
                <SheetHeader>
                  <SheetTitle className="text-[13px] font-normal text-white/55">Menu</SheetTitle>
                </SheetHeader>
                <nav aria-label="Mobile" className="mt-10">
                  <ul className="grid gap-1">
                    {LINKS.map((link) => {
                      const current = link.href === active;
                      return (
                        <li key={link.href}>
                          <SheetClose asChild>
                            <a
                              href={link.href}
                              aria-current={current ? "page" : undefined}
                              onClick={() => setActive(link.href)}
                              className={cn(
                                "flex items-baseline gap-4 rounded-lg py-2 text-[40px] font-[620] leading-[1.05] tracking-[-0.04em] outline-none transition-colors [font-stretch:112%]",
                                "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                                current
                                  ? "[color:color-mix(in_srgb,rgb(var(--neon))_40%,white)] [text-shadow:0_0_14px_rgb(var(--neon)/0.55),0_0_40px_rgb(var(--neon)/0.25)]"
                                  : "text-white/80 hover:text-white",
                              )}
                            >
                              {link.label}
                            </a>
                          </SheetClose>
                        </li>
                      );
                    })}
                  </ul>
                </nav>
                <div className="mt-auto grid gap-2 border-t border-white/[0.07] pt-6">
                  <Button asChild variant="solid" size="lg">
                    <a href="#start" onClick={() => setMenuOpen(false)}>
                      Start a notebook <ArrowRight />
                    </a>
                  </Button>
                  <Button asChild variant="ghost" size="lg">
                    <a href="#sign-in" onClick={() => setMenuOpen(false)}>
                      Sign in
                    </a>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* A slice of the page underneath, so the nav reads in context. */}
      <div
        aria-hidden
        className="pointer-events-none mx-auto grid max-w-6xl select-none gap-12 px-5 pb-6 pt-14 [mask-image:linear-gradient(to_bottom,#000_55%,transparent)] sm:px-8 sm:pt-20 lg:grid-cols-12"
      >
        <div className="lg:col-span-8">
          <p className="text-[clamp(2.4rem,6vw,4.4rem)] font-[620] leading-[0.96] tracking-[-0.045em] text-white/90 [font-stretch:112%]">
            Write it down
            <br />
            before the light goes.
          </p>
          <p className="mt-6 max-w-[44ch] text-[17px] leading-[1.6] text-white/60">
            Notebooks that work offline at the trailhead, timestamp every observation and sync when you&apos;re back in range.
          </p>
        </div>
        <div className="hidden self-end lg:col-span-4 lg:block">
          <p className="flex items-baseline justify-between text-[13px] text-white/55">
            Ridge survey, day 4<span className="text-white/50">Offline</span>
          </p>
          <ul className="mt-3 border-t border-white/[0.08] text-sm">
            {LOG.map((entry) => (
              <li key={entry.time} className="flex gap-4 border-b border-white/[0.06] py-2.5">
                <span className="font-mono text-[13px] leading-5 text-[rgb(var(--neon)/0.85)]">{entry.time}</span>
                <span className="leading-5 text-white/65">{entry.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
