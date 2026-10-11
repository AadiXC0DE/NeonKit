"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeonText } from "@/components/ui/neon-text";
import { Switch } from "@/components/ui/switch";
import { neonVars } from "@/lib/neon";

function Screw({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={`absolute size-[7px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#3b404d,#101219)] shadow-[0_0_0_1px_rgb(255_255_255/0.05)] ${className}`}
    />
  );
}

export default function HeroSign() {
  const [on, setOn] = React.useState(true);

  return (
    <section
      // Change the sign's color here; everything inside follows it.
      style={neonVars("magenta")}
      className="relative isolate flex min-h-[720px] flex-col overflow-hidden bg-[#05060a] px-6 py-10 text-white sm:px-10">
      {/* Wall and the light the sign throws on it */}
      <div aria-hidden className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_70%_55%_at_50%_40%,#10121b,#05060a_72%)]" />
      <div
        aria-hidden
        className="absolute left-1/2 top-[38%] -z-10 h-[50%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] bg-[rgb(var(--neon-accent)/0.16)] blur-[100px] transition-opacity duration-300"
        style={{ opacity: on ? 1 : 0 }}
      />

      <header className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/40">
        <span>Nightshift</span>
        <Switch size="sm" checked={on} onCheckedChange={setOn} label={<span className="text-xs uppercase tracking-[0.2em] text-white/40">Power</span>} />
      </header>

      <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="relative rounded-[24px] border border-white/[0.05] px-8 pb-6 pt-3 sm:px-14">
          <Screw className="left-3 top-3" />
          <Screw className="right-3 top-3" />
          <Screw className="bottom-3 left-3" />
          <Screw className="bottom-3 right-3" />
          <NeonText as="h1" on={on} buzz className="text-[clamp(3.5rem,13vw,9rem)] font-light leading-none tracking-tight">
            nightshift
          </NeonText>
        </div>
        <p className="mt-10 max-w-md text-balance text-lg leading-relaxed text-white/60">
          Deploys that land at 2am so you don&apos;t have to be awake for them. Queue it, close the laptop, read the
          report with coffee.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="solid" size="lg">
            Start free <ArrowRight />
          </Button>
          <Button variant="ghost" size="lg">
            See how it works
          </Button>
        </div>
      </div>
    </section>
  );
}
