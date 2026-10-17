"use client";

import * as React from "react";
import { ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Haze } from "@/components/ui/haze";
import { Lasers } from "@/components/ui/lasers";
import { neonVars } from "@/lib/neon";

const START = 212;
// Saturday doesn't sell out on the page: it stops here.
const FLOOR = 180;

// A ticket going strikes the number like a lamp: a hot flash that settles back to white.
const css = `
@keyframes nk-cta-lasers-sold { 0% { color: rgb(var(--neon)); text-shadow: 0 0 2px #fff, 0 0 18px rgb(var(--neon)), 0 0 48px rgb(var(--neon) / 0.6); } 100% { color: #fff; text-shadow: none; } }
.nk-cta-lasers-sold { animation: nk-cta-lasers-sold 900ms cubic-bezier(0.23, 1, 0.32, 1) both; }
@media (prefers-reduced-motion: reduce) { .nk-cta-lasers-sold { animation: none; } }
`;

/** Tickets left. Someone buys one every 5 to 11 seconds while the section is on screen. */
function useTicketsLeft(ref: React.RefObject<HTMLElement | null>) {
  const [left, setLeft] = React.useState(START);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let inView = false;
    const schedule = () => {
      timer = setTimeout(() => {
        timer = undefined;
        setLeft((n) => Math.max(FLOOR, n - 1));
        schedule();
      }, 5000 + Math.random() * 6000);
    };
    const sync = () => {
      const run = inView && !document.hidden;
      if (run && !timer) schedule();
      else if (!run && timer) {
        clearTimeout(timer);
        timer = undefined;
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    io.observe(node);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      if (timer) clearTimeout(timer);
    };
  }, [ref]);

  return left;
}

export default function CtaLasers() {
  const ref = React.useRef<HTMLElement>(null);
  const left = useTicketsLeft(ref);

  return (
    <section
      ref={ref}
      aria-labelledby="cta-lasers-title"
      // Change the color here; everything inside follows it.
      style={neonVars("lime")}
      className="relative isolate overflow-hidden bg-[#05060a] px-5 pb-16 pt-[300px] text-white sm:px-8 sm:pb-20 sm:pt-[340px] lg:pb-24 lg:pt-[380px]"
    >
      <style>{css}</style>
      {/* Smoke first, so the beams have something to cut through, then the beams. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <Haze light="top" density={0.55} intensity={0.6} seed={4} />
        <Lasers origin="top" sources={2} beams={7} spread={64} intensity={0.85} haze={0.55} />
        <div className="absolute inset-x-0 bottom-0 h-[62%] bg-[linear-gradient(to_top,#05060a_30%,rgb(5_6_10/0.7)_65%,transparent)]" />
      </div>

      <div className="mx-auto grid max-w-[1240px] gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <h2
            id="cta-lasers-title"
            className="text-[clamp(3rem,8.4vw,7.75rem)] font-[620] leading-[0.92] tracking-[-0.05em] text-white [font-stretch:112%]"
          >
            <span key={left} className={left === START ? undefined : "nk-cta-lasers-sold"}>
              {left}
            </span>{" "}
            tickets left
            <br />
            for Saturday.
          </h2>
          <p className="mt-7 max-w-[46ch] text-pretty text-[17px] leading-[1.6] text-white/65">
            Nightshift at Maassilo, Rotterdam. 5 April, 22:00 till 08:00, 31&nbsp;acts on three floors.
          </p>
        </div>

        <div className="flex flex-col gap-4 lg:items-end lg:pb-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button asChild variant="solid" size="lg">
              <a href="#">
                Buy a ticket, €58 <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="ghost" size="lg">
              <a href="#">See the lineup</a>
            </Button>
          </div>
          <p className="text-[14px] text-white/60">Friday sold out in 41 minutes.</p>
        </div>
      </div>
    </section>
  );
}
