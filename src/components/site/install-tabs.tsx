"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export type Highlighted = { code: string; html: string };

const managers = ["npm", "pnpm", "yarn", "bun"] as const;
type Manager = (typeof managers)[number];

const STORAGE_KEY = "neonkit:pm";

// Shared across every command block on the page, remembered per visitor.
const pmListeners = new Set<() => void>();

function readManager(): Manager {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Manager | null;
    if (saved && managers.includes(saved)) return saved;
  } catch {}
  return "npm";
}

function usePackageManager() {
  const pm = React.useSyncExternalStore(
    (listener) => {
      pmListeners.add(listener);
      return () => pmListeners.delete(listener);
    },
    readManager,
    () => "npm" as Manager,
  );
  const update = (next: Manager) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    pmListeners.forEach((listener) => listener());
  };
  return [pm, update] as const;
}

function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div role="tablist" aria-label={label} className={cn("flex items-center gap-1", className)}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={option === value}
          onClick={() => onChange(option)}
          className={cn(
            "h-8 cursor-pointer rounded-lg px-2.5 text-[13px] transition-colors duration-150",
            option === value ? "bg-white/[0.07] text-fg" : "text-muted hover:text-fg",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/** Package-manager aware command block. `commands` is keyed by manager. */
export function CommandBlock({ commands, className }: { commands: Record<Manager, Highlighted>; className?: string }) {
  const [pm, setPm] = usePackageManager();
  return (
    <div className={cn("overflow-hidden rounded-xl border border-white/[0.07] bg-surface", className)}>
      <div className="flex h-11 items-center justify-between gap-2 border-b border-white/[0.06] pl-1.5 pr-1.5">
        <Segmented options={managers} value={pm} onChange={setPm} label="Package manager" />
        <CopyButton value={commands[pm].code} label="Copy command" />
      </div>
      <div
        className="overflow-x-auto py-3.5 [&_.shiki]:text-[13.5px] [&_pre]:outline-none"
        dangerouslySetInnerHTML={{ __html: commands[pm].html }}
      />
    </div>
  );
}

export function InstallTabs({
  cli,
  manual,
}: {
  cli: Record<Manager, Highlighted>;
  manual: React.ReactNode;
}) {
  const [mode, setMode] = React.useState<"Command line" | "By hand">("Command line");
  return (
    <div>
      <Segmented
        options={["Command line", "By hand"] as const}
        value={mode}
        onChange={setMode}
        label="Installation method"
        className="-ml-2.5 mb-5"
      />
      {mode === "Command line" ? <CommandBlock commands={cli} /> : manual}
    </div>
  );
}
