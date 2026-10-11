"use client";

import * as React from "react";
import { Check, Copy, FileText } from "lucide-react";

/** Copies the page's markdown twin, for pasting into an AI chat. */
export function CopyPage({ href }: { href: string }) {
  const [state, setState] = React.useState<"idle" | "copied" | "error">("idle");

  React.useEffect(() => {
    if (state === "idle") return;
    const timeout = setTimeout(() => setState("idle"), 1800);
    return () => clearTimeout(timeout);
  }, [state]);

  return (
    <div className="inline-flex h-8 items-center overflow-hidden rounded-lg border border-line text-[12.5px]">
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
        className="inline-flex h-full cursor-pointer items-center gap-1.5 px-3 text-muted transition-colors hover:bg-white/[0.04] hover:text-fg"
      >
        {state === "copied" ? <Check className="size-3.5 text-[rgb(var(--neon-accent))]" /> : <Copy className="size-3.5" />}
        {state === "copied" ? "Copied" : state === "error" ? "Couldn't copy" : "Copy page"}
      </button>
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        aria-label="Open as Markdown"
        title="Open as Markdown"
        className="grid h-full place-items-center border-l border-line px-2.5 text-dim transition-colors hover:bg-white/[0.04] hover:text-fg"
      >
        <FileText className="size-3.5" />
      </a>
    </div>
  );
}
