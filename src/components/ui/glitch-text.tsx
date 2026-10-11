"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

// Two colored copies sit behind the text. During a burst they jump between
// horizontal slices (clip-path) and offsets in steps, so the split reads as a
// signal fault rather than a smooth wobble. The alternate color defaults to
// the neon hue turned 150 degrees, so it always contrasts with the accent.
const css = `
.nk-glitch-text { --nk-glitch-alt: rgb(240 70 235); }
@supports (color: hsl(from red h s l)) {
  .nk-glitch-text { --nk-glitch-alt: hsl(from rgb(var(--neon)) calc(h + 150) s l); }
}
.nk-glitch-text-a { color: rgb(var(--neon)); text-shadow: 0 0 0.12em rgb(var(--neon) / 0.7); }
.nk-glitch-text-b { color: var(--nk-glitch-alt); text-shadow: 0 0 0.12em var(--nk-glitch-alt); }
.nk-glitch-text-a, .nk-glitch-text-b { opacity: 0; }
.nk-glitch-text:is([data-active], [data-burst]) .nk-glitch-text-a,
.nk-glitch-text:is([data-active], [data-burst]) .nk-glitch-text-b,
.nk-glitch-text[data-trigger="hover"]:hover .nk-glitch-text-a,
.nk-glitch-text[data-trigger="hover"]:hover .nk-glitch-text-b { opacity: 0.9; }
.nk-glitch-text:is([data-active], [data-burst]) .nk-glitch-text-a,
.nk-glitch-text[data-trigger="hover"]:hover .nk-glitch-text-a { animation: nk-glitch-text-a var(--nk-glitch-speed) steps(1, end) infinite; }
.nk-glitch-text:is([data-active], [data-burst]) .nk-glitch-text-b,
.nk-glitch-text[data-trigger="hover"]:hover .nk-glitch-text-b { animation: nk-glitch-text-b calc(var(--nk-glitch-speed) * 1.17) steps(1, end) infinite; }
.nk-glitch-text:is([data-active], [data-burst]) .nk-glitch-text-base,
.nk-glitch-text[data-trigger="hover"]:hover .nk-glitch-text-base { animation: nk-glitch-text-base calc(var(--nk-glitch-speed) * 1.31) steps(1, end) infinite; }
@keyframes nk-glitch-text-a {
  0% { clip-path: inset(6% 0 58% 0); transform: translate(calc(var(--nk-glitch-x) * -1), 0); }
  17% { clip-path: inset(48% 0 20% 0); transform: translate(calc(var(--nk-glitch-x) * 1.5), 0); }
  33% { clip-path: inset(0 0 0 0); transform: translate(calc(var(--nk-glitch-x) * -0.5), 0); }
  50% { clip-path: inset(70% 0 4% 0); transform: translate(var(--nk-glitch-x), 0); }
  67% { clip-path: inset(18% 0 52% 0); transform: translate(calc(var(--nk-glitch-x) * -1.8), 0); }
  83% { clip-path: inset(38% 0 30% 0); transform: translate(calc(var(--nk-glitch-x) * 0.6), 0); }
  100% { clip-path: inset(6% 0 58% 0); transform: translate(calc(var(--nk-glitch-x) * -1), 0); }
}
@keyframes nk-glitch-text-b {
  0% { clip-path: inset(62% 0 8% 0); transform: translate(var(--nk-glitch-x), 0); }
  20% { clip-path: inset(0 0 0 0); transform: translate(calc(var(--nk-glitch-x) * 0.6), 0); }
  40% { clip-path: inset(12% 0 64% 0); transform: translate(calc(var(--nk-glitch-x) * -1.4), 0); }
  60% { clip-path: inset(44% 0 36% 0); transform: translate(calc(var(--nk-glitch-x) * 1.7), 0); }
  80% { clip-path: inset(80% 0 2% 0); transform: translate(calc(var(--nk-glitch-x) * -0.8), 0); }
  100% { clip-path: inset(62% 0 8% 0); transform: translate(var(--nk-glitch-x), 0); }
}
@keyframes nk-glitch-text-base {
  0%, 100% { transform: none; clip-path: none; }
  22% { transform: translate(calc(var(--nk-glitch-x) * 0.35), 0) skewX(var(--nk-glitch-skew)); clip-path: var(--nk-glitch-cut, none); }
  44% { transform: none; clip-path: none; }
  66% { transform: translate(calc(var(--nk-glitch-x) * -0.25), 0) skewX(calc(var(--nk-glitch-skew) * -0.6)); }
  80% { transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .nk-glitch-text .nk-glitch-text-a, .nk-glitch-text .nk-glitch-text-b, .nk-glitch-text .nk-glitch-text-base { animation: none !important; opacity: 0 !important; }
  .nk-glitch-text .nk-glitch-text-base { opacity: 1 !important; }
}
`;

