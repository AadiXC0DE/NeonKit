"use client";

import { CopyButton } from "@/components/site/copy-button";
import { registryUrl } from "@/config/site";
import { cn } from "@/lib/utils";

export function InstallChip({ className, name = "button" }: { className?: string; name?: string }) {
  const command = `npx shadcn@latest add ${registryUrl(name)}`;
  return (
    <div
      className={cn(
        "flex h-11 min-w-0 items-center gap-3 rounded-lg border border-line bg-surface/80 pl-4 pr-1.5 font-mono text-[12.5px] backdrop-blur-md",
        className,
      )}
    >
      <span className="select-none text-[rgb(var(--neon-accent))]">$</span>
      <span className="truncate text-muted">
        npx shadcn@latest add <span className="text-fg">{registryUrl(name).replace(/^https?:\/\//, "")}</span>
      </span>
      <CopyButton value={command} label="Copy install command" className="ml-auto shrink-0" />
    </div>
  );
}
