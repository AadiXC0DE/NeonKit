"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { demoLoaders } from "./demo-loaders";
import { FRAME_NAME, type FrameMessage } from "./frame-control";

/*
 * Previews render the real thing, never a screenshot. A gallery can hold dozens of them, so they share a budget:
 *  - each mounts when it comes near the viewport and unmounts once it's far away, keeping its box so nothing jumps;
 *  - inside a horizontal strip the window is measured against the strip, so sliding a frame out doesn't reboot it;
 *  - mounts are queued: one iframe boots at a time and only once scrolling settles, demos one per idle slice;
 *  - only what's on screen animates. Frames are paused from inside while off screen or mid-scroll.
 */

// ── Scrolling, shared by every preview on the page ───────────────────────────────────────────────

const SCROLL_IDLE = 160;
let scrolling = false;
let scrollTimer = 0;
const scrollListeners = new Set<() => void>();
const idleWaiters: (() => void)[] = [];

function onScroll() {
  window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(() => {
    scrolling = false;
    scrollListeners.forEach((notify) => notify());
    idleWaiters.splice(0).forEach((run) => run());
  }, SCROLL_IDLE);
  if (!scrolling) {
    scrolling = true;
    scrollListeners.forEach((notify) => notify());
  }
}

function subscribeScroll(notify: () => void) {
  if (scrollListeners.size === 0) document.addEventListener("scroll", onScroll, { capture: true, passive: true });
  scrollListeners.add(notify);
  return () => {
    scrollListeners.delete(notify);
    if (scrollListeners.size === 0) document.removeEventListener("scroll", onScroll, { capture: true });
  };
}

function useScrolling() {
  return React.useSyncExternalStore(
    subscribeScroll,
    () => scrolling,
    () => false,
  );
}

/** Runs `run` once the page stops scrolling, or after `maxWait` ms regardless. Returns a cancel. */
function whenScrollIdle(run: () => void, maxWait: number) {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    window.clearTimeout(fallback);
    const i = idleWaiters.indexOf(go);
    if (i >= 0) idleWaiters.splice(i, 1);
    run();
  };
  const fallback = window.setTimeout(go, maxWait);
  if (scrolling) idleWaiters.push(go);
  else window.setTimeout(go, 0);
  return () => {
    done = true;
    window.clearTimeout(fallback);
    const i = idleWaiters.indexOf(go);
    if (i >= 0) idleWaiters.splice(i, 1);
  };
}

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

/** Iframes boot a whole document: one at a time, between scrolls. */
const frameQueue = createQueue(1, (run) => whenScrollIdle(run, 1200));
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

/** Tracks an element's width, for scaling a fixed-size stage into it. */
function useWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState(0);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(node);
    return () => ro.disconnect();
  }, [ref]);
  return width;
}

const stage =
  "relative isolate overflow-hidden bg-[#05060a] before:absolute before:inset-x-0 before:top-0 before:-z-10 before:h-2/3 before:bg-[radial-gradient(60%_80%_at_50%_0%,rgb(var(--neon-accent)/0.07),transparent)]";

// ── Frames ───────────────────────────────────────────────────────────────────────────────────────

/** The iframe itself: a fresh instance per mount, so its loading state resets with it. */
function Frame({
  src,
  title,
  viewport,
  scale,
  playing,
}: {
  src: string;
  title: string;
  viewport: number;
  scale: number;
  playing: boolean;
}) {
  const [started, setStarted] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const frameRef = React.useRef<HTMLIFrameElement>(null);
  const releaseRef = React.useRef<() => void>(() => {});
  const playingRef = React.useRef(playing);
  React.useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  React.useEffect(
    () =>
      frameQueue((release) => {
        releaseRef.current = release;
        setStarted(true);
      }),
    [],
  );

  const send = React.useCallback((value: boolean) => {
    const message: FrameMessage = { type: "neonkit:frame-play", playing: value };
    frameRef.current?.contentWindow?.postMessage(message, window.location.origin);
  }, []);

  // The frame says hello once it can listen; answer with whether it should be running.
  React.useEffect(() => {
    if (!started) return;
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if ((event.data as FrameMessage | undefined)?.type === "neonkit:frame-ready") send(playingRef.current);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [started, send]);

  React.useEffect(() => {
    if (loaded) send(playing);
  }, [loaded, playing, send]);

  if (!started) return null;
  return (
    <iframe
      ref={frameRef}
      src={src}
      name={FRAME_NAME}
      title={title}
      tabIndex={-1}
      aria-hidden
      onLoad={() => {
        setLoaded(true);
        releaseRef.current();
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
 * On-screen frames boot first. Neighbours just off screen boot ahead of time, but only once the page has been
 * still for a while, so a boot never lands at the start of the next swipe.
 */
function FrameSlot({ onScreen, scrolling, children }: { onScreen: boolean; scrolling: boolean; children: React.ReactNode }) {
  const [warm, setWarm] = React.useState(false);
  // Once it's been on screen it has booted (or is booting): keep it.
  if (onScreen && !warm) setWarm(true);
  React.useEffect(() => {
    if (warm || scrolling) return;
    const timer = window.setTimeout(() => setWarm(true), 900);
    return () => window.clearTimeout(timer);
  }, [scrolling, warm]);
  return onScreen || warm ? children : null;
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
  const [ref, mounted] = useWindowed<HTMLDivElement>(200, 1000);
  const width = useWidth(ref);
  const onScreen = useOnScreen(ref, mounted);
  const scrolling = useScrolling();
  return (
    <div ref={ref} className={cn(stage, "aspect-[8/5]", className)}>
      {mounted && width > 0 && (
        <FrameSlot onScreen={onScreen} scrolling={scrolling}>
          <Frame src={src} title={title} viewport={viewport} scale={width / viewport} playing={onScreen && !scrolling} />
        </FrameSlot>
      )}
    </div>
  );
}

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
