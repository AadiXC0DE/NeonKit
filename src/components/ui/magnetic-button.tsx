"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const variants = {
  outline:
    "border border-[rgb(var(--neon)/0.7)] bg-[rgb(var(--neon)/0.06)] text-[rgb(var(--neon))] shadow-[0_0_12px_rgb(var(--neon)/0.25),inset_0_0_12px_rgb(var(--neon)/0.12)] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)] hover:border-[rgb(var(--neon))] hover:bg-[rgb(var(--neon)/0.12)] hover:shadow-[0_0_24px_rgb(var(--neon)/0.5),inset_0_0_16px_rgb(var(--neon)/0.2)]",
  solid:
    "bg-[rgb(var(--neon))] text-[#05060a] shadow-[0_0_0_1px_rgb(var(--neon)),0_0_18px_rgb(var(--neon)/0.45),inset_0_1px_0_rgb(255_255_255/0.45)] hover:shadow-[0_0_0_1px_rgb(var(--neon)),0_0_32px_rgb(var(--neon)/0.7),inset_0_1px_0_rgb(255_255_255/0.45)] hover:brightness-110",
  ghost: "text-white/70 hover:bg-[rgb(var(--neon)/0.1)] hover:text-[rgb(var(--neon))]",
} as const;

const sizes = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
  md: "h-10 gap-2 rounded-lg px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-xl px-6 text-base",
  icon: "size-10 rounded-full",
} as const;

// Slightly under-damped: it follows briskly and overshoots a touch when let go.
const STIFFNESS = 320;
const DAMPING = 22;

type AnyProps = Record<string, unknown>;
type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

// React 19 reads `ref` from props; React 18 keeps it on the element.
function getElementRef(element: React.ReactElement) {
  if (Number.parseInt(React.version, 10) >= 19) {
    return (element.props as { ref?: React.Ref<HTMLElement> }).ref;
  }
  return (element as unknown as { ref?: React.Ref<HTMLElement> }).ref;
}

/** Our props under the child's: handlers both run (child first), classes and styles merge. */
function mergeProps(ours: AnyProps, theirs: AnyProps): AnyProps {
  const merged: AnyProps = { ...ours, ...theirs };
  for (const key of Object.keys(ours)) {
    const a = ours[key];
    const b = theirs[key];
    if (/^on[A-Z]/.test(key) && typeof a === "function" && typeof b === "function") {
      merged[key] = (...args: unknown[]) => {
        (b as (...args: unknown[]) => void)(...args);
        (a as (...args: unknown[]) => void)(...args);
      };
    } else if (key === "className") {
      merged[key] = cn(a as string, b as string);
    } else if (key === "style") {
      merged[key] = { ...(a as object), ...(b as object) };
    }
  }
  return merged;
}

export interface MagneticButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  variant?: keyof typeof variants;
  /** `icon` is a round 40px button for a single glyph. */
  size?: keyof typeof sizes;
  /** How far (px) beyond the button's edge the pull reaches. */
  radius?: number;
  /** Share of the pointer's offset from center the button follows, 0 to 1. Capped near a third of its height. */
  strength?: number;
  /** How much further the label travels than the button, as a share of the button's offset. */
  labelStrength?: number;
  /** Render the child element (e.g. a link) as the magnet. */
  asChild?: boolean;
}

