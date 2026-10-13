"use client";

import * as React from "react";
import {
  animate,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

/** The single element in `node`. Server Components can pass it as a lazy reference, which Children resolves. */
function resolveElement<P = Record<string, unknown>>(node: React.ReactNode): React.ReactElement<P> | null {
  const [child] = React.Children.toArray(node);
  return React.isValidElement<P>(child) ? child : null;
}

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

/** A snap point: a fraction of the viewport height (0.4) or a fixed height ("320px"). */
export type SnapPoint = number | `${number}px`;

// iOS sheet curve: a quick start that settles very gently.
const SHEET_EASE = [0.32, 0.72, 0, 1] as const;
const SETTLE = { type: "spring", stiffness: 420, damping: 42, mass: 1 } as const;
const DRAG_THRESHOLD = 4;
const FLICK = 550; // px/s: faster than this moves at least one stop in the flick's direction.
const HARD_FLICK = 2400; // px/s: a downward flick this fast dismisses from any stop.
const NO_DRAG = "input, textarea, select, [contenteditable=''], [contenteditable='true'], [data-drawer-no-drag]";

interface DrawerContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  color?: NeonColor;
  contentId: string;
  titleId: string;
  descriptionId: string;
  hasDescription: boolean;
  setHasDescription: (value: boolean) => void;
  triggerRef: { current: HTMLElement | null };
  snapPoints?: SnapPoint[];
  activeSnapPoint: SnapPoint | null;
  setActiveSnapPoint: (point: SnapPoint) => void;
  dismissible: boolean;
  scaleBackground: boolean;
  /** 0 to 1: how far a drawer opened from inside this one has risen. */
  nestedProgress: MotionValue<number>;
  /** How far this drawer lifts so its top edge still shows above a taller child, in px. */
  nestedLift: MotionValue<number>;
  /** This drawer's visible height at its current stop; a child reads it to work out the lift. */
  visibleRef: { current: () => number };
  parent: DrawerContextValue | null;
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

function useDrawer(component: string) {
  const context = React.useContext(DrawerContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <Drawer>.`);
  return context;
}

type PossibleRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: PossibleRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.MutableRefObject<T | null>).current = value;
}

function useComposedRefs<T>(a: PossibleRef<T>, b: PossibleRef<T>) {
  return React.useCallback(
    (node: T | null) => {
      setRef(a, node);
      setRef(b, node);
    },
    [a, b],
  );
}

/** Merges props onto its single child element, chaining the child's own onClick. */
const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, className, onClick, ...props }, ref) => {
    const child = resolveElement<React.HTMLAttributes<HTMLElement>>(children);
    if (!child) return null;

    return React.cloneElement(child, {
      ...props,
      className: cn(child.props.className, className),
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        child.props.onClick?.(event);
        if (!event.defaultPrevented) onClick?.(event);
      },
      ...(ref ? { ref } : null),
    } as React.HTMLAttributes<HTMLElement>);
  },
);
Slot.displayName = "DrawerSlot";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function toPixels(point: SnapPoint, viewport: number) {
  return typeof point === "number" ? point * viewport : Number.parseFloat(point);
}

export interface DrawerProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Palette name or hex. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /**
   * Heights the drawer rests at, lowest first: fractions of the viewport (0.4) or pixels ("320px").
   * Without them the drawer is as tall as its content.
   */
  snapPoints?: SnapPoint[];
  /** Controlled snap point. One of `snapPoints`. */
  activeSnapPoint?: SnapPoint | null;
  onActiveSnapPointChange?: (point: SnapPoint) => void;
  /** When false, dragging, Escape and the overlay can't close it; only your own controls can. */
  dismissible?: boolean;
  /**
   * Shrinks the page behind the drawer into a card. Scales the element marked
   * `data-drawer-wrapper`, so put that on your app's root.
   */
  scaleBackground?: boolean;
  children?: React.ReactNode;
}

function Drawer({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  color,
  snapPoints,
  activeSnapPoint: activeProp,
  onActiveSnapPointChange,
  dismissible = true,
  scaleBackground = false,
  children,
}: DrawerProps) {
  const parent = React.useContext(DrawerContext);
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [hasDescription, setHasDescription] = React.useState(false);
  const [uncontrolledSnap, setUncontrolledSnap] = React.useState<SnapPoint | null>(snapPoints?.[0] ?? null);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const nestedProgress = useMotionValue(0);
  const nestedLift = useMotionValue(0);
  const visibleRef = React.useRef<() => number>(() => 0);
  const id = React.useId();
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;
  const activeSnapPoint = activeProp !== undefined ? activeProp : uncontrolledSnap;

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === open) return;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [open, isControlled, onOpenChange],
  );

  const setActiveSnapPoint = React.useCallback(
    (point: SnapPoint) => {
      if (point === activeSnapPoint) return;
      if (activeProp === undefined) setUncontrolledSnap(point);
      onActiveSnapPointChange?.(point);
    },
    [activeSnapPoint, activeProp, onActiveSnapPointChange],
  );

  const value = React.useMemo<DrawerContextValue>(
    () => ({
      open,
      setOpen,
      color,
      contentId: `${id}-content`,
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
      hasDescription,
      setHasDescription,
      triggerRef,
      snapPoints,
      activeSnapPoint,
      setActiveSnapPoint,
      dismissible,
      // A nested drawer leaves the background to its parent.
      scaleBackground: scaleBackground && !parent,
      nestedProgress,
      nestedLift,
      visibleRef,
      parent,
    }),
    [
      open,
      setOpen,
      color,
      id,
      hasDescription,
      snapPoints,
      activeSnapPoint,
      setActiveSnapPoint,
      dismissible,
      scaleBackground,
      nestedProgress,
      nestedLift,
      parent,
    ],
  );

  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}
Drawer.displayName = "Drawer";

export interface DrawerTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge trigger behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const DrawerTrigger = React.forwardRef<HTMLButtonElement, DrawerTriggerProps>((raw, ref) => {
  const { asChild = false, onClick, children, ...props } = fromRenderProp(raw);
  const { open, setOpen, contentId, triggerRef } = useDrawer("DrawerTrigger");

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event as React.MouseEvent<HTMLButtonElement>);
    if (event.defaultPrevented) return;
    triggerRef.current = event.currentTarget;
    setOpen(true);
  };

  const triggerProps = {
    ...props,
    "aria-haspopup": "dialog" as const,
    "aria-expanded": open,
    "aria-controls": open ? contentId : undefined,
  };

  if (asChild) {
    return (
      <Slot ref={ref} {...triggerProps} onClick={handleClick}>
        {children}
      </Slot>
    );
  }

  return (
    <button ref={ref} type="button" {...triggerProps} onClick={handleClick}>
      {children}
    </button>
  );
});
DrawerTrigger.displayName = "DrawerTrigger";

interface DragState {
  active: boolean;
  pending: boolean;
  pointerId: number;
  startY: number;
  startTranslate: number;
  scroller: HTMLElement | null;
  samples: { t: number; y: number }[];
}

interface Geometry {
  /** Panel height in px. */
  height: number;
  /** translateY for each snap point, in snapPoints order (lowest drawer first, so largest y first). */
  stops: number[];
  closed: number;
}

const flash = `@keyframes nk-drawer-detent{0%{opacity:1}100%{opacity:0}}`;

export interface DrawerContentProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "onAnimationStart" | "onDrag" | "onDragStart" | "onDragEnd"> {
  /** Shows the grab handle at the top. It doubles as a button that steps through the snap points. */
  showHandle?: boolean;
  /** Classes for the scrolling body that holds the children. */
  bodyClassName?: string;
}

const DrawerContent = React.forwardRef<HTMLDivElement, DrawerContentProps>(
  ({ showHandle = true, className, bodyClassName, style, children, onPointerDown: onPointerDownProp, ...props }, forwardedRef) => {
    const drawer = useDrawer("DrawerContent");
    const {
      open,
      setOpen,
      color,
      contentId,
      titleId,
      descriptionId,
      hasDescription,
      triggerRef,
      snapPoints,
      activeSnapPoint,
      setActiveSnapPoint,
      dismissible,
      scaleBackground,
      nestedProgress,
      nestedLift,
      visibleRef,
      parent,
    } = drawer;
    const reduceMotion = useReducedMotion() ?? false;
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    const panelRef = React.useRef<HTMLDivElement>(null);
    const ref = useComposedRefs(forwardedRef, panelRef);
    const saved = React.useRef<{ overflow: string; focus: HTMLElement | null; bodyBg: string } | null>(null);
    const geometry = React.useRef<Geometry>({ height: 0, stops: [0], closed: 0 });
    const y = useMotionValue(10000);
    const [dragging, setDragging] = React.useState(false);
    const [detent, setDetent] = React.useState(0);
    const [viewport, setViewport] = React.useState(0);

    // Keep the dialog mounted while the panel slides out.
    const [present, setPresent] = React.useState(open);
    const [wasOpen, setWasOpen] = React.useState(open);
    if (open !== wasOpen) {
      setWasOpen(open);
      if (open) setPresent(true);
    }

    const hasSnaps = Boolean(snapPoints?.length);
    const maxSnapHeight = hasSnaps && viewport ? Math.max(...snapPoints!.map((p) => toPixels(p, viewport))) : 0;

    const measure = React.useCallback(() => {
      const vh = window.innerHeight;
      const panel = panelRef.current;
      if (snapPoints?.length) {
        const visible = snapPoints.map((point) => clamp(toPixels(point, vh), 0, vh));
        const height = Math.max(...visible);
        geometry.current = { height, stops: visible.map((v) => height - v), closed: height + 24 };
      } else {
        const height = panel?.offsetHeight ?? vh;
        geometry.current = { height, stops: [0], closed: height + 24 };
      }
      return geometry.current;
    }, [snapPoints]);

    const stopFor = React.useCallback(
      (point: SnapPoint | null) => {
        const { stops } = geometry.current;
        if (!snapPoints?.length || point === null) return stops[0];
        const index = snapPoints.indexOf(point);
        return stops[index < 0 ? 0 : index];
      },
      [snapPoints],
    );

    // 0 when closed, 1 once the lowest stop is reached. Drives the overlay, page scale and parent.
    const progress = useTransform(y, (value) => {
      const { stops, closed } = geometry.current;
      const lowest = Math.max(...stops);
      if (closed <= lowest) return 1;
      return clamp((closed - value) / (closed - lowest), 0, 1);
    });

    useMotionValueEvent(progress, "change", (p) => {
      if (parent) {
        // Lift the parent until its top edge peeks 18px above this drawer, however tall it is.
        const { height } = geometry.current;
        const visible = height - stopFor(activeSnapPoint);
        parent.nestedLift.set(Math.max(0, visible + 18 - parent.visibleRef.current()));
        parent.nestedProgress.set(p);
      }
      if (!scaleBackground) return;
      const wrapper = document.querySelector<HTMLElement>("[data-drawer-wrapper]");
      if (!wrapper) return;
      const width = window.innerWidth || 1;
      const scale = 1 - (Math.min(32, width * 0.06) / width) * p;
      wrapper.style.transform = p ? `translate3d(0, ${12 * p}px, 0) scale(${scale})` : "";
      wrapper.style.borderRadius = p ? `${14 * p}px` : "";
      wrapper.style.overflow = p ? "hidden" : "";
      // On a near-black page the shrunken card needs an edge to read as one.
      wrapper.style.boxShadow = p ? `0 0 0 1px rgb(255 255 255 / ${0.08 * p})` : "";
    });

    React.useEffect(() => {
      visibleRef.current = () => geometry.current.height - stopFor(activeSnapPoint);
    }, [visibleRef, stopFor, activeSnapPoint]);

    // A drawer opened from this one pushes it back: smaller and a little higher, like a stacked card.
    const nestedScale = useTransform(nestedProgress, [0, 1], [1, 0.94]);
    const nestedY = useTransform([nestedProgress, nestedLift], ([p, lift]: number[]) => -p * Math.max(10, lift));
    const overlayOpacity = useTransform(progress, (p) => p);

    const settle = React.useCallback(
      (target: number, velocity = 0) => {
        if (reduceMotion) {
          y.set(target);
          return;
        }
        animate(y, target, { ...SETTLE, velocity });
      },
      [y, reduceMotion],
    );

    // Open: show the modal, measure, then slide up from below the fold.
    React.useLayoutEffect(() => {
      const dialog = dialogRef.current;
      if (!open || !dialog) return;
      if (!dialog.open) {
        const active = document.activeElement;
        saved.current = {
          overflow: document.documentElement.style.overflow,
          focus: active instanceof HTMLElement && active !== document.body ? active : triggerRef.current,
          bodyBg: document.body.style.background,
        };
        triggerRef.current = null;
        document.documentElement.style.overflow = "hidden";
        const wrapper = scaleBackground ? document.querySelector<HTMLElement>("[data-drawer-wrapper]") : null;
        if (wrapper) {
          document.body.style.background = "#000";
          // Shrink toward the top of what's on screen, not the top of a long scrolled page.
          wrapper.style.transformOrigin = `50% ${-wrapper.getBoundingClientRect().top}px`;
        }
      }
      setViewport(window.innerHeight);
      const { closed } = measure();
      y.stop();
      y.set(closed);
      if (!dialog.open) {
        dialog.showModal();
        // Land on the panel itself, so a phone doesn't throw up its keyboard for the first input.
        panelRef.current?.focus({ preventScroll: true });
      }
      const target = stopFor(activeSnapPoint);
      if (reduceMotion) y.set(target);
      else animate(y, target, { duration: 0.5, ease: SHEET_EASE });
      // Only on open; snap changes animate through their own effect.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    // Close: slide out (carrying any flick), then close the dialog and hand focus back.
    React.useEffect(() => {
      if (open || !present) return;
      const finish = () => {
        const dialog = dialogRef.current;
        if (dialog?.open) dialog.close();
        setPresent(false);
        const restore = saved.current;
        saved.current = null;
        if (!restore) return;
        document.documentElement.style.overflow = restore.overflow;
        document.body.style.background = restore.bodyBg;
        if (restore.focus?.isConnected) restore.focus.focus({ preventScroll: true });
      };
      const { closed } = measure();
      if (reduceMotion) {
        y.set(closed);
        finish();
        return;
      }
      const velocity = y.getVelocity();
      const controls =
        velocity > 200
          ? animate(y, closed, { ...SETTLE, velocity })
          : animate(y, closed, { duration: 0.32, ease: SHEET_EASE });
      controls.then(finish);
      return () => controls.stop();
    }, [open, present, y, reduceMotion, measure]);

    const dragRef = React.useRef<DragState>({
      active: false,
      pending: false,
      pointerId: -1,
      startY: 0,
      startTranslate: 0,
      scroller: null as HTMLElement | null,
      samples: [] as { t: number; y: number }[],
    });

    // A new snap point from outside (controlled prop or the handle) glides there.
    const lastSnap = React.useRef(activeSnapPoint);
    React.useEffect(() => {
      if (lastSnap.current === activeSnapPoint) return;
      lastSnap.current = activeSnapPoint;
      if (open && !dragRef.current.active) settle(stopFor(activeSnapPoint));
    }, [activeSnapPoint, open, settle, stopFor]);

    React.useEffect(() => {
      if (!open) return;
      const onResize = () => {
        setViewport(window.innerHeight);
        measure();
        y.set(stopFor(activeSnapPoint));
      };
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, [open, measure, stopFor, activeSnapPoint, y]);

    React.useEffect(
      () => () => {
        const restore = saved.current;
        if (!restore) return;
        document.documentElement.style.overflow = restore.overflow;
        document.body.style.background = restore.bodyBg;
        const wrapper = document.querySelector<HTMLElement>("[data-drawer-wrapper]");
        if (wrapper) {
          wrapper.style.transform = "";
          wrapper.style.boxShadow = "";
          wrapper.style.transformOrigin = "";
        }
      },
      [],
    );


    function release(velocity: number) {
      const { stops, closed } = geometry.current;
      const current = y.get();
      const order = stops.map((stop, index) => ({ stop, index })).sort((a, b) => a.stop - b.stop);
      const lowest = order[order.length - 1];

      let target: { stop: number; index: number } | "closed";
      if (dismissible && velocity > HARD_FLICK) {
        target = "closed";
      } else if (Math.abs(velocity) > FLICK) {
        // Move at least one stop in the flick's direction.
        target =
          velocity > 0
            ? (order.find((o) => o.stop > current + 1) ?? (dismissible ? "closed" : lowest))
            : ([...order].reverse().find((o) => o.stop < current - 1) ?? order[0]);
      } else {
        target = order.reduce((best, o) => (Math.abs(o.stop - current) < Math.abs(best.stop - current) ? o : best));
        // Past a third of the lowest stop's height (or 200px), letting go dismisses.
        const lowestVisible = closed - 24 - lowest.stop;
        if (dismissible && target === lowest && current - lowest.stop > Math.min(lowestVisible * 0.33, 200)) {
          target = "closed";
        }
      }

      if (target === "closed") {
        setOpen(false);
        return;
      }
      if (snapPoints?.length) {
        const point = snapPoints[target.index];
        lastSnap.current = point;
        setActiveSnapPoint(point);
      }
      settle(target.stop, velocity);
      setDetent((count) => count + 1);
    }

    function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
      if (event.button !== 0 || reduceMotion) return;
      const target = event.target as HTMLElement;
      if (target.closest(NO_DRAG)) return;
      dragRef.current = {
        active: false,
        pending: true,
        pointerId: event.pointerId,
        startY: event.clientY,
        startTranslate: y.get(),
        scroller: target.closest<HTMLElement>("[data-drawer-scroll]"),
        samples: [{ t: event.timeStamp, y: event.clientY }],
      };
    }

    // Window listeners keep the drag alive when the finger outruns the panel.
    React.useEffect(() => {
      if (!present) return;
      const panel = panelRef.current;

      const onMove = (event: PointerEvent) => {
        const state = dragRef.current;
        if (!state.pending || event.pointerId !== state.pointerId) return;
        const dy = event.clientY - state.startY;
        if (!state.active) {
          if (Math.abs(dy) < DRAG_THRESHOLD) return;
          const { stops } = geometry.current;
          const atTop = Math.abs(y.get() - Math.min(...stops)) < 2;
          const scroller = state.scroller;
          const scrollable = scroller && scroller.scrollHeight > scroller.clientHeight + 1;
          // Fully open with scrollable content: the content scrolls, unless it's at the top and you pull down.
          if (scrollable && atTop && (dy < 0 || scroller.scrollTop > 0)) {
            state.pending = false;
            return;
          }
          state.active = true;
          state.startY = event.clientY;
          y.stop();
          setDragging(true);
          panel?.setPointerCapture?.(event.pointerId);
        }
        const { stops } = geometry.current;
        const top = Math.min(...stops);
        let next = state.startTranslate + (event.clientY - state.startY);
        // Past the top stop the panel resists, like pulling on a spring.
        if (next < top) next = top - Math.sqrt(top - next) * 3;
        if (!dismissible) next = Math.min(next, Math.max(...stops) + Math.sqrt(Math.max(0, next - Math.max(...stops))) * 3);
        y.set(next);
        state.samples.push({ t: event.timeStamp, y: event.clientY });
        while (state.samples.length > 2 && event.timeStamp - state.samples[0].t > 100) state.samples.shift();
      };

      const onUp = (event: PointerEvent) => {
        const state = dragRef.current;
        if (event.pointerId !== state.pointerId) return;
        const wasActive = state.active;
        state.pending = false;
        state.active = false;
        if (!wasActive) return;
        setDragging(false);
        const first = state.samples[0];
        const last = state.samples[state.samples.length - 1];
        const dt = last.t - first.t;
        const velocity = event.type === "pointercancel" || dt <= 0 ? 0 : ((last.y - first.y) / dt) * 1000;
        release(velocity);
        // The press that ended a drag isn't a click on whatever it started over.
        const swallow = (click: MouseEvent) => {
          click.stopPropagation();
          click.preventDefault();
        };
        window.addEventListener("click", swallow, { capture: true, once: true });
        window.setTimeout(() => window.removeEventListener("click", swallow, { capture: true }), 0);
      };

      // Once a drag has started, stop the browser from scrolling the page or the body underneath.
      const onTouchMove = (event: TouchEvent) => {
        if (dragRef.current.active) event.preventDefault();
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
      panel?.addEventListener("touchmove", onTouchMove, { passive: false });
      return () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        panel?.removeEventListener("touchmove", onTouchMove);
      };
      // release reads fresh props through closures recreated each render; re-binding per render is cheap.
    });

    const snapIndex = hasSnaps && activeSnapPoint !== null ? snapPoints!.indexOf(activeSnapPoint) : -1;
    const expanded = hasSnaps && snapIndex === snapPoints!.length - 1;

    function stepSnap(direction: 1 | -1 | "cycle") {
      if (!snapPoints?.length) return;
      const index = snapIndex < 0 ? 0 : snapIndex;
      const next =
        direction === "cycle" ? (index + 1) % snapPoints.length : clamp(index + direction, 0, snapPoints.length - 1);
      setActiveSnapPoint(snapPoints[next]);
      setDetent((count) => count + 1);
    }

    const nested = Boolean(parent);

    return (
      <dialog
        ref={dialogRef}
        id={contentId}
        aria-labelledby={titleId}
        aria-describedby={hasDescription ? descriptionId : undefined}
        onCancel={(event) => {
          // React hands a nested drawer's cancel to every ancestor's handler too; only answer our own.
          if (event.target !== event.currentTarget) return;
          event.preventDefault();
          if (dismissible) setOpen(false);
        }}
        onClose={(event) => {
          if (event.target !== event.currentTarget) return;
          if (!dialogRef.current?.open) setOpen(false);
        }}
        style={neonVars(color)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none overflow-clip border-0 bg-transparent p-0 text-white/90 outline-none backdrop:bg-transparent",
        )}
      >
        {present && (
          <>
            <motion.div
              aria-hidden
              style={{ opacity: overlayOpacity }}
              onClick={() => {
                if (dismissible) setOpen(false);
              }}
              className={cn(
                "absolute inset-0",
                nested ? "bg-black/25" : scaleBackground ? "bg-black/40" : "bg-black/60 backdrop-blur-[2px]",
              )}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center">
              <motion.div
                style={{ scale: nestedScale, y: nestedY, transformOrigin: "50% 0%" }}
                className="flex w-full justify-center"
              >
                <motion.div
                  ref={ref}
                  tabIndex={-1}
                  data-state={dragging ? "dragging" : "idle"}
                  data-snap={snapIndex >= 0 ? snapIndex : undefined}
                  onPointerDown={(event) => {
                    onPointerDownProp?.(event);
                    if (!event.defaultPrevented) onPointerDown(event);
                  }}
                  style={{
                    ...style,
                    y,
                    height: hasSnaps && maxSnapHeight ? maxSnapHeight : undefined,
                  }}
                  className={cn(
                    "pointer-events-auto relative flex w-full max-w-2xl touch-none flex-col rounded-t-[20px] border border-b-0 border-white/10 bg-[#0a0b11] text-white/90 outline-none",
                    "shadow-[0_-24px_80px_-12px_rgb(0_0_0/0.85)]",
                    !hasSnaps && "max-h-[calc(100dvh-3rem)]",
                    dragging && "select-none",
                    className,
                  )}
                  {...props}
                >
                  <style>{flash}</style>
                  {/* Light from the top edge falls onto the panel; brighter while it's held. */}
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-x-12 -top-px h-px bg-[linear-gradient(90deg,transparent,rgb(var(--neon)/0.7),transparent)] transition-opacity duration-300",
                      dragging ? "opacity-100" : "opacity-50",
                    )}
                  />
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute inset-x-0 top-0 h-20 rounded-t-[20px] bg-[radial-gradient(60%_100%_at_50%_0%,rgb(var(--neon)/0.08),transparent)] transition-opacity duration-300",
                      dragging ? "opacity-100" : "opacity-60",
                    )}
                  />

                  {showHandle && (
                    <Handle
                      dragging={dragging}
                      detent={detent}
                      interactive={hasSnaps}
                      expanded={expanded}
                      onStep={stepSnap}
                    />
                  )}

                  <div
                    data-drawer-scroll=""
                    className={cn(
                      "relative flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6",
                      "touch-pan-y [scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]",
                      showHandle ? "pt-1" : "pt-5",
                      bodyClassName,
                    )}
                  >
                    {children}
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </>
        )}
      </dialog>
    );
  },
);
DrawerContent.displayName = "DrawerContent";

function Handle({
  dragging,
  detent,
  interactive,
  expanded,
  onStep,
}: {
  dragging: boolean;
  detent: number;
  interactive: boolean;
  expanded: boolean;
  onStep: (direction: 1 | -1 | "cycle") => void;
}) {
  const tube = (
    <span className="relative block h-[5px] w-11">
      {/* Unlit glass at rest, lit gas while held. */}
      <span
        className={cn(
          "absolute inset-0 rounded-full transition-[background-color,box-shadow] duration-200 ease-out",
          dragging
            ? "bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/0.9),0_0_18px_rgb(var(--neon)/0.5)]"
            : "bg-white/[0.16] shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)] group-hover/handle:bg-white/25",
        )}
      />
      <span
        className={cn(
          "absolute inset-x-1 top-1/2 h-px -translate-y-1/2 rounded-full transition-opacity duration-200",
          dragging ? "bg-white/80 opacity-100" : "opacity-0",
        )}
      />
      {/* Each time the drawer clicks into a stop, the tube flashes once, like a detent you can see. */}
      {detent > 0 && (
        <span
          key={detent}
          className="absolute -inset-px rounded-full bg-[rgb(var(--neon))] opacity-0 shadow-[0_0_8px_rgb(var(--neon)),0_0_22px_rgb(var(--neon)/0.6)] [animation:nk-drawer-detent_700ms_cubic-bezier(0.23,1,0.32,1)_both] motion-reduce:hidden"
        />
      )}
    </span>
  );

  if (!interactive) {
    return (
      <div aria-hidden className="group/handle flex h-7 shrink-0 cursor-grab items-center justify-center active:cursor-grabbing">
        {tube}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={expanded ? "Collapse drawer" : "Expand drawer"}
      onClick={() => onStep("cycle")}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp") {
          event.preventDefault();
          onStep(1);
        } else if (event.key === "ArrowDown") {
          event.preventDefault();
          onStep(-1);
        }
      }}
      className={cn(
        "group/handle mx-auto flex h-7 w-20 shrink-0 cursor-grab items-center justify-center rounded-full outline-none active:cursor-grabbing",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
      )}
    >
      {tube}
    </button>
  );
}

const DrawerHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1 pb-4 pt-2", className)} {...props} />
  ),
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("mt-auto flex flex-col gap-2 pt-5", className)} {...props} />
  ),
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const { titleId } = useDrawer("DrawerTitle");
    return (
      <h2
        ref={ref}
        className={cn("text-[17px] font-semibold leading-6 tracking-[-0.015em] text-white/95", className)}
        {...props}
        id={titleId}
      />
    );
  },
);
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { descriptionId, setHasDescription } = useDrawer("DrawerDescription");

    React.useLayoutEffect(() => {
      setHasDescription(true);
      return () => setHasDescription(false);
    }, [setHasDescription]);

    return (
      <p ref={ref} className={cn("text-sm leading-6 text-white/55", className)} {...props} id={descriptionId} />
    );
  },
);
DrawerDescription.displayName = "DrawerDescription";

export interface DrawerCloseProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge close behaviour onto the single child element instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const DrawerClose = React.forwardRef<HTMLButtonElement, DrawerCloseProps>((raw, ref) => {
  const { asChild = false, onClick, children, ...props } = fromRenderProp(raw);
  const { setOpen } = useDrawer("DrawerClose");

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    onClick?.(event as React.MouseEvent<HTMLButtonElement>);
    if (!event.defaultPrevented) setOpen(false);
  };

  if (asChild) {
    return (
      <Slot ref={ref} {...props} onClick={handleClick}>
        {children}
      </Slot>
    );
  }

  return (
    <button ref={ref} type="button" {...props} onClick={handleClick}>
      {children}
    </button>
  );
});
DrawerClose.displayName = "DrawerClose";

export {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
};
