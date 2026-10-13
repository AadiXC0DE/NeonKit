"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { basePath, brand, sections } from "./config";
import { Mark, focusRing } from "./primitives";

const sectionLinks = sections.filter((s) => s.nav).map((s) => ({ label: s.label, href: `${basePath}#${s.id}` }));
// Pricing is its own page; it sits between the product and the proof.
const links = [
  ...sectionLinks.slice(0, 2),
  { label: "Pricing", href: `${basePath}/pricing` },
  ...sectionLinks.slice(2),
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  // Remembers the page the menu was opened on, so navigating closes it.
  const [openOn, setOpenOn] = React.useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (next: boolean) => setOpenOn(next ? pathname : null);
  const progressRef = React.useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    let frame = 0;
    const read = () => {
      frame = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 24);
      // Written straight to the DOM: no re-render per scroll event.
      if (progressRef.current)
        progressRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, window.scrollY / max) : 0})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const tight = scrolled || open;

  return (
    <header
      className="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-6 sm:pt-4"
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
    >
      <nav
        aria-label="Main"
        className={cn(
          "relative mx-auto flex items-center gap-4 rounded-full border transition-[max-width,height,padding,background-color,border-color,box-shadow] duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
          tight
            ? "h-12 max-w-[780px] border-white/10 bg-[#0a0b11]/85 pl-4 pr-1.5 shadow-[0_16px_40px_-16px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.05)] backdrop-blur-[14px]"
            : "h-14 max-w-[1120px] border-transparent bg-transparent px-2",
        )}
      >
        <Link
          href={basePath}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-full text-[15px] font-semibold tracking-[-0.02em] text-white/90",
            focusRing,
          )}
        >
          <Mark className="size-[22px] text-[color-mix(in_srgb,rgb(var(--neon))_45%,white)]" />
          {brand}
        </Link>

        <ul className="hidden flex-1 items-center justify-center gap-0.5 md:flex">
          {links.map((link) => {
            const current = link.href === pathname;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "relative block rounded-full px-3 py-1.5 text-sm transition-colors hover:bg-white/[0.05] hover:text-white",
                    current ? "text-white" : "text-white/65",
                    focusRing,
                  )}
                >
                  {link.label}
                  {current && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 -bottom-px h-px rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_45%,white)] shadow-[0_0_6px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.6)]"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Button asChild variant="ghost" size="sm" className="hidden rounded-full px-3 lg:inline-flex">
            <Link href="#">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant={scrolled ? "solid" : "outline"} className="rounded-full px-3.5">
            <Link href={`${basePath}/pricing`}>
              Get started <ArrowRight aria-hidden className="hidden sm:block" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nightshift-menu"
            onClick={() => setOpen(!open)}
            className="size-9 rounded-full md:hidden"
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>

        {/* The hairline: unlit at the top, then it fills with reading progress. */}
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
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-8 -bottom-px h-px shadow-[0_0_8px_1px_rgb(var(--neon)/0.5),0_0_28px_2px_rgb(var(--neon)/0.22)] transition-opacity duration-500",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />
      </nav>

      {open && (
        <ul
          id="nightshift-menu"
          className="mx-auto mt-2 grid max-w-[780px] gap-0.5 rounded-2xl border border-white/10 bg-[#0a0b11] p-2 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.9)] md:hidden"
        >
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={link.href === pathname ? "page" : undefined}
                className={cn(
                  "block rounded-xl px-3 py-3 text-lg font-medium tracking-[-0.02em] text-white/85 hover:bg-white/[0.04] aria-[current=page]:text-[rgb(var(--neon))]",
                  focusRing,
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-1 border-t border-white/[0.06] pt-1">
            <Link
              href="#"
              className={cn(
                "block rounded-xl px-3 py-3 text-lg font-medium tracking-[-0.02em] text-white/60 hover:bg-white/[0.04]",
                focusRing,
              )}
            >
              Sign in
            </Link>
          </li>
        </ul>
      )}
    </header>
  );
}
