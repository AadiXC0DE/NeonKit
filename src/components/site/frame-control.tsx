"use client";

import * as React from "react";

/** Gallery frames carry this window name, so the page inside knows a parent will tell it when to run. */
export const FRAME_NAME = "neonkit-frame";

export type FrameMessage = { type: "neonkit:frame-ready" } | { type: "neonkit:frame-play"; playing: boolean };

/** The window name for a frame drawn at `scale`: the page inside reads it back before anything renders. */
export const frameName = (scale: number) => `${FRAME_NAME}:${scale.toFixed(3)}`;

const isGalleryFrame = () => window.parent !== window && window.name.startsWith(FRAME_NAME);

/*
 * A gallery frame lays out at desktop width and is drawn at a third of that or less. Canvases size their backing
 * store from devicePixelRatio, so left alone every one of them renders at full desktop resolution only to be shrunk,
 * and a page of frames runs out of memory. Report the ratio the frame is actually shown at instead: canvases come
 * out exactly as sharp as the pixels they land on. Runs when this module loads, before any component's effects.
 */
if (typeof window !== "undefined" && isGalleryFrame()) {
  const scale = Number(window.name.slice(FRAME_NAME.length + 1));
  if (scale > 0 && scale < 1) {
    const ratio = Math.max(0.5, Math.round((window.devicePixelRatio || 1) * scale * 100) / 100);
    Object.defineProperty(window, "devicePixelRatio", { configurable: true, get: () => ratio });
  }
}

/**
 * Inside a gallery frame: holds the page still until the parent says it's on screen.
 *
 * Frames share the parent's main thread, so an off-screen page that keeps animating makes the page you're
 * actually scrolling stutter. Paused means CSS animations stop (the `data-nk-paused` rule in globals.css),
 * Web Animations stop, and requestAnimationFrame callbacks are held until play resumes.
 */
export function FrameControl() {
  React.useEffect(() => {
    if (!isGalleryFrame()) return;
    const root = document.documentElement;
    const nativeRaf = window.requestAnimationFrame.bind(window);
    const nativeCancel = window.cancelAnimationFrame.bind(window);
    const held = new Map<number, FrameRequestCallback>();
    const stopped = new Set<Animation>();
    let nextId = 1 << 30;
    let paused = true;

    window.requestAnimationFrame = (callback) => {
      if (!paused) return nativeRaf(callback);
      const id = nextId++;
      held.set(id, callback);
      return id;
    };
    window.cancelAnimationFrame = (id) => {
      if (!held.delete(id)) nativeCancel(id);
    };

    const set = (value: boolean) => {
      paused = value;
      root.toggleAttribute("data-nk-paused", value);
      if (value) {
        for (const animation of document.getAnimations()) {
          // CSS animations are held by the stylesheet rule; script-driven ones need pausing by hand.
          if (animation.playState === "running" && !(animation instanceof CSSAnimation)) {
            animation.pause();
            stopped.add(animation);
          }
        }
        return;
      }
      stopped.forEach((animation) => animation.play());
      stopped.clear();
      const callbacks = [...held.values()];
      held.clear();
      callbacks.forEach((callback) => nativeRaf(callback));
    };
    set(true);

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as FrameMessage | undefined;
      if (data?.type === "neonkit:frame-play") set(!data.playing);
    };
    window.addEventListener("message", onMessage);
    const hello: FrameMessage = { type: "neonkit:frame-ready" };
    window.parent.postMessage(hello, window.location.origin);

    return () => {
      window.removeEventListener("message", onMessage);
      window.requestAnimationFrame = nativeRaf;
      window.cancelAnimationFrame = nativeCancel;
      set(false);
    };
  }, []);
  return null;
}
