"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type RenderProp = { asChild?: boolean; render?: React.ReactElement; nativeButton?: boolean; children?: React.ReactNode };

/**
 * Base UI spells asChild as `render={<Link />}` plus `nativeButton`, and the shadcn CLI rewrites
 * asChild into that form in base-* projects. Folds it back into asChild and children.
 */
function fromRenderProp<P extends RenderProp>({ render, nativeButton, ...props }: P): Omit<P, "render" | "nativeButton"> {
  void nativeButton; // Only meaningful to Base UI.
  if (!render) return props;
  const children = props.children === undefined ? render : React.cloneElement(render, undefined, props.children);
  return { ...props, asChild: true, children };
}

// Server Components can hand children over as lazy references, which only resolve
// on the client. Unwrapping them here keeps server and client HTML the same.
const reactUse = (React as unknown as Record<string, unknown>)[" use ".trim()] as
  | (<T>(usable: PromiseLike<T>) => T)
  | undefined;

function unwrapLazy(node: React.ReactNode): React.ReactNode {
  const lazy = node as { $$typeof?: symbol; _payload?: { then?: unknown } } | null;
  if (
    reactUse &&
    lazy &&
    typeof lazy === "object" &&
    lazy.$$typeof === Symbol.for("react.lazy") &&
    typeof lazy._payload?.then === "function"
  ) {
    return reactUse(lazy._payload as PromiseLike<React.ReactNode>);
  }
  return node;
}

// The beam is stacked dashes on an SVG rect with pathLength 100, so it travels at
// one speed around the whole border (a conic gradient races along long edges).
// Each dash pattern is "0 gap dash 0" (an even count, or SVG doubles it) so every
// layer's head sits on the same spot.
const css = `
@keyframes nk-shimmer-button-beam{to{stroke-dashoffset:-100}}
@keyframes nk-shimmer-button-sweep{0%{transform:translateX(-110%) skewX(-20deg)}42%,100%{transform:translateX(340%) skewX(-20deg)}}
.nk-shimmer-button-beam{animation:nk-shimmer-button-beam var(--nk-shimmer-button-lap) linear infinite}
.nk-shimmer-button-sweep{animation:nk-shimmer-button-sweep var(--nk-shimmer-button-cycle) cubic-bezier(0.65,0,0.35,1) infinite}
@media (prefers-reduced-motion:reduce){.nk-shimmer-button-beam{animation:none;stroke-dashoffset:-30}.nk-shimmer-button-sweep{animation:none;opacity:0}}
`;

const sizes = {
  sm: { root: "h-8 gap-1.5 rounded-md px-3 text-xs", radius: 6 },
  md: { root: "h-10 gap-2 rounded-lg px-4 text-sm", radius: 8 },
  lg: { root: "h-12 gap-2.5 rounded-xl px-6 text-base", radius: 12 },
} as const;

const variants = {
  outline: {
    root: "border border-[rgb(var(--neon)/0.28)] [background:linear-gradient(180deg,rgb(var(--neon)/0.11),rgb(var(--neon)/0.03)),#07080d] [color:color-mix(in_srgb,rgb(var(--neon))_30%,white)] shadow-[inset_0_1px_0_rgb(255_255_255/0.06),0_0_0_rgb(var(--neon)/0)] [text-shadow:0_0_12px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))] hover:border-[rgb(var(--neon)/0.5)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_24px_-4px_rgb(var(--neon)/CALC(0.55*var(--neon-glow,1)))]",
    sweep: "bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.12)_30%,color-mix(in_srgb,rgb(var(--neon))_40%,white)_50%,rgb(var(--neon)/0.12)_70%,transparent)] opacity-25",
    head: "stroke-[color-mix(in_srgb,rgb(var(--neon))_35%,white)]",
  },
  solid: {
    root: "border border-[rgb(var(--neon))] bg-[rgb(var(--neon))] text-[#05060a] shadow-[0_0_18px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45)] hover:shadow-[0_0_32px_rgb(var(--neon)/CALC(0.7*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45)] hover:brightness-110",
    sweep: "bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.2)_30%,rgb(255_255_255/0.75)_50%,rgb(255_255_255/0.2)_70%,transparent)] opacity-60",
    head: "stroke-white",
  },
} as const;

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

