"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { computePosition, flip, offset, shift, type Placement, type VirtualElement } from "@floating-ui/react-dom";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// The tube strikes once when the tour opens. Between steps it glides; it never flickers again.
const css = `
@keyframes nk-tour-ignite{0%{opacity:0}8%{opacity:.9}14%{opacity:.25}24%{opacity:1}34%{opacity:.6}100%{opacity:1}}
.nk-tour-tube{animation:nk-tour-ignite 520ms linear both}
.nk-tour-leak{display:none}
[data-side=bottom] .nk-tour-leak[data-edge=top],[data-side=top] .nk-tour-leak[data-edge=bottom],
[data-side=left] .nk-tour-leak[data-edge=right],[data-side=right] .nk-tour-leak[data-edge=left]{display:block}
@media (prefers-reduced-motion:reduce){.nk-tour-tube{animation:none}}
`;

const EASE = [0.23, 1, 0.32, 1] as const;
const GLIDE = 380;
const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
type Rect = { x: number; y: number; w: number; h: number; r: number };
/** Where the overlay sits on screen, and how much an ancestor transform scales it. */
type Origin = { x: number; y: number; s: number };

/** A CSS selector, a ref, an element or a function that returns one. Leave it out for a centered step. */
export type TourTarget =
  | string
  | React.RefObject<HTMLElement | null>
  | HTMLElement
  | (() => HTMLElement | null | undefined);

export interface TourStep {
  target?: TourTarget | null;
  title: React.ReactNode;
  body?: React.ReactNode;
  /** Where the card sits. Flips when there isn't room. */
  side?: Side;
  align?: Align;
  /** Space between the target and the lit outline, in px. */
  padding?: number;
  /** Corner radius of the outline. Defaults to the target's own radius plus `padding`. */
  radius?: number;
}

export interface TourLabels {
  next?: React.ReactNode;
  back?: React.ReactNode;
  skip?: React.ReactNode;
  done?: React.ReactNode;
}

export interface TourProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "title" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"> {
  steps: TourStep[];
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Zero-based. */
  step?: number;
  defaultStep?: number;
  onStepChange?: (step: number) => void;
  /** Next on the last step. The tour closes afterwards. */
  onComplete?: () => void;
  /** Skip or Escape, with the step it was on. */
  onSkip?: (step: number) => void;
  /** Dims only this element instead of the whole page. It should be positioned. */
  container?: React.RefObject<HTMLElement | null> | HTMLElement | null;
  labels?: TourLabels;
  /** Palette name or hex. Inherits `--neon-accent` from the page when omitted. */
  color?: NeonColor;
}

const subscribe = () => () => {};
const useIsClient = () =>
  React.useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

const TABBABLE = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

function resolveTarget(target: TourTarget | null | undefined, scope: ParentNode): HTMLElement | null {
  if (!target) return null;
  if (typeof target === "string") return scope.querySelector<HTMLElement>(target);
  if (typeof target === "function") return target() ?? null;
  if (typeof HTMLElement !== "undefined" && target instanceof HTMLElement) return target;
  return (target as React.RefObject<HTMLElement | null>).current ?? null;
}

function resolveContainer(container: TourProps["container"]) {
  if (!container) return null;
  return container instanceof HTMLElement ? container : container.current;
}

const round = (n: number) => Math.round(n * 10) / 10;

/** The page outside a rounded-rect hole, as one even-odd path. */
function dimPath({ x, y, w, h, r }: Rect) {
  const outer = "M-10000 -10000H100000V100000H-10000Z";
  if (w < 1 || h < 1) return outer;
  const k = Math.min(r, w / 2, h / 2);
  return `${outer}M${round(x + k)} ${round(y)}H${round(x + w - k)}A${k} ${k} 0 0 1 ${round(x + w)} ${round(y + k)}V${round(y + h - k)}A${k} ${k} 0 0 1 ${round(x + w - k)} ${round(y + h)}H${round(x + k)}A${k} ${k} 0 0 1 ${round(x)} ${round(y + h - k)}V${round(y + k)}A${k} ${k} 0 0 1 ${round(x + k)} ${round(y)}Z`;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
});

