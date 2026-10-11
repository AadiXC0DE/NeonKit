"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CodeFrame } from "./code-frame";

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
}: {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div role="tablist" aria-label={label} className="flex items-center gap-0.5">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          role="tab"
          aria-selected={option === value}
          onClick={() => onChange(option)}
          className={cn(
            "h-7 cursor-pointer rounded-md px-2.5 font-mono text-[11px] tracking-wide transition-colors",
            option === value ? "bg-white/[0.07] text-fg" : "text-dim hover:text-muted",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/** Package-manager aware command block. `commands` is keyed by manager. */
export function CommandBlock({ commands }: { commands: Record<Manager, Highlighted> }) {
  const [pm, setPm] = usePackageManager();
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="flex h-10 items-center border-b border-line px-1.5">
        <Segmented options={managers} value={pm} onChange={setPm} label="Package manager" />
      </div>
      <CodeFrame html={commands[pm].html} code={commands[pm].code} className="rounded-none border-0 [&_.shiki]:py-0" />
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
  const [mode, setMode] = React.useState<"CLI" | "Manual">("CLI");
  return (
    <div className="space-y-4">
      <Segmented options={["CLI", "Manual"] as const} value={mode} onChange={setMode} label="Installation method" />
      {mode === "CLI" ? <CommandBlock commands={cli} /> : manual}
    </div>
  );
}
