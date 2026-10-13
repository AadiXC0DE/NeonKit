"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { basePath } from "./config";
import { formatCountdown, usePastElement, useWindowCountdown } from "./primitives";

/** True once the element's top edge has come into the viewport (and stays true below it). */
function useReached(id: string) {
  const [reached, setReached] = React.useState(false);
  React.useEffect(() => {
    const node = document.getElementById(id);
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) =>
      setReached(entry.isIntersecting || entry.boundingClientRect.top < 0),
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [id]);
  return reached;
}

/** A "Get started" bar for phones: it rises once the hero is gone and steps aside for the closing CTA. */
export function MobileBar() {
  const pastHero = usePastElement("top");
  const atCta = useReached("deploy");
  const left = useWindowCountdown();
  const show = pastHero && !atCta;

  return (
    <div
      inert={!show}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none md:hidden",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-full opacity-0",
      )}
    >
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#0a0b11]/90 py-2 pl-4 pr-2 shadow-[0_-12px_40px_-12px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.05)] backdrop-blur-[14px]">
        <p className="min-w-0 font-mono text-[11px] uppercase leading-4 tracking-[0.12em] text-white/60">
          Next window
          <span className="block text-[13px] tabular-nums tracking-[0.04em] text-white/90">
            {formatCountdown(left)}
          </span>
        </p>
        <Button asChild variant="solid" size="md" className="rounded-xl">
          <Link href={`${basePath}/pricing`}>
            Get started <ArrowRight aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
