"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
  type Middleware,
  type Placement,
  type VirtualElement,
} from "@floating-ui/react-dom";
import { Check, ChevronRight } from "@/components/ui/icons";

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

type Side = "top" | "right" | "bottom" | "left";
type Align = "start" | "center" | "end";
type Point = { x: number; y: number };
/** Where focus lands when a menu mounts: an item, the menu itself, or nowhere (pointer-opened submenus). */
type FocusIntent = "first" | "last" | "menu" | "none";
type AnyProps = Record<string, unknown>;
type MotionSafe<T> = Omit<
  T,
  "color" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd"
>;

const EASE = [0.23, 1, 0.32, 1] as const;
const DANGER = "255 77 94";
const ITEM_SELECTOR = '[role="menuitem"],[role="menuitemcheckbox"],[role="menuitemradio"]';
const SUB_OPEN_DELAY = 100;
const GRACE_TIMEOUT = 300;
const TYPEAHEAD_RESET = 500;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const subscribeNothing = () => () => {};

/** False on the server and during hydration, so portals only render in the browser. */
function useIsClient() {
  return React.useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

function getElementRef(element: React.ReactElement): React.Ref<HTMLElement> | undefined {
  // React 19 moved `ref` into props and warns on `element.ref`; React 18 is the other way round.
  const props = element.props as { ref?: React.Ref<HTMLElement> };
  const legacy = element as unknown as { ref?: React.Ref<HTMLElement> };
  const propGetter = Object.getOwnPropertyDescriptor(props, "ref")?.get as { isReactWarning?: boolean } | undefined;
  if (propGetter?.isReactWarning) return legacy.ref;
  const elementGetter = Object.getOwnPropertyDescriptor(element, "ref")?.get as { isReactWarning?: boolean } | undefined;
  if (elementGetter?.isReactWarning) return props.ref;
  return props.ref ?? legacy.ref;
}

function setRef<T>(ref: React.Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

function useComposedRefs<T>(a: React.Ref<T> | undefined, b: React.Ref<T> | undefined) {
  return React.useCallback(
    (node: T | null) => {
      setRef(a, node);
      setRef(b, node);
    },
    [a, b],
  );
}

/** Our props first, the child's on top. Handlers run child first, then ours. */
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

const Slot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ children, ...props }, forwardedRef) => {
    const child = resolveElement<AnyProps>(children as React.ReactNode);
    const ref = useComposedRefs(forwardedRef, child ? getElementRef(child) : undefined);
    if (!child) return null;
    return React.cloneElement(child, { ...mergeProps(props, child.props), ref } as AnyProps);
  },
);
Slot.displayName = "DropdownMenuSlot";

