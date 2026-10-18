"use client";

import * as React from "react";
import { ArrowUpRight, Monitor, Smartphone, Tablet } from "@/components/ui/icons";
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
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2">
        <div role="tablist" aria-label="View" className="-ml-2.5 flex items-center gap-1">
          {(["preview", "code"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
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
        <div className="flex items-center gap-1">
          {tab === "preview" && (
            <div role="radiogroup" aria-label="Viewport" className="mr-2 hidden items-center gap-0.5 md:flex">
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
                    "grid size-8 cursor-pointer place-items-center rounded-lg transition-colors duration-150",
                    viewport === id ? "bg-white/[0.07] text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          )}
          <div className="hidden h-8 items-center gap-1 rounded-lg bg-white/[0.04] pl-3 font-mono text-[12px] text-muted lg:flex">
            <span className="max-w-[18rem] truncate">
              npx shadcn add <span className="text-fg">…/r/{slug}.json</span>
            </span>
            <CopyButton value={install} label="Copy install command" />
          </div>
          <a
            href={`/view/${slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-8 items-center gap-1 rounded-lg px-2.5 text-[13.5px] text-muted transition-colors hover:text-fg"
          >
            Open <ArrowUpRight size={14} />
            <span className="sr-only">the preview in a new tab</span>
          </a>
        </div>
      </div>
      <div className="overflow-hidden rounded-[14px] border border-white/[0.07]">
        {tab === "preview" ? (
          <div className="nk-stage relative flex justify-center p-0 [--neon:var(--neon-accent)] md:px-6 md:py-6">
            {/* The border lives on a wrapper: on the iframe it would eat into the height the frame reports. */}
            <div
              className="max-w-full overflow-hidden rounded-none border-white/[0.08] bg-background transition-[width] duration-300 ease-out md:rounded-[10px] md:border"
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
          <CodeFrame html={html} code={code} title={`components/${slug}.tsx`} maxHeight={640} className="rounded-none border-0" />
        )}
      </div>
    </div>
  );
}
