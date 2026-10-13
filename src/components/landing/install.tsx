"use client";

import * as React from "react";
import Link from "next/link";
import { Knob } from "@/components/ui/knob";
import { SevenSegment } from "@/components/ui/seven-segment";
import { Switch } from "@/components/ui/switch";
import { CopyButton } from "@/components/site/copy-button";
import { registryUrl } from "@/config/site";
import { cn } from "@/lib/utils";

type Token = [string, "k" | "s" | "t" | "p" | "x"];

const color: Record<Token[1], string> = {
  k: "text-[#8a93a6]", // keywords
  s: "text-[#c9d4e3]", // strings
  t: "text-fg", // tags and names
  p: "text-[#6f7789]", // punctuation
  x: "text-[#aab3c3]", // everything else
};

const kit = {
  switch: {
    file: "switch.tsx",
    code: [
      [["import ", "k"], ["{ Switch } ", "t"], ["from ", "k"], ['"@/components/ui/switch"', "s"]],
      [],
      [["export function ", "k"], ["Alerts", "t"], ["() {", "p"]],
      [["  return ", "k"], ["<Switch ", "t"], ["defaultChecked label=", "x"], ['"Alerts"', "s"], [" />", "t"]],
      [["}", "p"]],
    ] as Token[][],
  },
  knob: {
    file: "knob.tsx",
    code: [
      [["import ", "k"], ["{ Knob } ", "t"], ["from ", "k"], ['"@/components/ui/knob"', "s"]],
      [],
      [["export function ", "k"], ["Volume", "t"], ["() {", "p"]],
      [["  return ", "k"], ["<Knob ", "t"], ["defaultValue={", "x"], ["62", "s"], ["} aria-label=", "x"], ['"Volume"', "s"], [" />", "t"]],
      [["}", "p"]],
    ] as Token[][],
  },
  "seven-segment": {
    file: "seven-segment.tsx",
    code: [
      [["import ", "k"], ["{ SevenSegment } ", "t"], ["from ", "k"], ['"@/components/ui/seven-segment"', "s"]],
      [],
      [["export function ", "k"], ["Clock", "t"], ["({ time }) {", "p"]],
      [["  return ", "k"], ["<SevenSegment ", "t"], ["value={time} color=", "x"], ['"amber"', "s"], [" colonBlink", "x"], [" />", "t"]],
      [["}", "p"]],
    ] as Token[][],
  },
};

type Name = keyof typeof kit;

