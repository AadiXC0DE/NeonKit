"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { PanelLeft } from "@/components/ui/icons";

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

const EASE = [0.23, 1, 0.32, 1] as const;
const GLIDE = { duration: 0.3, ease: EASE };
const MOBILE_QUERY = "(max-width: 767.98px)";
// React 19 treats inert as a boolean; React 18 only renders it from a string.
const INERT = (Number.parseInt(React.version, 10) >= 19 ? { inert: true } : { inert: "" }) as React.HTMLAttributes<HTMLDivElement>;
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

type AnyRef<T> = React.Ref<T> | undefined;

function setRef<T>(ref: AnyRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) (ref as React.RefObject<T | null>).current = value;
}

// React 19 moved `ref` into props; reading `element.ref` there logs a warning.
function getElementRef<T>(element: React.ReactElement): AnyRef<T> {
  if (Number.parseInt(React.version, 10) >= 19) {
    return (element.props as { ref?: React.Ref<T> }).ref;
  }
  return (element as unknown as { ref?: React.Ref<T> }).ref;
}

function subscribeToViewport(callback: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener?.("change", callback);
  return () => query.removeEventListener?.("change", callback);
}

/** Below `md` the sidebar is an off-canvas drawer. The server renders the desktop layout. */
function useIsMobile() {
  return React.useSyncExternalStore(
    subscribeToViewport,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false,
  );
}

const subscribeNever = () => () => {};

function useMounted() {
  return React.useSyncExternalStore(subscribeNever, () => true, () => false);
}

function isFocusVisible(element: Element) {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

function matchesShortcut(event: KeyboardEvent, key: string) {
  const target = key.toLowerCase();
  if (event.key.toLowerCase() === target) return true;
  // Non-Latin layouts and Option rewrite event.key, so fall back to the physical key.
  if (/^[a-z]$/.test(target)) return event.code === `Key${target.toUpperCase()}`;
  return false;
}

type SidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  /** Collapses or expands the sidebar; below `md` it opens or closes the drawer instead. */
  toggle: () => void;
  isMobile: boolean;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  sidebarId: string;
  shortcut: string | false;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebarContext(component: string) {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error(`<${component}> must be used inside <SidebarProvider>.`);
  return context;
}

/** Reads and controls the nearest SidebarProvider. */
function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used inside <SidebarProvider>.");
  return context;
}

type SidebarInstanceValue = {
  layoutId: string;
  side: "left" | "right";
  /** Collapsed to the icon rail (md and up). */
  rail: boolean;
  hintsEnabled: boolean;
  reduceMotion: boolean;
  showHint: (element: HTMLElement, label: React.ReactNode, badge?: React.ReactNode) => void;
  hideHint: (immediate?: boolean) => void;
};

const SidebarInstanceContext = React.createContext<SidebarInstanceValue | null>(null);

function useSidebarInstance(component: string) {
  const context = React.useContext(SidebarInstanceContext);
  if (!context) throw new Error(`<${component}> must be used inside <Sidebar>.`);
  return context;
}

export interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Rail state when controlled. */
  collapsed?: boolean;
  /** Initial rail state when uncontrolled. */
  defaultCollapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** ⌘ (or Ctrl) plus this key toggles the sidebar. Pass false to turn the shortcut off. */
  shortcut?: string | false;
}

