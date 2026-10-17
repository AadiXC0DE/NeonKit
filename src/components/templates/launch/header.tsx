"use client";

import * as React from "react";
import { ArrowRight, ArrowUpRight, Menu } from "@/components/ui/icons";

import { Button } from "@/components/ui/button";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { event } from "./config";
import { useEvent, type Phase } from "./event-state";
import { Wordmark } from "./wordmark";

export const sections = [
  { id: "speakers", label: "Speakers" },
  { id: "agenda", label: "Agenda" },
  { id: "venue", label: "Venue" },
  { id: "tickets", label: "Tickets" },
  { id: "faq", label: "FAQ" },
];

const cta: Record<Phase, { label: string; href: string; external?: boolean }> = {
  before: { label: "Take a number", href: "#waitlist" },
  live: { label: "Watch live", href: event.streamUrl, external: true },
  after: { label: "Watch the replay", href: event.replayUrl, external: true },
};

const tube =
  "bg-[color-mix(in_srgb,rgb(var(--neon))_35%,white)] shadow-[0_0_3px_rgb(var(--neon)),0_0_10px_rgb(var(--neon)/0.8),0_0_22px_rgb(var(--neon)/0.4)]";

function useActiveSection() {
  const [active, setActive] = React.useState<string | null>(null);

  React.useEffect(() => {
    const nodes = sections.map(({ id }) => document.getElementById(id)).filter((node): node is HTMLElement => !!node);
    const visible = new Map<string, boolean>();
    // A band across the upper middle of the viewport: whichever section crosses it is the one being read.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) visible.set(entry.target.id, entry.isIntersecting);
        setActive(sections.find(({ id }) => visible.get(id))?.id ?? null);
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  return active;
}

export function Header() {
  const { phase, ready } = useEvent();
  const active = useActiveSection();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const action = cta[ready ? phase : "before"];

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The link is written out inline under each Button: the shadcn CLI turns `asChild` into Base UI's
  // `render={<a />}` in base-* projects, and it only can when the child is a JSX element, not a variable.
  const linkProps = { href: action.href, ...(action.external ? { target: "_blank", rel: "noreferrer" } : {}) };
  const linkIcon = action.external ? <ArrowUpRight aria-hidden /> : <ArrowRight aria-hidden />;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300",
        scrolled
          ? "border-white/[0.07] bg-[#05060a]/80 backdrop-blur-[12px]"
          : "border-transparent bg-[#05060a]/0",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1240px] items-center gap-8 px-5 sm:px-8">
        <a
          href="#top"
          aria-label="low light '27, back to top"
          className="rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]"
        >
          <Wordmark />
        </a>

        <nav aria-label="Sections" className="ml-auto hidden h-full md:block">
          <ul className="flex h-full items-center gap-1">
            {sections.map((section) => {
              const current = section.id === active;
              return (
                <li key={section.id} className="relative flex h-full items-center">
                  <a
                    href={`#${section.id}`}
                    aria-current={current ? "location" : undefined}
                    className={cn(
                      "group rounded-md px-3 py-1.5 text-sm outline-none transition-colors duration-150",
                      "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                      current ? "text-white" : "text-white/60 hover:text-white/90",
                    )}
                  >
                    {section.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-3 -bottom-px h-[2px] rounded-full transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                        current ? cn(tube, "scale-x-100 opacity-100") : "scale-x-50 bg-[rgb(var(--neon)/0.16)] opacity-0 group-hover:scale-x-100 group-hover:opacity-100",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <Button asChild variant="solid" size="sm" className="hidden px-3.5 sm:inline-flex">
            <a {...linkProps}>
              {action.label}
              {linkIcon}
            </a>
          </Button>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu" className="-mr-2 md:hidden">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" size="sm" className="bg-[#05060a]">
              <SheetHeader>
                <SheetTitle className="text-[14px] font-normal text-white/60">
                  Low Light 2027, {event.shortDate}
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Sections" className="mt-10">
                <ul className="grid gap-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <SheetClose asChild>
                        <a
                          href={`#${section.id}`}
                          className="block rounded-lg py-1.5 text-[40px] font-[640] leading-[1.05] tracking-[-0.04em] text-white/85 outline-none transition-colors [font-stretch:112%] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                        >
                          {section.label}
                        </a>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto border-t border-white/[0.07] pt-6">
                <p className="mb-4 text-[14px] text-white/60">
                  {event.venue}, {event.address}
                </p>
                <Button asChild variant="solid" size="lg" className="w-full" onClick={() => setMenuOpen(false)}>
                  <a {...linkProps}>
                    {action.label}
                    {linkIcon}
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
