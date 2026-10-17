"use client";

import * as React from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const subscribe = () => () => {};

/**
 * Page views and Core Web Vitals for real visits only. Gallery previews are frames of this same app; mounting
 * the scripts there would load them a dozen times per landing visit and count every preview as a view.
 */
export function SiteAnalytics() {
  const topLevel = React.useSyncExternalStore(
    subscribe,
    () => window.self === window.top,
    () => false,
  );
  if (!topLevel) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
