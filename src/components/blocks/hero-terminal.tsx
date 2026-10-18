"use client";

import * as React from "react";
import { ArrowRight } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Terminal, type TerminalLine } from "@/components/ui/terminal";
import { cn } from "@/lib/utils";
import { neonVars } from "@/lib/neon";

const INSTALL = "npm i -g fluxline";

const SESSION: TerminalLine[] = [
  { kind: "input", text: INSTALL },
  { kind: "output", text: "added 1 package in 1.9s" },
  { kind: "input", text: "flux deploy --prod" },
  { kind: "output", text: "› Detected Vite 6 + React, pnpm workspace" },
  { kind: "output", text: "› Built in 1.84s   212 files   3.1 MB", delay: 700 },
  { kind: "output", text: "› Uploaded to origin in 0.62s", delay: 500 },
  { kind: "output", text: "› Propagating to 38 regions… all healthy", delay: 900 },
  { kind: "success", text: "✓ Live at https://atlas-web.flux.run  (4.2s)", delay: 400 },
];

const REGIONS = [
  "iad", "ord", "dfw", "sea", "sfo", "lax", "yyz", "mex", "gru", "scl", "bog", "lhr", "ams", "fra", "cdg",
  "mad", "mxp", "arn", "waw", "ist", "dxb", "bom", "del", "blr", "sin", "kul", "cgk", "bkk", "hkg", "tpe",
  "icn", "nrt", "kix", "syd", "mel", "akl", "jnb", "los",
];

const STATS = [
  { value: "9 ms", label: "Cold start, p50" },
  { value: "300 ms", label: "Rollback" },
  { value: "3", label: "Free projects, for good" },
];

// Watches the Terminal's data-state so the readout lights only once the deploy has actually printed.
function useTerminalDone(ref: React.RefObject<HTMLDivElement | null>) {
  const [done, setDone] = React.useState(false);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const read = () => setDone(node.getAttribute("data-state") === "done");
    read();
    const observer = new MutationObserver(read);
    observer.observe(node, { attributes: true, attributeFilter: ["data-state"] });
    return () => observer.disconnect();
  }, [ref]);
  return done;
}

function Readout({ done }: { done: boolean }) {
  return (
    <div aria-live="polite">
      <p className="text-[13px] text-white/55">{done ? "Live everywhere in" : "Waiting for the deploy"}</p>
      <p
        className={cn(
          "mt-2 text-[clamp(4rem,9vw,6.5rem)] font-[620] leading-[0.9] tracking-[-0.05em] tabular-nums transition-[color,text-shadow] duration-500 [font-stretch:112%]",
          done
            ? "[color:color-mix(in_srgb,rgb(var(--neon))_35%,white)] [text-shadow:0_0_4px_rgb(var(--neon)/0.6),0_0_36px_rgb(var(--neon)/0.35)]"
            : "text-white/15",
        )}
      >
        {done ? "4.2s" : "0.0s"}
      </p>
      <div aria-hidden className="mt-6 grid grid-cols-[repeat(19,minmax(0,1fr))] gap-[3px]">
        {REGIONS.map((region, i) => (
          <span
            key={region}
            title={region}
            className={cn(
              "h-4 rounded-[1.5px] transition-[background-color,box-shadow] duration-300",
              done
                ? "bg-[rgb(var(--neon)/0.85)] shadow-[0_0_5px_rgb(var(--neon)/0.5)]"
                : "bg-white/[0.06]",
            )}
            style={{ transitionDelay: done ? `${i * 22}ms` : "0ms" }}
          />
        ))}
      </div>
      <p className="mt-3 text-[13px] text-white/55">
        <span className={cn("font-mono tabular-nums", done ? "text-white/90" : "text-white/55")}>
          {done ? REGIONS.length : 0}/{REGIONS.length}
        </span>{" "}
        regions healthy
      </p>
    </div>
  );
}

export default function HeroTerminal() {
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const done = useTerminalDone(terminalRef);

  return (
    <section
      aria-labelledby="fluxline-hero-title"
      // Change the color here; everything inside follows it.
      style={neonVars("lime")}
      className="relative isolate overflow-hidden bg-[#05060a] text-white"
    >
      <div aria-hidden className="absolute bottom-[-10%] right-[-10%] -z-10 h-[620px] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.06),transparent)]" />

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
        <a
          href="#changelog"
          className="group -mx-1 inline-flex min-h-9 items-center gap-3 rounded-md px-1 text-[14px] text-white/60 outline-none transition-colors hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
        >
          <span className="font-mono text-[13px] text-[rgb(var(--neon))]">v3.8</span>
          Rollbacks now take 300 ms
          <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>

        <div className="mt-6 grid gap-8 lg:grid-cols-12 lg:items-end lg:gap-10">
          <h1
            id="fluxline-hero-title"
            className="text-[clamp(3.1rem,8.6vw,7.25rem)] font-[620] leading-[0.92] tracking-[-0.045em] text-white/95 [font-stretch:112%] lg:col-span-8"
          >
            38 regions.
            <br />
            <span className="text-white/50">4.2 seconds.</span>
          </h1>
          <div className="lg:col-span-4 lg:pb-2">
            <p className="max-w-[44ch] text-[17px] leading-[1.6] text-white/60">
              Fluxline builds once, ships to every edge region in parallel and flips traffic only when all 38 report
              healthy. The last build stays warm, so a rollback is one command.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Button asChild variant="solid" size="lg">
            <a href="#start">
              Deploy a project <ArrowRight />
            </a>
          </Button>
          <div className="flex h-12 items-center gap-2 rounded-xl border border-white/10 bg-[#0a0b11] pl-4 pr-1.5">
            <span aria-hidden className="select-none font-mono text-[13px] text-[rgb(var(--neon))]">
              $
            </span>
            <code className="font-mono text-[13px] text-white/80">{INSTALL}</code>
            <CopyButton value={INSTALL} size="sm" aria-label="Copy install command" />
          </div>
        </div>

        <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-10">
          <div className="min-w-0 lg:col-span-8">
            {/* Title and Replay are lifted to AA here; the Terminal's own bar text sits at white/35–40. */}
            <Terminal
              ref={terminalRef}
              title={<span className="text-white/55">~/atlas-web — zsh</span>}
              lines={SESSION}
              typingSpeed={45}
              className="min-h-[300px] [&_button]:text-white/60"
            />
          </div>

          <div className="grid gap-12 sm:grid-cols-2 sm:items-end sm:gap-10 lg:col-span-4 lg:flex lg:flex-col lg:items-stretch lg:justify-between">
            <Readout done={done} />
            <dl className="divide-y divide-white/[0.06] border-t border-white/[0.08] sm:border-t-0">
              {STATS.map((stat) => (
                <div key={stat.label} className="flex items-baseline justify-between py-3">
                  <dt className="text-[13px] text-white/55">{stat.label}</dt>
                  <dd className="text-[17px] font-medium tabular-nums tracking-[-0.01em] text-white/90">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
