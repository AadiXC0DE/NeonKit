"use client";

import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { autoUpdate, offset, shift, size, useFloating, type Middleware } from "@floating-ui/react-dom";
import { ChevronDown } from "@/components/ui/icons";

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

type AnyProps = Record<string, unknown>;
type OpenReason = "pointer" | "click" | "keyboard";
type MotionSafe<T> = Omit<
  T,
  "color" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd"
>;

const EASE = [0.23, 1, 0.32, 1] as const;
const OPEN_DELAY = 150;
const CLOSE_DELAY = 150;
// Moving from one menu straight to the next shouldn't wait out the open delay again.
const SKIP_DELAY_WINDOW = 300;
const INDICATOR_BASE = 100;
const INDICATOR_INSET = 12;
const TABBABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

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
Slot.displayName = "NavigationMenuSlot";

function isFocusVisible(element: Element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

function tabbables(container: Element | null) {
  return container ? Array.from(container.querySelectorAll<HTMLElement>(TABBABLE)) : [];
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), Math.max(min, max));

// Grows the panel out of the trigger it belongs to.
const transformOrigin: Middleware = {
  name: "transformOrigin",
  fn({ x, rects }) {
    const originX = clamp(rects.reference.x + rects.reference.width / 2 - x, 0, rects.floating.width);
    return { data: { origin: `${originX}px 0px` } };
  },
};

interface ContentEntry {
  props: NavigationMenuContentProps;
  ref: React.Ref<HTMLDivElement> | undefined;
}

function createContentStore() {
  let entries = new Map<string, ContentEntry>();
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());
  return {
    get: () => entries,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set: (value: string, entry: ContentEntry) => {
      entries = new Map(entries).set(value, entry);
      emit();
    },
    remove: (value: string) => {
      if (!entries.has(value)) return;
      entries = new Map(entries);
      entries.delete(value);
      emit();
    },
  };
}

type ContentStore = ReturnType<typeof createContentStore>;

interface NavContextValue {
  value: string;
  /** -1 when the newly opened item sits left of the last one, 1 when right, 0 when opening fresh. */
  direction: number;
  /** The item the indicator sits under: the hovered or focused one, else the open one. */
  indicated: string | null;
  setHovered: (value: string | null) => void;
  items: Record<string, HTMLElement>;
  registerItem: (value: string, element: HTMLElement | null) => void;
  open: (value: string, reason: OpenReason) => void;
  close: () => void;
  pin: () => void;
  openedBy: () => OpenReason | null;
  scheduleOpen: (value: string) => void;
  scheduleClose: () => void;
  cancelTimers: () => void;
  requestPanelFocus: () => void;
  takePanelFocus: () => boolean;
  store: ContentStore;
  reduceMotion: boolean;
  triggerId: (value: string) => string;
  contentId: (value: string) => string;
}

const NavContext = React.createContext<NavContextValue | null>(null);

