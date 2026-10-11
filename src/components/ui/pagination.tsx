"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Ellipsis } from "lucide-react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const EASE = [0.23, 1, 0.32, 1] as const;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const sizes = {
  sm: { control: "h-8 min-w-8 rounded-md px-1.5 text-xs [&_svg]:size-3.5", gap: "gap-1", radius: 6, status: "text-xs" },
  md: { control: "h-10 min-w-10 rounded-lg px-2 text-sm [&_svg]:size-4", gap: "gap-1", radius: 8, status: "text-sm" },
  lg: { control: "h-12 min-w-12 rounded-xl px-2.5 text-base [&_svg]:size-[18px]", gap: "gap-1.5", radius: 12, status: "text-base" },
} as const;

type PageItem = number | "ellipsis";

function range(start: number, end: number) {
  return end < start ? [] : Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

/**
 * Pages to show, with ellipses. Once the window starts sliding the number of
 * slots stays constant, so the control never changes width mid-range.
 */
function getItems(page: number, count: number, siblingCount: number, boundaryCount: number): PageItem[] {
  const startPages = range(1, Math.min(boundaryCount, count));
  const endPages = range(Math.max(count - boundaryCount + 1, boundaryCount + 1), count);

  const siblingsStart = Math.max(
    Math.min(page - siblingCount, count - boundaryCount - siblingCount * 2 - 1),
    boundaryCount + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(page + siblingCount, boundaryCount + siblingCount * 2 + 2),
    endPages.length > 0 ? endPages[0] - 2 : count - 1,
  );

  return [
    ...startPages,
    ...(siblingsStart > boundaryCount + 2
      ? (["ellipsis"] as const)
      : boundaryCount + 1 < count - boundaryCount
        ? [boundaryCount + 1]
        : []),
    ...range(siblingsStart, siblingsEnd),
    ...(siblingsEnd < count - boundaryCount - 1
      ? (["ellipsis"] as const)
      : count - boundaryCount > boundaryCount
        ? [count - boundaryCount]
        : []),
    ...endPages,
  ];
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const controlBase = cn(
  "relative inline-flex shrink-0 cursor-pointer select-none items-center justify-center whitespace-nowrap font-medium tabular-nums outline-none",
  "transition-[background-color,border-color,color,text-shadow,transform,scale] duration-150 ease-out active:scale-[0.97]",
  "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
);

interface PageControlProps {
  href?: string;
  disabled?: boolean;
  onActivate: (event: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  children: React.ReactNode;
  "aria-label"?: string;
  "aria-current"?: "page";
}

/** A link when the pagination has `getHref`, otherwise a button. */
function PageControl({ href, disabled, onActivate, className, children, ...aria }: PageControlProps) {
  if (href !== undefined) {
    return (
      <a
        href={disabled ? undefined : href}
        role={disabled ? "link" : undefined}
        aria-disabled={disabled || undefined}
        onClick={(event) => {
          if (disabled) {
            event.preventDefault();
            return;
          }
          // Let modified clicks open a new tab without changing this one.
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
          onActivate(event);
        }}
        className={cn(className, disabled && "pointer-events-none opacity-35")}
        {...aria}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onActivate}
      className={cn(className, "disabled:pointer-events-none disabled:opacity-35")}
      {...aria}
    >
      {children}
    </button>
  );
}

/** A number that rolls out and the next one in when the value changes. */
function Rolling({
  value,
  direction,
  axis,
  reduceMotion,
}: {
  value: number;
  direction: number;
  axis: "x" | "y";
  reduceMotion: boolean;
}) {
  const offset = reduceMotion ? 0 : axis === "x" ? 6 : 8;

  return (
    <span className="relative inline-grid justify-items-center">
      <AnimatePresence initial={false} custom={direction}>
        <motion.span
          key={value}
          custom={direction}
          variants={{
            enter: (dir: number) => ({ [axis]: dir * offset, opacity: 0 }),
            center: { [axis]: 0, opacity: 1 },
            exit: (dir: number) => ({ [axis]: dir * -offset, opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: reduceMotion ? 0.1 : 0.2, ease: EASE }}
          className="[grid-area:1/1]"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export interface PaginationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color" | "onChange"> {
  /** Total number of pages. */
  pageCount: number;
  /** Current page (1-based) when controlled. */
  page?: number;
  /** Initial page when uncontrolled. */
  defaultPage?: number;
  onPageChange?: (page: number) => void;
  /** Pages shown on each side of the current one. */
  siblingCount?: number;
  /** Pages always shown at the start and end. */
  boundaryCount?: number;
  /** Render links instead of buttons, e.g. `(page) => \`?page=${page}\``. */
  getHref?: (page: number) => string;
  size?: keyof typeof sizes;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Leave unset to show page numbers from `sm` up and the compact control below it. */
  variant?: "default" | "compact";
}

const Pagination = React.forwardRef<HTMLElement, PaginationProps>(
  (
    {
      className,
      style,
      color,
      pageCount,
      page: pageProp,
      defaultPage = 1,
      onPageChange,
      siblingCount = 1,
      boundaryCount = 1,
      getHref,
      size = "md",
      variant,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const id = React.useId();
    const reduceMotion = useReducedMotion() ?? false;
    const s = sizes[size];

    const navRef = React.useRef<HTMLElement>(null);
    const mergedRef = React.useCallback(
      (node: HTMLElement | null) => {
        navRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );
    const refocus = React.useRef(false);

    const count = Math.max(1, Math.floor(pageCount) || 1);
    const [uncontrolled, setUncontrolled] = React.useState(defaultPage);
    const current = clamp(Math.floor(pageProp ?? uncontrolled) || 1, 1, count);

    // Direction of travel, so numbers roll the right way.
    const [previous, setPrevious] = React.useState(current);
    const [direction, setDirection] = React.useState(1);
    if (previous !== current) {
      setPrevious(current);
      setDirection(current > previous ? 1 : -1);
    }

    // Slots keep their elements while the window slides, so the number under a
    // focused slot can change. Hand focus to the page that was picked.
    useIsomorphicLayoutEffect(() => {
      if (!refocus.current) return;
      refocus.current = false;
      navRef.current?.querySelector<HTMLElement>('[aria-current="page"]')?.focus();
    }, [current]);

    const goTo = (next: number) => {
      const target = clamp(next, 1, count);
      if (target === current) return;
      if (pageProp === undefined) setUncontrolled(target);
      onPageChange?.(target);
    };

    const items = getItems(current, count, Math.max(0, siblingCount), Math.max(0, boundaryCount));
    const hrefFor = (target: number) => (getHref ? getHref(clamp(target, 1, count)) : undefined);

    const arrow = cn(
      controlBase,
      s.control,
      "border border-white/10 bg-white/[0.02] text-white/60 hover:border-white/20 hover:bg-white/[0.05] hover:text-white/90",
    );

    const previousControl = (
      <PageControl
        href={hrefFor(current - 1)}
        disabled={current <= 1}
        onActivate={() => goTo(current - 1)}
        aria-label="Previous page"
        className={arrow}
      >
        <ChevronLeft aria-hidden />
      </PageControl>
    );

    const nextControl = (
      <PageControl
        href={hrefFor(current + 1)}
        disabled={current >= count}
        onActivate={() => goTo(current + 1)}
        aria-label="Next page"
        className={arrow}
      >
        <ChevronRight aria-hidden />
      </PageControl>
    );

    const full = (
      <ul className={cn("items-center", s.gap, variant ? "flex" : "hidden sm:flex")}>
        <li>{previousControl}</li>
        {items.map((item, slot) =>
          item === "ellipsis" ? (
            <li key={slot} aria-hidden="true">
              <span className={cn("inline-flex items-center justify-center text-white/30", s.control)}>
                <Ellipsis />
              </span>
            </li>
          ) : (
            <li key={slot}>
              <PageControl
                href={hrefFor(item)}
                onActivate={(event) => {
                  if (event.currentTarget === document.activeElement) refocus.current = true;
                  goTo(item);
                }}
                aria-label={`Page ${item}`}
                aria-current={item === current ? "page" : undefined}
                className={cn(
                  controlBase,
                  s.control,
                  item === current
                    ? "text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]"
                    : "text-white/60 hover:bg-white/[0.05] hover:text-white/90",
                )}
              >
                {item === current && (
                  <motion.span
                    aria-hidden
                    layoutId={reduceMotion ? undefined : `${id}-active`}
                    initial={false}
                    transition={{ duration: 0.3, ease: EASE }}
                    // Inline so motion keeps the corners round while the pill moves.
                    style={{ borderRadius: s.radius }}
                    className="absolute inset-0 border border-[rgb(var(--neon)/0.55)] bg-[rgb(var(--neon)/0.12)] shadow-[0_0_16px_rgb(var(--neon)/0.28),inset_0_0_10px_rgb(var(--neon)/0.12)]"
                  />
                )}
                <Rolling value={item} direction={direction} axis="x" reduceMotion={reduceMotion} />
              </PageControl>
            </li>
          ),
        )}
        <li>{nextControl}</li>
      </ul>
    );

    const compact = (
      <div className={cn("items-center", s.gap, variant ? "flex" : "flex sm:hidden")}>
        {previousControl}
        <span aria-hidden className={cn("flex items-center gap-1.5 px-2 text-white/55", s.status)}>
          Page
          <span className="font-medium tabular-nums text-[rgb(var(--neon))] [text-shadow:0_0_10px_rgb(var(--neon)/0.6)]">
            <Rolling value={current} direction={direction} axis="y" reduceMotion={reduceMotion} />
          </span>
          of <span className="tabular-nums text-white/80">{count}</span>
        </span>
        <span className="sr-only" aria-live="polite">
          Page {current} of {count}
        </span>
        {nextControl}
      </div>
    );

    return (
      <nav
        ref={mergedRef}
        aria-label={ariaLabel ?? "Pagination"}
        style={neonVars(color, style)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "flex items-center", className)}
        {...props}
      >
        {variant !== "compact" && full}
        {variant !== "default" && compact}
      </nav>
    );
  },
);
Pagination.displayName = "Pagination";

export { Pagination };
