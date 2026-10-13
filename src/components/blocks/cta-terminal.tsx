"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { CopyButton } from "@/components/ui/copy-button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { neonVars } from "@/lib/neon";

const COMMANDS = {
  npm: "npm install -g @gantry/cli",
  pnpm: "pnpm add -g @gantry/cli",
  bun: "bun add -g @gantry/cli",
  yarn: "yarn global add @gantry/cli",
} as const;

type Manager = keyof typeof COMMANDS;

const SPECS = [
  { label: "Binary", value: "9.4 MB" },
  { label: "Cold start", value: "38 ms" },
  { label: "Runs on", value: "macOS, Linux, WSL" },
  { label: "License", value: "MIT" },
];

export default function CtaTerminal() {
  const [manager, setManager] = React.useState<Manager>("npm");
  const [copied, setCopied] = React.useState(false);
  // How much of the command is typed out; null means all of it.
  const [shown, setShown] = React.useState<number | null>(null);
  const timer = React.useRef<number | undefined>(undefined);
  const command = COMMANDS[manager];

  React.useEffect(() => () => window.clearInterval(timer.current), []);

  function choose(next: Manager) {
    setManager(next);
    window.clearInterval(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setShown(null);
    const length = COMMANDS[next].length;
    let n = 0;
    setShown(0);
    timer.current = window.setInterval(() => {
      n += 1;
      setShown(n >= length ? null : n);
      if (n >= length) window.clearInterval(timer.current);
    }, 22);
  }

  return (
    <section
      aria-labelledby="cta-terminal-title"
      // Change the color here; everything inside follows it.
      style={neonVars("lime")}
      className="relative isolate overflow-hidden bg-[#05060a] px-6 py-20 text-white/90 sm:px-10 sm:py-24 lg:px-16 lg:py-32"
    >
      <style>{`
        @keyframes nk-cta-terminal-caret { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }
        .nk-cta-terminal-caret { animation: nk-cta-terminal-caret 1.05s steps(1) infinite; }
        @keyframes nk-cta-terminal-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        .nk-cta-terminal-in { animation: nk-cta-terminal-in 260ms cubic-bezier(0.23, 1, 0.32, 1) both; }
        @media (prefers-reduced-motion: reduce) { .nk-cta-terminal-caret, .nk-cta-terminal-in { animation: none; } }
      `}</style>

      <div className="mx-auto max-w-[1180px]">
        <div className="flex items-center justify-between gap-6 border-b border-white/[0.07] pb-5 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
          <span>Gantry · v2.8.1</span>
          <a
            href="#"
            className="group -my-2.5 inline-flex items-center gap-1.5 rounded-md py-2.5 outline-none transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            Docs
            <ArrowUpRight aria-hidden className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>

        <h2
          id="cta-terminal-title"
          className="mt-14 max-w-[16ch] text-balance text-[clamp(2.6rem,7vw,6rem)] font-semibold leading-[0.93] tracking-[-0.045em] text-white lg:mt-20"
        >
          Containers up before you let go of Enter.
        </h2>

        <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)] lg:items-start lg:gap-20">
          <div className="min-w-0">
            <ToggleGroup
              aria-label="Package manager"
              size="sm"
              value={manager}
              onValueChange={(value) => value && choose(value as Manager)}
            >
              {(Object.keys(COMMANDS) as Manager[]).map((key) => (
                <ToggleGroupItem key={key} value={key} className="h-9 px-3 font-mono sm:h-6 sm:px-2.5">
                  {key}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            {/* Light from the prompt, pooling on the surface under it */}
            <div className="relative mt-4 max-w-[640px]">
              <div
                aria-hidden
                className="pointer-events-none absolute -inset-x-16 -bottom-24 top-1/2 -z-10 bg-[radial-gradient(50%_50%_at_50%_40%,rgb(var(--neon)/0.09),transparent)]"
              />
              <div className="relative flex h-16 items-center gap-3 rounded-2xl border border-[rgb(var(--neon)/0.22)] bg-[#0a0b11] pl-5 pr-2 shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_24px_60px_-24px_rgb(var(--neon)/0.35),inset_0_1px_0_rgb(255_255_255/0.05)] sm:h-[72px] sm:pl-6">
                <span
                  aria-hidden
                  className="absolute inset-x-8 -top-px h-px bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.8),transparent)]"
                />
                <span
                  aria-hidden
                  className="font-mono text-base text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.7)] sm:text-lg"
                >
                  $
                </span>
                <code className="flex min-w-0 flex-1 items-center overflow-hidden font-mono text-[13px] text-white/90 sm:text-[17px]">
                  <span className="sr-only">{command}</span>
                  <span aria-hidden className="truncate whitespace-pre">
                    {shown === null ? command : command.slice(0, shown)}
                  </span>
                  <span
                    aria-hidden
                    className="nk-cta-terminal-caret ml-0.5 inline-block h-[1.15em] w-[0.55em] shrink-0 bg-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/0.8)]"
                  />
                </code>
                <CopyButton
                  value={command}
                  aria-label={`Copy: ${command}`}
                  onCopy={() => setCopied(true)}
                  className="size-11 rounded-xl"
                />
              </div>
            </div>

            <p className="mt-4 min-h-5 font-mono text-[12px] text-white/55">
              {copied ? (
                <span className="nk-cta-terminal-in inline-block">
                  Next: <span className="text-white/80">cd</span> into any project and run{" "}
                  <span className="text-[rgb(var(--neon))]">gantry up</span>
                </span>
              ) : (
                "No daemon, no root. One binary on your PATH."
              )}
            </p>
          </div>

          <div className="lg:pt-12">
            <p className="max-w-[40ch] text-pretty text-[15px] leading-relaxed text-white/60">
              Gantry builds from your lockfile, keeps layers on local disk and starts containers without a background
              service. Your existing Dockerfiles work as they are.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/[0.07] pt-6">
              {SPECS.map((spec) => (
                <div key={spec.label} className="flex flex-col-reverse justify-end gap-1">
                  <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/55">{spec.label}</dt>
                  <dd className="text-[15px] font-medium tabular-nums text-white/85">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
