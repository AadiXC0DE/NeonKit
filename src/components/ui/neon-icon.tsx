"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

export type NeonIconName = "signal" | "wifi" | "battery" | "bolt" | "power" | "heart" | "bell";

// level: one step of the meter · on: lit while value > 0 · always: the casing · ring: lit while animated
type Role = "level" | "on" | "always" | "ring";
type Part = { d: string; role: Role; width: number; cap?: "round" | "butt" };

// Drawn as single strokes on a 24px grid, so every part can be a tube.
const icons: Record<NeonIconName, Part[]> = {
  signal: [
    { d: "M4.75 19.5v-2.75", role: "level", width: 2.5 },
    { d: "M9.5 19.5v-6.25", role: "level", width: 2.5 },
    { d: "M14.25 19.5v-9.75", role: "level", width: 2.5 },
    { d: "M19 19.5V6.25", role: "level", width: 2.5 },
  ],
  wifi: [
    { d: "M12 19.25h.01", role: "on", width: 3 },
    { d: "M8.75 16a4.6 4.6 0 0 1 6.5 0", role: "level", width: 2.1 },
    { d: "M5.71 12.96a8.9 8.9 0 0 1 12.58 0", role: "level", width: 2.1 },
    { d: "M2.67 9.92a13.2 13.2 0 0 1 18.66 0", role: "level", width: 2.1 },
  ],
  battery: [
    { d: "M4.5 6.75h13a2.25 2.25 0 0 1 2.25 2.25v6a2.25 2.25 0 0 1-2.25 2.25h-13A2.25 2.25 0 0 1 2.25 15V9A2.25 2.25 0 0 1 4.5 6.75Z", role: "always", width: 1.5 },
    { d: "M22 10.25v3.5", role: "always", width: 1.75 },
    { d: "M5.45 9.4v5.2", role: "level", width: 2.4, cap: "butt" },
    { d: "M8.9 9.4v5.2", role: "level", width: 2.4, cap: "butt" },
    { d: "M12.35 9.4v5.2", role: "level", width: 2.4, cap: "butt" },
    { d: "M15.8 9.4v5.2", role: "level", width: 2.4, cap: "butt" },
  ],
  bolt: [{ d: "M13.5 2.75 5 13.25h6.25l-1 8 8.75-10.5h-6.25l.75-8Z", role: "on", width: 1.6 }],
  power: [
    { d: "M16.93 6.7A8 8 0 1 1 7.07 6.7", role: "on", width: 1.9 },
    { d: "M12 3.25v8", role: "on", width: 1.9 },
  ],
  heart: [
    { d: "M12 20.25 4.6 12.85a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9a4.6 4.6 0 0 1 6.5 6.5Z", role: "on", width: 1.6 },
  ],
  bell: [
    { d: "M5.25 17.25h13.5l-1.5-2V10.5a5.25 5.25 0 0 0-10.5 0v4.75Z", role: "on", width: 1.6 },
    { d: "M10 20.25a2.1 2.1 0 0 0 4 0", role: "on", width: 1.6 },
    { d: "M12 3.25v2", role: "on", width: 1.6 },
    { d: "M19.75 4.5a8.6 8.6 0 0 1 2 3.75", role: "ring", width: 1.6 },
    { d: "M4.25 4.5a8.6 8.6 0 0 0-2 3.75", role: "ring", width: 1.6 },
  ],
};

const sizes = { sm: 16, md: 20, lg: 24 } as const;

const baseCss = `
@keyframes nk-neon-icon-ignite { 0% { opacity: 0; } 14% { opacity: 0.9; } 26% { opacity: 0.15; } 44% { opacity: 1; } 56% { opacity: 0.45; } 72%, 100% { opacity: 1; } }
@keyframes nk-neon-icon-surge { 0%, 84%, 100% { opacity: 1; } 86% { opacity: 0.3; } 88% { opacity: 1; } 91% { opacity: 0.5; } 93% { opacity: 1; } }
@keyframes nk-neon-icon-breathe { 0%, 100% { opacity: 1; } 50% { opacity: 0.28; } }
@keyframes nk-neon-icon-beat { 0% { transform: scale(1); } 14% { transform: scale(1.13); } 28% { transform: scale(0.98); } 42% { transform: scale(1.07); } 70%, 100% { transform: scale(1); } }
@keyframes nk-neon-icon-ring { 0% { transform: rotate(0deg); } 6% { transform: rotate(14deg); } 14% { transform: rotate(-12deg); } 22% { transform: rotate(9deg); } 30% { transform: rotate(-6deg); } 38% { transform: rotate(3deg); } 46%, 100% { transform: rotate(0deg); } }
@keyframes nk-neon-icon-wave { 0%, 3% { opacity: 0; } 6%, 34% { opacity: 1; } 48%, 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .nk-neon-icon-motion { animation: none !important; } }
`;

