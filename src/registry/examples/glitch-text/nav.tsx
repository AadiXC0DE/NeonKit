"use client";

import * as React from "react";
import { GlitchText } from "@/components/ui/glitch-text";

const links = ["Work", "Lab", "Archive", "Contact"];

export default function GlitchTextNav() {
  const [hot, setHot] = React.useState<string | null>(null);

  return (
    <nav aria-label="Studio" className="flex flex-wrap items-center justify-center gap-1">
      {links.map((link) => (
        <a
          key={link}
          href={`#${link.toLowerCase()}`}
          onPointerEnter={() => setHot(link)}
          onPointerLeave={() => setHot(null)}
          onFocus={() => setHot(link)}
          onBlur={() => setHot(null)}
          className="rounded-lg px-4 py-2 text-lg font-medium tracking-tight text-white/70 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent)/0.6)]"
        >
          <GlitchText trigger="manual" active={hot === link} intensity="subtle">
            {link}
          </GlitchText>
        </a>
      ))}
    </nav>
  );
}
