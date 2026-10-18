"use client";

import * as React from "react";
import { Check, Copy } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  className,
  label = "Copy code",
  text,
}: {
  value: string;
  className?: string;
  label?: string;
  /** Show a word next to the icon, for toolbars with room for it. */
  text?: boolean;
}) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timeout);
  }, [copied]);

  return (
    <button
      type="button"
      aria-label={text ? undefined : copied ? "Copied" : label}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
      className={cn(
        "inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-lg text-[13px] text-muted transition-colors duration-150 hover:bg-white/[0.06] hover:text-fg",
        text ? "px-2.5" : "w-8",
        className,
      )}
    >
      {copied ? (
        <Check size={14} className="text-[rgb(var(--neon-accent))]" />
      ) : (
        <Copy size={14} />
      )}
      {text && <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>}
    </button>
  );
}