const SidebarProvider = React.forwardRef<HTMLDivElement, SidebarProviderProps>(
  (
    {
      className,
      collapsed: collapsedProp,
      defaultCollapsed = false,
      onCollapsedChange,
      shortcut = "b",
      ...props
    },
    ref,
  ) => {
    const sidebarId = `${React.useId()}sidebar`;
    const isMobile = useIsMobile();
    const [uncontrolled, setUncontrolled] = React.useState(defaultCollapsed);
    const [openMobile, setOpenMobile] = React.useState(false);
    const collapsed = collapsedProp ?? uncontrolled;
    // A drawer left open while the window widens past md shouldn't pop open again on the way back.
    if (!isMobile && openMobile) setOpenMobile(false);

    const setCollapsed = React.useCallback(
      (next: boolean) => {
        if (next === collapsed) return;
        if (collapsedProp === undefined) setUncontrolled(next);
        onCollapsedChange?.(next);
      },
      [collapsed, collapsedProp, onCollapsedChange],
    );

    const toggle = React.useCallback(() => {
      if (isMobile) setOpenMobile((open) => !open);
      else setCollapsed(!collapsed);
    }, [isMobile, collapsed, setCollapsed]);

    // The listener stays subscribed once; it always calls the latest toggle.
    const toggleRef = React.useRef(toggle);
    React.useEffect(() => {
      toggleRef.current = toggle;
    }, [toggle]);

    React.useEffect(() => {
      if (!shortcut) return;
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented || event.repeat || event.altKey || event.shiftKey) return;
        if (!(event.metaKey || event.ctrlKey) || !matchesShortcut(event, shortcut)) return;
        // Rich-text editors use ⌘B for bold.
        const target = event.target;
        if (target instanceof Element && target.closest('[contenteditable]:not([contenteditable="false"])')) return;
        event.preventDefault();
        toggleRef.current();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [shortcut]);

    const context = React.useMemo<SidebarContextValue>(
      () => ({
        collapsed,
        setCollapsed,
        toggle,
        isMobile,
        openMobile,
        setOpenMobile,
        sidebarId,
        shortcut,
      }),
      [collapsed, setCollapsed, toggle, isMobile, openMobile, sidebarId, shortcut],
    );

    return (
      <SidebarContext.Provider value={context}>
        <div ref={ref} className={cn("flex w-full", className)} {...props} />
      </SidebarContext.Provider>
    );
  },
);
SidebarProvider.displayName = "SidebarProvider";

type Hint = {
  label: React.ReactNode;
  badge?: React.ReactNode;
  x: number;
  y: number;
  neon: string;
};

