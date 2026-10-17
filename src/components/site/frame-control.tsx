"use client";

import * as React from "react";

/** Gallery frames carry this window name, so the page inside knows a parent will tell it when to run. */
export const FRAME_NAME = "neonkit-frame";

export type FrameMessage = { type: "neonkit:frame-ready" } | { type: "neonkit:frame-play"; playing: boolean };

/**
 * Inside a gallery frame: holds the page still until the parent says it's on screen.
 *
 * Frames share the parent's main thread, so an off-screen page that keeps animating makes the page you're
 * actually scrolling stutter. Paused means CSS animations stop (the `data-nk-paused` rule in globals.css),
 * Web Animations stop, and requestAnimationFrame callbacks are held until play resumes.
 */
export function FrameControl() {
  React.useEffect(() => {
    if (window.parent === window || window.name !== FRAME_NAME) return;
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
