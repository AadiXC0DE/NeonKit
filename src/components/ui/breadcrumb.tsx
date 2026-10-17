"use client";

import * as React from "react";
import { ChevronRight, Ellipsis } from "@/components/ui/icons";

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

// Revealed items slide in a few pixels from the ellipsis, one after another.
const keyframes = `@keyframes nk-breadcrumb-reveal{from{opacity:0;transform:translateX(-4px)}}`;
const revealClass =
  "motion-safe:[animation:nk-breadcrumb-reveal_220ms_cubic-bezier(0.23,1,0.32,1)_both]";

const BreadcrumbContext = React.createContext<{ maxItems?: number }>({});

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

const LAZY = Symbol.for("react.lazy");

type LazyType = { $$typeof: symbol; _payload: unknown; _init: (payload: unknown) => unknown };

/**
 * True when `node` is an element of `component`. Children passed down from a Server Component
 * can arrive as lazy references to the client module, so those are resolved first. This file is
 * already loaded by the time it runs, so resolving never suspends.
 */
function isElementOf(node: React.ReactNode, component: unknown) {
  if (!React.isValidElement(node)) return false;
  let type: unknown = node.type;
  if (typeof type === "object" && type !== null && (type as LazyType).$$typeof === LAZY) {
    try {
      type = (type as LazyType)._init((type as LazyType)._payload);
    } catch {
      return false;
    }
  }
  return type === component;
}

/** Flattens fragments so `items.map(item => <>…</>)` collapses like plain children. */
function flatten(children: React.ReactNode, prefix = ""): React.ReactNode[] {
  return React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<{ children?: React.ReactNode }>(child)) return [child];
    const key = `${prefix}${child.key ?? ""}`;
    if (child.type === React.Fragment) return flatten(child.props.children, key);
    return [prefix ? React.cloneElement(child, { key }) : child];
  });
}