// Segments light one after another, hold together, then drop out together.
function seekKeyframes(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const on = Math.round(8 + (i * 56) / count);
    return `@keyframes nk-neon-icon-seek-${count}-${i} { 0%, ${on}% { opacity: 0; } ${on + 2}%, 80% { opacity: 1; } 86%, 100% { opacity: 0; } }`;
  }).join("\n");
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

function defaultLabel(icon: NeonIconName, value: number, lit: number, levels: number, animated: boolean) {
  const on = value > 0;
  switch (icon) {
    case "signal":
      return animated ? "Searching for signal" : `Signal: ${lit} of ${levels} bars`;
    case "wifi":
      return animated ? "Searching for Wi-Fi" : on ? `Wi-Fi: ${lit} of ${levels} bars` : "Wi-Fi off";
    case "battery":
      return `Battery ${Math.round(clamp(value) * 100)}%${animated ? ", charging" : ""}`;
    case "bolt":
      return on ? "Powered" : "No power";
    case "power":
      return on ? (animated ? "Standby" : "Power on") : "Power off";
    case "heart":
      return on ? (animated ? "Heartbeat" : "Heart") : "Heart, off";
    case "bell":
      return animated ? "New notifications" : on ? "Notifications on" : "Notifications off";
  }
}

export interface NeonIconProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color"> {
  icon: NeonIconName;
  /**
   * 0 to 1. Drives how many bars, arcs or cells are lit; for the single-part
   * icons anything above 0 is on. Rising levels light up in sequence.
   */
  value?: number;
  /**
   * The icon's idle loop: signal and wifi search, battery charges, bolt surges,
   * power breathes on standby, heart beats, bell rings.
   */
  animated?: boolean;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** sm, md and lg match the icon sizes in Button (16, 20, 24px), or pass pixels. */
  size?: keyof typeof sizes | number;
  /** Accessible name. Defaults to a description of the state, like "Signal: 3 of 4 bars". */
  label?: string;
}

