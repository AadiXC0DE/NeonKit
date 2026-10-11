"use client";

import * as React from "react";
import { RotateCcw } from "lucide-react";
import { neonVars, type NeonColorName } from "@/lib/neon";
import { cn } from "@/lib/utils";
import { AccentPicker } from "./accent-picker";
import { CodeFrame } from "./code-frame";

export function ComponentPreview({
  children,
  html,
  code,
  title,
  className,
  canvasClassName,
}: {
  children: React.ReactNode;
  html: string;
  code: string;
  title?: string;
  className?: string;
  canvasClassName?: string;
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  // Null inherits the site-wide accent (set by the hue knob); picking a swatch overrides it here only.
  const [accent, setAccent] = React.useState<NeonColorName | null>(null);
  const [replay, setReplay] = React.useState(0);

  return (
    <div className={cn("rounded-xl border border-line bg-surface", className)}>
      <div className="flex h-11 items-center justify-between gap-3 border-b border-line px-2">
        <div role="tablist" aria-label={title ? `${title} view` : "View"} className="flex items-center">
          {(["preview", "code"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                "relative h-11 cursor-pointer px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                tab === value ? "text-fg" : "text-dim hover:text-muted",
              )}
            >
              {value}
              {tab === value && (
                <span className="absolute inset-x-3 -bottom-px h-px bg-[rgb(var(--neon-accent))] shadow-[0_0_8px_rgb(var(--neon-accent))]" />
              )}
            </button>
          ))}
        </div>
        {tab === "preview" && (
          <div className="flex items-center gap-1">
            <AccentPicker value={accent} onChange={setAccent} className="hidden sm:flex" />
            <button
              type="button"
              aria-label="Replay preview"
              onClick={() => setReplay((n) => n + 1)}
              className="grid size-8 cursor-pointer place-items-center rounded-md text-dim transition-colors hover:bg-white/[0.06] hover:text-fg"
            >
              <RotateCcw className="size-3.5" />
            </button>
          </div>
        )}
      </div>
      {tab === "preview" ? (
        <div
          style={neonVars(accent ?? undefined)}
          className={cn(
            "relative flex min-h-[320px] items-center justify-center rounded-b-xl bg-background bg-dots px-6 py-14 [overflow-x:clip] sm:px-10",
            canvasClassName,
          )}
        >
          <div key={replay} className="flex w-full items-center justify-center">
            {children}
          </div>
        </div>
      ) : (
        <CodeFrame html={html} code={code} maxHeight={520} className="rounded-t-none border-0" />
      )}
    </div>
  );
}