export interface SidebarProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  side?: "left" | "right";
  /** "rail" lets the sidebar collapse to a 56px icon rail; "none" keeps it open. */
  collapsible?: "rail" | "none";
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      style,
      color,
      side = "left",
      collapsible = "rail",
      children,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const { collapsed, isMobile, openMobile, setOpenMobile, sidebarId } = useSidebarContext("Sidebar");
    const panelRef = React.useRef<HTMLDivElement>(null);
    const mergedRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        setRef(ref, node);
        panelRef.current = node;
      },
      [ref],
    );
    const instanceId = React.useId();
    const reduceMotion = useReducedMotion() ?? false;
    const mounted = useMounted();

    const rail = collapsible === "rail" && collapsed;
    const hintsEnabled = rail && !isMobile;
    const drawerOpen = isMobile && openMobile;

    const [hint, setHint] = React.useState<Hint | null>(null);
    const hideTimer = React.useRef<number | undefined>(undefined);

    // A stale hint must not reappear the next time the sidebar collapses.
    const [hintsWereEnabled, setHintsWereEnabled] = React.useState(hintsEnabled);
    if (hintsWereEnabled !== hintsEnabled) {
      setHintsWereEnabled(hintsEnabled);
      setHint(null);
    }
    const visibleHint = hintsEnabled ? hint : null;
    const hintOpen = visibleHint !== null;

    React.useEffect(() => () => window.clearTimeout(hideTimer.current), []);

    const showHint = React.useCallback(
      (element: HTMLElement, label: React.ReactNode, badge?: React.ReactNode) => {
        window.clearTimeout(hideTimer.current);
        const panel = panelRef.current;
        if (!panel) return;
        const item = element.getBoundingClientRect();
        const bounds = panel.getBoundingClientRect();
        setHint({
          label,
          badge,
          x: side === "left" ? bounds.right + 10 : bounds.left - 10,
          y: item.top + item.height / 2,
          // The hint is portaled out of the sidebar, so it carries the color with it.
          neon: getComputedStyle(panel).getPropertyValue("--neon").trim(),
        });
      },
      [side],
    );

    const hideHint = React.useCallback((immediate = false) => {
      window.clearTimeout(hideTimer.current);
      if (immediate) setHint(null);
      // A short grace period lets the hint glide to the next item instead of blinking.
      else hideTimer.current = window.setTimeout(() => setHint(null), 80);
    }, []);

    React.useEffect(() => {
      if (!hintOpen) return;
      const close = () => setHint(null);
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") close();
      };
      window.addEventListener("scroll", close, true);
      window.addEventListener("resize", close);
      document.addEventListener("keydown", onKeyDown);
      return () => {
        window.removeEventListener("scroll", close, true);
        window.removeEventListener("resize", close);
        document.removeEventListener("keydown", onKeyDown);
      };
    }, [hintOpen]);

    // The mobile drawer behaves like a modal: focus moves in, Escape closes, the page stops scrolling.
    React.useEffect(() => {
      if (!drawerOpen) return;
      const panel = panelRef.current;
      const restore = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      // Wait two frames: the panel is still visibility:hidden until its transition starts.
      let frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
          (first ?? panel)?.focus({ preventScroll: true });
        });
      });

      const onKeyDown = (event: KeyboardEvent) => {
        if (event.defaultPrevented || !panel) return;
        if (event.key === "Escape") {
          event.preventDefault();
          setOpenMobile(false);
          return;
        }
        // SidebarInset is inert, but the rest of the page may not be: keep Tab inside the drawer.
        if (event.key !== "Tab") return;
        const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (element) =>
            !element.closest("[hidden], [inert]") &&
            (typeof element.checkVisibility !== "function" || element.checkVisibility()),
        );
        if (focusable.length === 0) {
          event.preventDefault();
          panel.focus({ preventScroll: true });
          return;
        }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        const outside = !(active instanceof Node) || !panel.contains(active);
        if (event.shiftKey && (active === first || active === panel || outside)) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && (active === last || outside)) {
          event.preventDefault();
          first.focus();
        }
      };
      const overflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKeyDown);
      return () => {
        cancelAnimationFrame(frame);
        document.removeEventListener("keydown", onKeyDown);
        document.body.style.overflow = overflow;
        if (restore?.isConnected) restore.focus({ preventScroll: true });
      };
    }, [drawerOpen, setOpenMobile]);

    const instance = React.useMemo<SidebarInstanceValue>(
      () => ({ layoutId: instanceId, side, rail, hintsEnabled, reduceMotion, showHint, hideHint }),
      [instanceId, side, rail, hintsEnabled, reduceMotion, showHint, hideHint],
    );

    const nudge = reduceMotion ? 0 : side === "left" ? -4 : 4;

    return (
      <SidebarInstanceContext.Provider value={instance}>
        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              key="backdrop"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.16 } }}
              transition={{ duration: 0.24, ease: EASE }}
              onClick={() => setOpenMobile(false)}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
            />
          )}
        </AnimatePresence>
        <div
          ref={mergedRef}
          id={sidebarId}
          role={drawerOpen ? "dialog" : undefined}
          aria-modal={drawerOpen || undefined}
          aria-label={ariaLabel ?? (drawerOpen ? "Sidebar" : undefined)}
          tabIndex={drawerOpen ? -1 : undefined}
          data-state={rail ? "collapsed" : "expanded"}
          data-side={side}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "group/sidebar flex flex-col overflow-hidden border-white/[0.08] bg-[#07080d] text-white/90 outline-none",
            "transition-[width,transform,translate,visibility] duration-[240ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
            // Below md: an off-canvas drawer over the page.
            "fixed inset-y-0 z-50 w-[min(288px,85vw)] shadow-[0_0_48px_-12px_rgb(0_0_0/0.9)]",
            side === "left" ? "left-0 border-r" : "right-0 border-l",
            openMobile
              ? "visible translate-x-0"
              : cn("invisible", side === "left" ? "-translate-x-full" : "translate-x-full"),
            // md and up: part of the layout, sticky, as tall as the viewport or the provider.
            "md:visible md:sticky md:bottom-auto md:top-0 md:z-auto md:h-[100svh] md:max-h-full md:translate-x-0 md:self-start md:shadow-none",
            side === "left" ? "md:left-auto" : "md:right-auto",
            rail ? "md:w-14" : "md:w-[248px]",
            className,
          )}
          {...props}
        >
          {children}
        </div>
        {mounted &&
          createPortal(
            <AnimatePresence>
              {visibleHint && (
                <motion.div
                  key="sidebar-hint"
                  aria-hidden
                  data-sidebar-hint=""
                  initial={{ opacity: 0, x: nudge, y: visibleHint.y, scale: reduceMotion ? 1 : 0.96 }}
                  animate={{ opacity: 1, x: 0, y: visibleHint.y, scale: 1 }}
                  exit={{
                    opacity: 0,
                    x: nudge / 2,
                    scale: reduceMotion ? 1 : 0.96,
                    transition: { duration: 0.1, ease: EASE },
                  }}
                  transition={{ duration: 0.15, ease: EASE, y: { duration: reduceMotion ? 0 : 0.2, ease: EASE } }}
                  style={
                    {
                      left: visibleHint.x,
                      transformOrigin: "0 0",
                      ...(visibleHint.neon
                        ? { "--neon": visibleHint.neon, "--neon-accent": visibleHint.neon }
                        : null),
                    } as React.CSSProperties
                  }
                  className="[--neon:var(--neon-accent,34_211_238)] pointer-events-none fixed top-0 z-[60]"
                >
                  <div
                    className={cn(
                      "flex -translate-y-1/2 items-center gap-2 whitespace-nowrap rounded-lg border border-[rgb(var(--neon)/0.4)] bg-[#0a0b11] px-2.5 py-1.5 text-xs leading-4 text-white/90",
                      "shadow-[0_0_14px_-2px_rgb(var(--neon)/0.35),0_8px_20px_-8px_rgb(0_0_0/0.8)]",
                      side === "right" && "-translate-x-full",
                    )}
                  >
                    {visibleHint.label}
                    {visibleHint.badge != null && visibleHint.badge !== false && (
                      <span className="font-medium tabular-nums text-[rgb(var(--neon))]">{visibleHint.badge}</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body,
          )}
      </SidebarInstanceContext.Provider>
    );
  },
);
Sidebar.displayName = "Sidebar";

const SidebarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex shrink-0 items-center gap-2 overflow-hidden p-2", className)} {...props} />
  ),
);
SidebarHeader.displayName = "SidebarHeader";

