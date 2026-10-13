"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { TubeDivider } from "@/components/ui/tube-divider";
import { neonVars } from "@/lib/neon";
import { cn } from "@/lib/utils";

const LINKS = ["Docs", "Pricing", "Changelog", "Status", "Privacy"];

function BackToTop({ className }: { className: string }) {
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
      }}
      className={cn(
        "size-9 shrink-0 cursor-pointer place-items-center rounded-lg border border-white/10 text-white/50 outline-none transition-colors hover:border-[rgb(var(--neon)/0.5)] hover:text-[rgb(var(--neon))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
        className,
      )}
    >
      <ArrowUp aria-hidden className="size-4" />
    </button>
  );
}

export default function FooterMinimal() {
  const ref = React.useRef<HTMLElement>(null);
  const [lit, setLit] = React.useState(false);

  // The tube strikes the first time the footer scrolls into view.
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setLit(true);
      observer.disconnect();
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={ref}
      // Change the color here; everything inside follows it.
      style={neonVars("cyan")}
      className="relative isolate overflow-hidden bg-[#05060a] px-6 pb-10 pt-6 text-white/90 sm:px-10 lg:px-16"
    >
      <div className="mx-auto max-w-[1180px]">
        <TubeDivider size="sm" clips={false} on={lit} />

        <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
          <div className="flex items-center justify-between gap-6">
            <a
              href="#"
              aria-label="Ferrous home"
              className="group inline-flex items-center gap-3 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-[#05060a]"
            >
              {/* The element tile: iron, atomic number 26 */}
              <span
                aria-hidden
                className="relative grid size-9 place-items-center rounded-[8px] pt-1 border border-[rgb(var(--neon)/0.25)] bg-[rgb(var(--neon)/0.04)] font-mono text-[13px] font-medium text-[rgb(var(--neon))] transition-[border-color,box-shadow] duration-300 group-hover:border-[rgb(var(--neon)/0.7)] group-hover:shadow-[0_0_14px_-2px_rgb(var(--neon)/0.6),inset_0_0_8px_rgb(var(--neon)/0.15)]"
              >
                <span className="absolute left-[3px] top-[1px] text-[7px] leading-none text-[rgb(var(--neon)/0.8)]">26</span>
                Fe
              </span>
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-white">Ferrous</span>
            </a>
            <BackToTop className="grid lg:hidden" />
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/55">
              {LINKS.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="relative -my-2 inline-block rounded-md py-2 outline-none transition-colors duration-150 after:absolute after:inset-x-0 after:bottom-1 after:h-px after:scale-x-0 after:bg-[rgb(var(--neon))] after:shadow-[0_0_6px_rgb(var(--neon))] after:transition-transform after:duration-200 hover:text-white hover:after:scale-x-100 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] motion-reduce:after:transition-none"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            <p className="font-mono text-[11px] tracking-[0.04em] text-white/55">© 2026 Ferrous · Made in Rotterdam</p>
            <BackToTop className="hidden lg:grid" />
          </div>
        </div>
      </div>
    </footer>
  );
}