function Dash({
  radius,
  pattern,
  width = 1,
  className,
}: {
  radius: number;
  pattern: string;
  width?: number;
  className?: string;
}) {
  return (
    <rect
      width="100%"
      height="100%"
      rx={radius - 0.5}
      pathLength={100}
      fill="none"
      strokeWidth={width}
      strokeLinecap="round"
      strokeDasharray={pattern}
      className={cn("nk-shimmer-button-beam", className)}
    />
  );
}

export interface ShimmerButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** `outline` is dark glass with a lit edge, `solid` is a lit face. */
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Seconds for the beam to run once around the border. */
  beamDuration?: number;
  /** Seconds between light sweeps across the face. */
  shimmerDuration?: number;
  /** Render the child element (e.g. a link) with the shimmer. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (raw, ref) => {
    const {
      className,
      style,
      color,
      variant = "outline",
      size = "md",
      beamDuration = 4,
      shimmerDuration = 3.2,
      asChild = false,
      disabled,
      children,
      ...props
    } = fromRenderProp(raw);
    const s = sizes[size];
    const v = variants[variant];
    const resolved = asChild ? unwrapLazy(children) : children;
    const child = asChild && React.isValidElement<AnyProps>(resolved) ? resolved : null;
    const childRef = child ? getElementRef(child) : undefined;
    const composedRef = (node: HTMLButtonElement | null) => {
      setRef(ref, node);
      setRef(childRef as PossibleRef<HTMLButtonElement>, node);
    };

    const timing = {
      "--nk-shimmer-button-lap": `${beamDuration}s`,
      "--nk-shimmer-button-cycle": `${shimmerDuration}s`,
    } as React.CSSProperties;

    const decorate = (label: React.ReactNode) => (
      <>
        <style>{css}</style>
        {/* The sweep is clipped to the face; the beam rides the border and may glow past it. */}
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <span className={cn("nk-shimmer-button-sweep absolute inset-y-0 left-0 w-1/3", v.sweep)} />
        </span>
        <svg
          aria-hidden
          className="pointer-events-none absolute left-[-0.5px] top-[-0.5px] h-[calc(100%+1px)] w-[calc(100%+1px)] overflow-visible"
        >
          <g className="opacity-70 [filter:blur(3px)_opacity(var(--neon-glow,1))]">
            <Dash radius={s.radius} pattern="0 82 18 0" width={3} className="stroke-[rgb(var(--neon))]" />
          </g>
          <Dash radius={s.radius} pattern="0 72 28 0" className="stroke-[rgb(var(--neon)/0.14)]" />
          <Dash radius={s.radius} pattern="0 80 20 0" className="stroke-[rgb(var(--neon)/0.22)]" />
          <Dash radius={s.radius} pattern="0 87 13 0" className="stroke-[rgb(var(--neon)/0.45)]" />
          <Dash radius={s.radius} pattern="0 93 7 0" className="stroke-[rgb(var(--neon))]" />
          <Dash radius={s.radius} pattern="0 97 3 0" width={1.25} className={v.head} />
        </svg>
        <span className="relative inline-flex items-center gap-[inherit] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
          {label}
        </span>
      </>
    );

    const rootProps: AnyProps = {
      style: neonVars(color, { ...timing, ...style }),
      className: cn(
        "[--neon:var(--neon-accent,34_211_238)]",
        "relative isolate inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap font-medium outline-none",
        "transition-[background-color,border-color,color,box-shadow,filter,transform,scale] duration-200 ease-out active:scale-[0.97]",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
        "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
        s.root,
        v.root,
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
      <button ref={ref} disabled={disabled} {...(rootProps as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {decorate(children)}
      </button>
    );
  },
);
ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
