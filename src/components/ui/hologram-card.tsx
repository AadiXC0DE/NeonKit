"use client";

import * as React from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// The foil: diagonal streaks of diffracted light (the linear gradient) whose
// hue comes from a conic rainbow underneath. Each hue leans toward the neon
// color so the card stays in key with the accent around it.
const css = `
.nk-hologram-card-sheen {
  --nk-hologram-card-a: color-mix(in srgb, rgb(var(--neon)) 28%, #ff4fd8);
  --nk-hologram-card-b: color-mix(in srgb, rgb(var(--neon)) 28%, #ffd54f);
  --nk-hologram-card-c: color-mix(in srgb, rgb(var(--neon)) 28%, #4fffb0);
  --nk-hologram-card-d: color-mix(in srgb, rgb(var(--neon)) 28%, #4fb6ff);
  --nk-hologram-card-e: color-mix(in srgb, rgb(var(--neon)) 28%, #a64fff);
  background:
    repeating-linear-gradient(118deg, #000 0%, #000 3%, #444 6.5%, #fff 10%, #444 13.5%, #000 17%, #000 20%),
    repeating-conic-gradient(from 0deg at 50% 50%, var(--nk-hologram-card-a) 0deg, var(--nk-hologram-card-b) 24deg, var(--nk-hologram-card-c) 48deg, var(--nk-hologram-card-d) 72deg, var(--nk-hologram-card-e) 96deg, var(--nk-hologram-card-a) 120deg);
  background-blend-mode: multiply;
}
.nk-hologram-card-foil[data-foil="lines"] {
  -webkit-mask-image: repeating-linear-gradient(-62deg, #000 0 1px, rgb(0 0 0 / 0.28) 1px 3px);
  mask-image: repeating-linear-gradient(-62deg, #000 0 1px, rgb(0 0 0 / 0.28) 1px 3px);
}
.nk-hologram-card-foil[data-foil="dots"] {
  -webkit-mask-image: radial-gradient(circle, #000 0 0.9px, rgb(0 0 0 / 0.28) 1.5px);
  mask-image: radial-gradient(circle, #000 0 0.9px, rgb(0 0 0 / 0.28) 1.5px);
  -webkit-mask-size: 4px 4px;
  mask-size: 4px 4px;
}
.nk-hologram-card-foil[data-foil="glitter"] {
  --nk-hologram-card-fleck: #000 0 0.8px, transparent 1.6px;
  -webkit-mask-image: radial-gradient(circle at 20% 30%, var(--nk-hologram-card-fleck)), radial-gradient(circle at 70% 60%, var(--nk-hologram-card-fleck)), radial-gradient(circle at 40% 85%, var(--nk-hologram-card-fleck)), radial-gradient(circle at 85% 15%, var(--nk-hologram-card-fleck)), linear-gradient(rgb(0 0 0 / 0.3) 0 0);
  mask-image: radial-gradient(circle at 20% 30%, var(--nk-hologram-card-fleck)), radial-gradient(circle at 70% 60%, var(--nk-hologram-card-fleck)), radial-gradient(circle at 40% 85%, var(--nk-hologram-card-fleck)), radial-gradient(circle at 85% 15%, var(--nk-hologram-card-fleck)), linear-gradient(rgb(0 0 0 / 0.3) 0 0);
  -webkit-mask-size: 13px 17px, 23px 19px, 29px 31px, 37px 41px, 100% 100%;
  mask-size: 13px 17px, 23px 19px, 29px 31px, 37px 41px, 100% 100%;
}
`;

// Slightly under-damped: the card overshoots a hair when it springs back flat.
const spring = { stiffness: 190, damping: 19, mass: 0.9 };
const perspective = 800;

export type HologramFoil = "lines" | "dots" | "glitter" | "smooth";

export interface HologramCardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Largest tilt in degrees, reached at the card's edges. */
  maxTilt?: number;
  /** Texture the rainbow sheen catches on. */
  foil?: HologramFoil;
  /** Strength of the sheen and glare, 0 to 1. */
  intensity?: number;
  /** A soft spot of light that follows the pointer. */
  glare?: boolean;
}

const clamp = (value: number) => Math.min(1, Math.max(0, value));

