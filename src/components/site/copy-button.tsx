"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  className,
  label = "Copy code",
}: {
  value: string;
  className?: string;
  label?: string;
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
      aria-label={copied ? "Copied" : label}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setCopied(true);
      }}
      className={cn(
        "grid size-8 cursor-pointer place-items-center rounded-md text-muted transition-colors hover:bg-white/[0.06] hover:text-fg",
        className,
      )}
    >
      {copied ? <Check className="size-3.5 text-[rgb(var(--neon-accent))]" /> : <Copy className="size-3.5" />}
    </button>
  );
}
