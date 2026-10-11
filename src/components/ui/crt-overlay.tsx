"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Power on: a dot stretches into a bright line, the line opens into the
// picture with a little vertical overshoot. Power off runs it backwards and
// leaves a dot of phosphor that fades on its own.
const css = `
@keyframes nk-crt-overlay-on {
  0% { transform: scale(0, 0.008); opacity: 0; }
  8% { transform: scale(0.06, 0.008); opacity: 1; }
  34% { transform: scale(1, 0.008); }
  62% { transform: scale(1, 1.035); }
  76% { transform: scale(1, 0.99); }
  100% { transform: scale(1, 1); opacity: 1; }
}
@keyframes nk-crt-overlay-off {
  0% { transform: scale(1, 1); opacity: 1; }
  42% { transform: scale(1, 0.008); }
  76% { transform: scale(0.1, 0.008); opacity: 1; }
  100% { transform: scale(0, 0.008); opacity: 0; }
}
@keyframes nk-crt-overlay-flash-on { 0%, 34% { opacity: 1; } 100% { opacity: 0; } }
@keyframes nk-crt-overlay-flash-off { 0% { opacity: 0; } 38%, 100% { opacity: 1; } }
@keyframes nk-crt-overlay-afterglow { 0%, 30% { opacity: 0; transform: scale(1); } 36% { opacity: 1; transform: scale(1); } 100% { opacity: 0; transform: scale(0.3); } }
@keyframes nk-crt-overlay-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes nk-crt-overlay-flicker { 0%, 100% { opacity: 0; } 6% { opacity: 0.05; } 8% { opacity: 0; } 41% { opacity: 0.03; } 43% { opacity: 0; } 77% { opacity: 0.06; } 78.5% { opacity: 0; } }
@keyframes nk-crt-overlay-roll { from { transform: translateY(-100%); } to { transform: translateY(400%); } }
.nk-crt-overlay-screen[data-phase="booting"] { animation: nk-crt-overlay-on 900ms cubic-bezier(0.23, 1, 0.32, 1) both; }
.nk-crt-overlay-screen[data-phase="shutting"] { animation: nk-crt-overlay-off 520ms cubic-bezier(0.55, 0, 0.75, 0.2) both; }
.nk-crt-overlay-screen[data-phase="off"] { opacity: 0; }
.nk-crt-overlay-screen[data-phase="booting"] .nk-crt-overlay-flash { animation: nk-crt-overlay-flash-on 900ms ease-out both; }
.nk-crt-overlay-screen[data-phase="shutting"] .nk-crt-overlay-flash { animation: nk-crt-overlay-flash-off 520ms ease-out both; }
.nk-crt-overlay-afterglow { animation: nk-crt-overlay-afterglow 1500ms ease-out both; }
.nk-crt-overlay-flicker { animation: nk-crt-overlay-flicker 3.7s linear infinite; }
.nk-crt-overlay-roll { animation: nk-crt-overlay-roll 7s linear infinite; }
@media (prefers-reduced-motion: reduce) {
  .nk-crt-overlay-screen[data-phase="booting"] { animation: nk-crt-overlay-fade 160ms ease-out both; }
  .nk-crt-overlay-screen[data-phase="shutting"] { animation: nk-crt-overlay-fade 120ms ease-out reverse both; }
  .nk-crt-overlay-screen[data-phase] .nk-crt-overlay-flash,
  .nk-crt-overlay-afterglow,
  .nk-crt-overlay-flicker,
  .nk-crt-overlay-roll { animation: none; opacity: 0; }
}
`;

type Phase = "on" | "off" | "booting" | "shutting";

// Fallbacks in case animationend never arrives (hidden tab, display: none).
const durations = { booting: 950, shutting: 1600 };

export interface CrtOverlayProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Phosphor color for the glow and the tint. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Power. Turning it off collapses the picture to a line and a dot; on reverses it. */
  on?: boolean;
  /** Play the power-on animation when the screen first mounts lit. */
  animateOnMount?: boolean;
  /** Horizontal scanlines and a faint aperture grille. */
  scanlines?: boolean;
  /** A slow refresh bar and the odd brightness dip. */
  flicker?: boolean;
  /** Red and blue fringes on text, like a slightly misconverged tube. */
  chromatic?: boolean;
  /** Text blooms in the phosphor color. */
  glow?: boolean;
  /** Rounded, bulging glass with darker edges. */
  curvature?: boolean;
  /** Tints the whole picture in the phosphor color, like a monochrome monitor. */
  phosphor?: boolean;
  /** Called when a power-on or power-off animation finishes. */
  onPowerComplete?: (on: boolean) => void;
}