const HologramCard = React.forwardRef<HTMLDivElement, HologramCardProps>(
  (
    {
      className,
      style,
      color,
      maxTilt = 12,
      foil = "lines",
      intensity = 1,
      glare = true,
      children,
      onPointerEnter,
      onPointerMove,
      onPointerLeave,
      onPointerCancel,
      onPointerUp,
      onFocus,
      onBlur,
      ...props
    },
    forwardedRef,
  ) => {
    const ref = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(forwardedRef, () => ref.current as HTMLDivElement);

    const reduceMotion = useReducedMotion();
    const tilt = React.useRef(maxTilt);
    tilt.current = maxTilt;
    const strength = clamp(intensity);

    // Where the light hits, 0..1 across the card, and how lit the card is.
    const pointerX = useSpring(0.5, spring);
    const pointerY = useSpring(0.5, spring);
    const active = useSpring(0, spring);

    // The untransformed box, measured on entry. Reading the tilted box on
    // every move would feed the tilt back into the pointer position.
    const box = React.useRef<{ left: number; top: number; width: number; height: number } | null>(null);
    const hovering = React.useRef(false);
    const focused = React.useRef(false);

    const transform = useTransform([pointerX, pointerY, active], ([x, y, a]: number[]) => {
      const max = tilt.current;
      return `perspective(${perspective}px) rotateX(${((y - 0.5) * 2 * max).toFixed(3)}deg) rotateY(${((0.5 - x) * 2 * max).toFixed(3)}deg) scale(${(1 + a * 0.02).toFixed(4)})`;
    });
    useMotionValueEvent(transform, "change", (value) => {
      if (ref.current && !reduceMotion) ref.current.style.transform = value;
    });

    // The rainbow slides against the tilt and turns a little, so colors sweep
    // across the foil the way a real hologram shifts in the hand.
    const sheenTransform = useTransform([pointerX, pointerY], ([x, y]: number[]) => {
      return `translate3d(${((0.5 - x) * 20).toFixed(3)}%, ${((0.5 - y) * 20).toFixed(3)}%, 0) rotate(${((x - 0.5) * 14 + (y - 0.5) * 8).toFixed(3)}deg)`;
    });
    const sheenOpacity = useTransform(active, (a) => (0.2 + 0.8 * a) * strength);
    const washOpacity = useTransform(active, (a) => (0.05 + 0.3 * a) * strength);
    const glareX = useTransform(pointerX, (x) => `${x * 50}%`);
    const glareY = useTransform(pointerY, (y) => `${y * 50}%`);
    const glareOpacity = useTransform(active, (a) => a * strength);
    const edgeOpacity = useTransform(active, (a) => 0.25 + 0.75 * a);
    const spillOpacity = useTransform(active, (a) => a);

    const scrolled = React.useCallback(() => {
      box.current = null;
    }, []);

    const measure = () => {
      const node = ref.current;
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      const width = node.offsetWidth || rect.width;
      const height = node.offsetHeight || rect.height;
      box.current = {
        left: rect.left + rect.width / 2 - width / 2,
        top: rect.top + rect.height / 2 - height / 2,
        width,
        height,
      };
      return box.current;
    };

    const aim = (clientX: number, clientY: number) => {
      const rect = box.current ?? measure();
      if (!rect || !rect.width || !rect.height) return;
      pointerX.set(clamp((clientX - rect.left) / rect.width));
      pointerY.set(clamp((clientY - rect.top) / rect.height));
      active.set(1);
    };

    // Keyboard focus gets a gentle, fixed pose instead of following anything.
    const settle = () => {
      if (reduceMotion) return;
      if (focused.current) {
        pointerX.set(0.64);
        pointerY.set(0.36);
        active.set(0.75);
      } else {
        pointerX.set(0.5);
        pointerY.set(0.5);
        active.set(0);
      }
    };

    const release = () => {
      hovering.current = false;
      box.current = null;
      window.removeEventListener("scroll", scrolled, true);
      settle();
    };

    React.useEffect(() => () => window.removeEventListener("scroll", scrolled, true), [scrolled]);

    // Reduced motion: no tilt, a still sheen caught at a flattering angle.
    React.useEffect(() => {
      if (!reduceMotion) return;
      if (ref.current) ref.current.style.transform = "";
      pointerX.jump(0.3);
      pointerY.jump(0.22);
      active.jump(0.55);
    }, [reduceMotion, pointerX, pointerY, active]);

    return (
      <div
        ref={ref}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative isolate rounded-2xl border border-white/10 bg-[#0a0b11] text-white/90 outline-none",
          "shadow-[0_28px_56px_-28px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.06)]",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          className,
        )}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          if (reduceMotion) return;
          hovering.current = true;
          measure();
          window.addEventListener("scroll", scrolled, { capture: true, passive: true });
          aim(event.clientX, event.clientY);
        }}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          if (reduceMotion) return;
          if (!hovering.current) {
            hovering.current = true;
            window.addEventListener("scroll", scrolled, { capture: true, passive: true });
          }
          aim(event.clientX, event.clientY);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          release();
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          release();
        }}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          // A finger has no hover: let go and the card settles.
          if (event.pointerType === "touch") release();
        }}
        onFocus={(event) => {
          onFocus?.(event);
          if (reduceMotion) return;
          let visible = true;
          try {
            visible = event.target.matches(":focus-visible");
          } catch {
            // Older engines without :focus-visible: treat every focus as visible.
          }
          if (!visible) return;
          focused.current = true;
          if (!hovering.current) settle();
        }}
        onBlur={(event) => {
          onBlur?.(event);
          if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
          focused.current = false;
          if (!hovering.current) settle();
        }}
        {...props}
      >
        <style>{css}</style>
        {/* Light the card throws on the surface around it */}
        <motion.div
          aria-hidden
          style={{ opacity: spillOpacity }}
          className="pointer-events-none absolute -inset-px -z-10 rounded-[inherit] shadow-[0_0_32px_-8px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1))),0_20px_80px_-28px_rgb(var(--neon)/CALC(0.4*var(--neon-glow,1)))]"
        />
        {children}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
        >
          {/* Foil: burns bright where it crosses artwork and type */}
          <motion.div
            data-foil={foil}
            style={{ opacity: sheenOpacity }}
            className="nk-hologram-card-foil absolute inset-0 mix-blend-color-dodge"
          >
            <motion.div
              style={{ transform: sheenTransform }}
              className="nk-hologram-card-sheen absolute -inset-1/2"
            />
          </motion.div>
          {/* Foil: a faint wash so the rainbow also reads on dark ink */}
          <motion.div
            data-foil={foil}
            style={{ opacity: washOpacity }}
            className="nk-hologram-card-foil absolute inset-0 mix-blend-screen"
          >
            <motion.div
              style={{ transform: sheenTransform }}
              className="nk-hologram-card-sheen absolute -inset-1/2"
            />
          </motion.div>
          {glare && (
            <motion.div
              style={{ x: glareX, y: glareY, opacity: glareOpacity }}
              className="absolute -left-full -top-full h-[200%] w-[200%] mix-blend-soft-light [background:radial-gradient(circle_at_50%_50%,rgb(255_255_255/0.95),rgb(255_255_255/0.35)_14%,transparent_38%)]"
            />
          )}
          {glare && (
            <motion.div
              style={{ x: glareX, y: glareY, opacity: glareOpacity }}
              className="absolute -left-full -top-full h-[200%] w-[200%] mix-blend-screen [background:radial-gradient(circle_at_50%_50%,rgb(255_255_255/0.16),transparent_22%)]"
            />
          )}
        </div>
        {/* The edge catches light nearest the pointer */}
        <motion.div
          aria-hidden
          style={{ opacity: edgeOpacity }}
          className="pointer-events-none absolute -inset-px overflow-hidden rounded-[inherit] p-px [mask:linear-gradient(#000_0_0)_content-box_exclude,linear-gradient(#000_0_0)]"
        >
          <motion.div
            style={{ x: glareX, y: glareY }}
            className="absolute -left-full -top-full h-[200%] w-[200%] [background:radial-gradient(circle_at_50%_50%,color-mix(in_srgb,rgb(var(--neon)/var(--neon-glow,1))_40%,white),rgb(var(--neon)/CALC(0.6*var(--neon-glow,1)))_12%,transparent_32%)]"
          />
        </motion.div>
      </div>
    );
  },
);
HologramCard.displayName = "HologramCard";

export { HologramCard };
