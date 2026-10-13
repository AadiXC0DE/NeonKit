"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

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

// The chamfer is a clip-path, which also clips box-shadows and rings, so the
// border, the face and the focus ring are each their own clipped layer and the
// glow comes from a drop-shadow on their wrapper.
const css = `
.nk-cyber-button-shape{clip-path:polygon(var(--nk-cyber-button-cut) 0,100% 0,100% calc(100% - var(--nk-cyber-button-cut)),calc(100% - var(--nk-cyber-button-cut)) 100%,0 100%,0 var(--nk-cyber-button-cut))}
@keyframes nk-cyber-button-scan{0%{transform:translateY(-100%)}50%,100%{transform:translateY(60%)}}
@keyframes nk-cyber-button-split-a{0%{opacity:1;clip-path:inset(12% 0 64% 0);transform:translate(-3px,0)}20%{clip-path:inset(58% 0 18% 0);transform:translate(2px,0)}40%{clip-path:inset(30% 0 46% 0);transform:translate(-2px,0)}60%{clip-path:inset(76% 0 4% 0);transform:translate(3px,0)}80%{clip-path:inset(4% 0 82% 0);transform:translate(-1px,0)}100%{opacity:0;clip-path:inset(50% 0 50% 0);transform:none}}
@keyframes nk-cyber-button-split-b{0%{opacity:1;clip-path:inset(62% 0 14% 0);transform:translate(3px,0)}20%{clip-path:inset(8% 0 70% 0);transform:translate(-2px,0)}40%{clip-path:inset(44% 0 30% 0);transform:translate(2px,0)}60%{clip-path:inset(20% 0 60% 0);transform:translate(-3px,0)}80%{clip-path:inset(84% 0 2% 0);transform:translate(1px,0)}100%{opacity:0;clip-path:inset(50% 0 50% 0);transform:none}}
@keyframes nk-cyber-button-jolt{0%,100%{transform:none}12%{transform:translateX(1.5px) skewX(-10deg)}24%{transform:translateX(-1px) skewX(6deg)}36%{transform:none}62%{transform:translateX(1px)}70%{transform:none}}
.nk-cyber-button-tick{left:calc(100% - var(--nk-cyber-button-base)/2 + 2px);top:calc(100% - var(--nk-cyber-button-base)/2 + 2px);width:calc(var(--nk-cyber-button-base)*0.7);transform:translate(-50%,-50%) rotate(-45deg)}
.nk-cyber-button-scan{animation:nk-cyber-button-scan var(--nk-cyber-button-scan) cubic-bezier(0.45,0,0.55,1) infinite}
.nk-cyber-button-split{opacity:0}
@media (hover:hover) and (prefers-reduced-motion:no-preference){
.nk-cyber-button:hover .nk-cyber-button-split-a{animation:nk-cyber-button-split-a 340ms steps(1,end) both}
.nk-cyber-button:hover .nk-cyber-button-split-b{animation:nk-cyber-button-split-b 340ms steps(1,end) 30ms both}
.nk-cyber-button:hover .nk-cyber-button-label{animation:nk-cyber-button-jolt 340ms steps(1,end)}
}
@media (prefers-reduced-motion:reduce){.nk-cyber-button-scan{animation:none;opacity:0}}
`;

const sizes = {
  sm: { root: "h-8 gap-1.5 px-4 text-[11px]", cut: 7 },
  md: { root: "h-10 gap-2 px-5 text-xs", cut: 9 },
  lg: { root: "h-12 gap-2.5 px-7 text-sm", cut: 11 },
} as const;

