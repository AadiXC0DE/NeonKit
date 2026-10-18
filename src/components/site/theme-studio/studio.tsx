"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";
import { Channels, Master, Readout } from "./desk";
import { ExportPanel } from "./export-panel";
import { shareUrl } from "./exports";
import { Scene } from "./scene";
import { accentOf, encodeTheme, isStock, stockTheme, type Theme } from "./state";

const wide = "(min-width: 1024px)";
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(wide);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/** Desktop on the server; the real answer after hydration. One scene mounts, never both. */
function useWide() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(wide).matches,
    () => true,
  );
}

export function ThemeStudio({ initial }: { initial: Theme }) {
  const isWide = useWide();
  const [theme, setTheme] = React.useState(initial);
  const [stock, setStock] = React.useState(false);
  const update = React.useCallback((fn: (t: Theme) => Theme) => setTheme(fn), []);
  const shown = stock ? stockTheme : theme;
  const accent = accentOf(theme);

  // The query string is the save file: every change lands in the address bar.
  React.useEffect(() => {
    const id = window.setTimeout(() => {
      const qs = encodeTheme(theme);
      const next = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
      if (next !== `${window.location.pathname}${window.location.search}${window.location.hash}`) {
        window.history.replaceState(window.history.state, "", next);
      }
    }, 120);
    return () => window.clearTimeout(id);
  }, [theme]);

  // The desk and export are lit by the theme's own accent, at stock glow.
  const deskStyle = { "--neon-accent": accent.rgb } as React.CSSProperties;

  return (
    <>
      <section aria-labelledby="nk-studio-title" className="relative">
        <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4 pb-6 pt-7 sm:pt-9">
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <h1 id="nk-studio-title" className="type-display text-[clamp(2.1rem,3.6vw,3rem)] text-fg">
                Theme Studio
              </h1>
              <p className="max-w-[40rem] text-[15.5px] leading-[1.55] text-muted">
                Retune the palette, the glow, the corners and the room. The bench lights up as you go.
              </p>
            </div>
            <div className="flex items-center gap-2" style={deskStyle}>
              <Button variant="ghost" size="sm" disabled={isStock(theme)} onClick={() => setTheme(stockTheme)}>
                Reset
              </Button>
              <CopyButton value={() => shareUrl(theme)} variant="outline" size="sm" copiedLabel="Link copied">
                Copy link
              </CopyButton>
            </div>
          </div>

        </div>

        {isWide ? (
          <div className="mx-auto max-w-[88rem] px-6">
            <div
              aria-label="Preview"
              role="region"
              className="overflow-hidden rounded-[18px] border border-white/[0.07] shadow-[0_40px_80px_-40px_rgb(0_0_0/0.9)]"
            >
              <Scene theme={shown} />
            </div>
          </div>
        ) : (
          // Phones and tablets: the bench stays pinned while the desk scrolls under it.
          <div aria-label="Preview" role="region" className="sticky top-14 z-20 border-y border-white/[0.07]">
            <Scene theme={shown} compact />
          </div>
        )}

        {/* Desktop: the desk docks to the bottom of the window until the bench has scrolled past. */}
        <div style={deskStyle} className="z-30 lg:sticky lg:bottom-3 lg:mt-4">
          <div className="mx-auto max-w-[88rem] lg:px-6">
            <div
              className={cn(
                "border-y border-white/[0.08] bg-[#090a0f]/95 px-4 py-7 backdrop-blur-xl sm:px-6",
                "lg:rounded-[18px] lg:border lg:px-7 lg:py-5 lg:shadow-[0_24px_60px_-12px_rgb(0_0_0/0.95),0_0_0_1px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.06)]",
              )}
            >
              <h2 className="sr-only">Controls</h2>
              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-end lg:gap-10">
                <Channels theme={theme} update={update} />
                {isWide && <Readout theme={theme} />}
                <Master
                  theme={theme}
                  update={update}
                  stock={stock}
                  onStockChange={setStock}
                  layout={isWide ? "row" : "grid"}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={deskStyle} className="mx-auto max-w-[88rem] px-4 pb-32 pt-24 sm:px-6 sm:pt-28">
        <ExportPanel theme={theme} />
      </div>
    </>
  );
}
