"use client";

import * as React from "react";

/** Inside a preview iframe: tells the parent page how tall the content is. */
export function FrameHeight({ id }: { id: string }) {
  React.useEffect(() => {
    if (window.parent === window) return;
    const post = () =>
      window.parent.postMessage({ type: "neonkit:frame-height", id, height: document.body.scrollHeight }, "*");
    const observer = new ResizeObserver(post);
    observer.observe(document.body);
    post();
    return () => observer.disconnect();
  }, [id]);
  return null;
}