export type SidebarContentProps = Omit<
  React.HTMLAttributes<HTMLElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration"
>;

const SidebarContent = React.forwardRef<HTMLElement, SidebarContentProps>(
  ({ className, onScroll, "aria-label": ariaLabel, ...props }, ref) => {
    const { hideHint } = useSidebarInstance("SidebarContent");

    return (
      <motion.nav
        ref={ref}
        // Lets the active marker measure correctly inside the scrolled list.
        layoutScroll
        aria-label={ariaLabel ?? "Sidebar"}
        onScroll={(event) => {
          onScroll?.(event);
          hideHint(true);
        }}
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden p-2",
          "[scrollbar-color:rgb(255_255_255/0.1)_transparent] [scrollbar-width:thin]",
          className,
        )}
        {...props}
      />
    );
  },
);
SidebarContent.displayName = "SidebarContent";

export interface SidebarGroupProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Small heading above the items. In the rail it turns into a short divider. */
  label?: React.ReactNode;
}

const SidebarGroup = React.forwardRef<HTMLDivElement, SidebarGroupProps>(
  ({ className, label, children, ...props }, ref) => {
    const { rail } = useSidebarInstance("SidebarGroup");
    const labelId = React.useId();
    const hasLabel = label != null && label !== false;

    return (
      <div
        ref={ref}
        role={hasLabel ? "group" : undefined}
        aria-labelledby={hasLabel ? labelId : undefined}
        className={cn("flex flex-col", className)}
        {...props}
      >
        {hasLabel && (
          <div className="relative flex h-8 shrink-0 items-center px-3">
            <span
              id={labelId}
              className={cn(
                "truncate text-xs font-medium text-white/55 transition-opacity ease-out",
                rail ? "duration-100 md:opacity-0" : "delay-75 duration-200",
              )}
            >
              {label}
            </span>
            <span
              aria-hidden
              className={cn(
                "absolute left-3 top-1/2 h-px w-4 bg-white/[0.14] opacity-0 transition-opacity duration-200 ease-out",
                rail && "md:opacity-100",
              )}
            />
          </div>
        )}
        <ul className="m-0 flex list-none flex-col gap-0.5 p-0">{children}</ul>
      </div>
    );
  },
);
SidebarGroup.displayName = "SidebarGroup";

