"use client";

import * as React from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { Terminal, type TerminalLine } from "@/components/ui/terminal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { sections } from "./config";
import { cliSpecs, managers, type Manager } from "./data";
import { Eyebrow } from "./primitives";

const section = sections[1];

function session(manager: Manager): TerminalLine[] {
  return [
    { kind: "input", text: `${managers[manager].run} nightshift init` },
    { kind: "output", text: "linked   okapi/storefront" },
    { kind: "output", text: "targets  preview · staging · production" },
    { kind: "output", text: "checks   /healthz · p95 < 400 ms · 5xx < 1%" },
    { kind: "input", text: "nightshift queue production --window 02:00" },
    { kind: "output", text: "queued   storefront@a1c93e2, 5th in line" },
    { kind: "output", text: "window   02:00 Europe/Lisbon · in 4h 12m" },
    { kind: "success", text: "✓ You can close the laptop." },
  ];
}

export function Install() {
  const [manager, setManager] = React.useState<Manager>("npm");
  const [copied, setCopied] = React.useState(false);
  const command = managers[manager].install;

  return (
    <section
      id={section.id}
      aria-labelledby="install-title"
      className="relative isolate scroll-mt-20 overflow-hidden px-5 py-20 sm:px-8 lg:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-10%] top-1/3 -z-10 h-[520px] w-[720px] rounded-full bg-[radial-gradient(closest-side,rgb(var(--neon)/0.07),transparent)]"
      />
      <div className="mx-auto grid max-w-[1120px] gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <div className="min-w-0">
          <Eyebrow clock={section.clock}>Install</Eyebrow>
          <h2
            id="install-title"
            className="mt-4 text-balance text-[clamp(2.25rem,4.6vw,3.5rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-white"
          >
            Two commands, then go to bed.
          </h2>
          <p className="mt-6 max-w-[42ch] text-pretty text-[15px] leading-relaxed text-white/60">
            Nightshift runs the deploy step you already have. Init finds your targets and a sane set of health checks;
            queue does the rest.
          </p>

          <div className="mt-10">
            <ToggleGroup
              aria-label="Package manager"
              size="sm"
              value={manager}
              onValueChange={(value) => value && setManager(value as Manager)}
            >
              {(Object.keys(managers) as Manager[]).map((key) => (
                <ToggleGroupItem key={key} value={key} className="font-mono">
                  {key}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>

            <div className="relative mt-4 flex h-14 items-center gap-3 rounded-2xl border border-[rgb(var(--neon)/0.22)] bg-[#0a0b11] pl-5 pr-2 shadow-[0_0_0_1px_rgb(0_0_0/0.4),0_24px_60px_-24px_rgb(var(--neon)/0.35),inset_0_1px_0_rgb(255_255_255/0.05)]">
              <span
                aria-hidden
                className="absolute inset-x-8 -top-px h-px bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.8),transparent)]"
              />
              <span
                aria-hidden
                className="font-mono text-[15px] text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.7)]"
              >
                $
              </span>
              <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-white/90 sm:text-[14px]">
                {command}
              </code>
              <CopyButton
                value={command}
                aria-label={`Copy: ${command}`}
                onCopy={() => setCopied(true)}
                className="size-10 rounded-xl"
              />
            </div>
            <p className="mt-3 h-5 font-mono text-[12px] text-white/60">
              {copied ? (
                <>
                  Next: <span className="text-white/90">{managers[manager].run} nightshift init</span>
                </>
              ) : (
                "Node 18+. No daemon, no agent on your servers."
              )}
            </p>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-white/[0.07] pt-6">
            {cliSpecs.map((spec) => (
              <div key={spec.label} className="flex flex-col-reverse justify-end gap-1">
                <dt className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">{spec.label}</dt>
                <dd className="text-[15px] font-medium tabular-nums text-white/85">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="min-w-0 lg:pt-14">
          <Terminal
            title={<span className="text-white/60">storefront · zsh</span>}
            lines={session(manager)}
            typingSpeed={30}
            className="text-[11px] leading-[1.8] sm:text-[13px] [&_button]:text-white/60"
          />
          <p className="mt-4 font-mono text-[11px] text-white/60">
            Commit <span className="text-white/85">nightshift.toml</span> and the whole team queues the same way.
          </p>
        </div>
      </div>
    </section>
  );
}