function isPointInPolygon(point: Point, polygon: Point[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const a = polygon[i];
    const b = polygon[j];
    if (a.y > point.y !== b.y > point.y && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Grows the menu out of the trigger (or the pointer, for context menus) wherever it ends up placed.
const transformOrigin: Middleware = {
  name: "transformOrigin",
  fn({ x, y, rects, placement }) {
    const side = placement.split("-")[0] as Side;
    const originX = clamp(rects.reference.x + rects.reference.width / 2 - x, 0, rects.floating.width);
    const originY = clamp(rects.reference.y + rects.reference.height / 2 - y, 0, rects.floating.height);
    const origin = {
      top: `${originX}px 100%`,
      bottom: `${originX}px 0px`,
      left: `100% ${originY}px`,
      right: `0px ${originY}px`,
    }[side];
    return { data: { origin } };
  },
};

const nudges: Record<Side, { x?: number; y?: number }> = {
  top: { y: 4 },
  bottom: { y: -4 },
  left: { x: 4 },
  right: { x: -4 },
};

function readNeon(element: Element | null) {
  if (!element || typeof window === "undefined") return undefined;
  const styles = window.getComputedStyle(element);
  return styles.getPropertyValue("--neon").trim() || styles.getPropertyValue("--neon-accent").trim() || undefined;
}

function portalContainer(element: Element | null) {
  // A modal <dialog> makes everything outside it inert, so render inside it when the trigger is.
  return (element?.closest("dialog") as HTMLElement | null) ?? document.body;
}

function getItems(menu: HTMLElement) {
  return Array.from(menu.querySelectorAll<HTMLElement>(ITEM_SELECTOR)).filter(
    (item) => item.getAttribute("aria-disabled") !== "true",
  );
}

function textOf(item: HTMLElement) {
  const text = item.dataset.textValue ?? item.querySelector("[data-menu-label]")?.textContent ?? item.textContent;
  return (text ?? "").trim().toLowerCase();
}

function focusItem(menu: HTMLElement, item: HTMLElement, scroll: boolean) {
  item.focus({ preventScroll: true });
  if (!scroll || menu.scrollHeight <= menu.clientHeight) return;
  const top = item.offsetTop - 4;
  const bottom = item.offsetTop + item.offsetHeight + 4;
  if (top < menu.scrollTop) menu.scrollTop = top;
  else if (bottom > menu.scrollTop + menu.clientHeight) menu.scrollTop = bottom - menu.clientHeight;
}

interface RootContextValue {
  rootId: string;
  triggerId: string;
  contentId: string;
  open: boolean;
  /** Bumps on every open, so reopening mid-exit mounts a fresh menu instead of reviving the old one. */
  session: number;
  setOpen: (open: boolean) => void;
  /** Closes the whole menu, optionally sending focus back where it came from. */
  close: (restoreFocus: boolean) => void;
  restoreFocus: () => void;
  color?: NeonColor;
  anchorPoint?: Point;
  triggerEl: HTMLElement | null;
  setTriggerEl: (element: HTMLElement | null) => void;
  anchorEl: HTMLElement | null;
  setAnchorEl: (element: HTMLElement | null) => void;
  setFocusIntent: (intent: FocusIntent) => void;
  takeFocusIntent: () => FocusIntent;
}

const RootContext = React.createContext<RootContextValue | null>(null);

function useRoot(component: string) {
  const context = React.useContext(RootContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <DropdownMenu>.`);
  return context;
}

interface MenuContextValue {
  menuId: string;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  loop: boolean;
  reduceMotion: boolean;
  /** Moves focus to the menu itself, which clears the highlight. */
  focusMenu: () => void;
  isTypingAhead: () => boolean;
  isPointerMovingToSubmenu: (event: React.PointerEvent) => boolean;
  setGrace: (area: Point[], side: Side) => void;
  clearGrace: () => void;
}

const MenuContext = React.createContext<MenuContextValue | null>(null);

function useMenu(component: string) {
  const context = React.useContext(MenuContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <DropdownMenuContent>.`);
  return context;
}

interface SubContextValue {
  open: boolean;
  session: number;
  openSub: (intent: FocusIntent) => void;
  closeSub: () => void;
  triggerId: string;
  contentId: string;
  triggerEl: HTMLElement | null;
  setTriggerEl: (element: HTMLElement | null) => void;
  contentEl: HTMLElement | null;
  setContentEl: (element: HTMLElement | null) => void;
  takeFocusIntent: () => FocusIntent;
  loop: boolean;
}

const SubContext = React.createContext<SubContextValue | null>(null);

function useSub(component: string) {
  const context = React.useContext(SubContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <DropdownMenuSub>.`);
  return context;
}

const GroupContext = React.createContext<{ labelId: string; setHasLabel: (value: boolean) => void } | null>(null);

const RadioContext = React.createContext<{ value?: string; select: (value: string) => void } | null>(null);

export interface DropdownMenuProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Palette name or hex. When omitted the menu takes the trigger's color, then `--neon-accent`. */
  color?: NeonColor;
  /** Opens the menu at this viewport point instead of against the trigger. Context Menu uses it. */
  anchorPoint?: Point;
  children?: React.ReactNode;
}

function DropdownMenu({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  color,
  anchorPoint,
  children,
}: DropdownMenuProps) {
  const id = React.useId();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const [triggerEl, setTriggerEl] = React.useState<HTMLElement | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const focusIntent = React.useRef<FocusIntent>("menu");
  const previousFocus = React.useRef<HTMLElement | null>(null);
  const isControlled = openProp !== undefined;
  const open = isControlled ? openProp : uncontrolledOpen;

  const [session, setSession] = React.useState(0);
  const [wasOpen, setWasOpen] = React.useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setSession((count) => count + 1);
  }

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next === open) return;
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [open, isControlled, onOpenChange],
  );

  // Remember what had focus before opening; menus without a focusable trigger hand it back there.
  useIsomorphicLayoutEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    previousFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;
  }, [open]);

  const restoreFocus = React.useCallback(() => {
    const target = triggerEl ?? previousFocus.current;
    if (target?.isConnected) target.focus({ preventScroll: true });
  }, [triggerEl]);

  const close = React.useCallback(
    (restore: boolean) => {
      setOpen(false);
      if (restore) restoreFocus();
    },
    [setOpen, restoreFocus],
  );

  const setFocusIntent = React.useCallback((intent: FocusIntent) => {
    focusIntent.current = intent;
  }, []);

  const takeFocusIntent = React.useCallback(() => {
    const intent = focusIntent.current;
    focusIntent.current = "menu";
    return intent;
  }, []);

  const value = React.useMemo<RootContextValue>(
    () => ({
      rootId: id,
      triggerId: `${id}-trigger`,
      contentId: `${id}-content`,
      open,
      session,
      setOpen,
      close,
      restoreFocus,
      color,
      anchorPoint,
      triggerEl,
      setTriggerEl,
      anchorEl,
      setAnchorEl,
      setFocusIntent,
      takeFocusIntent,
    }),
    [
      id,
      open,
      session,
      setOpen,
      close,
      restoreFocus,
      color,
      anchorPoint,
      triggerEl,
      anchorEl,
      setFocusIntent,
      takeFocusIntent,
    ],
  );

  return <RootContext.Provider value={value}>{children}</RootContext.Provider>;
}
DropdownMenu.displayName = "DropdownMenu";

export interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Merge trigger behaviour onto the single child element (e.g. a Button) instead of rendering a button. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps>(
  (raw, forwardedRef) => {
    const { asChild = false, disabled, className, style, children, onPointerDown, onClick, onKeyDown, onKeyUp, ...props } =
      fromRenderProp(raw);
    const root = useRoot("DropdownMenuTrigger");
    const ref = useComposedRefs<HTMLButtonElement>(forwardedRef, root.setTriggerEl);
    const pointerType = React.useRef<string | null>(null);

    function toggle(intent: FocusIntent) {
      if (root.open) {
        root.close(true);
      } else {
        root.setFocusIntent(intent);
        root.setOpen(true);
      }
    }

    const triggerProps = {
      ...props,
      id: props.id ?? root.triggerId,
      "aria-haspopup": "menu" as const,
      "aria-expanded": root.open,
      "aria-controls": root.open ? root.contentId : undefined,
      "data-state": root.open ? "open" : "closed",
      "data-disabled": disabled ? "" : undefined,
      onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => {
        onPointerDown?.(event);
        pointerType.current = event.pointerType;
        // Mouse opens on press, like a native menu; touch waits for the click so scrolling stays safe.
        if (event.defaultPrevented || disabled || event.pointerType !== "mouse") return;
        if (event.button !== 0 || event.ctrlKey) return;
        if (!root.open) event.preventDefault();
        toggle("menu");
      },
      onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        const handled = pointerType.current === "mouse";
        pointerType.current = null;
        if (event.defaultPrevented || disabled || handled) return;
        toggle("menu");
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled) return;
        if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          root.setFocusIntent(event.key === "ArrowUp" ? "last" : "first");
          root.setOpen(true);
        }
      },
      onKeyUp: (event: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyUp?.(event);
        // Space is handled on keydown; cancel the click it would fire on keyup.
        if (event.key === " ") event.preventDefault();
      },
    };

    if (asChild) {
      return (
        <Slot ref={ref as React.Ref<HTMLElement>} className={className} style={style} {...triggerProps}>
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        style={neonVars(root.color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a] disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...triggerProps}
      >
        {children}
      </button>
    );
  },
);
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuAnchorProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

/**
 * Positions the menu against this element instead of the trigger, and lends it its color.
 * Useful for custom triggers, such as Context Menu's right-click area.
 */
const DropdownMenuAnchor = React.forwardRef<HTMLDivElement, DropdownMenuAnchorProps>(
  (raw, forwardedRef) => {
    const { asChild = false, ...props } = fromRenderProp(raw);
    const root = useRoot("DropdownMenuAnchor");
    const ref = useComposedRefs<HTMLDivElement>(forwardedRef, root.setAnchorEl);
    if (asChild) return <Slot ref={ref as React.Ref<HTMLElement>} {...props} />;
    return <div ref={ref} {...props} />;
  },
);
DropdownMenuAnchor.displayName = "DropdownMenuAnchor";

interface MenuSurfaceProps extends MotionSafe<React.HTMLAttributes<HTMLDivElement>> {
  reference: Element | VirtualElement | null;
  colorSource: Element | null;
  side: Side;
  align: Align;
  sideOffset: number;
  alignOffset: number;
  loop: boolean;
  takeFocusIntent: () => FocusIntent;
  onDismiss: () => void;
  /** Submenus close with ArrowLeft and don't watch outside clicks themselves. */
  isSub: boolean;
}

const MenuSurface = React.forwardRef<HTMLDivElement, MenuSurfaceProps>(
  (
    {
      reference,
      colorSource,
      side,
      align,
      sideOffset,
      alignOffset,
      loop,
      takeFocusIntent,
      onDismiss,
      isSub,
      id,
      className,
      style,
      children,
      onKeyDown,
      onFocus,
      onBlur,
      onPointerMove,
      onPointerLeave,
      ...props
    },
    forwardedRef,
  ) => {
    const root = useRoot("DropdownMenuContent");
    const reduceMotion = useReducedMotion() ?? false;
    const isPresent = useIsPresent();
    const menuId = React.useId();
    const panelRef = React.useRef<HTMLDivElement>(null);
    const ref = useComposedRefs(forwardedRef, panelRef);
    const [activeId, setActiveId] = React.useState<string | null>(null);
    const typeahead = React.useRef({ query: "", timer: 0 });
    const grace = React.useRef<{ area: Point[]; side: Side } | null>(null);
    const graceTimer = React.useRef(0);
    const pointer = React.useRef<{ x: number; dir: Side }>({ x: 0, dir: "right" });

    const [floatingEl, setFloatingEl] = React.useState<HTMLElement | null>(null);
    const placement = (align === "center" ? side : `${side}-${align}`) as Placement;
    const { floatingStyles, middlewareData, placement: finalPlacement } = useFloating({
      placement,
      strategy: "fixed",
      open: true,
      elements: { reference, floating: floatingEl },
      whileElementsMounted: autoUpdate,
      middleware: [
        offset({ mainAxis: sideOffset, alignmentAxis: alignOffset }),
        flip({ padding: 8 }),
        shift({ padding: 8 }),
        size({
          padding: 8,
          apply({ availableWidth, availableHeight, elements, rects }) {
            // Lets a menu match its trigger: className="w-[var(--menu-trigger-width)]".
            elements.floating.style.setProperty("--menu-trigger-width", `${rects.reference.width}px`);
            elements.floating.style.setProperty("--menu-available-width", `${Math.max(0, availableWidth)}px`);
            elements.floating.style.setProperty("--menu-available-height", `${Math.max(0, availableHeight)}px`);
          },
        }),
        transformOrigin,
      ],
    });
    const finalSide = finalPlacement.split("-")[0] as Side;
    const finalAlign = (finalPlacement.split("-")[1] ?? "center") as Align;
    const origin = (middlewareData.transformOrigin as { origin?: string } | undefined)?.origin;

    // A portal leaves the trigger's subtree, so carry its color over.
    const inherited = React.useMemo(() => (root.color ? undefined : readNeon(colorSource)), [root.color, colorSource]);
    const colorStyle = root.color
      ? neonVars(root.color)
      : inherited
        ? ({ "--neon": inherited, "--neon-accent": inherited } as React.CSSProperties)
        : undefined;

    // Read once per mount: StrictMode runs this effect twice, and taking the intent again would come
    // back as "menu" and pull focus off the first item onto the panel.
    const focusIntent = React.useRef<FocusIntent | null>(null);
    React.useEffect(() => {
      const panel = panelRef.current;
      if (!panel) return;
      focusIntent.current ??= takeFocusIntent();
      const intent = focusIntent.current;
      if (intent === "none") return;
      const items = getItems(panel);
      const target = intent === "first" ? items[0] : intent === "last" ? items[items.length - 1] : undefined;
      if (target) focusItem(panel, target, true);
      else panel.focus({ preventScroll: true });
    }, [takeFocusIntent]);

    React.useEffect(() => {
      const state = typeahead.current;
      return () => {
        window.clearTimeout(state.timer);
        window.clearTimeout(graceTimer.current);
      };
    }, []);

    const { rootId, anchorPoint, triggerEl, close, restoreFocus } = root;
    React.useEffect(() => {
      if (isSub || !isPresent) return;
      const onPointerDownOutside = (event: PointerEvent) => {
        const target = event.target as Element | null;
        if (target?.closest?.(`[data-neonkit-menu="${rootId}"]`)) return;
        // The trigger toggles itself. A context-menu area is outside, so a click there closes.
        if (!anchorPoint && target && triggerEl?.contains(target)) return;
        close(false);
        // If the click landed on nothing focusable, put focus back on the trigger.
        window.requestAnimationFrame(() => {
          const active = document.activeElement;
          if (!active || active === document.body) restoreFocus();
        });
      };
      document.addEventListener("pointerdown", onPointerDownOutside, true);
      return () => document.removeEventListener("pointerdown", onPointerDownOutside, true);
    }, [isSub, isPresent, rootId, anchorPoint, triggerEl, close, restoreFocus]);

    const menu = React.useMemo<MenuContextValue>(() => {
      const isPointerMovingToSubmenu = (event: React.PointerEvent) => {
        const intent = grace.current;
        if (!intent || pointer.current.dir !== intent.side) return false;
        return isPointInPolygon({ x: event.clientX, y: event.clientY }, intent.area);
      };
      return {
        menuId,
        activeId,
        setActiveId,
        loop,
        reduceMotion,
        focusMenu: () => panelRef.current?.focus({ preventScroll: true }),
        isTypingAhead: () => typeahead.current.query !== "",
        isPointerMovingToSubmenu,
        setGrace: (area, graceSide) => {
          grace.current = { area, side: graceSide };
          window.clearTimeout(graceTimer.current);
          graceTimer.current = window.setTimeout(() => {
            grace.current = null;
          }, GRACE_TIMEOUT);
        },
        clearGrace: () => {
          grace.current = null;
          window.clearTimeout(graceTimer.current);
        },
      };
    }, [menuId, activeId, loop, reduceMotion]);

    function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
      onKeyDown?.(event);
      const panel = event.currentTarget;
      // Keys from a portaled submenu bubble here through React; that menu handles its own.
      if (event.defaultPrevented || !panel.contains(event.target as Node)) return;

      const items = getItems(panel);
      const current = items.indexOf(document.activeElement as HTMLElement);
      const last = items.length - 1;
      const { key } = event;
      let next = -1;

      switch (key) {
        case "ArrowDown":
          next = current < 0 ? 0 : current === last ? (loop ? 0 : last) : current + 1;
          break;
        case "ArrowUp":
          next = current < 0 ? last : current === 0 ? (loop ? last : 0) : current - 1;
          break;
        case "Home":
        case "PageUp":
          next = 0;
          break;
        case "End":
        case "PageDown":
          next = last;
          break;
        case "Escape":
          event.preventDefault();
          event.stopPropagation();
          onDismiss();
          return;
        case "ArrowLeft":
          if (isSub) {
            event.preventDefault();
            onDismiss();
          }
          return;
        case "Tab":
          // Hand focus back to the trigger and let the browser continue the Tab from there.
          close(true);
          return;
        default: {
          const printable = key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey;
          if (!printable || (key === " " && !typeahead.current.query)) return;
          event.preventDefault();
          const state = typeahead.current;
          window.clearTimeout(state.timer);
          state.timer = window.setTimeout(() => {
            state.query = "";
          }, TYPEAHEAD_RESET);
          state.query += key.toLowerCase();
          // Pressing the same letter repeatedly cycles through items that start with it.
          const repeated = state.query.split("").every((char) => char === state.query[0]);
          const query = repeated ? state.query[0] : state.query;
          const start = current < 0 ? 0 : current + (repeated ? 1 : 0);
          for (let n = 0; n < items.length; n++) {
            const index = (start + n) % items.length;
            if (textOf(items[index]).startsWith(query)) {
              next = index;
              break;
            }
          }
        }
      }

      if (next >= 0 && items[next]) {
        event.preventDefault();
        focusItem(panel, items[next], true);
      }
    }

    return (
      <div
        ref={setFloatingEl}
        data-neonkit-menu={rootId}
        style={{ ...floatingStyles, ...colorStyle }}
        className="z-50 [--neon:var(--neon-accent,34_211_238)]"
      >
        <motion.div
          ref={ref}
          // A reopened menu can overlap this one while it fades out; only the live one keeps the id.
          id={isPresent ? id : undefined}
          role="menu"
          tabIndex={-1}
          aria-orientation="vertical"
          data-side={finalSide}
          data-align={finalAlign}
          data-state={isPresent ? "open" : "closed"}
          layoutScroll
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, ...nudges[side] }}
          animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
          exit={
            reduceMotion
              ? { opacity: 0, transition: { duration: 0.1 } }
              : { opacity: 0, scale: 0.97, transition: { duration: 0.1, ease: EASE } }
          }
          transition={{ duration: 0.16, ease: EASE }}
          style={{ transformOrigin: origin, ...style }}
          className={cn(
            "relative min-w-[12rem] max-w-[var(--menu-available-width)] max-h-[min(var(--menu-available-height),28rem)] overflow-y-auto overscroll-contain",
            "rounded-xl border border-white/10 bg-[#0a0b11] p-1 text-white/90 outline-none",
            "shadow-[0_18px_48px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(var(--neon)/0.06),0_0_28px_-10px_rgb(var(--neon)/0.45)]",
            "[scrollbar-color:rgb(255_255_255/0.15)_transparent] [scrollbar-width:thin]",
            !isPresent && "pointer-events-none",
            className,
          )}
          {...props}
          onKeyDown={handleKeyDown}
          onFocus={(event) => {
            onFocus?.(event);
            if (event.target === event.currentTarget) setActiveId(null);
          }}
          onBlur={(event) => {
            onBlur?.(event);
            const next = event.relatedTarget as Element | null;
            // Focus moving somewhere unrelated (not another layer of this menu) closes it.
            if (!isPresent || !next || next.closest(`[data-neonkit-menu="${rootId}"]`)) return;
            if (triggerEl?.contains(next)) return;
            root.setOpen(false);
          }}
          onPointerMove={(event) => {
            onPointerMove?.(event);
            if (event.pointerType !== "mouse") return;
            const x = event.clientX;
            if (x !== pointer.current.x) pointer.current = { x, dir: x > pointer.current.x ? "right" : "left" };
          }}
          onPointerLeave={(event) => {
            onPointerLeave?.(event);
            if (event.pointerType !== "mouse" || menu.isPointerMovingToSubmenu(event)) return;
            const panel = panelRef.current;
            // Only clear the highlight while focus is here, never pull it back out of a submenu.
            if (panel && panel.contains(document.activeElement)) panel.focus({ preventScroll: true });
          }}
        >
          <MenuContext.Provider value={menu}>{children}</MenuContext.Provider>
        </motion.div>
      </div>
    );
  },
);
MenuSurface.displayName = "DropdownMenuSurface";

export interface DropdownMenuContentProps extends MotionSafe<React.HTMLAttributes<HTMLDivElement>> {
  side?: Side;
  align?: Align;
  /** Gap between the trigger and the menu, in px. */
  sideOffset?: number;
  alignOffset?: number;
  /** Arrow keys wrap from the last item to the first and back. */
  loop?: boolean;
}

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ side = "bottom", align = "start", sideOffset, alignOffset = 0, loop = true, children, ...props }, ref) => {
    const root = useRoot("DropdownMenuContent");
    const isClient = useIsClient();
    const point = root.anchorPoint;
    const pointX = point?.x;
    const pointY = point?.y;
    const anchorEl = root.anchorEl;

    const virtual = React.useMemo<VirtualElement | null>(() => {
      if (pointX === undefined || pointY === undefined) return null;
      return {
        getBoundingClientRect: () => ({
          x: pointX,
          y: pointY,
          width: 0,
          height: 0,
          top: pointY,
          left: pointX,
          right: pointX,
          bottom: pointY,
        }),
        contextElement: anchorEl ?? undefined,
      };
    }, [pointX, pointY, anchorEl]);

    if (!isClient) return null;
    const colorSource = root.anchorEl ?? root.triggerEl;
    const reference = virtual ?? colorSource;

    return createPortal(
      <AnimatePresence>
        {root.open && (
          <MenuSurface
            key={root.session}
            ref={ref}
            id={root.contentId}
            aria-labelledby={root.triggerEl ? root.triggerId : undefined}
            reference={reference}
            colorSource={colorSource}
            side={side}
            align={align}
            sideOffset={sideOffset ?? (virtual ? 2 : 6)}
            alignOffset={alignOffset}
            loop={loop}
            takeFocusIntent={root.takeFocusIntent}
            onDismiss={() => root.close(true)}
            isSub={false}
            {...props}
          >
            {children}
          </MenuSurface>
        )}
      </AnimatePresence>,
      portalContainer(colorSource),
    );
  },
);
DropdownMenuContent.displayName = "DropdownMenuContent";

function Highlight({ menu }: { menu: MenuContextValue }) {
  return (
    <motion.span
      aria-hidden
      layoutId={menu.reduceMotion ? undefined : `${menu.menuId}-highlight`}
      initial={false}
      transition={{ duration: 0.18, ease: EASE }}
      // Set inline so motion keeps the corners round while the bar stretches between items.
      style={{ borderRadius: 6 }}
      className="pointer-events-none absolute inset-0 bg-[rgb(var(--neon)/0.09)] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.07)]"
    >
      <motion.span
        layout={!menu.reduceMotion}
        transition={{ duration: 0.18, ease: EASE }}
        className="absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon)/0.9),0_0_14px_rgb(var(--neon)/0.45)]"
      />
    </motion.span>
  );
}

interface ItemShellProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "role"> {
  role: "menuitem" | "menuitemcheckbox" | "menuitemradio";
  disabled?: boolean;
  danger?: boolean;
  inset?: boolean;
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
  textValue?: string;
  leading?: (highlighted: boolean) => React.ReactNode;
  trailing?: (highlighted: boolean) => React.ReactNode;
  /** Sub triggers open a submenu instead of selecting. */
  selectable?: boolean;
  onSelect?: (event: Event) => void;
}

const ItemShell = React.forwardRef<HTMLDivElement, ItemShellProps>(
  (raw, forwardedRef) => {
    const {
      role,
      disabled = false,
      danger = false,
      inset = false,
      asChild = false,
      textValue,
      leading,
      trailing,
      selectable = true,
      onSelect,
      id: idProp,
      className,
      style,
      children,
      onClick,
      onKeyDown,
      onFocus,
      onPointerMove,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      ...props
    } = fromRenderProp(raw);
    const root = useRoot("DropdownMenuItem");
    const menu = useMenu("DropdownMenuItem");
    const autoId = React.useId();
    const id = idProp ?? autoId;
    const highlighted = menu.activeId === id;
    const pressedHere = React.useRef(false);

    const itemProps = {
      ...props,
      id,
      role,
      tabIndex: -1,
      "aria-disabled": disabled || undefined,
      "data-disabled": disabled ? "" : undefined,
      "data-highlighted": highlighted ? "" : undefined,
      "data-variant": danger ? "danger" : undefined,
      "data-text-value": textValue ?? (typeof children === "string" && !asChild ? children : undefined),
      style: danger ? ({ "--neon": DANGER, "--neon-accent": DANGER, ...style } as React.CSSProperties) : style,
      className: cn(
        "relative flex w-full cursor-pointer select-none items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm leading-5 outline-none",
        "transition-colors duration-150 ease-out [&_svg]:pointer-events-none [&_svg]:shrink-0",
        inset && "pl-[34px]",
        danger
          ? highlighted
            ? "text-[rgb(var(--neon))]"
            : "text-[rgb(var(--neon)/0.85)]"
          : highlighted
            ? "text-white"
            : "text-white/75",
        disabled && "cursor-not-allowed opacity-40",
        className,
      ),
      onFocus: (event: React.FocusEvent<HTMLDivElement>) => {
        onFocus?.(event);
        if (event.target === event.currentTarget) menu.setActiveId(id);
      },
      onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerMove?.(event);
        if (event.defaultPrevented || event.pointerType !== "mouse") return;
        if (menu.isPointerMovingToSubmenu(event)) return;
        if (disabled) menu.focusMenu();
        else if (document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true });
      },
      onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(event);
        pressedHere.current = true;
      },
      onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerUp?.(event);
        // Press on the trigger, drag onto an item, release: that selects it, like a native menu.
        const dragged = !pressedHere.current && event.pointerType === "mouse" && event.button === 0;
        pressedHere.current = false;
        if (dragged && !event.defaultPrevented) event.currentTarget.click();
      },
      onPointerLeave: (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerLeave?.(event);
        pressedHere.current = false;
      },
      onClick: (event: React.MouseEvent<HTMLDivElement>) => {
        onClick?.(event);
        if (disabled) {
          event.preventDefault();
          return;
        }
        if (event.defaultPrevented || !selectable) return;
        const item = event.currentTarget;
        const selectEvent = new CustomEvent("neonkit.menu.select", { bubbles: true, cancelable: true });
        if (onSelect) item.addEventListener(selectEvent.type, (e) => onSelect(e), { once: true });
        item.dispatchEvent(selectEvent);
        if (!selectEvent.defaultPrevented) root.close(true);
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented || disabled) return;
        if (event.key === " " && menu.isTypingAhead()) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          // Go through click so asChild links navigate the way they would on a mouse press.
          event.currentTarget.click();
        }
      },
    };

    const inner = (label: React.ReactNode) => (
      <>
        {highlighted && <Highlight menu={menu} />}
        {leading?.(highlighted)}
        <span data-menu-label="" className="relative min-w-0 flex-1 truncate">
          {label}
        </span>
        {trailing?.(highlighted)}
      </>
    );

    const asChildElement = asChild ? resolveElement<{ children?: React.ReactNode }>(children) : null;
    if (asChildElement) {
      return (
        <Slot ref={forwardedRef as React.Ref<HTMLElement>} {...(itemProps as React.HTMLAttributes<HTMLElement>)}>
          {React.cloneElement(asChildElement, undefined, inner(asChildElement.props.children))}
        </Slot>
      );
    }

    return (
      <div ref={forwardedRef} {...itemProps}>
        {inner(children)}
      </div>
    );
  },
);
ItemShell.displayName = "DropdownMenuItemShell";

function IconSlot({ icon, highlighted, danger }: { icon: React.ReactNode; highlighted: boolean; danger?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative flex size-4 shrink-0 items-center justify-center transition-[color,filter] duration-150 ease-out [&_svg]:size-4",
        highlighted
          ? "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_5px_rgb(var(--neon)/0.65))]"
          : danger
            ? "text-[rgb(var(--neon)/0.75)]"
            : "text-white/50",
      )}
    >
      {icon}
    </span>
  );
}

function Shortcut({ children, highlighted }: { children: React.ReactNode; highlighted: boolean }) {
  return (
    <span
      className={cn(
        "relative ml-auto shrink-0 pl-5 text-xs tracking-[0.08em] transition-colors duration-150",
        highlighted ? "text-white/55" : "text-white/30",
      )}
    >
      {children}
    </span>
  );
}

interface ItemCommonProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onSelect" | "role" | "color"> {
  disabled?: boolean;
  /** Text for typeahead when the label isn't plain text. */
  textValue?: string;
  /** Indents the label to line up with items that have an icon. */
  inset?: boolean;
  /** Called on click, Enter or Space. The menu closes unless you call `event.preventDefault()`. */
  onSelect?: (event: Event) => void;
}

export interface DropdownMenuItemProps extends ItemCommonProps {
  icon?: React.ReactNode;
  /** Shown on the right, e.g. "⌘K". Display only: wire the key yourself. */
  shortcut?: React.ReactNode;
  variant?: "default" | "danger";
  /** Render the single child (e.g. a link) as the item. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ icon, shortcut, variant = "default", ...props }, ref) => {
    const danger = variant === "danger";
    return (
      <ItemShell
        ref={ref}
        role="menuitem"
        danger={danger}
        leading={icon ? (highlighted) => <IconSlot icon={icon} highlighted={highlighted} danger={danger} /> : undefined}
        trailing={shortcut ? (highlighted) => <Shortcut highlighted={highlighted}>{shortcut}</Shortcut> : undefined}
        {...props}
      />
    );
  },
);
DropdownMenuItem.displayName = "DropdownMenuItem";

export interface DropdownMenuCheckboxItemProps extends ItemCommonProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  shortcut?: React.ReactNode;
}

const DropdownMenuCheckboxItem = React.forwardRef<HTMLDivElement, DropdownMenuCheckboxItemProps>(
  ({ checked: checkedProp, defaultChecked = false, onCheckedChange, shortcut, onSelect, ...props }, ref) => {
    const [uncontrolled, setUncontrolled] = React.useState(defaultChecked);
    const checked = checkedProp !== undefined ? checkedProp : uncontrolled;

    return (
      <ItemShell
        ref={ref}
        role="menuitemcheckbox"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        onSelect={(event) => {
          if (checkedProp === undefined) setUncontrolled(!checked);
          onCheckedChange?.(!checked);
          onSelect?.(event);
        }}
        leading={() => (
          <span
            aria-hidden
            className={cn(
              "relative flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-[border-color,background-color,box-shadow] duration-150 ease-out",
              checked
                ? "border-[rgb(var(--neon)/0.8)] bg-[rgb(var(--neon)/0.16)] shadow-[0_0_10px_rgb(var(--neon)/0.45)]"
                : "border-white/20 bg-white/[0.03]",
            )}
          >
            <Check
              strokeWidth={3}
              className={cn(
                "size-3 text-[rgb(var(--neon))] transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none",
                checked ? "scale-100 opacity-100" : "scale-50 opacity-0",
              )}
            />
          </span>
        )}
        trailing={shortcut ? (highlighted) => <Shortcut highlighted={highlighted}>{shortcut}</Shortcut> : undefined}
        {...props}
      />
    );
  },
);
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem";

export interface DropdownMenuRadioGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const DropdownMenuRadioGroup = React.forwardRef<HTMLDivElement, DropdownMenuRadioGroupProps>(
  ({ value: valueProp, defaultValue, onValueChange, ...props }, ref) => {
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
    const value = valueProp !== undefined ? valueProp : uncontrolled;
    const context = React.useMemo(
      () => ({
        value,
        select: (next: string) => {
          if (next === value) return;
          if (valueProp === undefined) setUncontrolled(next);
          onValueChange?.(next);
        },
      }),
      [value, valueProp, onValueChange],
    );

    return (
      <RadioContext.Provider value={context}>
        <DropdownMenuGroup ref={ref} {...props} />
      </RadioContext.Provider>
    );
  },
);
DropdownMenuRadioGroup.displayName = "DropdownMenuRadioGroup";

export interface DropdownMenuRadioItemProps extends ItemCommonProps {
  value: string;
  shortcut?: React.ReactNode;
}

const DropdownMenuRadioItem = React.forwardRef<HTMLDivElement, DropdownMenuRadioItemProps>(
  ({ value, shortcut, onSelect, ...props }, ref) => {
    const group = React.useContext(RadioContext);
    if (!group) throw new Error("<DropdownMenuRadioItem> must be rendered inside <DropdownMenuRadioGroup>.");
    const checked = group.value === value;

    return (
      <ItemShell
        ref={ref}
        role="menuitemradio"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        onSelect={(event) => {
          group.select(value);
          onSelect?.(event);
        }}
        leading={() => (
          <span
            aria-hidden
            className={cn(
              "relative flex size-4 shrink-0 items-center justify-center rounded-full border transition-[border-color,box-shadow] duration-150 ease-out",
              checked
                ? "border-[rgb(var(--neon)/0.8)] shadow-[0_0_10px_rgb(var(--neon)/0.4)]"
                : "border-white/20 bg-white/[0.03]",
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full bg-[rgb(var(--neon))] shadow-[0_0_6px_rgb(var(--neon))] transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none",
                checked ? "scale-100 opacity-100" : "scale-0 opacity-0",
              )}
            />
          </span>
        )}
        trailing={shortcut ? (highlighted) => <Shortcut highlighted={highlighted}>{shortcut}</Shortcut> : undefined}
        {...props}
      />
    );
  },
);
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem";

export interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean;
}

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, DropdownMenuLabelProps>(
  ({ inset = false, className, id, ...props }, ref) => {
    const group = React.useContext(GroupContext);
    const setHasLabel = group?.setHasLabel;

    useIsomorphicLayoutEffect(() => {
      if (!setHasLabel) return;
      setHasLabel(true);
      return () => setHasLabel(false);
    }, [setHasLabel]);

    return (
      <div
        ref={ref}
        id={id ?? group?.labelId}
        className={cn("select-none px-2 pb-1 pt-1.5 text-xs font-medium text-white/40", inset && "pl-[34px]", className)}
        {...props}
      />
    );
  },
);
DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (props, ref) => {
    const labelId = React.useId();
    const [hasLabel, setHasLabel] = React.useState(false);
    const context = React.useMemo(() => ({ labelId, setHasLabel }), [labelId]);

    return (
      <GroupContext.Provider value={context}>
        <div ref={ref} role="group" aria-labelledby={hasLabel ? labelId : undefined} {...props} />
      </GroupContext.Provider>
    );
  },
);
DropdownMenuGroup.displayName = "DropdownMenuGroup";

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} role="separator" className={cn("-mx-1 my-1 h-px bg-white/[0.07]", className)} {...props} />
  ),
);
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

function DropdownMenuSub({ children }: { children?: React.ReactNode }) {
  const parent = useMenu("DropdownMenuSub");
  const id = React.useId();
  const triggerId = `${id}-trigger`;
  const [open, setOpen] = React.useState(false);
  const [session, setSession] = React.useState(0);
  const [triggerEl, setTriggerEl] = React.useState<HTMLElement | null>(null);
  const [contentEl, setContentEl] = React.useState<HTMLElement | null>(null);
  const focusIntent = React.useRef<FocusIntent>("none");

  // The submenu belongs to its trigger's highlight: when the parent moves on, it closes.
  if (open && parent.activeId !== triggerId) setOpen(false);

  const openSub = React.useCallback(
    (intent: FocusIntent) => {
      if (open) return;
      focusIntent.current = intent;
      setSession((count) => count + 1);
      setOpen(true);
    },
    [open],
  );

  const closeSub = React.useCallback(() => setOpen(false), []);

  const takeFocusIntent = React.useCallback(() => {
    const intent = focusIntent.current;
    focusIntent.current = "none";
    return intent;
  }, []);

  const value = React.useMemo<SubContextValue>(
    () => ({
      open,
      session,
      openSub,
      closeSub,
      triggerId,
      contentId: `${id}-content`,
      triggerEl,
      setTriggerEl,
      contentEl,
      setContentEl,
      takeFocusIntent,
      loop: parent.loop,
    }),
    [open, session, openSub, closeSub, triggerId, id, triggerEl, contentEl, takeFocusIntent, parent.loop],
  );

  return <SubContext.Provider value={value}>{children}</SubContext.Provider>;
}
DropdownMenuSub.displayName = "DropdownMenuSub";

export interface DropdownMenuSubTriggerProps extends Omit<ItemCommonProps, "onSelect"> {
  icon?: React.ReactNode;
}

const DropdownMenuSubTrigger = React.forwardRef<HTMLDivElement, DropdownMenuSubTriggerProps>(
  ({ icon, disabled, onPointerMove, onPointerLeave, onKeyDown, onClick, ...props }, forwardedRef) => {
    const menu = useMenu("DropdownMenuSubTrigger");
    const sub = useSub("DropdownMenuSubTrigger");
    const ref = useComposedRefs<HTMLDivElement>(forwardedRef, sub.setTriggerEl);
    const openTimer = React.useRef(0);

    React.useEffect(() => () => window.clearTimeout(openTimer.current), []);

    return (
      <ItemShell
        ref={ref}
        role="menuitem"
        id={sub.triggerId}
        disabled={disabled}
        selectable={false}
        aria-haspopup="menu"
        aria-expanded={sub.open}
        aria-controls={sub.open ? sub.contentId : undefined}
        data-state={sub.open ? "open" : "closed"}
        leading={icon ? (highlighted) => <IconSlot icon={icon} highlighted={highlighted} /> : undefined}
        trailing={(highlighted) => (
          <ChevronRight
            aria-hidden
            className={cn(
              "relative ml-auto size-4 transition-colors duration-150",
              highlighted || sub.open ? "text-white/70" : "text-white/30",
            )}
          />
        )}
        onPointerMove={(event) => {
          onPointerMove?.(event);
          if (event.defaultPrevented || event.pointerType !== "mouse" || disabled) return;
          if (menu.isPointerMovingToSubmenu(event)) return;
          if (!sub.open && !openTimer.current) {
            menu.clearGrace();
            openTimer.current = window.setTimeout(() => {
              openTimer.current = 0;
              sub.openSub("none");
            }, SUB_OPEN_DELAY);
          }
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          window.clearTimeout(openTimer.current);
          openTimer.current = 0;
          const content = sub.contentEl;
          if (event.pointerType !== "mouse" || !sub.open || !content) return;
          // A triangle from the pointer to the submenu's near edge: diagonal moves across
          // neighbouring items keep the submenu open instead of highlighting them.
          const rect = content.getBoundingClientRect();
          const side: Side = content.dataset.side === "left" ? "left" : "right";
          const near = side === "right" ? rect.left : rect.right;
          const far = side === "right" ? rect.right : rect.left;
          const bleed = side === "right" ? -5 : 5;
          menu.setGrace(
            [
              { x: event.clientX + bleed, y: event.clientY },
              { x: near, y: rect.top },
              { x: far, y: rect.top },
              { x: far, y: rect.bottom },
              { x: near, y: rect.bottom },
            ],
            side,
          );
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented || disabled) return;
          if (event.key === "ArrowRight" || event.key === "Enter" || (event.key === " " && !menu.isTypingAhead())) {
            event.preventDefault();
            const content = sub.contentEl;
            if (sub.open && content) {
              const first = getItems(content)[0];
              if (first) focusItem(content, first, true);
            } else {
              sub.openSub("first");
            }
          }
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented || disabled) return;
          event.currentTarget.focus({ preventScroll: true });
          if (!sub.open) sub.openSub("none");
        }}
        {...props}
      />
    );
  },
);
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger";

export interface DropdownMenuSubContentProps extends MotionSafe<React.HTMLAttributes<HTMLDivElement>> {
  /** Gap between the submenu and its parent menu, in px. */
  sideOffset?: number;
}

const DropdownMenuSubContent = React.forwardRef<HTMLDivElement, DropdownMenuSubContentProps>(
  ({ sideOffset = 2, children, ...props }, forwardedRef) => {
    const root = useRoot("DropdownMenuSubContent");
    const sub = useSub("DropdownMenuSubContent");
    const isClient = useIsClient();
    const ref = useComposedRefs<HTMLDivElement>(forwardedRef, sub.setContentEl);
    if (!isClient) return null;

    return createPortal(
      <AnimatePresence>
        {root.open && sub.open && (
          <MenuSurface
            key={sub.session}
            ref={ref}
            id={sub.contentId}
            aria-labelledby={sub.triggerId}
            reference={sub.triggerEl}
            colorSource={sub.triggerEl}
            side="right"
            align="start"
            // Clear the parent's padding and border so the first items line up.
            sideOffset={sideOffset + 5}
            alignOffset={-5}
            loop={sub.loop}
            takeFocusIntent={sub.takeFocusIntent}
            onDismiss={() => {
              sub.closeSub();
              sub.triggerEl?.focus({ preventScroll: true });
            }}
            isSub
            {...props}
          >
            {children}
          </MenuSurface>
        )}
      </AnimatePresence>,
      portalContainer(sub.triggerEl),
    );
  },
);
DropdownMenuSubContent.displayName = "DropdownMenuSubContent";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuAnchor,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
