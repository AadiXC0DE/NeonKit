"use client";

import * as React from "react";
import { ArrowRight } from "lucide-react";
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
  { value: "9 ms", label: "p50 cold start" },
  { value: "300 ms", label: "rollback" },
  { value: "3 free", label: "projects, forever" },
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
    <div className="relative mt-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] px-4 py-4 sm:px-5">
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -left-10 -top-16 h-40 w-64 rounded-full bg-[rgb(var(--neon)/0.14)] blur-[50px] transition-opacity duration-700",
          done ? "opacity-100" : "opacity-0",
        )}
      />
      <div className="relative flex items-end justify-between gap-4" aria-live="polite">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
          {done ? "Deployed in" : "Waiting for deploy"}
          <span
            className={cn(
              "mt-1 block font-sans text-3xl font-semibold normal-case tracking-[-0.03em] transition-[color,text-shadow] duration-500",
              done
                ? "[color:color-mix(in_srgb,rgb(var(--neon))_35%,white)] [text-shadow:0_0_14px_rgb(var(--neon)/0.6),0_0_40px_rgb(var(--neon)/0.3)]"
                : "text-white/20",
            )}
          >
            {done ? "4.2s" : "0.0s"}
          </span>
        </p>
        <p className="pb-1 text-right font-mono text-[11px] text-white/55">
          <span className={done ? "text-white/85" : undefined}>{done ? REGIONS.length : 0}</span>/{REGIONS.length} regions healthy
        </p>
      </div>
      <div aria-hidden className="relative mt-4 grid grid-cols-[repeat(19,minmax(0,1fr))] gap-[3px] sm:grid-cols-[repeat(38,minmax(0,1fr))]">
        {REGIONS.map((region, i) => (
          <span
            key={region}
            title={region}
            className={cn(
              "h-3 rounded-[1.5px] transition-[background-color,box-shadow] duration-300 sm:h-6",
              done
                ? "bg-[rgb(var(--neon)/0.85)] shadow-[0_0_5px_rgb(var(--neon)/0.55)]"
                : "bg-[rgb(var(--neon)/0.12)]",
            )}
            style={{ transitionDelay: done ? `${i * 22}ms` : "0ms" }}
          />
        ))}
      </div>
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
      <div aria-hidden className="absolute right-[-10%] top-[10%] -z-10 h-[520px] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.07),transparent)]" />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1fr_minmax(0,540px)] lg:gap-16">
        <div>
          <a
            href="#changelog"
            className="group inline-flex min-h-9 items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 sm:min-h-0 text-xs text-white/60 outline-none transition-colors hover:border-white/20 hover:text-white/90 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            <span className="rounded-full bg-[rgb(var(--neon)/0.14)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[rgb(var(--neon))]">
              v3.8
            </span>
            Rollbacks now take 300 ms
            <ArrowRight aria-hidden className="size-3 transition-transform group-hover:translate-x-0.5" />
          </a>

          <h1
            id="fluxline-hero-title"
            className="mt-7 text-[clamp(3rem,7.5vw,6rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-white/95"
          >
            38 regions.
            <br />
            4.2 seconds.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/55 sm:text-lg">
            Fluxline builds your app once, ships it to every edge region in parallel and only flips traffic when all 38
            report healthy. The last build stays warm, so a rollback is one command.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild variant="solid" size="lg" className="shadow-[0_0_0_1px_rgb(var(--neon)),inset_0_1px_0_rgb(255_255_255/0.45)]">
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

          <dl className="mt-12 grid max-w-md grid-cols-3 border-t border-white/[0.07] pt-5">
            {STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="mt-0.5 font-mono text-[11px] text-white/55">{stat.label}</dt>
                <dd className="text-lg font-semibold tracking-[-0.02em] text-white/90">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="min-w-0">
          {/* Title and Replay are lifted to AA here; the Terminal's own bar text sits at white/35–40. */}
          <Terminal
            ref={terminalRef}
            title={<span className="text-white/55">~/atlas-web — zsh</span>}
            lines={SESSION}
            typingSpeed={45}
            className="min-h-[284px] [&_button]:text-white/60"
          />
          <Readout done={done} />
        </div>
      </div>
    </section>
  );
}
