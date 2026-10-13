"use client";

import * as React from "react";
import { Check, Copy, FileText } from "@/components/ui/icons";

/** Copies the page's markdown twin, ready to paste into a chat or a rules file. */
export function CopyPage({ href }: { href: string }) {
  const [state, setState] = React.useState<"idle" | "copied" | "error">("idle");

  React.useEffect(() => {
    if (state === "idle") return;
    const timeout = setTimeout(() => setState("idle"), 1800);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <div className="inline-flex h-9 shrink-0 items-center overflow-hidden rounded-lg border border-white/10 text-[13px]">
      <button
        type="button"
        onClick={async () => {
          try {
            const response = await fetch(href);
            await navigator.clipboard.writeText(await response.text());
            setState("copied");
          } catch {
            setState("error");
          }
        }}
        className="inline-flex h-full cursor-pointer items-center gap-2 px-3 text-muted transition-colors hover:bg-white/[0.05] hover:text-fg"
      >
        {state === "copied" ? <Check size={14} className="text-[rgb(var(--neon-accent))]" /> : <Copy size={14} />}
        <span aria-live="polite">{state === "copied" ? "Copied" : state === "error" ? "Couldn't copy" : "Copy as Markdown"}</span>
      </button>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="Open as Markdown"
        title="Open as Markdown"
        className="grid h-full place-items-center border-l border-white/10 px-2.5 text-muted transition-colors hover:bg-white/[0.05] hover:text-fg"
      >
        <FileText size={14} />
      </a>
    </div>
  );
}
