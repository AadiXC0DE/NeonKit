"use client";

import * as React from "react";

/**
 * The site-wide accent. It lives on <html> as --neon-accent so every component
 * on every page follows it, and it's remembered per visitor.
 */

export type Accent = { hue: number; rgb: string; name?: string };

const KEY = "neonkit:accent";
const listeners = new Set<() => void>();
const DEFAULT: Accent = { hue: 187, rgb: "34 211 238", name: "cyan" };
let current: Accent = DEFAULT;
let hydrated = false;

export function hueToRgb(hue: number) {
  // A neon-ish HSL: fully saturated, a touch above mid lightness.
  const s = 0.95;
  const l = 0.6;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)].map((v) => Math.round(v * 255)).join(" ");
}

export function rgbToHue(rgb: string) {
  const [r, g, b] = rgb.split(" ").map((n) => Number(n) / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const d = max - min;
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60;
  return Math.round(h);
}

function apply(accent: Accent) {
  current = accent;
  document.documentElement.style.setProperty("--neon-accent", accent.rgb);
  listeners.forEach((listener) => listener());
}

export function setAccent(accent: Accent) {
  apply(accent);
  try {
    localStorage.setItem(KEY, JSON.stringify(accent));
  } catch {}
}

export function resetAccent() {
  apply(DEFAULT);
  try {
    localStorage.removeItem(KEY);
  } catch {}
}

function subscribe(listener: () => void) {
  if (!hydrated) {
    hydrated = true;
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) apply(JSON.parse(saved) as Accent);
    } catch {}
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAccent() {
  return React.useSyncExternalStore(
    subscribe,
    () => current,
    () => DEFAULT,
  );
}

/** Restores a saved accent on pages that don't render any accent controls. */
export function AccentRestorer() {
  useAccent();
  return null;
}