const variants = {
  outline: {
    root: "[color:color-mix(in_srgb,rgb(var(--neon))_35%,white)] [text-shadow:0_0_10px_rgb(var(--neon)/0.5)]",
    border: "bg-[rgb(var(--neon)/0.5)] group-hover/cyber:bg-[rgb(var(--neon)/0.95)] group-focus-visible/cyber:bg-[rgb(var(--neon)/0.95)]",
    face: "[background:linear-gradient(180deg,rgb(var(--neon)/0.13),rgb(var(--neon)/0.04)_60%),#06070b] group-hover/cyber:[background:linear-gradient(180deg,rgb(var(--neon)/0.2),rgb(var(--neon)/0.07)_60%),#06070b]",
    scan: "bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.85)_18%,rgb(var(--neon)/0.85)_82%,transparent)]",
    trail: "bg-[linear-gradient(180deg,transparent,rgb(var(--neon)/0.14))]",
    splitB: "text-[rgb(var(--neon))]",
    tick: "bg-[rgb(var(--neon))]",
  },
  solid: {
    root: "text-[#05060a]",
    border: "bg-[rgb(var(--neon))]",
    face: "[background:linear-gradient(180deg,rgb(255_255_255/0.22),rgb(255_255_255/0)_55%),rgb(var(--neon))] group-hover/cyber:[background:linear-gradient(180deg,rgb(255_255_255/0.32),rgb(255_255_255/0.06)_55%),rgb(var(--neon))]",
    scan: "bg-[linear-gradient(90deg,transparent,rgb(255_255_255/0.85)_18%,rgb(255_255_255/0.85)_82%,transparent)]",
    trail: "bg-[linear-gradient(180deg,transparent,rgb(255_255_255/0.22))]",
    splitB: "text-white",
    tick: "bg-[rgb(var(--neon))]",
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

export interface CyberButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Second channel of the RGB split on hover. */
  colorAlt?: NeonColor;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Seconds between passes of the scanning line. 0 turns it off. */
  scanDuration?: number;
  /** Render the child element (e.g. a link) with the cyber frame. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  (raw, ref) => {
    const {
      className,
      style,
      color,
      colorAlt = "magenta",
      variant = "outline",
      size = "md",
      scanDuration = 3.6,
      asChild = false,
      disabled,
      children,
      ...props
    } = fromRenderProp(raw);
    const s = sizes[size];
    const v = variants[variant];
    const child = asChild && React.isValidElement<AnyProps>(children) ? children : null;
    const childRef = child ? getElementRef(child) : undefined;
    const composedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        setRef(ref, node);
        setRef(childRef as PossibleRef<HTMLButtonElement>, node);
      },
      [ref, childRef],
    );

    const decorate = (label: React.ReactNode) => (
      <>
        <style>{css}</style>
        {/* Focus ring: ring-2 with a 2px offset, cut to the same chamfer. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-150 group-focus-visible/cyber:opacity-100"
        >
          <span className="nk-cyber-button-shape absolute inset-0 bg-[rgb(var(--neon)/0.6)] [--nk-cyber-button-cut:calc(var(--nk-cyber-button-base)+1.6px)]" />
          <span className="nk-cyber-button-shape absolute inset-[2px] bg-[#05060a] [--nk-cyber-button-cut:calc(var(--nk-cyber-button-base)+0.8px)]" />
        </span>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 transition-[filter] duration-200 ease-out group-hover/cyber:[filter:drop-shadow(0_0_7px_rgb(var(--neon)/0.55))] group-focus-visible/cyber:[filter:drop-shadow(0_0_7px_rgb(var(--neon)/0.55))]"
        >
          <span className={cn("nk-cyber-button-shape absolute inset-0 transition-colors duration-200", v.border)} />
          <span
            className={cn(
              "nk-cyber-button-shape absolute inset-px overflow-hidden [--nk-cyber-button-cut:calc(var(--nk-cyber-button-base)-0.4px)]",
              v.face,
            )}
          >
            {scanDuration > 0 && (
              <span className="nk-cyber-button-scan absolute inset-0 opacity-50 transition-opacity duration-200 group-hover/cyber:opacity-100">
                <span className={cn("absolute inset-x-0 bottom-0 h-1/2", v.trail)} />
                <span className={cn("absolute inset-x-0 bottom-0 h-px", v.scan)} />
              </span>
            )}
          </span>
        </span>

        {/* Corner tick: a short bar parallel to the lower chamfer, just outside it */}
        <span
          aria-hidden
          className={cn("nk-cyber-button-tick pointer-events-none absolute h-px shadow-[0_0_6px_rgb(var(--neon))]", v.tick)}
        />

        <span className="nk-cyber-button-label relative inline-flex items-center gap-[inherit] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0">
          {label}
          <span
            aria-hidden
            className="nk-cyber-button-split nk-cyber-button-split-a pointer-events-none absolute inset-0 inline-flex items-center gap-[inherit] text-[rgb(var(--nk-cyber-button-alt))] [text-shadow:none]"
          >
            {label}
          </span>
          <span
            aria-hidden
            className={cn(
              "nk-cyber-button-split nk-cyber-button-split-b pointer-events-none absolute inset-0 inline-flex items-center gap-[inherit] [text-shadow:none]",
              v.splitB,
            )}
          >
            {label}
          </span>
        </span>
      </>
    );

    const rootProps: AnyProps = {
      style: neonVars(color, {
        "--nk-cyber-button-base": `${s.cut}px`,
        "--nk-cyber-button-cut": `${s.cut}px`,
        "--nk-cyber-button-alt": toNeonRgb(colorAlt),
        "--nk-cyber-button-scan": `${scanDuration}s`,
        ...style,
      } as React.CSSProperties),
      className: cn(
        "[--neon:var(--neon-accent,34_211_238)]",
        "nk-cyber-button group/cyber relative isolate inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap font-semibold uppercase tracking-[0.16em] outline-none",
        "transition-[color,transform,scale] duration-200 ease-out active:scale-[0.97]",
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
CyberButton.displayName = "CyberButton";

export { CyberButton };