export interface BreadcrumbProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /**
   * Collapse the middle of the trail when it has more items than this. The first item and the
   * last `maxItems - 1` stay; the rest fold into an ellipsis button that expands inline.
   */
  maxItems?: number;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, style, color, maxItems, children, "aria-label": ariaLabel, ...props }, ref) => {
    const context = React.useMemo(() => ({ maxItems }), [maxItems]);

    return (
      <BreadcrumbContext.Provider value={context}>
        <nav
          ref={ref}
          aria-label={ariaLabel ?? "Breadcrumb"}
          style={neonVars(color, style)}
          className={cn("[--neon:var(--neon-accent,34_211_238)]", className)}
          {...props}
        >
          {maxItems != null && <style>{keyframes}</style>}
          {children}
        </nav>
      </BreadcrumbContext.Provider>
    );
  },
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.OlHTMLAttributes<HTMLOListElement>>(
  ({ className, children, ...props }, ref) => {
    const { maxItems } = React.useContext(BreadcrumbContext);
    const listRef = React.useRef<HTMLOListElement>(null);
    const mergedRef = React.useCallback(
      (node: HTMLOListElement | null) => {
        setRef(ref, node);
        listRef.current = node;
      },
      [ref],
    );
    const focusRevealed = React.useRef(false);
    // Remember which trail was expanded, so navigating to a new path collapses again.
    const [expandedFor, setExpandedFor] = React.useState<string | null>(null);

    const nodes = flatten(children);
    const itemIndexes = nodes.flatMap((node, index) => (isElementOf(node, BreadcrumbItem) ? [index] : []));
    const count = itemIndexes.length;
    const trail = itemIndexes.map((index) => (nodes[index] as React.ReactElement).key).join("|");
    const limit = maxItems == null ? Infinity : Math.max(2, Math.floor(maxItems));
    const overflowing = count > limit;
    const collapsed = overflowing && expandedFor !== trail;

    // Everything between the first item and the trailing items folds away.
    const headEnd = overflowing ? itemIndexes[0] : -1;
    const tailStart = overflowing ? itemIndexes[count - (limit - 1)] : -1;
    const hidden = overflowing ? nodes.slice(headEnd + 1, tailStart) : [];
    const isSeparator = (node: React.ReactNode) => isElementOf(node, BreadcrumbSeparator);
    const leadingSeparator = isSeparator(hidden[0]) ? hidden[0] : null;
    const trailingSeparator =
      hidden.length > 1 && isSeparator(hidden[hidden.length - 1]) ? hidden[hidden.length - 1] : null;

    React.useEffect(() => {
      if (collapsed || !focusRevealed.current) return;
      focusRevealed.current = false;
      listRef.current
        ?.querySelector<HTMLElement>("[data-revealed] a, [data-revealed] button, [data-revealed] [tabindex]")
        ?.focus();
    }, [collapsed]);

    let content: React.ReactNode[] = nodes;

    if (collapsed) {
      const hiddenItems = count - limit;
      content = [
        ...nodes.slice(0, headEnd + 1),
        leadingSeparator,
        <BreadcrumbItem key="nk-breadcrumb-ellipsis">
          <BreadcrumbEllipsis
            aria-label={`Show ${hiddenItems} more ${hiddenItems === 1 ? "item" : "items"}`}
            onClick={() => {
              focusRevealed.current = true;
              setExpandedFor(trail);
            }}
          />
        </BreadcrumbItem>,
        trailingSeparator &&
          React.cloneElement(trailingSeparator as React.ReactElement, { key: "nk-breadcrumb-ellipsis-separator" }),
        ...nodes.slice(tailStart),
      ];
    } else if (overflowing) {
      let step = 0;
      content = nodes.map((node, index) => {
        const revealed = index > headEnd && index < tailStart && node !== leadingSeparator;
        if (!revealed || !React.isValidElement<React.HTMLAttributes<HTMLElement>>(node)) return node;
        return React.cloneElement(node, {
          "data-revealed": "",
          className: cn(node.props.className, revealClass),
          style: { ...node.props.style, animationDelay: `${step++ * 28}ms` },
        } as React.HTMLAttributes<HTMLElement>);
      });
    }

    return (
      <ol
        ref={mergedRef}
        className={cn(
          "flex flex-wrap items-center gap-1.5 break-words text-sm leading-5 text-white/55 sm:gap-2",
          className,
        )}
        {...props}
      >
        {content}
      </ol>
    );
  },
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={cn("inline-flex min-w-0 items-center gap-1.5", className)} {...props} />
  ),
);
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Merge the link styles onto the single child element, such as your router's Link. */
  asChild?: boolean;
  /** Base UI-style asChild: `render={<Link href="/" />}`. */
  render?: React.ReactElement;
  /** Accepted for Base UI compatibility; no effect. */
  nativeButton?: boolean;
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  (raw, ref) => {
    const { className, asChild = false, children, ...props } = fromRenderProp(raw);
    const child =
      asChild ? resolveElement<React.HTMLAttributes<HTMLElement>>(children) : null;
    const childRef = child ? getElementRef<HTMLAnchorElement>(child) : undefined;
    const mergedRef = React.useCallback(
      (node: HTMLAnchorElement | null) => {
        setRef(ref, node);
        setRef(childRef, node);
      },
      [ref, childRef],
    );

    const classes = cn(
      "inline-flex min-w-0 items-center gap-1.5 rounded-md text-white/55 outline-none",
      "transition-[color,text-shadow] duration-150 ease-out hover:text-white/90",
      "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
      "[&_svg]:size-3.5 [&_svg]:shrink-0",
      className,
    );

    if (child) {
      return React.cloneElement(child, {
        ...props,
        ...child.props,
        className: cn(classes, child.props.className),
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          child.props.onClick?.(event);
          if (!event.defaultPrevented) props.onClick?.(event as React.MouseEvent<HTMLAnchorElement>);
        },
        ref: mergedRef,
      } as React.HTMLAttributes<HTMLElement>);
    }

    return (
      <a ref={ref} className={classes} {...props}>
        {children}
      </a>
    );
  },
);
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      aria-current="page"
      className={cn(
        "inline-flex min-w-0 items-center gap-1.5 font-medium text-[rgb(var(--neon))]",
        "[text-shadow:0_0_12px_rgb(var(--neon)/CALC(0.5*var(--neon-glow,1)))] [&_svg]:size-3.5 [&_svg]:shrink-0",
        "[&_svg]:[filter:drop-shadow(0_0_4px_rgb(var(--neon)/CALC(0.6*var(--neon-glow,1))))]",
        className,
      )}
      {...props}
    />
  ),
);
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn("inline-flex select-none items-center text-white/25 [&_svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  ),
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, children, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label="Show more"
      className={cn(
        "inline-flex h-6 w-7 cursor-pointer items-center justify-center rounded-md text-white/50 outline-none",
        "transition-[background-color,color,box-shadow,transform] duration-150 ease-out active:scale-[0.97]",
        "hover:bg-[rgb(var(--neon)/0.1)] hover:text-[rgb(var(--neon))] hover:shadow-[0_0_12px_rgb(var(--neon)/CALC(0.2*var(--neon-glow,1)))]",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
        "[&_svg]:size-4",
        className,
      )}
      {...props}
    >
      {children ?? <Ellipsis />}
    </button>
  ),
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
