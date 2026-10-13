"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

/**
 * Highlighted code. With a `title` it reads as a file: a name, line numbers and a copy button in
 * the header. Without one it's a snippet, and the copy button waits in the corner.
 */
export function CodeFrame({
  html,
  code,
  title,
  className,
  maxHeight,
  numbered = Boolean(title),
}: {
  html: string;
  code: string;
  title?: string;
  className?: string;
  maxHeight?: number;
  numbered?: boolean;
}) {
  const lines = React.useMemo(() => code.trimEnd().split("\n").length, [code]);
  // ~23px per line at 13px/1.75 plus the 32px of padding: only offer to expand when it's clipped.
  const clipped = maxHeight !== undefined && lines * 22.75 + 32 > maxHeight;
  const [expanded, setExpanded] = React.useState(false);
  const bodyId = React.useId();

  return (
    <div
      className={cn(
        "group/code relative overflow-hidden rounded-xl border border-white/[0.07] bg-surface",
        className,
      )}
    >
      {title ? (
        <div className="flex h-11 items-center justify-between gap-3 border-b border-white/[0.06] pl-4 pr-1.5">
          <span className="min-w-0 truncate font-mono text-[12.5px] text-muted">{title}</span>
          <CopyButton value={code} text />
        </div>
      ) : (
        <CopyButton
          value={code}
          className="absolute right-2 top-2 z-10 bg-surface shadow-[-12px_0_12px_#0a0c12] transition-opacity duration-150 focus-visible:opacity-100 sm:opacity-0 sm:group-hover/code:opacity-100 [@media(hover:none)]:opacity-100"
        />
      )}
      <div
        id={bodyId}
        className={cn("overflow-auto py-4 [&_pre]:outline-none", numbered && "nk-numbered")}
        style={clipped && !expanded ? { maxHeight } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {clipped && (
        <div
          className={cn(
            "flex justify-center",
            expanded
              ? "border-t border-white/[0.06] py-2"
              : "absolute inset-x-0 bottom-0 bg-[linear-gradient(to_top,#0a0c12_35%,transparent)] pb-3 pt-12",
          )}
        >
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={bodyId}
            onClick={() => setExpanded((value) => !value)}
            className="h-8 cursor-pointer rounded-lg px-3 text-[13px] text-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
          >
            {expanded ? "Collapse" : `Show all ${lines} lines`}
          </button>
        </div>
      )}
    </div>
  );
}