export interface SidebarItemProps extends Omit<React.AnchorHTMLAttributes<HTMLElement>, "color"> {
  icon?: React.ReactNode;
  /** Renders a link. Without it the item is a button. */
  href?: string;
  /** Marks the current page: `aria-current="page"` and the lit tube. */
  active?: boolean;
  /** Count or short tag at the end of the row. In the rail it becomes a dot on the icon. */
  badge?: React.ReactNode;
  /** Text for the hover label in the rail. Defaults to the item's label. */
  tooltip?: React.ReactNode;
  disabled?: boolean;
  /** Merge the item onto the single child element, such as your router's Link. Its children become the label. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const SidebarItem = React.forwardRef<HTMLElement, SidebarItemProps>(
  (raw, ref) => {
    const {
      className,
      icon,
      href,
      active = false,
      badge,
      tooltip,
      disabled = false,
      asChild = false,
      children,
      onClick,
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      ...props
    } = fromRenderProp(raw);
    const { isMobile, setOpenMobile } = useSidebarContext("SidebarItem");
    const instance = useSidebarInstance("SidebarItem");
    const { rail } = instance;

    const child =
      asChild ? resolveElement<React.HTMLAttributes<HTMLElement>>(children) : null;
    const childProps: React.HTMLAttributes<HTMLElement> = child?.props ?? {};
    const label = child ? childProps.children : children;
    const hasBadge = badge != null && badge !== false;
    const childRef = child ? getElementRef<HTMLElement>(child) : undefined;
    const mergedRef = (node: HTMLElement | null) => {
      setRef(ref, node);
      setRef(childRef, node);
    };

    const handlers = {
      onClick: (event: React.MouseEvent<HTMLElement>) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        childProps.onClick?.(event);
        onClick?.(event);
        if (!event.defaultPrevented && isMobile) setOpenMobile(false);
      },
      onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
        childProps.onPointerEnter?.(event);
        onPointerEnter?.(event);
        if (event.pointerType === "mouse" && instance.hintsEnabled) {
          instance.showHint(event.currentTarget, tooltip ?? label, hasBadge ? badge : undefined);
        }
      },
      onPointerLeave: (event: React.PointerEvent<HTMLElement>) => {
        childProps.onPointerLeave?.(event);
        onPointerLeave?.(event);
        instance.hideHint();
      },
      onFocus: (event: React.FocusEvent<HTMLElement>) => {
        childProps.onFocus?.(event);
        onFocus?.(event);
        if (instance.hintsEnabled && isFocusVisible(event.currentTarget)) {
          instance.showHint(event.currentTarget, tooltip ?? label, hasBadge ? badge : undefined);
        }
      },
      onBlur: (event: React.FocusEvent<HTMLElement>) => {
        childProps.onBlur?.(event);
        onBlur?.(event);
        instance.hideHint();
      },
    };

    const classes = cn(
      "group/item relative flex h-9 w-full min-w-0 cursor-pointer select-none items-center gap-3 overflow-hidden rounded-lg px-3 text-left text-sm outline-none",
      "transition-[background-color,color] duration-150 ease-out",
      "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#07080d]",
      active ? "text-white" : "text-white/65 hover:bg-white/[0.04] hover:text-white/90 active:bg-white/[0.06]",
      disabled && "pointer-events-none opacity-40",
    );

    // Labels fade out fast when collapsing and back in a beat after the rail starts to widen.
    const fade = rail ? "duration-100 md:opacity-0" : "delay-75 duration-200";

    const content = (
      <>
        <span
          className={cn(
            "relative grid size-4 shrink-0 place-items-center transition-[color,filter] duration-150 [&_svg]:size-4",
            active
              ? "text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.7))]"
              : "text-white/50 group-hover/item:text-white/80",
          )}
        >
          {icon}
          {hasBadge && (
            <span
              aria-hidden
              className={cn(
                "absolute -right-1 -top-1 size-1.5 rounded-full bg-[rgb(var(--neon))] opacity-0 shadow-[0_0_6px_rgb(var(--neon)/0.9)] transition-opacity duration-200",
                rail && "md:opacity-100",
              )}
            />
          )}
        </span>
        <span className={cn("min-w-0 flex-1 truncate transition-opacity ease-out", fade)}>{label}</span>
        {hasBadge && (
          <span
            className={cn(
              "ml-auto inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-medium tabular-nums",
              "transition-[opacity,background-color,color] ease-out",
              active ? "bg-[rgb(var(--neon)/0.16)] text-[rgb(var(--neon))]" : "bg-white/[0.06] text-white/55",
              fade,
            )}
          >
            {badge}
          </span>
        )}
      </>
    );

    const shared = {
      ...props,
      ...handlers,
      "aria-current": active ? ("page" as const) : undefined,
      "data-active": active ? "" : undefined,
    };

    let element: React.ReactNode;
    if (child) {
      element = React.cloneElement(child, {
        ...shared,
        ...childProps,
        ...handlers,
        "aria-disabled": disabled || undefined,
        className: cn(classes, childProps.className, className),
        children: content,
        ref: mergedRef,
      } as React.HTMLAttributes<HTMLElement>);
    } else if (href !== undefined) {
      element = (
        <a
          ref={mergedRef}
          href={disabled ? undefined : href}
          aria-disabled={disabled || undefined}
          className={cn(classes, className)}
          {...(shared as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    } else {
      element = (
        <button
          ref={mergedRef}
          type="button"
          disabled={disabled}
          className={cn(classes, className)}
          {...(shared as React.ButtonHTMLAttributes<HTMLButtonElement>)}
        >
          {content}
        </button>
      );
    }

    return (
      <li className="relative">
        {active && (
          <>
            <motion.span
              aria-hidden
              layoutId={instance.reduceMotion ? undefined : `${instance.layoutId}-fill`}
              initial={false}
              transition={GLIDE}
              style={{ borderRadius: 8 }}
              className="pointer-events-none absolute inset-0 bg-[rgb(var(--neon)/0.08)] shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.14)]"
            />
            <motion.span
              aria-hidden
              layoutId={instance.reduceMotion ? undefined : `${instance.layoutId}-tube`}
              initial={false}
              transition={GLIDE}
              style={{ borderRadius: 3 }}
              className={cn(
                "pointer-events-none absolute inset-y-2 w-[3px] bg-[rgb(var(--neon))]",
                "shadow-[0_0_10px_rgb(var(--neon)/0.85),0_0_2px_rgb(var(--neon))]",
                instance.side === "left" ? "-left-[5px]" : "-right-[5px]",
              )}
            />
          </>
        )}
        {element}
      </li>
    );
  },
);
SidebarItem.displayName = "SidebarItem";

const SidebarFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex shrink-0 flex-col gap-1 overflow-hidden border-t border-white/[0.06] p-2", className)}
      {...props}
    />
  ),
);
SidebarFooter.displayName = "SidebarFooter";

export interface SidebarTriggerProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const SidebarTrigger = React.forwardRef<HTMLButtonElement, SidebarTriggerProps>(
  ({ className, style, color, onClick, children, ...props }, ref) => {
    const { toggle, collapsed, isMobile, openMobile, sidebarId, shortcut } = useSidebarContext("SidebarTrigger");
    const key = shortcut ? shortcut.toUpperCase() : null;

    return (
      <button
        ref={ref}
        type="button"
        aria-label={children == null ? "Toggle sidebar" : undefined}
        aria-controls={sidebarId}
        aria-expanded={isMobile ? openMobile : !collapsed}
        aria-keyshortcuts={key ? `Meta+${key} Control+${key}` : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented) toggle();
        }}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg text-white/55 outline-none",
          "transition-[background-color,color,transform,scale] duration-150 ease-out active:scale-[0.97]",
          "hover:bg-white/[0.06] hover:text-white/90",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          "[&_svg]:size-4 [&_svg]:shrink-0",
          className,
        )}
        {...props}
      >
        {children ?? <PanelLeft aria-hidden />}
      </button>
    );
  },
);
SidebarTrigger.displayName = "SidebarTrigger";

const SidebarInset = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { isMobile, openMobile } = useSidebarContext("SidebarInset");
    // While the drawer is open the page behind it can't be focused or clicked. Set during render, so it is
    // already gone when the drawer hands focus back.
    const inert = isMobile && openMobile;

    return (
      <div
        ref={ref}
        {...(inert ? INERT : null)}
        className={cn("relative flex min-w-0 flex-1 flex-col", className)}
        {...props}
      />
    );
  },
);
SidebarInset.displayName = "SidebarInset";

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarItem,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  useSidebar,
};
