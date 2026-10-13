"use client";

import * as React from "react";
import { ExternalLink, Monitor, Smartphone, Tablet } from "lucide-react";
import { registryUrl } from "@/config/site";
import { cn } from "@/lib/utils";
import { CodeFrame } from "./code-frame";
import { CopyButton } from "./copy-button";

const viewports = [
  { id: "desktop", label: "Desktop", width: "100%", icon: Monitor },
  { id: "tablet", label: "Tablet", width: "768px", icon: Tablet },
  { id: "phone", label: "Phone", width: "390px", icon: Smartphone },
] as const;

export function BlockPreview({
  slug,
  html,
  code,
  height = 720,
}: {
  slug: string;
  html: string;
  code: string;
  height?: number;
}) {
  const [tab, setTab] = React.useState<"preview" | "code">("preview");
  const [viewport, setViewport] = React.useState<(typeof viewports)[number]["id"]>("desktop");
  const [frameHeight, setFrameHeight] = React.useState(height);
  const install = `npx shadcn@latest add ${registryUrl(slug)}`;

  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; id?: string; height?: number };
      if (data?.type === "neonkit:frame-height" && data.id === slug && data.height) {
        setFrameHeight(Math.max(240, Math.ceil(data.height)));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [slug]);

  const width = viewports.find((v) => v.id === viewport)!.width;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-2 py-1.5">
        <div role="tablist" aria-label="View" className="flex">
          {(["preview", "code"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              onClick={() => setTab(value)}
              className={cn(
                "relative h-8 cursor-pointer px-3 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors",
                tab === value ? "text-fg" : "text-dim hover:text-muted",
              )}
            >
              {value}
              {tab === value && (
                <span className="absolute inset-x-3 -bottom-1.5 h-px bg-[rgb(var(--neon-accent))] shadow-[0_0_8px_rgb(var(--neon-accent))]" />
              )}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {tab === "preview" && (
            <div role="radiogroup" aria-label="Viewport" className="hidden items-center gap-0.5 rounded-lg border border-line p-0.5 md:flex">
              {viewports.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={viewport === id}
                  aria-label={label}
                  title={label}
                  onClick={() => setViewport(id)}
                  className={cn(
                    "grid size-7 cursor-pointer place-items-center rounded-md transition-colors",
                    viewport === id ? "bg-white/[0.07] text-fg" : "text-dim hover:text-muted",
                  )}
                >
                  <Icon className="size-3.5" />
                </button>
              ))}
            </div>
          )}
          <div className="hidden h-8 items-center gap-2 rounded-lg border border-line pl-3 pr-0.5 font-mono text-[11.5px] text-muted lg:flex">
            <span className="max-w-[18rem] truncate">npx shadcn add …/r/{slug}.json</span>
            <CopyButton value={install} label="Copy install command" className="size-7" />
          </div>
          <a
            href={`/view/${slug}`}
            target="_blank"
            rel="noreferrer"
            aria-label="Open preview in a new tab"
            title="Open in a new tab"
            className="grid size-8 place-items-center rounded-md text-dim transition-colors hover:bg-white/[0.06] hover:text-fg"
          >
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </div>
      {tab === "preview" ? (
        <div className="flex justify-center bg-background bg-dots p-0 md:p-4">
          {/* The border lives on a wrapper: on the iframe it would eat into the height the frame reports. */}
          <div
            className="max-w-full overflow-hidden rounded-none border-line bg-background transition-[width] duration-300 ease-out md:rounded-xl md:border"
            style={{ width }}
          >
            <iframe
              title={`${slug} preview`}
              src={`/view/${slug}`}
              loading="lazy"
              className="block w-full border-0"
              style={{ height: frameHeight }}
            />
          </div>
        </div>
      ) : (
        <CodeFrame html={html} code={code} maxHeight={640} className="rounded-none border-0" />
      )}
    </div>
  );
}
