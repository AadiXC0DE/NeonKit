"use client";

import * as React from "react";
import { Coffee, Heart, Moon, Music2, Wifi, Zap, type Icon } from "@/components/ui/icons";

const sign: { glyph: Icon; label: string }[] = [
  { glyph: Coffee, label: "Coffee" },
  { glyph: Wifi, label: "Wifi" },
  { glyph: Music2, label: "Music" },
  { glyph: Heart, label: "Heart" },
  { glyph: Moon, label: "Moon" },
  { glyph: Zap, label: "Zap" },
];

// Each tube strikes on its own beat, like a sign whose transformers warm up one by one.
const strikes = [
  { delay: 0, duration: 520 },
  { delay: 260, duration: 380 },
  { delay: 610, duration: 640 },
  { delay: 420, duration: 300 },
  { delay: 880, duration: 560 },
  { delay: 1120, duration: 820 },
];

/** Unlit glass, then the same glyph three times: a soft halo, the colored tube, a thin white-hot core. */
function Tube({ glyph: Glyph, on, delay, duration }: { glyph: Icon; on: boolean; delay: number; duration: number }) {
  return (
    <span aria-hidden className="relative block size-14 @lg:size-16">
      <Glyph className="absolute inset-0 size-full text-white/[0.13]" />
      <span
        className={on ? "nk-strike absolute inset-0" : "absolute inset-0 opacity-0"}
        style={{ animationDelay: `${delay}ms`, animationDuration: `${duration}ms` }}
      >
        <Glyph
          strokeWidth={2.5}
          className="absolute inset-0 size-full text-[rgb(var(--neon))] opacity-60 [filter:blur(7px)]"
        />
        <Glyph className="absolute inset-0 size-full text-[rgb(var(--neon))] [filter:drop-shadow(0_0_3px_rgb(var(--neon)/0.9))]" />
        <Glyph strokeWidth={0.6} className="absolute inset-0 size-full text-white/90" />
      </span>
    </span>
  );
}

export default function IconsPowerOn() {
  const ref = React.useRef<HTMLUListElement>(null);
  const [on, setOn] = React.useState(false);

  // Power on once the row is mostly in view; it stays lit after that.
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setOn(true);
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="@container w-full">
      <style>{`
        @keyframes nk-strike {
          0% { opacity: 0 } 6% { opacity: .8 } 11% { opacity: .05 } 19% { opacity: .95 } 24% { opacity: .2 }
          38% { opacity: 1 } 46% { opacity: .6 } 60%, 100% { opacity: 1 }
        }
        .nk-strike { animation-name: nk-strike; animation-timing-function: steps(1, end); animation-fill-mode: both }
        @media (prefers-reduced-motion: reduce) { .nk-strike { animation: none } }
      `}</style>
      <ul
        ref={ref}
        aria-label={on ? "Six icons, lit" : "Six icons, off"}
        className="mx-auto grid max-w-[38rem] grid-cols-3 justify-items-center gap-x-8 gap-y-12 @lg:grid-cols-6"
      >
        {sign.map(({ glyph, label }, i) => (
          <li key={label} aria-label={label}>
            <Tube glyph={glyph} on={on} {...strikes[i]} />
          </li>
        ))}
      </ul>
    </div>
  );
}