const Tour = React.forwardRef<HTMLDivElement, TourProps>(
  (
    {
      steps,
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      step: stepProp,
      defaultStep = 0,
      onStepChange,
      onComplete,
      onSkip,
      container,
      labels,
      color,
      ...props
    },
    ref,
  ) => {
    const isClient = useIsClient();
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
    const open = openProp ?? innerOpen;
    // A ref container is filled when its element commits, which can be after this component's layout
    // effects (the container is usually an ancestor), so it's read in a passive effect.
    const [host, setHost] = React.useState<HTMLElement | null>(null);
    React.useEffect(() => {
      // Syncing from a ref, which has no event to subscribe to.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHost(resolveContainer(container));
    }, [container, open]);
    const [innerStep, setInnerStep] = React.useState(defaultStep);
    const count = steps.length;
    const index = Math.min(Math.max(stepProp ?? innerStep, 0), Math.max(count - 1, 0));

    // An uncontrolled tour starts over each time it opens.
    const [wasOpen, setWasOpen] = React.useState(open);
    if (open !== wasOpen) {
      setWasOpen(open);
      if (open && stepProp === undefined) setInnerStep(defaultStep);
    }

    const setOpen = (next: boolean) => {
      if (openProp === undefined) setInnerOpen(next);
      onOpenChange?.(next);
    };
    const go = (next: number) => {
      if (next < 0 || next >= count || next === index) return;
      if (stepProp === undefined) setInnerStep(next);
      onStepChange?.(next);
    };
    const actions = {
      next: () => {
        if (index >= count - 1) {
          onComplete?.();
          setOpen(false);
        } else go(index + 1);
      },
      back: () => go(index - 1),
      skip: () => {
        onSkip?.(index);
        setOpen(false);
      },
    };

    if (!isClient || (container && !host)) return null;

    return (
      <AnimatePresence>
        {open && count > 0 && (
          <TourLayer
            key="tour"
            ref={ref}
            steps={steps}
            index={index}
            host={host}
            labels={labels}
            color={color}
            actions={actions}
            {...props}
          />
        )}
      </AnimatePresence>
    );
  },
);
Tour.displayName = "Tour";

interface TourLayerProps extends Omit<TourProps, "open" | "defaultOpen" | "onOpenChange" | "step" | "defaultStep" | "onStepChange" | "onComplete" | "onSkip" | "container"> {
  index: number;
  host: HTMLElement | null;
  actions: { next: () => void; back: () => void; skip: () => void };
}

