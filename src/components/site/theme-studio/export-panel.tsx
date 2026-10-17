"use client";

import * as React from "react";
import { CodeBlock } from "@/components/ui/code-block";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
import { globalsCss, installCommand, neonTs, registryJson, shareUrl, tailwindConfig } from "./exports";
import { stockPalette, type Theme } from "./state";

function Line({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="grid min-w-0 gap-2">
      <p className="text-[14px] text-white/60">{label}</p>
      <div className="flex min-w-0 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] py-1 pl-3.5 pr-1">
        <code tabIndex={0} className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-2 font-mono text-[12.5px] text-white/85 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {value}
        </code>
        <CopyButton value={value} size="sm" aria-label={`Copy ${label.toLowerCase()}`} />
      </div>
      {children}
    </div>
  );
}

export function ExportPanel({ theme, className }: { theme: Theme; className?: string }) {
  const paletteChanged =
    theme.palette.length !== stockPalette.length ||
    theme.palette.some((t, i) => t.name !== stockPalette[i].name || t.rgb !== stockPalette[i].rgb);

  const files = [
    { filename: "app/globals.css", code: globalsCss(theme), language: "css" },
    { filename: "lib/neon.ts", code: neonTs(theme), language: "ts" },
    ...(theme.radius !== 100 ? [{ filename: "tailwind.config.js", code: tailwindConfig(theme), language: "js" }] : []),
    { filename: "theme.json", code: registryJson(theme), language: "json" },
  ];
  const [file, setFile] = React.useState(files[0].filename);
  const active = files.some((f) => f.filename === file) ? file : files[0].filename;

  return (
    <section aria-labelledby="nk-studio-export" className={cn("grid gap-12 lg:grid-cols-12 lg:gap-8", className)}>
      <div className="grid min-w-0 content-start gap-8 lg:col-span-4">
        <div>
          <h2 id="nk-studio-export" className="type-display text-[clamp(1.9rem,3vw,2.6rem)] text-fg">
            Take it with you
          </h2>
          <p className="mt-4 max-w-[34rem] text-[15.5px] leading-[1.6] text-muted">
            One command writes the variables into your globals.css
            {paletteChanged ? " and your palette into lib/neon.ts" : ""}. Or copy the files by hand.
          </p>
        </div>
        <Line label="Install with the shadcn CLI" value={installCommand(theme)}>
          {paletteChanged && (
            <p className="text-[13px] leading-5 text-white/55">
              Components you add later ask to overwrite lib/neon.ts with the stock palette. Answer no.
            </p>
          )}
        </Line>
        <Line label="Share this theme" value={shareUrl(theme)} />
        <ul className="grid gap-2.5 border-t border-white/[0.07] pt-6 text-[13.5px] leading-5 text-white/55">
          <li>
            Corners scale through Tailwind&apos;s <span className="font-mono text-white/75">--radius-*</span> scale.
            Arbitrary radii like <span className="font-mono text-white/75">rounded-[14px]</span> keep their size.
          </li>
          <li>
            Surface sets the page. Popovers and focus-ring offsets keep their own near-black, so very tinted surfaces show
            a seam there.
          </li>
          <li>Motion off also stops the blinking caret and loading spinners. Reduced keeps state changes.</li>
        </ul>
      </div>
      <div className="min-w-0 lg:col-span-8">
        <CodeBlock files={files} value={active} onValueChange={setFile} maxHeight={520} lineNumbers />
      </div>
    </section>
  );
}
