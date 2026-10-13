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
      [["  return ", "k"], ["<Switch ", "t"], ["defaultChecked label=", "x"], ['"Deploy alerts"', "s"], [" />", "t"]],
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

  if (name === "switch") return <Switch defaultChecked label="Deploy alerts" />;
  if (name === "knob") return <Knob defaultValue={62} size="sm" aria-label="Volume" />;
  return <SevenSegment value={time} color="amber" colonBlink size={32} aria-label={`The time is ${time}`} />;
}

export function Install() {
  const [name, setName] = React.useState<Name>("switch");
  const url = registryUrl(name);
  const [origin, path] = [url.slice(0, url.indexOf("/r/")), url.slice(url.indexOf("/r/"))];
  const command = `npx shadcn@latest add ${url}`;

  return (
    <section aria-labelledby="install-title" className="relative px-4 pb-40 pt-24 sm:px-6 sm:pb-56 sm:pt-32">
      <div className="mx-auto max-w-[88rem]">
        <h2 id="install-title" className="type-display text-[clamp(2.2rem,3.8vw,3.6rem)] text-fg">
          One command. Then it&apos;s yours.
        </h2>

        <div className="mt-14 grid gap-16 lg:mt-20 lg:grid-cols-12 lg:gap-6">
          {/* The command */}
          <div className="min-w-0 lg:col-span-7">
            <p className="break-words font-mono text-[clamp(1.35rem,3.15vw,3.1rem)] leading-[1.18] tracking-[-0.03em]">
              <span className="block text-[#6f7789]">
                <span className="select-none text-[rgb(var(--neon-accent))]">$ </span>npx shadcn@latest add
              </span>
              <span className="block text-[#8a93a6]">
                <span className="block sm:inline">https://</span>
                {origin.replace(/^https?:\/\//, "")}
              </span>
              <span className="block text-fg">{path}</span>
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
              <span className="inline-flex items-center gap-3 text-[15px] text-fg">
                <CopyButton value={command} label="Copy install command" />
                Copy
              </span>
              <div role="group" aria-label="Component" className="flex flex-wrap items-center gap-x-1 gap-y-2 text-[15px]">
                <span className="mr-2 text-muted">Try</span>
                {(Object.keys(kit) as Name[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={name === key}
                    onClick={() => setName(key)}
                    className={cn(
                      "cursor-pointer rounded-md px-2 py-1 transition-colors",
                      name === key ? "text-fg underline decoration-[rgb(var(--neon-accent))] decoration-2 underline-offset-[6px]" : "text-muted hover:text-fg",
                    )}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-10 max-w-[34rem] text-[16px] leading-[1.6] text-muted">
              NeonKit is a shadcn registry. The CLI writes the source into your repo and nothing else: no package to
              update, no wrapper, no theme provider. React 19, Tailwind 3.4 or 4.
            </p>
          </div>

          {/* What it writes, and how you use it */}
          <div className="min-w-0 lg:col-span-5 lg:col-start-8">
            <p className="text-[14px] text-muted">Writes</p>
            <pre className="mt-3 overflow-x-auto font-mono text-[13.5px] leading-[1.85] text-[#aab3c3]">
              <span className="text-[#6f7789]">src/</span>
              {"\n"}
              <span className="text-[#6f7789]">├─ components/ui/</span>
              {"\n"}
              <span className="text-[#6f7789]">│  └─ </span>
              <span className="text-fg">{kit[name].file}</span>
              <span className="text-[rgb(var(--neon-accent))]"> new</span>
              {"\n"}
              <span className="text-[#6f7789]">└─ lib/</span>
              {"\n"}
              <span className="text-[#6f7789]">   ├─ </span>
              <span className="text-fg">neon.ts</span>
              <span className="text-[rgb(var(--neon-accent))]"> new, once</span>
              {"\n"}
              <span className="text-[#6f7789]">   └─ </span>
              <span>utils.ts</span>
              <span className="text-[#6f7789]"> kept</span>
            </pre>

            <p className="mt-10 border-t border-line pt-6 text-[14px] text-muted">Use</p>
            <pre className="mt-3 overflow-x-auto pb-2 font-mono text-[13px] leading-[1.85]">
              <code>
                {kit[name].code.map((line, i) => (
                  <span key={`${name}-${i}`} className="block min-h-[1.85em]">
                    {line.map(([text, kind], j) => (
                      <span key={j} className={color[kind]}>
                        {text}
                      </span>
                    ))}
                  </span>
                ))}
              </code>
            </pre>

            <div className="mt-8 flex min-h-16 items-center gap-6 border-t border-line pt-6">
              <span className="text-[14px] text-muted">Renders</span>
              <Result name={name} />
            </div>
            <p className="mt-6 text-[14px] text-muted">
              Docs for{" "}
              <Link href={`/components/${name}`} className="text-fg underline decoration-white/25 underline-offset-4 hover:decoration-[rgb(var(--neon-accent))]">
                {name}
              </Link>
              , or every step in{" "}
              <Link href="/docs/installation" className="text-fg underline decoration-white/25 underline-offset-4 hover:decoration-[rgb(var(--neon-accent))]">
                installation
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
