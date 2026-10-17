"use client";

import * as React from "react";
import { Check, ChevronDown, Copy, FileText, SquareArrowOutUpRight } from "@/components/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { siteConfig } from "@/config/site";

/** v0 opens a registry item as a new chat with the code already in it. */
const openInV0 = (registryItem: string) => `https://v0.app/chat/api/open?url=${encodeURIComponent(registryItem)}`;

const ask = (markdown: string) =>
  `Read ${markdown}. It's a NeonKit doc page. I want to use it in my project and ask questions about it.`;

/**
 * Copies the page's markdown twin, ready to paste into a chat or a rules file.
 * The menu opens the same page elsewhere: raw, in v0 (when there's a registry item) or in a chat.
 */
export function CopyPage({ href, registryItem }: { href: string; registryItem?: string }) {
  const [state, setState] = React.useState<"idle" | "copied" | "error">("idle");
  const markdown = `${siteConfig.url}${href}`;

  React.useEffect(() => {
    if (state === "idle") return;
    const timeout = setTimeout(() => setState("idle"), 1800);
    return () => clearTimeout(timeout);
  }, [state]);

  const links = [
    { label: "View as Markdown", href, icon: <FileText /> },
    ...(registryItem ? [{ label: "Open in v0", href: openInV0(registryItem), icon: <V0Mark /> }] : []),
    { label: "Open in ChatGPT", href: `https://chatgpt.com/?hints=search&q=${encodeURIComponent(ask(markdown))}` },
    { label: "Open in Claude", href: `https://claude.ai/new?q=${encodeURIComponent(ask(markdown))}` },
  ];

  return (
    <div className="inline-flex h-9 shrink-0 items-center overflow-hidden rounded-lg border border-white/10 text-[13px]">
      <button
        type="button"
        onClick={async () => {
          try {
            const response = await fetch(href);
            await navigator.clipboard.writeText(await response.text());
            setState("copied");
          } catch {
            setState("error");
          }
        }}
        className="inline-flex h-full cursor-pointer items-center gap-2 px-3 text-muted transition-colors hover:bg-white/[0.05] hover:text-fg"
      >
        {state === "copied" ? <Check size={14} className="text-[rgb(var(--neon-accent))]" /> : <Copy size={14} />}
        <span aria-live="polite">{state === "copied" ? "Copied" : state === "error" ? "Couldn't copy" : "Copy as Markdown"}</span>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="More ways to open this page"
          className="grid h-full cursor-pointer place-items-center border-l border-white/10 px-2.5 text-muted transition-colors hover:bg-white/[0.05] hover:text-fg data-[state=open]:text-fg"
        >
          <ChevronDown size={14} />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[13.5rem]">
          {links.map((link, i) => (
            <React.Fragment key={link.label}>
              {i === 1 && <DropdownMenuSeparator />}
              <DropdownMenuItem asChild>
                <a href={link.href} target="_blank" rel="noreferrer">
                  {link.icon ?? <SquareArrowOutUpRight />}
                  {link.label}
                </a>
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** v0's wordmark, drawn small enough to sit with the icons. */
function V0Mark() {
  return (
    <svg viewBox="0 0 40 20" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M23.3919 0H32.9188C36.7819 0 39.9136 3.13165 39.9136 6.99475V16.0805H36.0006V6.99475C36.0006 6.90167 35.9969 6.80925 35.9898 6.71766L26.4628 16.079C26.4949 16.08 26.5272 16.0805 26.5595 16.0805H36.0006V19.7762H26.5595C22.6964 19.7762 19.4788 16.6139 19.4788 12.7508V3.68923H23.3919V12.7508C23.3919 12.9253 23.4054 13.0977 23.4316 13.2668L33.1682 3.6995C33.0861 3.6927 33.003 3.68923 32.9188 3.68923H23.3919V0Z" />
      <path d="M13.7688 19.0956L0 3.68759H5.53933L13.6231 12.7337V3.68759H17.7535V17.5746C17.7535 19.6705 15.1654 20.6584 13.7688 19.0956Z" />
    </svg>
  );
}

/** For pages without a markdown twin (blocks, templates): straight to v0 with the registry item. */
export function OpenInV0({ registryItem }: { registryItem: string }) {
  return (
    <a
      href={openInV0(registryItem)}
      target="_blank"
      rel="noreferrer"
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-white/10 px-3 text-[13px] text-muted transition-colors hover:bg-white/[0.05] hover:text-fg"
    >
      <V0Mark />
      Open in v0
    </a>
  );
}