const NeonIcon = React.forwardRef<HTMLSpanElement, NeonIconProps>(
  (
    {
      className,
      style,
      icon,
      value = 1,
      animated = false,
      color,
      size = "md",
      label,
      "aria-hidden": ariaHidden,
      ...props
    },
    ref,
  ) => {
    const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const parts = icons[icon];
    const levels = parts.filter((part) => part.role === "level").length;
    const on = value > 0;
    const lit = !on || levels === 0 ? 0 : Math.max(1, Math.round(clamp(value) * levels));

    // Remember where the level came from, so the change can play in sequence.
    const [previous, setPrevious] = React.useState({ lit, on });
    const [change, setChange] = React.useState({ from: lit, wasOn: on, count: 0 });
    if (previous.lit !== lit || previous.on !== on) {
      setChange({ from: previous.lit, wasOn: previous.on, count: change.count + 1 });
      setPrevious({ lit, on });
    }

    const lowBattery = icon === "battery" && !animated && clamp(value) <= 0.2;
    const px = typeof size === "number" ? size : sizes[size];
    const hidden = ariaHidden === true || ariaHidden === "true";

    // Segments that run a loop while animated.
    const seeking = animated && (icon === "signal" || icon === "wifi");
    const charging = animated && icon === "battery";
    const chargeFrom = lit >= levels ? levels - 1 : lit;
    const loopCount = seeking ? levels : charging ? levels - chargeFrom : 0;

    const levelOf: number[] = [];
    for (const part of parts) {
      levelOf.push(part.role === "level" ? levelOf.filter((l) => l >= 0).length : -1);
    }

    return (
      <span
        ref={ref}
        role={hidden ? undefined : "img"}
        aria-label={hidden ? undefined : (label ?? defaultLabel(icon, value, lit, levels, animated))}
        aria-hidden={ariaHidden}
        data-icon={icon}
        data-level={levels ? lit : on ? 1 : 0}
        data-animated={animated || undefined}
        style={neonVars(color ?? (lowBattery ? "red" : undefined), { width: px, height: px, ...style })}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative inline-flex shrink-0 align-middle",
          className,
        )}
        {...props}
      >
        <style>{baseCss + (loopCount > 0 ? seekKeyframes(loopCount) : "")}</style>
        <svg viewBox="0 0 24 24" fill="none" className="size-full overflow-visible" aria-hidden>
          <defs>
            <filter id={`${uid}-glow`} filterUnits="userSpaceOnUse" x={-8} y={-8} width={40} height={40}>
              <feGaussianBlur stdDeviation={1.15} />
            </filter>
          </defs>
          <g
            className={cn(animated && (icon === "heart" || icon === "bell") && "nk-neon-icon-motion")}
            style={{
              transformBox: "view-box",
              transformOrigin: icon === "bell" ? "12px 3.5px" : "12px 13px",
              animation: animated
                ? icon === "heart"
                  ? "nk-neon-icon-beat 1.1s ease-out infinite"
                  : icon === "bell"
                    ? "nk-neon-icon-ring 2.4s ease-in-out infinite"
                    : undefined
                : undefined,
            }}
          >
            {parts.map((part, index) => {
              const level = levelOf[index];
              const isLit =
                part.role === "always"
                  ? true
                  : part.role === "on"
                    ? on || seeking
                    : part.role === "ring"
                      ? animated
                      : level < lit;

              // A rising change lights from the old level upward; a falling one goes out from the top.
              const rising =
                change.count > 0 &&
                (part.role === "level"
                  ? level >= change.from && level < lit
                  : part.role === "on" && on && !change.wasOn);
              const stagger = part.role === "level" ? (level - change.from) * 90 : 0;
              const fallDelay = part.role === "level" ? Math.max(0, change.from - 1 - level) * 60 : 0;

              let loop: string | undefined;
              if (seeking && part.role === "level") {
                loop = `nk-neon-icon-seek-${levels}-${level} 1.9s linear infinite`;
              } else if (charging && part.role === "level" && level >= chargeFrom) {
                loop = `nk-neon-icon-seek-${loopCount}-${level - chargeFrom} 2.2s linear infinite`;
              } else if (animated && part.role === "ring") {
                loop = "nk-neon-icon-wave 2.4s linear infinite";
              } else if (animated && icon === "bolt" && isLit) {
                loop = "nk-neon-icon-surge 2.8s linear infinite";
              } else if (animated && icon === "power" && isLit) {
                loop = "nk-neon-icon-breathe 3.2s ease-in-out infinite";
              }

              const showLit = isLit || Boolean(loop && part.role === "level");
              const stroke = {
                strokeLinecap: part.cap ?? "round",
                strokeLinejoin: "round",
              } as const;

              return (
                <g key={index} data-part={part.role} data-lit={isLit || undefined}>
                  <path
                    d={part.d}
                    strokeWidth={part.width}
                    {...stroke}
                    style={{ stroke: "rgb(var(--neon) / 0.16)" }}
                  />
                  <g
                    style={{
                      opacity: showLit ? 1 : 0,
                      transition: showLit ? "none" : `opacity 180ms ease-out ${fallDelay}ms`,
                    }}
                  >
                    <g
                      key={rising ? change.count : 0}
                      className={cn((rising || loop) && "nk-neon-icon-motion")}
                      style={{
                        animation:
                          loop ??
                          (rising ? `nk-neon-icon-ignite 380ms linear ${stagger}ms both` : undefined),
                      }}
                    >
                      <path
                        d={part.d}
                        strokeWidth={part.width + 0.6}
                        {...stroke}
                        filter={`url(#${uid}-glow)`}
                        style={{ stroke: "rgb(var(--neon))" }}
                      />
                      <path
                        d={part.d}
                        strokeWidth={part.width}
                        {...stroke}
                        style={{ stroke: "rgb(var(--neon))" }}
                      />
                      <path
                        d={part.d}
                        strokeWidth={part.width * 0.42}
                        {...stroke}
                        style={{ stroke: "color-mix(in srgb, rgb(var(--neon)) 30%, white)" }}
                      />
                    </g>
                  </g>
                </g>
              );
            })}
          </g>
        </svg>
      </span>
    );
  },
);
NeonIcon.displayName = "NeonIcon";

export { NeonIcon };
