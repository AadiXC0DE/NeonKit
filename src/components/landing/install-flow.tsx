"use client";

import * as React from "react";
import { useInView, useReducedMotion } from "motion/react";
import { Switch } from "@/components/ui/switch";
import { registryUrl } from "@/config/site";
import { SectionHeading } from "./section-heading";

const command = `npx shadcn@latest add ${registryUrl("switch")}`;
const output = [
  { mark: "✔", text: "Checking registry." },
  { mark: "✔", text: "Installing dependencies." },
  { mark: "✔", text: "Created 2 files:" },
  { mark: " ", text: "  - components/ui/switch.tsx" },
  { mark: " ", text: "  - lib/neon.ts" },
];

function Terminal() {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduce = useReducedMotion();
  const [typedChars, setTyped] = React.useState(0);
  const [shownLines, setLines] = React.useState(0);

  React.useEffect(() => {
    if (!inView || reduce) return;
    let i = 0;
    const typer = setInterval(() => {
      i += 2;
      setTyped(Math.min(i, command.length));
      if (i >= command.length) {
        clearInterval(typer);
        output.forEach((_, n) => setTimeout(() => setLines(n + 1), 450 + n * 260));
      }
    }, 22);
    return () => clearInterval(typer);
  }, [inView, reduce]);

  // Reduced motion skips the typing and shows the finished session.
  const typed = reduce ? command.length : typedChars;
  const lines = reduce ? output.length : shownLines;
  const done = lines === output.length;

  return (
    <div ref={ref} className="overflow-hidden rounded-2xl border border-line bg-[#07080d]">
      <div className="flex h-10 items-center justify-between border-b border-line px-4 font-mono text-[11px] text-dim">
        <span>~/nightshift</span>
        <span>zsh</span>
      </div>
      <pre className="min-h-[220px] overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.9]">
        <code>
          <span className="text-[rgb(var(--neon-accent))]">$ </span>
          <span className="text-fg">{command.slice(0, typed)}</span>
          {typed < command.length && <span className="ml-px inline-block h-[1.1em] w-[7px] translate-y-[3px] animate-caret bg-fg" />}
          {"\n"}
          {output.slice(0, lines).map((line) => (
            <React.Fragment key={line.text}>
              <span className="text-[rgb(52_211_153)]">{line.mark}</span>
              <span className="text-muted"> {line.text}</span>
              {"\n"}
            </React.Fragment>
          ))}
          {done && (
            <>
              <span className="text-[rgb(var(--neon-accent))]">$ </span>
              <span className="inline-block h-[1.1em] w-[7px] translate-y-[3px] animate-caret bg-fg" />
            </>
          )}
        </code>
      </pre>
    </div>
  );
}

export function InstallFlow() {
  const [on, setOn] = React.useState(true);

  return (
    <section className="border-y border-line bg-[linear-gradient(to_bottom,#07080c,#05060a)]">
      <div className="mx-auto max-w-[88rem] px-4 py-20 sm:px-6 sm:py-28">
        <SectionHeading index="03" label="Install" title={<>One command.<br className="hidden sm:block" /> Then it&apos;s yours.</>}>
          NeonKit is a shadcn registry. The CLI writes the component into your project and pulls in the one helper it
          needs. No package to keep updated, no wrapper to fight.
        </SectionHeading>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <Terminal />
          <div className="grid overflow-hidden rounded-2xl border border-line bg-[#07080d] sm:grid-rows-[1fr_auto]">
            <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.9] text-[#c8d0de]">
              <code>
                <span className="text-[#f58ac6]">import</span> {"{ "}Switch{" }"} <span className="text-[#f58ac6]">from</span>{" "}
                <span className="text-[#7ee8f8]">&quot;@/components/ui/switch&quot;</span>
                {"\n\n"}
                <span className="text-[#6b7489]">&lt;</span>
                <span className="text-[#e9edf5]">Switch</span>
                {" "}
                <span className="text-[#b8a6fb]">color</span>
                <span className="text-[#6b7489]">=</span>
                <span className="text-[#7ee8f8]">&quot;lime&quot;</span>
                {" "}
                <span className="text-[#b8a6fb]">defaultChecked</span>
                {" "}
                <span className="text-[#6b7489]">/&gt;</span>
              </code>
            </pre>
            <div className="flex items-center justify-between gap-4 border-t border-line bg-background/60 px-5 py-5">
              <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">Result</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-muted">{on ? "on" : "off"}</span>
                <Switch color="lime" checked={on} onCheckedChange={setOn} aria-label="Example switch" />
              </div>
            </div>
          </div>
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-3">
          {[
            ["Add", "With the shadcn CLI, or paste the source from any component page."],
            ["Use", "Import it like your own code, because it is. Typed props, sensible defaults."],
            ["Bend it", "Change a class, a color or a whole variant. Nothing upstream to break."],
          ].map(([title, body], i) => (
            <li key={title} className="border-t border-line pt-5">
              <p className="font-mono text-[11px] text-dim">0{i + 1}</p>
              <p className="mt-3 font-semibold tracking-[-0.01em] text-fg">{title}</p>
              <p className="mt-1.5 text-[14.5px] leading-relaxed text-muted">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