function Result({ name }: { name: Name }) {
  const [time, setTime] = React.useState("21:47");
  React.useEffect(() => {
    if (name !== "seven-segment") return;
    const tick = () => {
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`);
    };
    tick();
    const id = window.setInterval(tick, 10_000);
    return () => window.clearInterval(id);
  }, [name]);

  if (name === "switch") return <Switch defaultChecked label="Alerts" />;
  if (name === "knob") return <Knob defaultValue={62} size="sm" aria-label="Volume" />;
  return <SevenSegment value={time} color="amber" colonBlink size={32} aria-label={`The time is ${time}`} />;
}

function Step({ n, title, children, className }: { n: number; title: string; children: React.ReactNode; className?: string }) {
  return (
    <li className={cn("min-w-0", className)}>
      <h3 className="flex items-center gap-3 text-[17px] font-medium text-fg">
        <span
          aria-hidden
          className="grid size-7 shrink-0 place-items-center rounded-full border border-[rgb(var(--neon-accent)/0.5)] text-[13px] tabular-nums text-[rgb(var(--neon-accent))]"
        >
          {n}
        </span>
        <span>
          <span className="sr-only">Step {n}: </span>
          {title}
        </span>
      </h3>
      <div className="mt-4">{children}</div>
    </li>
  );
}

const panel = "overflow-hidden rounded-[12px] border border-white/[0.08] bg-[#0a0c12]";

export function Install() {
  const [name, setName] = React.useState<Name>("switch");
  const url = registryUrl(name);
  const command = `npx shadcn@latest add ${url}`;

  return (
    <section aria-labelledby="install-title" className="relative px-4 pb-32 pt-24 sm:px-6 sm:pb-44 sm:pt-32">
      <div className="mx-auto max-w-[88rem]">
        <div className="max-w-[46rem]">
          <h2 id="install-title" className="type-display text-balance text-[clamp(2.2rem,4.2vw,4rem)] text-fg">
            Install one. Import it. It&apos;s yours.
          </h2>
          <p className="mt-5 text-[16.5px] leading-[1.6] text-muted">
            Every component is a single file. The shadcn CLI copies it into your project, so there&apos;s no package to
            update and nothing to wrap. Works with React 19 and Tailwind 3.4 or 4.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-2" role="group" aria-label="Pick a component to install">
          <span className="mr-2 text-[15px] text-muted">Pick one</span>
          {(Object.keys(kit) as Name[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={name === key}
              onClick={() => setName(key)}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-[14px] transition-colors duration-150",
                name === key
                  ? "border-[rgb(var(--neon-accent)/0.55)] bg-[rgb(var(--neon-accent)/0.08)] text-fg"
                  : "border-line text-muted hover:text-fg",
              )}
            >
              {key}
            </button>
          ))}
        </div>

        <ol className="mt-10 grid gap-x-6 gap-y-12 lg:grid-cols-3">
          <Step n={1} title="Run the command">
            <div className={panel}>
              <div className="flex items-start gap-3 p-4 font-mono text-[13px] leading-[1.7]">
                <span aria-hidden className="select-none text-[rgb(var(--neon-accent))]">
                  $
                </span>
                <code className="min-w-0 flex-1 break-all text-[#c9d4e3]">
                  npx shadcn@latest add <span className="text-fg">{url}</span>
                </code>
                <CopyButton value={command} label="Copy install command" className="-mr-1 -mt-1 shrink-0" />
              </div>
              <div className="border-t border-white/[0.06] px-4 py-3 font-mono text-[12.5px] leading-[1.8] text-[#8a93a6]">
                <span className="text-[rgb(var(--neon-accent))]">✓</span> Created 2 files
                <br />
                <span className="text-[#6f7789]">  </span>components/ui/<span className="text-fg">{kit[name].file}</span>
                <br />
                <span className="text-[#6f7789]">  </span>lib/<span className="text-fg">neon.ts</span>
              </div>
            </div>
            <p className="mt-3 text-[14px] text-muted">Your project needs a shadcn setup once. The installation guide covers it.</p>
          </Step>

          <Step n={2} title="Import it">
            <div className={panel}>
              <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-[1.75]">
                <code>
                  {kit[name].code.map((line, i) => (
                    <span key={`${name}-${i}`} className="block min-h-[1.75em]">
                      {line.map(([text, kind], j) => (
                        <span key={j} className={color[kind]}>
                          {text}
                        </span>
                      ))}
                    </span>
                  ))}
                </code>
              </pre>
            </div>
            <p className="mt-3 text-[14px] text-muted">Typed props, sensible defaults, one CSS variable for color.</p>
          </Step>

          <Step n={3} title="It's yours">
            <div className={cn(panel, "grid min-h-[9.5rem] place-items-center p-6")}>
              <Result name={name} />
            </div>
            <p className="mt-3 text-[14px] text-muted">
              The source lives in <span className="font-mono text-[12.5px] text-fg">components/ui/{kit[name].file}</span>.
              Change anything.{" "}
              <Link
                href={`/components/${name}`}
                className="text-fg underline decoration-white/25 underline-offset-4 hover:decoration-[rgb(var(--neon-accent))]"
              >
                Docs for {name}
              </Link>
            </p>
          </Step>
        </ol>

        <p className="mt-12 text-[15px] text-muted">
          First time with shadcn?{" "}
          <Link
            href="/docs/installation"
            className="font-medium text-fg underline decoration-white/25 underline-offset-[5px] transition-colors hover:decoration-[rgb(var(--neon-accent))]"
          >
            Read the installation guide
          </Link>
        </p>
      </div>
    </section>
  );
}
