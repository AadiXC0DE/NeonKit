"use client";

import * as React from "react";
import { CopyButton } from "@/components/ui/copy-button";
import { Terminal, type TerminalLine } from "@/components/ui/terminal";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { sections } from "./config";
import { cliSpecs, managers, type Manager } from "./data";
import { Headline } from "./primitives";

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
      className="relative isolate scroll-mt-20 overflow-hidden px-5 py-24 sm:px-8 lg:py-36"
    >
      <div className="mx-auto max-w-[1120px]">
        <Headline id="install-title" clock={section.clock} className="text-[clamp(2.25rem,5.4vw,4.5rem)]">
          Two commands, then go to bed.
        </Headline>

        <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-8">
          {/* The session is the thing to look at; the install line sits beside it, ready to copy */}
          <div className="min-w-0 lg:col-span-7">
            <Terminal
              title={<span className="text-white/55">storefront · zsh</span>}
              lines={session(manager)}
              typingSpeed={30}
              className="text-[11px] leading-[1.8] sm:text-[13px] [&_button]:text-white/60"
            />
            <p className="mt-4 text-[13px] text-white/55">
              Commit <code className="font-mono text-white/85">nightshift.toml</code> and the whole team queues the
              same way.
            </p>
          </div>

          <div className="min-w-0 lg:col-span-4 lg:col-start-9">
            <p className="max-w-[42ch] text-pretty text-[16px] leading-[1.6] text-white/60">
              Nightshift runs the deploy step you already have. <span className="text-white/85">Init</span> finds your
              targets and a sane set of health checks; <span className="text-white/85">queue</span> does the rest.
            </p>

            <div className="mt-9">
              <ToggleGroup
                aria-label="Package manager"
                size="sm"
                value={manager}
                onValueChange={(value) => value && setManager(value as Manager)}
              >
                {(Object.keys(managers) as Manager[]).map((key) => (
                  <ToggleGroupItem key={key} value={key}>
                    {key}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>

              <div className="mt-3 flex h-12 items-center gap-3 rounded-[10px] border border-white/10 bg-[#0a0b11] pl-4 pr-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
                <span aria-hidden className="font-mono text-[14px] text-[rgb(var(--neon))]">
                  $
                </span>
                <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-white/90">{command}</code>
                <CopyButton
                  value={command}
                  aria-label={`Copy: ${command}`}
                  onCopy={() => setCopied(true)}
                  className="size-9 rounded-lg"
                />
              </div>
              <p className="mt-3 min-h-5 text-[13px] text-white/55">
                {copied ? (
                  <>
                    Copied. Next:{" "}
                    <code className="font-mono text-white/90">{managers[manager].run} nightshift init</code>
                  </>
                ) : (
                  "Node 18 or later. No daemon, no agent on your servers."
                )}
              </p>
            </div>

            <dl className="mt-10 divide-y divide-white/[0.07] border-y border-white/[0.07] text-[14px]">
              {cliSpecs.map((spec) => (
                <div key={spec.label} className="flex items-baseline justify-between gap-6 py-3">
                  <dt className="text-white/55">{spec.label}</dt>
                  <dd className="text-right text-white/85">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