function useNav(component: string) {
  const context = React.useContext(NavContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <NavigationMenu>.`);
  return context;
}

const ItemContext = React.createContext<{ value: string } | null>(null);

function useItem(component: string) {
  const context = React.useContext(ItemContext);
  if (!context) throw new Error(`<${component}> must be rendered inside <NavigationMenuItem>.`);
  return context;
}

/** True inside a panel, where links drop the top-level styling. */
const InPanelContext = React.createContext(false);

export interface NavigationMenuProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color" | "defaultValue" | "onChange"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** The open item's value, or "" when every panel is closed. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

const NavigationMenu = React.forwardRef<HTMLElement, NavigationMenuProps>(
  (
    {
      color,
      value: valueProp,
      defaultValue = "",
      onValueChange,
      className,
      style,
      children,
      onKeyDown,
      onBlur,
      "aria-label": ariaLabel = "Main",
      ...props
    },
    forwardedRef,
  ) => {
    const baseId = React.useId();
    const reduceMotion = useReducedMotion() ?? false;
    const [uncontrolled, setUncontrolled] = React.useState(defaultValue);
    const value = valueProp !== undefined ? valueProp : uncontrolled;
    const [hovered, setHovered] = React.useState<string | null>(null);
    const [direction, setDirection] = React.useState(0);
    const [items, setItems] = React.useState<Record<string, HTMLElement>>({});
    const [store] = React.useState(createContentStore);
    const [rootEl, setRootEl] = React.useState<HTMLElement | null>(null);
    const ref = useComposedRefs(forwardedRef, setRootEl);

    const valueRef = React.useRef(value);
    const timer = React.useRef(0);
    const closedAt = React.useRef(-Infinity);
    const reason = React.useRef<OpenReason | null>(null);
    const panelFocus = React.useRef(false);

    useIsomorphicLayoutEffect(() => {
      valueRef.current = value;
    });

    React.useEffect(() => () => window.clearTimeout(timer.current), []);

    const setValue = React.useCallback(
      (next: string) => {
        window.clearTimeout(timer.current);
        const previous = valueRef.current;
        if (next === previous) return;
        if (!next) closedAt.current = performance.now();
        const from = previous ? items[previous] : undefined;
        const to = next ? items[next] : undefined;
        setDirection(
          from && to ? (from.compareDocumentPosition(to) & Node.DOCUMENT_POSITION_PRECEDING ? -1 : 1) : 0,
        );
        if (valueProp === undefined) setUncontrolled(next);
        onValueChange?.(next);
      },
      [items, valueProp, onValueChange],
    );

    const registerItem = React.useCallback((itemValue: string, element: HTMLElement | null) => {
      setItems((current) => {
        if (element) return current[itemValue] === element ? current : { ...current, [itemValue]: element };
        if (!(itemValue in current)) return current;
        const next = { ...current };
        delete next[itemValue];
        return next;
      });
    }, []);

    const context = React.useMemo<NavContextValue>(() => {
      const open = (next: string, why: OpenReason) => {
        reason.current = why;
        setValue(next);
      };
      const close = () => {
        reason.current = null;
        setValue("");
      };
      return {
        value,
        direction,
        indicated: hovered ?? (value || null),
        setHovered,
        items,
        registerItem,
        open,
        close,
        pin: () => {
          reason.current = "click";
        },
        openedBy: () => reason.current,
        scheduleOpen: (next) => {
          window.clearTimeout(timer.current);
          const recentlyClosed = performance.now() - closedAt.current < SKIP_DELAY_WINDOW;
          if (valueRef.current || recentlyClosed) {
            open(next, "pointer");
            return;
          }
          timer.current = window.setTimeout(() => open(next, "pointer"), OPEN_DELAY);
        },
        scheduleClose: () => {
          window.clearTimeout(timer.current);
          if (!valueRef.current) return;
          timer.current = window.setTimeout(close, CLOSE_DELAY);
        },
        cancelTimers: () => window.clearTimeout(timer.current),
        requestPanelFocus: () => {
          panelFocus.current = true;
        },
        takePanelFocus: () => {
          const requested = panelFocus.current;
          panelFocus.current = false;
          return requested;
        },
        store,
        reduceMotion,
        triggerId: (itemValue) => `${baseId}-trigger-${itemValue.replace(/\s+/g, "-")}`,
        contentId: (itemValue) => `${baseId}-content-${itemValue.replace(/\s+/g, "-")}`,
      };
    }, [value, direction, hovered, items, registerItem, setValue, store, reduceMotion, baseId]);

    React.useEffect(() => {
      if (!value || !rootEl) return;
      const onPointerDown = (event: PointerEvent) => {
        if (!rootEl.contains(event.target as Node)) context.close();
      };
      document.addEventListener("pointerdown", onPointerDown, true);
      return () => document.removeEventListener("pointerdown", onPointerDown, true);
    }, [value, rootEl, context]);

    return (
      <NavContext.Provider value={context}>
        <nav
          ref={ref}
          aria-label={ariaLabel}
          style={neonVars(color, style)}
          className={cn("[--neon:var(--neon-accent,34_211_238)]", "relative flex min-w-0 items-center", className)}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.key !== "Escape" || !value) return;
            event.preventDefault();
            event.stopPropagation();
            items[value]?.focus();
            context.close();
          }}
          onBlur={(event) => {
            onBlur?.(event);
            const next = event.relatedTarget as Node | null;
            if (next && event.currentTarget.contains(next)) return;
            setHovered(null);
            if (next) context.close();
          }}
          {...props}
        >
          {children}
          <Viewport />
        </nav>
      </NavContext.Provider>
    );
  },
);
NavigationMenu.displayName = "NavigationMenu";

const NavigationMenuList = React.forwardRef<HTMLUListElement, React.HTMLAttributes<HTMLUListElement>>(
  ({ className, children, onKeyDown, onPointerLeave, ...props }, ref) => {
    const nav = useNav("NavigationMenuList");
    const frameRef = React.useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scaleX = useMotionValue(0);
    const opacity = useMotionValue(0);
    const placed = React.useRef(false);
    const target = nav.indicated ? nav.items[nav.indicated] : undefined;
    const { reduceMotion } = nav;

    // One tube that glides between items. Transforms only: x for position, scaleX for width.
    useIsomorphicLayoutEffect(() => {
      const frame = frameRef.current;
      if (!frame || !target) {
        placed.current = false;
        animate(opacity, 0, { duration: 0.15, ease: EASE });
        return;
      }
      const place = (glide: boolean) => {
        const frameRect = frame.getBoundingClientRect();
        const rect = target.getBoundingClientRect();
        const left = rect.left - frameRect.left + frame.scrollLeft + INDICATOR_INSET;
        const width = Math.max(0, rect.width - INDICATOR_INSET * 2);
        y.set(rect.bottom - frameRect.top - 3);
        if (glide) {
          animate(x, left, { duration: 0.28, ease: EASE });
          animate(scaleX, width / INDICATOR_BASE, { duration: 0.28, ease: EASE });
        } else {
          x.set(left);
          scaleX.set(width / INDICATOR_BASE);
        }
      };
      place(placed.current && !reduceMotion);
      placed.current = true;
      animate(opacity, 1, { duration: 0.15, ease: EASE });
      const onResize = () => place(false);
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }, [target, reduceMotion, x, y, scaleX, opacity]);

    function handleKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
      onKeyDown?.(event);
      if (event.defaultPrevented) return;
      const current = event.target as HTMLElement;
      if (!current.hasAttribute("data-nav-top")) return;
      const tops = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-nav-top]")).filter(
        (element) => !(element as HTMLButtonElement).disabled,
      );
      const index = tops.indexOf(current);
      const last = tops.length - 1;
      const next = (
        {
          ArrowRight: index === last ? 0 : index + 1,
          ArrowLeft: index === 0 ? last : index - 1,
          Home: 0,
          End: last,
        } as Record<string, number>
      )[event.key];
      if (next === undefined || index < 0) return;
      event.preventDefault();
      const element = tops[next];
      element.focus();
      // While a panel is open, arrowing along the bar swaps panels like a menubar.
      if (nav.value) {
        const itemValue = element.dataset.navValue;
        if (element.hasAttribute("data-nav-trigger") && itemValue) nav.open(itemValue, "keyboard");
        else nav.close();
      }
    }

    return (
      <div
        ref={frameRef}
        className={cn(
          "relative min-w-0",
          // On small screens the bar scrolls sideways; the edges fade so a clipped item reads as more.
          "max-sm:overflow-x-auto max-sm:[scrollbar-width:none] max-sm:[&::-webkit-scrollbar]:hidden",
          "max-sm:[mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]",
        )}
      >
        <ul
          ref={ref}
          className={cn("flex items-center gap-0.5", className)}
          onKeyDown={handleKeyDown}
          onPointerLeave={(event) => {
            onPointerLeave?.(event);
            if (event.pointerType === "mouse") nav.setHovered(null);
          }}
          {...props}
        >
          {children}
        </ul>
        <motion.span
          aria-hidden
          style={{ x, y, scaleX, opacity, originX: 0, width: INDICATOR_BASE }}
          className="pointer-events-none absolute left-0 top-0 h-px"
        >
          <span className="absolute inset-x-0 -top-1.5 h-3 bg-[radial-gradient(closest-side,rgb(var(--neon)/CALC(0.55*var(--neon-glow,1))),transparent)]" />
          <span className="absolute inset-0 rounded-full bg-[rgb(var(--neon))]" />
        </motion.span>
      </div>
    );
  },
);
NavigationMenuList.displayName = "NavigationMenuList";

export interface NavigationMenuItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  /** Identifies the item for `value`/`onValueChange`. Generated when omitted. */
  value?: string;
}

const NavigationMenuItem = React.forwardRef<HTMLLIElement, NavigationMenuItemProps>(
  ({ value: valueProp, className, ...props }, ref) => {
    const autoValue = React.useId();
    const value = valueProp ?? autoValue;
    const context = React.useMemo(() => ({ value }), [value]);

    return (
      <ItemContext.Provider value={context}>
        <li ref={ref} className={cn("relative shrink-0", className)} {...props} />
      </ItemContext.Provider>
    );
  },
);
NavigationMenuItem.displayName = "NavigationMenuItem";

const topItem = cn(
  "relative inline-flex h-9 shrink-0 cursor-pointer select-none items-center gap-1 whitespace-nowrap rounded-lg px-3 text-sm font-medium outline-none",
  "transition-[color,background-color] duration-150 ease-out",
  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
  "disabled:pointer-events-none disabled:opacity-40",
);

const NavigationMenuTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  (
    { className, children, disabled, onPointerEnter, onPointerLeave, onClick, onKeyDown, onKeyUp, onFocus, ...props },
    forwardedRef,
  ) => {
    const nav = useNav("NavigationMenuTrigger");
    const { value } = useItem("NavigationMenuTrigger");
    const { registerItem } = nav;
    const register = React.useCallback((element: HTMLElement | null) => registerItem(value, element), [registerItem, value]);
    const ref = useComposedRefs<HTMLButtonElement>(forwardedRef, register);
    const open = nav.value === value;
    // After closing with a click, hovering doesn't reopen until the pointer leaves.
    const hoverSuppressed = React.useRef(false);

    function openWithKeyboard() {
      nav.requestPanelFocus();
      nav.open(value, "keyboard");
    }

    return (
      <button
        ref={ref}
        type="button"
        id={nav.triggerId(value)}
        disabled={disabled}
        aria-expanded={open}
        aria-controls={open ? nav.contentId(value) : undefined}
        data-state={open ? "open" : "closed"}
        data-nav-top=""
        data-nav-trigger=""
        data-nav-value={value}
        className={cn(
          topItem,
          open ? "bg-white/[0.04] text-white" : "text-white/60 hover:bg-white/[0.04] hover:text-white/95",
          className,
        )}
        onPointerEnter={(event) => {
          onPointerEnter?.(event);
          if (event.pointerType !== "mouse" || disabled) return;
          nav.setHovered(value);
          if (!hoverSuppressed.current) nav.scheduleOpen(value);
        }}
        onPointerLeave={(event) => {
          onPointerLeave?.(event);
          if (event.pointerType !== "mouse") return;
          hoverSuppressed.current = false;
          nav.scheduleClose();
        }}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          if (!open) {
            nav.open(value, "click");
          } else if (nav.openedBy() === "pointer") {
            // It opened on hover a moment ago; the click confirms it rather than closing it.
            nav.pin();
          } else {
            hoverSuppressed.current = true;
            nav.close();
          }
        }}
        onKeyDown={(event) => {
          onKeyDown?.(event);
          if (event.defaultPrevented) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (open) nav.close();
            else openWithKeyboard();
          } else if (event.key === "ArrowDown") {
            event.preventDefault();
            if (!open) openWithKeyboard();
            else tabbables(document.getElementById(nav.contentId(value)))[0]?.focus();
          } else if (event.key === "Tab" && !event.shiftKey && open) {
            const first = tabbables(document.getElementById(nav.contentId(value)))[0];
            if (first) {
              event.preventDefault();
              first.focus();
            }
          }
        }}
        onKeyUp={(event) => {
          onKeyUp?.(event);
          // Space is handled on keydown; cancel the click it would fire on keyup.
          if (event.key === " ") event.preventDefault();
        }}
        onFocus={(event) => {
          onFocus?.(event);
          if (isFocusVisible(event.currentTarget)) nav.setHovered(value);
        }}
        {...props}
      >
        {children}
        <ChevronDown
          aria-hidden
          className={cn(
            "size-3.5 shrink-0 transition-[transform,color] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            open ? "rotate-180 text-[rgb(var(--neon))]" : "text-white/35",
          )}
        />
      </button>
    );
  },
);
NavigationMenuTrigger.displayName = "NavigationMenuTrigger";

export type NavigationMenuContentProps = MotionSafe<React.HTMLAttributes<HTMLDivElement>>;

/** Registers its children with the shared panel; renders nothing in place. */
const NavigationMenuContent = React.forwardRef<HTMLDivElement, NavigationMenuContentProps>((props, ref) => {
  const { store } = useNav("NavigationMenuContent");
  const { value } = useItem("NavigationMenuContent");

  useIsomorphicLayoutEffect(() => {
    store.set(value, { props, ref });
  });

  useIsomorphicLayoutEffect(() => () => store.remove(value), [store, value]);

  return null;
});
NavigationMenuContent.displayName = "NavigationMenuContent";

const slide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 28 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -28 }),
};

const fade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
};

const Pane = React.forwardRef<HTMLDivElement, { value: string; entry: ContentEntry }>(({ value, entry }, ref) => {
  const nav = useNav("NavigationMenuContent");
  const composedRef = useComposedRefs(ref, entry.ref);
  const { className, children, ...props } = entry.props;

  return (
    <motion.div
      ref={composedRef}
      id={nav.contentId(value)}
      aria-labelledby={nav.triggerId(value)}
      data-value={value}
      // Keeps the pane at its natural size while the panel around it morphs.
      layout={!nav.reduceMotion}
      custom={nav.direction}
      variants={nav.reduceMotion ? fade : slide}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.22, ease: EASE }}
      // max-w-full lets fixed-width content wrap when the panel is capped to the viewport.
      // The pane scrolls when the panel would run past the bottom of the viewport (2px for the border).
      className={cn(
        "max-h-[calc(var(--nk-nav-max-height,100vh)-2px)] max-w-full overflow-y-auto overscroll-contain outline-none",
        className,
      )}
      {...props}
    >
      <InPanelContext.Provider value>{children}</InPanelContext.Provider>
    </motion.div>
  );
});
Pane.displayName = "NavigationMenuPane";

function Panel({ value, entry }: { value: string; entry: ContentEntry }) {
  const nav = useNav("NavigationMenuContent");
  const isPresent = useIsPresent();
  const [floatingEl, setFloatingEl] = React.useState<HTMLElement | null>(null);
  const { floatingStyles, middlewareData, isPositioned } = useFloating({
    placement: "bottom",
    strategy: "absolute",
    transform: false,
    open: true,
    elements: { reference: nav.items[value] ?? null, floating: floatingEl },
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      shift({ padding: 8 }),
      size({
        padding: 8,
        apply({ availableWidth, availableHeight, elements }) {
          elements.floating.style.maxWidth = `${Math.max(0, availableWidth)}px`;
          elements.floating.style.setProperty("--nk-nav-max-height", `${Math.max(120, availableHeight)}px`);
        },
      }),
      transformOrigin,
    ],
  });
  const origin = (middlewareData.transformOrigin as { origin?: string } | undefined)?.origin;
  const reduceMotion = nav.reduceMotion;

  const { takePanelFocus } = nav;
  React.useEffect(() => {
    if (!takePanelFocus()) return;
    tabbables(document.getElementById(nav.contentId(value)))[0]?.focus();
  }, [value, takePanelFocus, nav]);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const pane = document.getElementById(nav.contentId(value));
    const focusable = tabbables(pane);
    const index = focusable.indexOf(document.activeElement as HTMLElement);
    if (index < 0) return;
    const { key } = event;

    if (key === "ArrowDown" || key === "ArrowUp" || key === "Home" || key === "End") {
      event.preventDefault();
      const next =
        key === "Home"
          ? 0
          : key === "End"
            ? focusable.length - 1
            : clamp(index + (key === "ArrowDown" ? 1 : -1), 0, focusable.length - 1);
      focusable[next]?.focus();
    } else if (key === "Tab" && event.shiftKey && index === 0) {
      event.preventDefault();
      nav.items[value]?.focus();
    } else if (key === "Tab" && !event.shiftKey && index === focusable.length - 1) {
      // The panel lives at the end of the nav; carry on from the trigger it belongs to.
      const tops = Array.from(document.querySelectorAll<HTMLElement>("[data-nav-top]"));
      const trigger = nav.items[value];
      const after = trigger ? tops.slice(tops.indexOf(trigger) + 1).find((element) => trigger.closest("nav")?.contains(element)) : undefined;
      if (after) {
        event.preventDefault();
        after.focus();
      }
      nav.close();
    }
  }

  return (
    <motion.div
      ref={setFloatingEl}
      layout={isPositioned && !reduceMotion}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={
        reduceMotion
          ? { opacity: 0, transition: { duration: 0.12 } }
          : { opacity: 0, scale: 0.98, y: -2, transition: { duration: 0.14, ease: EASE } }
      }
      transition={{ duration: 0.16, ease: EASE, layout: { duration: 0.32, ease: EASE } }}
      // borderRadius inline so motion keeps the corners round while the panel morphs.
      style={{ ...floatingStyles, borderRadius: 12, transformOrigin: origin }}
      className={cn(
        "z-50 overflow-hidden border border-white/10 bg-[#0a0b11] text-white/90",
        "shadow-[0_18px_48px_-12px_rgb(0_0_0/0.85),0_0_0_1px_rgb(var(--neon)/0.06),0_0_28px_-10px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]",
        !isPresent && "pointer-events-none",
      )}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") nav.cancelTimers();
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") nav.scheduleClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <AnimatePresence mode="popLayout" initial={false} custom={nav.direction}>
        <Pane key={value} value={value} entry={entry} />
      </AnimatePresence>
    </motion.div>
  );
}

function Viewport() {
  const nav = useNav("NavigationMenu");
  const entries = React.useSyncExternalStore(nav.store.subscribe, nav.store.get, nav.store.get);
  const entry = nav.value ? entries.get(nav.value) : undefined;

  return (
    <AnimatePresence>
      {nav.value && entry && <Panel key="panel" value={nav.value} entry={entry} />}
    </AnimatePresence>
  );
}

export interface NavigationMenuLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Marks the current page: `aria-current="page"` and a softly lit label. */
  active?: boolean;
  /** Render the single child (e.g. your router's Link) with the link's behaviour and styles. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const NavigationMenuLink = React.forwardRef<HTMLAnchorElement, NavigationMenuLinkProps>(
  (raw, forwardedRef) => {
    const { active = false, asChild = false, className, onClick, onPointerEnter, onFocus, ...props } = fromRenderProp(raw);
    const nav = useNav("NavigationMenuLink");
    const item = React.useContext(ItemContext);
    const inPanel = React.useContext(InPanelContext);
    const topLevel = Boolean(item) && !inPanel;
    const itemValue = topLevel ? item?.value : undefined;
    const { registerItem } = nav;
    const register = React.useCallback(
      (element: HTMLElement | null) => {
        if (itemValue) registerItem(itemValue, element);
      },
      [registerItem, itemValue],
    );
    const ref = useComposedRefs<HTMLAnchorElement>(forwardedRef, register);

    const linkProps = {
      ...props,
      "aria-current": active ? ("page" as const) : undefined,
      "data-active": active ? "" : undefined,
      "data-nav-top": topLevel ? "" : undefined,
      "data-nav-value": itemValue,
      className: cn(
        topLevel
          ? cn(
              topItem,
              active
                ? "text-[rgb(var(--neon))] [text-shadow:0_0_12px_rgb(var(--neon)/CALC(0.45*var(--neon-glow,1)))]"
                : "text-white/60 hover:bg-white/[0.04] hover:text-white/95",
            )
          : cn(
              "block rounded-lg outline-none transition-colors duration-150 ease-out hover:bg-white/[0.04] focus-visible:bg-white/[0.04]",
              "focus-visible:ring-1 focus-visible:ring-[rgb(var(--neon)/0.5)]",
            ),
        className,
      ),
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (!event.defaultPrevented) nav.close();
      },
      onPointerEnter: (event: React.PointerEvent<HTMLAnchorElement>) => {
        onPointerEnter?.(event);
        if (itemValue && event.pointerType === "mouse") nav.setHovered(itemValue);
      },
      onFocus: (event: React.FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(event);
        if (itemValue && isFocusVisible(event.currentTarget)) nav.setHovered(itemValue);
      },
    };

    if (asChild) return <Slot ref={ref as React.Ref<HTMLElement>} {...(linkProps as React.HTMLAttributes<HTMLElement>)} />;
    return <a ref={ref} {...linkProps} />;
  },
);
NavigationMenuLink.displayName = "NavigationMenuLink";

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
};
