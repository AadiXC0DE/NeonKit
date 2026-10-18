"use client";

import * as React from "react";
import { Menu } from "@/components/ui/icons";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { availability, brand, sections } from "./config";
import { useLights } from "./lights";

type SectionId = (typeof sections)[number]["id"];

// The link for whichever section holds the middle of the viewport lights up.
function useActiveSection() {
  const [active, setActive] = React.useState<SectionId | null>(null);

  React.useEffect(() => {
    const nodes = sections
      .map((section) => document.getElementById(section.id))
      .filter((node): node is HTMLElement => Boolean(node));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        }
      },
      { rootMargin: "-45% 0px -54% 0px" },
    );
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);

  return active;
}

function LightsSwitch({ className }: { className?: string }) {
  const { on, setOn } = useLights();
  return (
    <Switch
      size="sm"
      checked={on}
      onCheckedChange={setOn}
      className={className}
      label={
        <span className="text-[13px] text-white/70">
          Lights<span className="sr-only"> (shortcut: L)</span>
        </span>
      }
    />
  );
}

export function Header() {
  const { on } = useLights();
  const active = useActiveSection();
  const [scrolled, setScrolled] = React.useState(false);
  const [menuOpen, setMenuOpen] = React.useState(false);

  // The sheet locks page scroll while it's open, so close it first and jump once it has slid away.
  const jumpTo = (id: string) => {
    setMenuOpen(false);
    window.setTimeout(() => {
      const target = document.getElementById(id);
      if (!target) return;
      history.replaceState(null, "", `#${id}`);
      target.scrollIntoView({ behavior: "auto" });
    }, 260);
  };

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color] duration-300",
        scrolled ? "border-white/[0.07] bg-[#05060a]/85 backdrop-blur-[12px]" : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-5 sm:px-10">
        <a
          href="#top"
          className="group flex items-center gap-2.5 rounded-md text-[15px] font-medium tracking-[-0.01em] text-white/90 outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]"
        >
          <span
            aria-hidden
            className={cn(
              "size-2 rounded-full transition-[background-color,box-shadow] duration-500",
              on
                ? "bg-[color-mix(in_srgb,rgb(var(--neon))_60%,white)] shadow-[0_0_6px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/0.6)]"
                : "bg-white/15",
            )}
          />
          {brand}
        </a>

        <nav aria-label="Sections" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {sections.map((section) => {
              const current = active === section.id;
              return (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    aria-current={current ? "true" : undefined}
                    className={cn(
                      "relative block rounded-md px-3 py-2 text-sm outline-none transition-colors duration-200",
                      "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                      current ? "text-white" : "text-white/60 hover:text-white/90",
                    )}
                  >
                    {section.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-3 -bottom-px h-px rounded-full transition-opacity duration-300",
                        "bg-[color-mix(in_srgb,rgb(var(--neon))_55%,white)] shadow-[0_0_6px_rgb(var(--neon)),0_0_12px_rgb(var(--neon)/0.5)]",
                        current ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <LightsSwitch />
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger
              aria-label="Open menu"
              className="-mr-2 grid size-10 place-items-center rounded-lg text-white/70 outline-none transition-colors hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] md:hidden"
            >
              <Menu className="size-5" aria-hidden />
            </SheetTrigger>
            <SheetContent side="right" size="sm" className="bg-[#07080d]">
              <SheetHeader>
                <SheetTitle className="text-[15px] font-medium text-white/80">{brand}</SheetTitle>
                <SheetDescription className="sr-only">Jump to a section</SheetDescription>
              </SheetHeader>
              <nav aria-label="Sections" className="mt-10">
                <ol className="space-y-1">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        href={`#${section.id}`}
                        onClick={(event) => {
                          event.preventDefault();
                          jumpTo(section.id);
                        }}
                        className="block rounded-lg py-1.5 text-[40px] leading-[1.05] tracking-[-0.038em] text-white/90 outline-none transition-colors [font-stretch:112%] [font-weight:620] hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                      >
                        {section.label}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
              <p className="mt-auto pt-10 text-sm leading-6 text-white/60">{availability}.</p>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