const CrtOverlay = React.forwardRef<HTMLDivElement, CrtOverlayProps>(
  (
    {
      className,
      style,
      color,
      on = true,
      animateOnMount = false,
      scanlines = true,
      flicker = true,
      chromatic = true,
      glow = true,
      curvature = false,
      phosphor = false,
      onPowerComplete,
      children,
      ...props
    },
    ref,
  ) => {
    const [phase, setPhase] = React.useState<Phase>(() =>
      on ? (animateOnMount ? "booting" : "on") : "off",
    );
    const [previous, setPrevious] = React.useState(on);
    // Each power-off mounts a fresh afterglow dot, so it plays once per shutdown.
    const [shutdowns, setShutdowns] = React.useState(0);
    if (previous !== on) {
      setPrevious(on);
      setPhase(on ? "booting" : "shutting");
      if (!on) setShutdowns((count) => count + 1);
    }

    const contentRef = React.useRef<HTMLDivElement>(null);
    const onComplete = React.useRef(onPowerComplete);
    onComplete.current = onPowerComplete;

    const finish = React.useCallback((from: Phase) => {
      setPhase((current) => (current === from ? (from === "booting" ? "on" : "off") : current));
    }, []);

    React.useEffect(() => {
      if (phase !== "booting" && phase !== "shutting") return;
      const timeout = setTimeout(() => finish(phase), durations[phase]);
      return () => clearTimeout(timeout);
    }, [phase, finish]);

    const settled = React.useRef(phase);
    React.useEffect(() => {
      const from = settled.current;
      settled.current = phase;
      if ((from === "booting" && phase === "on") || (from === "shutting" && phase === "off")) {
        onComplete.current?.(phase === "on");
      }
    }, [phase]);

    // A dark tube shows nothing, so its content shouldn't take focus or clicks.
    React.useEffect(() => {
      if (contentRef.current) contentRef.current.inert = !on;
    }, [on]);

    const lit = on && phase !== "off";
    const textShadow =
      [
        chromatic && "-0.6px 0 rgb(255 40 90 / 0.5), 0.6px 0 rgb(40 190 255 / 0.5)",
        glow && "0 0 1px rgb(255 255 255 / 0.4), 0 0 12px rgb(var(--neon) / 0.6)",
      ]
        .filter(Boolean)
        .join(", ") || undefined;

    return (
      <div
        ref={ref}
        data-state={on ? "on" : "off"}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative isolate overflow-hidden bg-[#040507] text-white/90",
          "transition-shadow duration-700 ease-out",
          curvature ? "rounded-[2.25rem/1.75rem]" : "rounded-xl",
          lit
            ? "shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_0_70px_-18px_rgb(var(--neon)/0.55)]"
            : "shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_0_70px_-18px_rgb(var(--neon)/0)]",
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        <div
          data-phase={phase}
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget) finish(phase);
          }}
          className="nk-crt-overlay-screen relative h-full"
        >
          {/* The raster: a lit tube glows faintly even where the picture is black */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(var(--neon)/0.1),rgb(var(--neon)/0.035)_55%,transparent_85%)]"
          />
          <div
            ref={contentRef}
            aria-hidden={on ? undefined : true}
            style={{ textShadow }}
            className={cn("relative h-full", phase === "off" && "invisible")}
          >
            {children}
          </div>
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {phosphor && (
              <div className="absolute inset-0 bg-[color-mix(in_srgb,rgb(var(--neon))_70%,white)] mix-blend-multiply" />
            )}
            {scanlines && (
              <>
                <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,rgb(0_0_0/0.32)_0_1px,transparent_1px_3px)]" />
                <div className="absolute inset-0 opacity-[0.45] mix-blend-multiply bg-[repeating-linear-gradient(to_right,rgb(255_190_190)_0_1px,rgb(190_255_190)_1px_2px,rgb(190_200_255)_2px_3px)]" />
              </>
            )}
            {flicker && (
              <>
                <div className="nk-crt-overlay-roll absolute inset-x-0 top-0 h-1/4 bg-[linear-gradient(to_bottom,transparent,rgb(255_255_255/0.045),transparent)]" />
                <div className="nk-crt-overlay-flicker absolute inset-0 bg-black opacity-0" />
              </>
            )}
            <div className="nk-crt-overlay-flash absolute inset-0 bg-[color-mix(in_srgb,rgb(var(--neon))_20%,white)] opacity-0" />
          </div>
        </div>
        {/* Glass: unaffected by power, so a dark tube still reads as a screen */}
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]">
          {shutdowns > 0 && !on && (
            <div
              key={shutdowns}
              className="nk-crt-overlay-afterglow absolute left-1/2 top-1/2 -ml-1 -mt-1 size-2 rounded-full bg-[color-mix(in_srgb,rgb(var(--neon))_25%,white)] opacity-0 shadow-[0_0_8px_2px_rgb(var(--neon)),0_0_28px_6px_rgb(var(--neon)/0.6)]"
            />
          )}
          <div
            className={cn(
              "absolute inset-0 rounded-[inherit]",
              curvature
                ? "bg-[radial-gradient(ellipse_at_center,transparent_48%,rgb(0_0_0/0.55)_100%)] shadow-[inset_0_0_50px_12px_rgb(0_0_0/0.75),inset_0_0_3px_1px_rgb(255_255_255/0.08)]"
                : "bg-[radial-gradient(ellipse_at_center,transparent_62%,rgb(0_0_0/0.4)_100%)] shadow-[inset_0_0_28px_rgb(0_0_0/0.6)]",
            )}
          />
          <div
            className={cn(
              "absolute inset-0 rounded-[inherit]",
              curvature
                ? "bg-[radial-gradient(ellipse_70%_45%_at_32%_8%,rgb(255_255_255/0.09),transparent_70%)]"
                : "bg-[linear-gradient(165deg,rgb(255_255_255/0.05),transparent_38%)]",
            )}
          />
        </div>
      </div>
    );
  },
);
CrtOverlay.displayName = "CrtOverlay";

export { CrtOverlay };
