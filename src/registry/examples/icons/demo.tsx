"use client";

import * as React from "react";
import { icons, Search } from "@/components/ui/icons";

const names = Object.keys(icons).sort();

export default function IconsGallery() {
  const [query, setQuery] = React.useState("");
  const [copied, setCopied] = React.useState<string | null>(null);
  const shown = query ? names.filter((name) => name.toLowerCase().includes(query.trim().toLowerCase())) : names;

  async function copy(name: string) {
    try {
      await navigator.clipboard.writeText(`<${name} />`);
      setCopied(name);
      window.setTimeout(() => setCopied((current) => (current === name ? null : current)), 1400);
    } catch {
      // Clipboard can be blocked; the name is still on screen.
    }
  }

  return (
    <div className="w-full max-w-3xl">
      <div className="mb-5 flex items-center gap-3">
        <label className="flex h-10 flex-1 items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-white/90 focus-within:border-[rgb(var(--neon-accent,34_211_238)/0.6)] focus-within:shadow-[0_0_0_3px_rgb(var(--neon-accent,34_211_238)/0.12)]">
          <Search aria-hidden className="size-4 text-white/50" />
          <span className="sr-only">Filter icons</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Filter ${names.length} icons`}
            className="h-full flex-1 bg-transparent outline-none placeholder:text-white/50"
          />
        </label>
        <p aria-live="polite" className="w-28 text-right text-xs tabular-nums text-white/55">
          {copied ? `Copied <${copied} />` : `${shown.length} shown`}
        </p>
      </div>
      <ul className="grid max-h-[420px] grid-cols-4 gap-1 overflow-y-auto sm:grid-cols-6 md:grid-cols-8">
        {shown.map((name) => {
          const Glyph = icons[name as keyof typeof icons];
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() => copy(name)}
                title={name}
                className="group flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg text-white/75 outline-none transition-colors duration-150 hover:bg-white/[0.04] hover:text-[rgb(var(--neon-accent,34_211_238))] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)]"
              >
                <Glyph aria-hidden className="size-6 transition-[filter] duration-200 group-hover:[filter:drop-shadow(0_0_6px_rgb(var(--neon-accent,34_211_238)/0.7))]" />
                <span className="w-full truncate px-1 text-center text-[10.5px] text-white/55">{name}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {shown.length === 0 && <p className="py-10 text-center text-sm text-white/55">Nothing called “{query}”.</p>}
    </div>
  );
}