const TourLayer = React.forwardRef<HTMLDivElement, TourLayerProps>(
  ({ steps, index, host, labels, color, actions, className, style, onKeyDown, ...props }, forwardedRef) => {
    const reduceMotion = useReducedMotion();
    // False while the exit animation plays: the tour has already closed, so it lets go of focus and keys.
    const present = useIsPresent();
    const id = React.useId();
    const step = steps[index];
    const last = index === steps.length - 1;

    const overlayRef = React.useRef<HTMLDivElement>(null);
    const dimRef = React.useRef<SVGPathElement>(null);
    const tubeRef = React.useRef<SVGGElement>(null);
    const wrapperRef = React.useRef<HTMLDivElement>(null);
    const cardRef = React.useRef<HTMLDivElement>(null);
    const nextRef = React.useRef<HTMLButtonElement>(null);
    React.useImperativeHandle(forwardedRef, () => cardRef.current as HTMLDivElement);

    // The color where the tour started (its container, or the button that opened it), carried into the portals.
    const [inherited] = React.useState(() => {
      const source = host ?? (document.activeElement as HTMLElement | null) ?? document.body;
      const styles = getComputedStyle(source);
      const rgb = styles.getPropertyValue("--neon").trim() || styles.getPropertyValue("--neon-accent").trim();
      return rgb ? ({ "--neon": rgb, "--neon-accent": rgb } as React.CSSProperties) : undefined;
    });
    // Where focus was when the tour opened, read during the first render, before focus moves into the card.
    const [previous] = React.useState(() => document.activeElement as HTMLElement | null);

    const actionsRef = React.useRef(actions);
    React.useEffect(() => {
      actionsRef.current = actions;
    });

    // Geometry lives in refs and is written straight to the SVG and the card: no render per frame.
    const geo = React.useRef({ shown: null as Rect | null, from: null as Rect | null, start: 0, raf: 0, target: null as HTMLElement | null, tries: 0 });
    const stepRef = React.useRef(step);
    React.useEffect(() => {
      stepRef.current = step;
    }, [step]);

    const measure = React.useCallback((): { rect: Rect; origin: Origin } | null => {
      const overlay = overlayRef.current;
      if (!overlay) return null;
      const box = overlay.getBoundingClientRect();
      const s = overlay.offsetWidth ? box.width / overlay.offsetWidth : 1;
      const origin = { x: box.left, y: box.top, s };
      const target = geo.current.target;
      if (!target || !target.isConnected) {
        const w = overlay.offsetWidth || window.innerWidth;
        const h = overlay.offsetHeight || window.innerHeight;
        return { rect: { x: w / 2, y: h / 2, w: 0, h: 0, r: 0 }, origin };
      }
      const t = target.getBoundingClientRect();
      if (t.width === 0 && t.height === 0) {
        // Hidden (display: none at this breakpoint): the step falls back to a centered card.
        const w = overlay.offsetWidth || window.innerWidth;
        const h = overlay.offsetHeight || window.innerHeight;
        return { rect: { x: w / 2, y: h / 2, w: 0, h: 0, r: 0 }, origin };
      }
      const { padding = 6, radius } = stepRef.current;
      const own = parseFloat(getComputedStyle(target).borderTopLeftRadius) || 0;
      return {
        rect: {
          x: (t.left - box.left) / s - padding,
          y: (t.top - box.top) / s - padding,
          w: t.width / s + padding * 2,
          h: t.height / s + padding * 2,
          r: radius ?? Math.min(own + padding, 24),
        },
        origin,
      };
    }, []);

    const place = React.useCallback((rect: Rect, origin: Origin, centered: boolean) => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const { side = "bottom", align = "center" } = stepRef.current;
      if (centered) {
        const w = wrapper.offsetWidth;
        const h = wrapper.offsetHeight;
        const cx = origin.x + (rect.x + rect.w / 2) * origin.s;
        const cy = origin.y + (rect.y + rect.h / 2) * origin.s;
        const x = Math.min(Math.max(cx - w / 2, 12), window.innerWidth - w - 12);
        const y = Math.min(Math.max(cy - h / 2, 12), window.innerHeight - h - 12);
        wrapper.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
        wrapper.dataset.side = "none";
        wrapper.style.opacity = "";
        return;
      }
      const reference: VirtualElement = {
        getBoundingClientRect: () => {
          const left = origin.x + rect.x * origin.s;
          const top = origin.y + rect.y * origin.s;
          const width = rect.w * origin.s;
          const height = rect.h * origin.s;
          return { x: left, y: top, left, top, width, height, right: left + width, bottom: top + height };
        },
      };
      computePosition(reference, wrapper, {
        strategy: "fixed",
        placement: (align === "center" ? side : `${side}-${align}`) as Placement,
        // Opposite side first, then the perpendicular ones; on a phone a side card often has to go above or below.
        middleware: [offset(12), flip({ padding: 12, fallbackAxisSideDirection: "start" }), shift({ padding: 12, crossAxis: true })],
      }).then(({ x, y, placement }) => {
        wrapper.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
        // The light leak sits opposite the target's centre, kept clear of the card's corners.
        const box = reference.getBoundingClientRect();
        const clamp = (value: number, max: number) => `${Math.round(Math.min(Math.max(value, 48), Math.max(max - 48, 48)))}px`;
        wrapper.style.setProperty("--nk-leak-x", clamp(box.left + box.width / 2 - x, wrapper.offsetWidth));
        wrapper.style.setProperty("--nk-leak-y", clamp(box.top + box.height / 2 - y, wrapper.offsetHeight));
        wrapper.dataset.side = placement.split("-")[0];
        wrapper.style.opacity = "";
      });
    }, []);

    const write = React.useCallback(
      (rect: Rect, origin: Origin, centered: boolean) => {
        geo.current.shown = rect;
        dimRef.current?.setAttribute("d", dimPath(rect));
        const tube = tubeRef.current;
        if (tube) {
          tube.style.display = rect.w < 2 || rect.h < 2 ? "none" : "";
          for (const node of Array.from(tube.children) as SVGRectElement[]) {
            const inset = Number(node.dataset.inset ?? 0);
            node.setAttribute("x", String(round(rect.x + inset)));
            node.setAttribute("y", String(round(rect.y + inset)));
            node.setAttribute("width", String(round(Math.max(0, rect.w - inset * 2))));
            node.setAttribute("height", String(round(Math.max(0, rect.h - inset * 2))));
            node.setAttribute("rx", String(round(Math.max(0, Math.min(rect.r - inset, rect.w / 2, rect.h / 2)))));
          }
        }
        place(rect, origin, centered);
      },
      [place],
    );

    const frameRef = React.useRef<(now: number) => void>(() => {});
    const frame = React.useCallback(
      (now: number) => {
        const g = geo.current;
        g.raf = 0;
        const measured = measure();
        if (!measured) return;
        const { rect, origin } = measured;
        const t = reduceMotion || !g.from ? 1 : Math.min(1, (now - g.start) / GLIDE);
        write(g.from && t < 1 ? lerpRect(g.from, rect, easeOutQuint(t)) : rect, origin, rect.w < 1 && rect.h < 1);
        if (t < 1) g.raf = requestAnimationFrame((time) => frameRef.current(time));
        else g.from = null;
      },
      [measure, write, reduceMotion],
    );
    React.useEffect(() => {
      frameRef.current = frame;
    }, [frame]);

    const schedule = React.useCallback(() => {
      if (!geo.current.raf) geo.current.raf = requestAnimationFrame(frame);
    }, [frame]);

    // New step: find its target (it may mount a frame or two late), bring it into view, glide to it.
    React.useEffect(() => {
      const g = geo.current;
      let cancelled = false;
      let retry = 0;
      const scope = host ?? document;
      const begin = () => {
        if (cancelled) return;
        const target = resolveTarget(step.target, scope);
        if (step.target && !target && g.tries < 30) {
          g.tries += 1;
          retry = requestAnimationFrame(begin);
          return;
        }
        g.tries = 0;
        g.target = target;
        const measured = measure();
        if (!measured) return;
        const { rect } = measured;
        // The first step contracts onto its target, like a lens focusing; later steps glide from the last.
        g.from = g.shown ?? { x: rect.x - 14, y: rect.y - 14, w: rect.w + 28, h: rect.h + 28, r: rect.r + 14 };
        g.start = performance.now();
        if (target) {
          const box = target.getBoundingClientRect();
          const margin = 96;
          if (box.top < margin || box.bottom > window.innerHeight - margin || box.left < 0 || box.right > window.innerWidth) {
            target.scrollIntoView({ block: "center", inline: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
          }
        }
        cancelAnimationFrame(g.raf);
        g.raf = 0;
        schedule();
      };
      begin();
      return () => {
        cancelled = true;
        cancelAnimationFrame(retry);
      };
      // Keyed on the index and target, not the step object, so an inline steps array doesn't restart the glide.
    }, [index, step.target, host, measure, schedule, reduceMotion]);

    // Follow the target through scrolling, resizing and its own layout changes.
    React.useEffect(() => {
      const g = geo.current;
      window.addEventListener("scroll", schedule, { capture: true, passive: true });
      window.addEventListener("resize", schedule);
      const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(schedule) : null;
      if (g.target) observer?.observe(g.target);
      if (wrapperRef.current) observer?.observe(wrapperRef.current);
      return () => {
        window.removeEventListener("scroll", schedule, { capture: true });
        window.removeEventListener("resize", schedule);
        observer?.disconnect();
      };
    }, [schedule, index]);

    React.useEffect(() => {
      const g = geo.current;
      return () => cancelAnimationFrame(g.raf);
    }, []);

    // Focus moves into the card, and back to wherever it was as soon as the tour closes.
    React.useEffect(() => {
      if (present) {
        nextRef.current?.focus({ preventScroll: true });
        return;
      }
      if (previous && previous.isConnected && previous !== document.body) previous.focus({ preventScroll: true });
    }, [present, previous]);

    // A step change can hide the focused button (Back on the first step): keep focus in the card.
    React.useEffect(() => {
      const card = cardRef.current;
      if (card && !card.contains(document.activeElement)) nextRef.current?.focus({ preventScroll: true });
    }, [index]);

    React.useEffect(() => {
      if (!present) return;
      const onKey = (event: KeyboardEvent) => {
        if (event.defaultPrevented) return;
        const target = event.target as HTMLElement | null;
        const typing = target?.closest("input, textarea, select, [contenteditable='true']");
        if (event.key === "Escape") {
          event.preventDefault();
          actionsRef.current.skip();
        } else if (!typing && event.key === "ArrowRight") {
          event.preventDefault();
          actionsRef.current.next();
        } else if (!typing && event.key === "ArrowLeft") {
          event.preventDefault();
          actionsRef.current.back();
        }
      };
      const onFocusIn = (event: FocusEvent) => {
        const card = cardRef.current;
        if (card && event.target instanceof Node && !card.contains(event.target)) nextRef.current?.focus({ preventScroll: true });
      };
      document.addEventListener("keydown", onKey);
      document.addEventListener("focusin", onFocusIn);
      return () => {
        document.removeEventListener("keydown", onKey);
        document.removeEventListener("focusin", onFocusIn);
      };
    }, [present]);

    const trapTab = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || event.key !== "Tab") return;
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(TABBABLE));
      if (!items.length) return;
      const first = items[0];
      const lastItem = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault();
        first.focus();
      }
    };

    const fid = `${id}-glow`.replace(/:/g, "");
    const titleId = `${id}-title`;
    const bodyId = `${id}-body`;
    const fade = { duration: reduceMotion ? 0.12 : 0.2, ease: EASE };

    const overlay = (
      <motion.div
        ref={overlayRef}
        aria-hidden
        data-nk-tour-overlay=""
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={fade}
        style={{ ...inherited, ...neonVars(color) }}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          host ? "absolute inset-0 z-40 rounded-[inherit]" : "fixed inset-0 z-[60]",
          "overflow-hidden",
          !present && "pointer-events-none",
        )}
      >
        <style href="nk-tour" precedence="nk">{css}</style>
        <svg className="absolute inset-0 size-full">
          <defs>
            <filter id={fid} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>
          <path ref={dimRef} fillRule="evenodd" style={{ fill: "rgb(3 4 8 / 0.74)" }} d={dimPath({ x: 0, y: 0, w: 0, h: 0, r: 0 })} />
          <g ref={tubeRef} className="nk-tour-tube" style={{ display: "none" }}>
            <rect
              filter={`url(#${fid})`}
              style={{ fill: "none", stroke: "rgb(var(--neon))", strokeWidth: 5, opacity: "calc(0.55 * var(--neon-glow, 1))" }}
            />
            <rect style={{ fill: "rgb(var(--neon) / 0.035)", stroke: "rgb(var(--neon))", strokeWidth: 1.5 }} />
            <rect data-inset="0.3" style={{ fill: "none", stroke: "color-mix(in srgb, rgb(var(--neon)) 45%, white)", strokeWidth: 0.6 }} />
          </g>
        </svg>
      </motion.div>
    );

    const card = (
      <div
        ref={wrapperRef}
        // Transparent, not hidden, until placed: a hidden button can't take focus.
        style={{ ...inherited, ...neonVars(color), opacity: 0 }}
        className={cn("[--neon:var(--neon-accent,34_211_238)] fixed left-0 top-0 z-[61] w-max", !present && "pointer-events-none")}
      >
        <motion.div
          {...props}
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={step.body ? bodyId : undefined}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
          transition={fade}
          onKeyDown={trapTab}
          style={style}
          className={cn(
            "relative w-[min(20rem,calc(100vw-24px))] rounded-xl border border-white/10 bg-[#0a0b11] p-4 text-white/90 outline-none",
            "shadow-[0_18px_48px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(var(--neon)/0.06),0_0_28px_-10px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]",
            className,
          )}
        >
          {/* Light leaks in along the edge facing the target. */}
          <span aria-hidden className="pointer-events-none absolute -inset-px overflow-hidden rounded-[inherit]">
            <span data-edge="top" className="nk-tour-leak absolute left-[var(--nk-leak-x,50%)] top-0 h-px w-40 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.75),transparent)]" />
            <span data-edge="bottom" className="nk-tour-leak absolute bottom-0 left-[var(--nk-leak-x,50%)] h-px w-40 -translate-x-1/2 bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.75),transparent)]" />
            <span data-edge="left" className="nk-tour-leak absolute left-0 top-[var(--nk-leak-y,50%)] h-24 w-px -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgb(var(--neon)/0.75),transparent)]" />
            <span data-edge="right" className="nk-tour-leak absolute right-0 top-[var(--nk-leak-y,50%)] h-24 w-px -translate-y-1/2 bg-[linear-gradient(180deg,transparent,rgb(var(--neon)/0.75),transparent)]" />
          </span>

          <motion.div
            key={index}
            initial={reduceMotion ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: EASE, delay: 0.04 }}
          >
            <div className="flex items-baseline justify-between gap-4">
              <h2 id={titleId} className="text-[15px] font-medium leading-snug text-white">
                {step.title}
              </h2>
              {steps.length > 1 && (
                <span className="shrink-0 text-xs tabular-nums text-white/45">
                  {index + 1} of {steps.length}
                </span>
              )}
            </div>
            {step.body && (
              <div id={bodyId} className="mt-1.5 text-[13.5px] leading-[1.55] text-white/60">
                {step.body}
              </div>
            )}
          </motion.div>
          <span className="sr-only" aria-live="polite">{steps.length > 1 ? `Step ${index + 1} of ${steps.length}` : ""}</span>

          <div className="mt-4 flex items-center gap-2">
            {!last && (
              <button
                type="button"
                onClick={() => actions.skip()}
                className="-ml-1.5 h-8 cursor-pointer rounded-md px-1.5 text-[13px] text-white/50 outline-none transition-colors duration-150 hover:text-white/85 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
              >
                {labels?.skip ?? "Skip tour"}
              </button>
            )}
            <div className="ml-auto flex items-center gap-2">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => actions.back()}
                  className="h-8 cursor-pointer rounded-md border border-white/10 px-3 text-[13px] text-white/75 outline-none transition-[border-color,color,transform] duration-150 hover:border-white/20 hover:text-white active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b11]"
                >
                  {labels?.back ?? "Back"}
                </button>
              )}
              <button
                ref={nextRef}
                type="button"
                onClick={() => actions.next()}
                className={cn(
                  "h-8 cursor-pointer rounded-md bg-[rgb(var(--neon))] px-3.5 text-[13px] font-medium text-[#05060a] outline-none transition-[box-shadow,transform] duration-150 active:scale-[0.97]",
                  "shadow-[0_0_0_1px_rgb(var(--neon)),0_0_14px_rgb(var(--neon)/CALC(0.4*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45)] hover:shadow-[0_0_0_1px_rgb(var(--neon)),0_0_22px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))),inset_0_1px_0_rgb(255_255_255/0.45)]",
                  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b11]",
                )}
              >
                {last ? (labels?.done ?? "Done") : (labels?.next ?? "Next")}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );

    return (
      <>
        {createPortal(overlay, host ?? document.body)}
        {createPortal(card, document.body)}
      </>
    );
  },
);
TourLayer.displayName = "TourLayer";

export { Tour };
