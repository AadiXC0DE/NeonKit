"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { demoLoaders } from "./demo-loaders";

/**
 * Previews render the real thing, never a screenshot. To keep long galleries smooth, each one mounts when it
 * comes within `near` px of the viewport and unmounts once it's `far` px away, keeping its box so nothing jumps.
 */
function useWindowed<T extends HTMLElement>(near = 400, far = 1600, settle = 0) {
  const ref = React.useRef<T>(null);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let timer = 0;
    // `settle` skips previews you only fling past: they mount after staying near the viewport that long.
    const enter = new IntersectionObserver(
      ([entry]) => {
        window.clearTimeout(timer);
        if (entry.isIntersecting) timer = window.setTimeout(() => setMounted(true), settle);
      },
      { rootMargin: `${near}px 0px` },
    );
    const leave = new IntersectionObserver(([entry]) => !entry.isIntersecting && setMounted(false), {
      rootMargin: `${far}px 0px`,
    });
    enter.observe(node);
    leave.observe(node);
    return () => {
      window.clearTimeout(timer);
      enter.disconnect();
      leave.disconnect();
    };
  }, [near, far, settle]);
  return [ref, mounted] as const;
}

/** Frames load one or two at a time; a page full of them never starts thirty documents at once. */
const MAX_LOADING = 2;
let loading = 0;
const waiting: (() => void)[] = [];
function requestSlot(start: () => void) {
  if (loading < MAX_LOADING) {
    loading++;
    start();
    return () => {};
  }
  waiting.push(start);
  return () => {
    const i = waiting.indexOf(start);
    if (i >= 0) waiting.splice(i, 1);
  };
}
function releaseSlot() {
  const next = waiting.shift();
  if (next) next();
  else loading = Math.max(0, loading - 1);
}

/** Tracks an element's width, for scaling a fixed-size stage into it. */
function useWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    ro.observe(node);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

const stage =
  "relative isolate overflow-hidden bg-[#05060a] before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-2/3 before:bg-[radial-gradient(60%_80%_at_50%_0%,rgb(var(--neon-accent)/0.07),transparent)]";

/** The iframe itself: a fresh instance per mount, so its loading state resets with it. */
function Frame({ src, title, viewport, scale }: { src: string; title: string; viewport: number; scale: number }) {
  const [started, setStarted] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const holding = React.useRef(false);

  React.useEffect(() => {
    const cancel = requestSlot(() => {
      holding.current = true;
      setStarted(true);
    });
    return () => {
      cancel();
      if (holding.current) releaseSlot();
      holding.current = false;
    };
  }, []);

  if (!started) return null;
  return (
    <iframe
      src={src}
      title={title}
      tabIndex={-1}
      aria-hidden
      onLoad={() => {
        setLoaded(true);
        if (holding.current) {
          holding.current = false;
          releaseSlot();
        }
      }}
      className={cn(
        "pointer-events-none absolute left-0 top-0 origin-top-left border-0 transition-opacity duration-300 motion-reduce:transition-none",
        loaded ? "opacity-100" : "opacity-0",
      )}
      style={{ width: viewport, height: viewport * 0.625, transform: `scale(${scale})` }}
    />
  );
}

/**
 * A real page (a block's /view route or a template's /preview route) drawn at a desktop viewport and scaled
 * to fit, so it stays sharp at any size. Inert: it's a picture of the page you can't tab into.
 */
export function LiveFrame({
  src,
  title,
  viewport = 1440,
  className,
}: {
  src: string;
  /** Names the frame for assistive tech that reaches it anyway. */
  title: string;
  /** Width of the virtual browser the page lays out in. */
  viewport?: number;
  className?: string;
}) {
  const [ref, mounted] = useWindowed<HTMLDivElement>(150, 900, 150);
  const width = useWidth(ref);
  return (
    <div ref={ref} className={cn(stage, "aspect-[8/5]", className)}>
      {mounted && width > 0 && <Frame src={src} title={title} viewport={viewport} scale={width / viewport} />}
    </div>
  );
}

/** Width of the stage a component demo lays out on before it's scaled into its tile. */
const DEMO_WIDTH = 720;

/** A component's hero demo, loaded only when needed and scaled to fit an 8:5 tile. Inert. */
export function LiveDemo({ slug, className }: { slug: string; className?: string }) {
  const [ref, mounted] = useWindowed<HTMLDivElement>(300, 1400, 120);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [Demo, setDemo] = React.useState<React.ComponentType | null>(null);
  const [scale, setScale] = React.useState(0);

  React.useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    demoLoaders[slug]?.()
      .then((module) => !cancelled && setDemo(() => module.default))
      .catch(() => {});
    return () => {
      cancelled = true;
      setDemo(null);
      setScale(0);
    };
  }, [mounted, slug]);

  // Fit both ways: offsetWidth/Height ignore the transform, so they're the demo's natural size.
  React.useEffect(() => {
    const node = ref.current;
    const inner = stageRef.current;
    if (!Demo || !node || !inner) return;
    const fit = () => {
      const pad = Math.min(48, node.clientWidth * 0.1);
      // Fit the demo's own box, not the whole stage, so small components (a switch, a slider) fill their tile.
      const content = inner.firstElementChild as HTMLElement | null;
      const contentWidth = Math.min(DEMO_WIDTH, Math.max(content?.offsetWidth ?? DEMO_WIDTH, 160));
      setScale(
        Math.min(
          1.5,
          (node.clientWidth - pad) / contentWidth,
          (node.clientHeight - pad) / Math.max(inner.offsetHeight, 1),
        ),
      );
    };
    const ro = new ResizeObserver(fit);
    ro.observe(node);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [Demo, ref]);

  return (
    <div ref={ref} className={cn(stage, "nk-stage aspect-[8/5] [--neon:var(--neon-accent)]", className)}>
      {Demo && (
        <div
          ref={stageRef}
          inert
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 flex items-center justify-center transition-opacity duration-300 motion-reduce:transition-none",
            scale > 0 ? "opacity-100" : "opacity-0",
          )}
          style={{ width: DEMO_WIDTH, transform: `translate(-50%, -50%) scale(${scale || 0.5})` }}
        >
          <Demo />
        </div>
      )}
    </div>
  );
}
