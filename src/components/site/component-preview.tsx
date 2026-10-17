"use client";

import * as React from "react";
import { RotateCcw } from "@/components/ui/icons";
import { neonVars, type NeonColorName } from "@/lib/neon";
import { cn } from "@/lib/utils";
import { AccentPicker } from "./accent-picker";
import { CodeFrame } from "./code-frame";

export function ComponentPreview({
  children,
  html,
  code,
  title,
  filename,
  className,
  canvasClassName,
  size = "md",
}: {
  children: React.ReactNode;
  html: string;
  code: string;
  title?: string;
  /** Shown over the code, e.g. `button-demo.tsx`. */
  filename?: string;
  className?: string;
  canvasClassName?: string;
  /** The first preview on a page gets the taller stage. */
  size?: "md" | "lg";
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  // Null follows the site-wide accent (the hue knob); a gel overrides it for this preview only.
  const [accent, setAccent] = React.useState<NeonColorName | null>(null);
  const [replay, setReplay] = React.useState(0);
  const id = React.useId();

  // The hero preview mounts at once. The others mount as they come within 600px of the viewport and unmount
  // once they're 2000px away, keeping their height, so a fast scroll never has dozens of live demos running.
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(size === "lg");
  const [reserved, setReserved] = React.useState<number>();
  React.useEffect(() => {
    if (size === "lg" || tab !== "preview") return;
    const node = stageRef.current;
    if (!node) return;
    const near = new IntersectionObserver(([entry]) => entry.isIntersecting && setMounted(true), {
      rootMargin: "600px 0px",
    });
    const far = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) return;
        setReserved(node.offsetHeight);
        setMounted(false);
      },
      { rootMargin: "2000px 0px" },
    );
    near.observe(node);
    far.observe(node);
    return () => {
      near.disconnect();
      far.disconnect();
    };
  }, [size, tab]);

  return (
    <figure className={cn("min-w-0", className)}>
      <div className="flex h-11 items-center justify-between gap-3">
        <div role="tablist" aria-label={title ? `${title}: view` : "View"} className="-ml-2.5 flex items-center gap-1">
          {(["preview", "code"] as const).map((value) => (
            <button
              key={value}
              id={`${id}-${value}-tab`}
              type="button"
              role="tab"
              aria-selected={tab === value}
              aria-controls={`${id}-panel`}
              onClick={() => setTab(value)}
              className={cn(
                "h-8 cursor-pointer rounded-lg px-2.5 text-[13.5px] transition-colors duration-150",
                tab === value ? "bg-white/[0.07] text-fg" : "text-muted hover:text-fg",
              )}
            >
              {value === "preview" ? "Preview" : "Code"}
            </button>
          ))}
        </div>
        {tab === "preview" && (
          <div className="flex items-center gap-1">
            {accent && (
              <button
                type="button"
                onClick={() => setAccent(null)}
                className="mr-1 hidden h-8 cursor-pointer rounded-lg px-2 text-[13px] text-muted transition-colors hover:text-fg sm:block"
              >
                Reset
              </button>
            )}
            <AccentPicker value={accent} onChange={setAccent} className="hidden sm:flex" />
            <button
              type="button"
              aria-label="Replay preview"
              title="Replay"
              onClick={() => setReplay((n) => n + 1)}
              className="ml-1 grid size-8 cursor-pointer place-items-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
            >
              <RotateCcw size={15} />
            </button>
          </div>
        )}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}-tab`} className="mt-2">
        {tab === "preview" ? (
          <div
            ref={stageRef}
            style={neonVars(accent ?? undefined, mounted ? undefined : { minHeight: reserved })}
            className={cn(
              // Examples may style with var(--neon) directly; resolve it from the accent here.
              "[--neon:var(--neon-accent,34_211_238)]",
              "nk-stage relative isolate flex items-center justify-center rounded-[14px] border border-white/[0.07] px-5 py-14 [overflow-x:clip] sm:px-10",
              size === "lg" ? "min-h-[320px] sm:min-h-[440px] sm:py-20" : "min-h-[280px] sm:min-h-[340px]",
              canvasClassName,
            )}
          >
            <div key={replay} className="flex w-full items-center justify-center">
              {mounted ? children : null}
            </div>
          </div>
        ) : (
          <CodeFrame html={html} code={code} title={filename} numbered maxHeight={560} className="rounded-[14px]" />
        )}
      </div>
    </figure>
  );
}