const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  (
    {
      className,
      style,
      color,
      variant = "outline",
      size = "md",
      radius = 56,
      strength = 0.2,
      labelStrength = 0.3,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLElement | null>(null);
    const labelRef = React.useRef<HTMLSpanElement>(null);
    const child = asChild && React.isValidElement<AnyProps>(children) ? children : null;
    const childRef = child ? getElementRef(child) : undefined;
    const composedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        rootRef.current = node;
        setRef(ref, node);
        setRef(childRef as PossibleRef<HTMLButtonElement>, node);
      },
      [ref, childRef],
    );

    React.useEffect(() => {
      const root = rootRef.current;
      if (!root || disabled || typeof window === "undefined" || !window.matchMedia) return;
      const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (!finePointer.matches || reducedMotion.matches) return;

      const pos = { x: 0, y: 0 };
      const vel = { x: 0, y: 0 };
      const target = { x: 0, y: 0, pull: 0 };
      let pull = 0;
      let frame = 0;
      let last = 0;

      const label = labelRef.current;
      const write = () => {
        root.style.translate = `${pos.x.toFixed(2)}px ${pos.y.toFixed(2)}px`;
        root.style.setProperty("--nk-magnetic-button-pull", pull.toFixed(3));
        if (label) {
          label.style.translate = `${(pos.x * labelStrength).toFixed(2)}px ${(pos.y * labelStrength).toFixed(2)}px`;
        }
      };

      const step = (now: number) => {
        const dt = Math.min((now - (last || now)) / 1000, 1 / 30);
        last = now;
        // Fixed sub-steps keep the spring stable when a frame runs long.
        const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          for (const axis of ["x", "y"] as const) {
            const force = -STIFFNESS * (pos[axis] - target[axis]) - DAMPING * vel[axis];
            vel[axis] += force * h;
            pos[axis] += vel[axis] * h;
          }
        }
        pull += (target.pull - pull) * Math.min(1, dt * 12);
        write();
        const resting =
          Math.abs(pos.x - target.x) < 0.01 &&
          Math.abs(pos.y - target.y) < 0.01 &&
          Math.abs(vel.x) < 0.01 &&
          Math.abs(vel.y) < 0.01 &&
          Math.abs(pull - target.pull) < 0.002;
        if (resting) {
          pos.x = target.x;
          pos.y = target.y;
          pull = target.pull;
          write();
          frame = 0;
          last = 0;
          return;
        }
        frame = requestAnimationFrame(step);
      };

      const kick = () => {
        if (!frame) frame = requestAnimationFrame(step);
      };

      const release = () => {
        target.x = 0;
        target.y = 0;
        target.pull = 0;
        kick();
      };

      const onMove = (event: PointerEvent) => {
        if (event.pointerType === "touch") return;
        const rect = root.getBoundingClientRect();
        // The rect includes the current offset; take it out to find where the button rests.
        const cx = rect.left + rect.width / 2 - pos.x;
        const cy = rect.top + rect.height / 2 - pos.y;
        const dx = event.clientX - cx;
        const dy = event.clientY - cy;
        const outsideX = Math.max(Math.abs(dx) - rect.width / 2, 0);
        const outsideY = Math.max(Math.abs(dy) - rect.height / 2, 0);
        const distance = Math.hypot(outsideX, outsideY);
        if (distance >= radius) {
          if (target.pull !== 0) release();
          return;
        }
        const t = 1 - distance / radius;
        const falloff = t * t * (3 - 2 * t);
        const cap = rect.height * 0.32;
        target.x = Math.max(-cap, Math.min(cap, dx * strength)) * falloff;
        target.y = Math.max(-cap, Math.min(cap, dy * strength)) * falloff;
        target.pull = falloff;
        kick();
      };

      const onOut = (event: PointerEvent) => {
        if (!event.relatedTarget) release();
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerout", onOut);
      window.addEventListener("blur", release);
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerout", onOut);
        window.removeEventListener("blur", release);
        cancelAnimationFrame(frame);
        root.style.translate = "";
        root.style.removeProperty("--nk-magnetic-button-pull");
        if (label) label.style.translate = "";
      };
    }, [disabled, radius, strength, labelStrength]);

    const decorate = (label: React.ReactNode) => (
      <>
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-[var(--nk-magnetic-button-pull,0)] shadow-[0_0_26px_rgb(var(--neon)/0.45)]"
        />
        <span
          ref={labelRef}
          className="relative inline-flex items-center gap-[inherit] will-change-[translate] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
        >
          {label}
        </span>
      </>
    );

    const rootProps: AnyProps = {
      style: neonVars(color, style),
      className: cn(
        "[--neon:var(--neon-accent,34_211_238)]",
        "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap font-medium outline-none will-change-[translate]",
        "transition-[background-color,border-color,color,box-shadow,filter,transform,scale] duration-200 ease-out active:scale-[0.97]",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
        "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
        sizes[size],
        variants[variant],
        className,
      ),
      ...props,
    };

    if (child) {
      return React.cloneElement(
        child,
        {
          ...mergeProps(rootProps, child.props),
          ...(disabled && { "aria-disabled": true, tabIndex: -1 }),
          ref: composedRef,
        } as AnyProps,
        decorate(child.props.children as React.ReactNode),
      );
    }

    return (
      <button ref={composedRef} disabled={disabled} {...(rootProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {decorate(children)}
      </button>
    );
  },
);
MagneticButton.displayName = "MagneticButton";

export { MagneticButton };
