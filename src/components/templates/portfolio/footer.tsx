"use client";

import * as React from "react";
import { ArrowUp } from "lucide-react";
import { Kbd } from "@/components/ui/kbd";
import { brand, city } from "./config";
import { useLights } from "./lights";

export function Footer() {
  const { on } = useLights();

  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-10 text-sm text-white/60 sm:px-10 md:flex-row md:items-center md:justify-between">
        <p>
          © 2026 {brand} · {city}
        </p>
        <p className="hidden items-center gap-2 md:flex">
          Press <Kbd listen="l" size="sm">L</Kbd> to switch the lights {on ? "off" : "on"}.
        </p>
        <a
          href="#top"
          className="flex w-fit items-center gap-1.5 rounded-md text-white/70 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          Back to top <ArrowUp aria-hidden className="size-3.5" />
        </a>
      </div>
    </footer>
  );
}
