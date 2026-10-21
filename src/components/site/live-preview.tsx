"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { demoLoaders } from "./demo-loaders";

/*
 * Component demos render the real thing. A gallery can hold dozens of them, so they share a budget:
 *  - each mounts when it comes near the viewport and unmounts once it's far away, keeping its box so nothing jumps;
 *  - inside a horizontal strip the window is measured against the strip, so sliding a demo out doesn't reboot it;
 *  - mounts are queued, one per idle slice, so a screenful doesn't land in one long task;
 *  - only what's on screen animates.
 *
 * Whole pages (blocks, templates) are too heavy to run by the dozen; galleries show them as screenshots, see
 * preview-shot.tsx.
 */

const idle = (run: () => void) =>
  typeof window.requestIdleCallback === "function"
    ? ((id) => () => window.cancelIdleCallback(id))(window.requestIdleCallback(run, { timeout: 400 }))
    : ((id) => () => window.clearTimeout(id))(window.setTimeout(run, 16));

// ── A queue of mounts with a fixed number of slots ───────────────────────────────────────────────

function createQueue(slots: number, wait: (run: () => void) => () => void) {
  let busy = 0;
  const pending: (() => void)[] = [];
  const pump = () => {
    while (busy < slots && pending.length) {
      const start = pending.shift()!;
      busy++;
      start();
    }
  };
  /** Calls `start` when a slot is free; `start` receives `release`. Returns a cancel that also releases. */
  return (start: (release: () => void) => void) => {
    let state: "waiting" | "running" | "done" = "waiting";
    let cancelWait = () => {};
    const release = () => {
      if (state !== "running") return;
      state = "done";
      busy = Math.max(0, busy - 1);
      pump();
    };
    const entry = () => {
      cancelWait = wait(() => {
        if (state !== "waiting") return;
        state = "running";
        start(release);
      });
    };
    pending.push(entry);
    pump();
    return () => {
      const i = pending.indexOf(entry);
      if (i >= 0) pending.splice(i, 1);
      cancelWait();
      if (state === "waiting") {
        state = "done";
        // The entry already took a slot if it left `pending`.
        if (i < 0) {
          busy = Math.max(0, busy - 1);
          pump();
        }
      } else release();
    };
  };
}

/** Demos are cheaper: one per idle slice, so a screenful doesn't land in one long task. */
const demoQueue = createQueue(1, idle);

// ── Windowing ────────────────────────────────────────────────────────────────────────────────────

/** The nearest ancestor that scrolls sideways, if any. */
function horizontalScroller(node: HTMLElement) {
  for (let el = node.parentElement; el && el !== document.body; el = el.parentElement) {
    const { overflowX } = getComputedStyle(el);
    if (overflowX === "auto" || overflowX === "scroll") return el;
  }
  return null;
}

/** Enter at `near`, leave past `far`: a band with hysteresis so an edge case doesn't flap. */
function band(target: Element, root: Element | null, near: string, far: string, set: (inside: boolean) => void) {
  const enter = new IntersectionObserver(([entry]) => entry.isIntersecting && set(true), { root, rootMargin: near });
  const leave = new IntersectionObserver(([entry]) => !entry.isIntersecting && set(false), { root, rootMargin: far });
  enter.observe(target);
  leave.observe(target);
  return () => {
    enter.disconnect();
    leave.disconnect();
  };
}

function useWindowed<T extends HTMLElement>(near: number, far: number) {
  const ref = React.useRef<T>(null);
  const [inside, setInside] = React.useState(false);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const strip = horizontalScroller(node);
    if (!strip) return band(node, null, `${near}px 0px`, `${far}px 0px`, setInside);
    // In a strip: near the page viewport (the strip is) and near the strip's own window (the item is).
    let page = false;
    let along = false;
    const update = () => setInside(page && along);
    const stopPage = band(strip, null, `${near}px 0px`, `${far}px 0px`, (v) => ((page = v), update()));
    const stopAlong = band(node, strip, `0px ${near * 2}px`, `0px ${far}px`, (v) => ((along = v), update()));
    return () => {
      stopPage();
      stopAlong();
    };
  }, [near, far]);
  return [ref, inside] as const;
}

/** On screen right now. The implicit root clips through scrolling ancestors, strips included. */
function useOnScreen(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [on, setOn] = React.useState(false);
  React.useEffect(() => {
    const node = ref.current;
    if (!node || !enabled) return;
    const io = new IntersectionObserver(([entry]) => setOn(entry.isIntersecting), { threshold: 0.05 });
    io.observe(node);
    return () => {
      io.disconnect();
      setOn(false);
    };
  }, [ref, enabled]);
  return on;
}

const stage =
  "relative isolate overflow-hidden bg-[#05060a] before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-2/3 before:bg-[radial-gradient(60%_80%_at_50%_0%,rgb(var(--neon-accent)/0.07),transparent)]";

// ── Component demos ──────────────────────────────────────────────────────────────────────────────

/** Width of the stage a component demo lays out on before it's scaled into its tile. */
const DEMO_WIDTH = 720;

/** A component's hero demo, loaded only when needed and scaled to fit an 8:5 tile. Inert. */
export function LiveDemo({ slug, className }: { slug: string; className?: string }) {
  const [ref, mounted] = useWindowed<HTMLDivElement>(300, 1400);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [Demo, setDemo] = React.useState<React.ComponentType | null>(null);
  const [scale, setScale] = React.useState(0);
  const onScreen = useOnScreen(ref, Boolean(Demo));

  React.useEffect(() => {
    if (!mounted) return;
    let cancelled = false;
    const cancel = demoQueue((release) => {
      const load = demoLoaders[slug];
      if (!load) return release();
      load()
        .then((module) => !cancelled && setDemo(() => module.default))
        .catch(() => {})
        .finally(release);
    });
    return () => {
      cancelled = true;
      cancel();
      setDemo(null);
      setScale(0);
    };
  }, [mounted, slug]);

  // Fit both ways: offsetWidth/Height ignore the transform, so they're the demo's natural size.
  React.useEffect(() => {
    const node = ref.current;
    const inner = stageRef.current;
    if (!Demo || !node || !inner) return;
    let frame = 0;
    const fit = () => {
      frame = 0;
      const pad = Math.min(48, node.clientWidth * 0.1);
      // Fit the demo's own box, not the whole stage, so small components (a switch, a slider) fill their tile.
      const content = inner.firstElementChild as HTMLElement | null;
      const contentWidth = Math.min(DEMO_WIDTH, Math.max(content?.offsetWidth ?? DEMO_WIDTH, 160));
      const next = Math.min(
        1.5,
        (node.clientWidth - pad) / contentWidth,
        (node.clientHeight - pad) / Math.max(inner.offsetHeight, 1),
      );
      // Rounded, so a demo that breathes by a pixel doesn't rescale the tile every frame.
      setScale((prev) => (Math.abs(prev - next) < 0.01 ? prev : next));
    };
    const ro = new ResizeObserver(() => {
      if (!frame) frame = requestAnimationFrame(fit);
    });
    ro.observe(node);
    ro.observe(inner);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [Demo, ref]);

  return (
    <div
      ref={ref}
      data-nk-paused={Demo && !onScreen ? "" : undefined}
      className={cn(stage, "nk-stage aspect-[8/5] [--neon:var(--neon-accent)]", className)}
    >
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
