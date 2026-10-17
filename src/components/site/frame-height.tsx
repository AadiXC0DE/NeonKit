"use client";

import * as React from "react";

/**
 * Inside a preview iframe: tells the parent page how tall the content is.
 *
 * The parent sizes the iframe to fit, so the embedded document never needs to scroll. Turning its
 * overflow off keeps it from becoming a scroll container that eats the first few pixels of every
 * wheel gesture before the page underneath gets them.
 */
export function FrameHeight({ id }: { id: string }) {
  React.useEffect(() => {
    if (window.parent === window) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";

    let last = 0;
    const post = () => {
      const height = Math.ceil(document.body.getBoundingClientRect().height);
      if (height === last) return;
      last = height;
      window.parent.postMessage({ type: "neonkit:frame-height", id, height }, "*");
    };
    const observer = new ResizeObserver(post);
    observer.observe(document.body);
    post();
    return () => {
      observer.disconnect();
      root.style.overflow = previous;
    };
  }, [id]);
  return null;
}