const intensities = {
  subtle: { x: "0.03em", skew: "0deg", speed: "360ms", burst: [200, 260], cut: "none" },
  medium: { x: "0.06em", skew: "3deg", speed: "300ms", burst: [240, 340], cut: "none" },
  heavy: { x: "0.11em", skew: "9deg", speed: "240ms", burst: [300, 400], cut: "polygon(0 0, 100% 0, 100% 46%, 0 46%, 0 58%, 100% 58%, 100% 100%, 0 100%)" },
} as const;

type Trigger = "hover" | "always" | "inView" | "manual";

export interface GlitchTextProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Element to render. */
  as?: "span" | "p" | "div" | "h1" | "h2" | "h3" | "h4";
  /** When it glitches: on hover, in periodic bursts, once each time it scrolls into view, or while `active`. */
  trigger?: Trigger;
  /** With `trigger="manual"`: glitches while true. */
  active?: boolean;
  /** How far the slices jump and how hard the text skews. */
  intensity?: keyof typeof intensities;
  /** The first split layer. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** The second split layer. Defaults to the neon hue turned 150°. */
  colorAlt?: NeonColor;
}

const GlitchText = React.forwardRef<HTMLElement, GlitchTextProps>(
  (
    {
      className,
      style,
      color,
      colorAlt,
      as: Tag = "span",
      trigger = "always",
      active = false,
      intensity = "medium",
      children,
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLElement);
    const preset = intensities[intensity];

    React.useEffect(() => {
      const node = rootRef.current;
      if (!node || (trigger !== "always" && trigger !== "inView")) return;
      if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

      const [min, max] = preset.burst;
      let burstTimer: ReturnType<typeof setTimeout> | undefined;
      let restTimer: ReturnType<typeof setTimeout> | undefined;
      let visible = typeof IntersectionObserver === "undefined";

      const burst = () => {
        node.setAttribute("data-burst", "");
        clearTimeout(burstTimer);
        burstTimer = setTimeout(() => node.removeAttribute("data-burst"), min + Math.random() * (max - min));
      };
      const schedule = (delay: number) => {
        clearTimeout(restTimer);
        restTimer = setTimeout(() => {
          if (visible && !document.hidden) burst();
          schedule(2200 + Math.random() * 3200);
        }, delay);
      };

      const io =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(
              ([entry]) => {
                const wasVisible = visible;
                visible = entry.isIntersecting;
                if (trigger === "inView" && visible && !wasVisible) burst();
              },
              { threshold: trigger === "inView" ? 0.6 : 0 },
            );
      io?.observe(node);
      if (trigger === "always") schedule(900 + Math.random() * 1200);
      else if (!io) burst();

      return () => {
        io?.disconnect();
        clearTimeout(burstTimer);
        clearTimeout(restTimer);
        node.removeAttribute("data-burst");
      };
    }, [trigger, preset]);

    const vars = {
      "--nk-glitch-x": preset.x,
      "--nk-glitch-skew": preset.skew,
      "--nk-glitch-speed": preset.speed,
      "--nk-glitch-cut": preset.cut,
      ...(colorAlt ? { "--nk-glitch-alt": `rgb(${toNeonRgb(colorAlt)})` } : null),
      ...style,
    } as React.CSSProperties;

    const layer = "nk-glitch-text-layer pointer-events-none absolute inset-0 -z-10 select-none";

    return (
      <Tag
        ref={rootRef as React.Ref<HTMLHeadingElement>}
        data-trigger={trigger}
        data-active={(trigger === "manual" && active) || undefined}
        style={neonVars(color, vars)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "nk-glitch-text relative isolate inline-block",
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        <span className="nk-glitch-text-base inline-block">{children}</span>
        <span aria-hidden className={cn(layer, "nk-glitch-text-a")}>
          {children}
        </span>
        <span aria-hidden className={cn(layer, "nk-glitch-text-b")}>
          {children}
        </span>
      </Tag>
    );
  },
);
GlitchText.displayName = "GlitchText";

export { GlitchText };
