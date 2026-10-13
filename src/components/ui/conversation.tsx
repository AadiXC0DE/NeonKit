"use client";

import * as React from "react";
import { ArrowDown } from "@/components/ui/icons";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

const reducedQuery = "(prefers-reduced-motion: reduce)";

function prefersReducedMotion() {
  return typeof window !== "undefined" && !!window.matchMedia?.(reducedQuery).matches;
}

/** Items are the content's element children, minus dividers. */
function countItems(content: HTMLElement | null) {
  if (!content) return 0;
  let count = 0;
  for (const child of Array.from(content.children)) {
    if (!(child as HTMLElement).hasAttribute("data-conversation-divider")) count++;
  }
  return count;
}

export interface ConversationActions {
  /** Scrolls to the newest content and follows it again. */
  scrollToBottom: (behavior?: "smooth" | "instant") => void;
  isAtBottom: () => boolean;
}

export interface ConversationProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  /** Shown instead of the messages when there are none. */
  empty?: React.ReactNode;
  /** A reply is arriving. Holds screen reader announcements until it's done. */
  streaming?: boolean;
  /** Follow new content while the reader is at the bottom. */
  autoScroll?: boolean;
  /** Pixels from the bottom that still count as "at the bottom". */
  threshold?: number;
  /** Where to start on mount. */
  initialScroll?: "bottom" | "top";
  /** Text on the pill that appears after scrolling up. */
  jumpLabel?: string;
  /** Classes for the inner column holding the messages. */
  contentClassName?: string;
  /** Imperative scroll controls. */
  actionsRef?: React.Ref<ConversationActions>;
  /** Called when following the bottom starts or stops. */
  onStickChange?: (stuck: boolean) => void;
  color?: NeonColor;
}

const Conversation = React.forwardRef<HTMLDivElement, ConversationProps>(
  (
    {
      empty,
      streaming = false,
      autoScroll = true,
      threshold = 56,
      initialScroll = "bottom",
      jumpLabel = "Jump to latest",
      contentClassName,
      actionsRef,
      onStickChange,
      className,
      style,
      color,
      children,
      ...props
    },
    ref,
  ) => {
    const scrollerRef = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    const stuck = React.useRef(initialScroll === "bottom");
    const lastTop = React.useRef(0);
    const baseCount = React.useRef(0);
    const frame = React.useRef<number | null>(null);
    const onStickChangeRef = React.useRef(onStickChange);
    const autoScrollRef = React.useRef(autoScroll);
    const [atBottom, setAtBottom] = React.useState(true);
    const [scrolled, setScrolled] = React.useState(false);
    const [unread, setUnread] = React.useState(0);
    const [following, setFollowing] = React.useState(initialScroll === "bottom");

    React.useEffect(() => {
      onStickChangeRef.current = onStickChange;
      autoScrollRef.current = autoScroll;
    });

    const isEmpty = React.Children.toArray(children).length === 0;

    const setStuck = React.useCallback((next: boolean) => {
      if (stuck.current === next) return;
      stuck.current = next;
      setFollowing(next);
      if (!next) baseCount.current = countItems(contentRef.current);
      else setUnread(0);
      onStickChangeRef.current?.(next);
    }, []);

    const stop = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
    };

    const glide = React.useCallback((behavior: "smooth" | "instant" = "smooth") => {
      const el = scrollerRef.current;
      if (!el) return;
      if (behavior === "instant" || prefersReducedMotion() || typeof requestAnimationFrame === "undefined") {
        stop();
        el.scrollTop = el.scrollHeight;
        return;
      }
      if (frame.current !== null) return; // Already gliding; it re-reads the target every frame.
      // Eases toward a target that keeps moving while text streams in, instead of jumping per chunk.
      const step = () => {
        const target = el.scrollHeight - el.clientHeight;
        const delta = target - el.scrollTop;
        if (Math.abs(delta) < 1 || !stuck.current) {
          frame.current = null;
          return;
        }
        el.scrollTop += Math.sign(delta) * Math.max(1, Math.abs(delta) * 0.2);
        frame.current = requestAnimationFrame(step);
      };
      frame.current = requestAnimationFrame(step);
    }, []);

    const scrollToBottom = React.useCallback(
      (behavior: "smooth" | "instant" = "smooth") => {
        setStuck(true);
        glide(behavior);
      },
      [glide, setStuck],
    );

    React.useImperativeHandle(
      actionsRef,
      () => ({
        scrollToBottom,
        isAtBottom: () => stuck.current,
      }),
      [scrollToBottom],
    );

    useIsomorphicLayoutEffect(() => {
      const el = scrollerRef.current;
      if (el && initialScroll === "bottom") el.scrollTop = el.scrollHeight;
    }, []);

    React.useEffect(() => {
      const el = scrollerRef.current;
      const content = contentRef.current;
      if (!el || !content) return;

      const measure = () => {
        const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
        const top = el.scrollTop;
        // Moving up past the threshold is the reader leaving; content growing never moves scrollTop up.
        if (top < lastTop.current - 1 && distance > threshold) {
          stop();
          setStuck(false);
        }
        if (distance <= threshold) setStuck(true);
        lastTop.current = top;
        setAtBottom(distance <= threshold);
        setScrolled(top > 2);
      };

      const onWheel = (event: WheelEvent) => {
        if (event.deltaY < 0 && el.scrollHeight > el.clientHeight) {
          stop();
          setStuck(false);
        }
      };

      const onKey = (event: KeyboardEvent) => {
        if (event.key === "ArrowUp" || event.key === "PageUp" || event.key === "Home") {
          stop();
          setStuck(false);
        }
      };

      const follow = () => {
        if (stuck.current && autoScrollRef.current) glide();
        else if (!stuck.current) setUnread(Math.max(0, countItems(content) - baseCount.current));
        measure();
      };

      const resize = typeof ResizeObserver !== "undefined" ? new ResizeObserver(follow) : null;
      resize?.observe(content);
      resize?.observe(el);

      const mutations = typeof MutationObserver !== "undefined" ? new MutationObserver(follow) : null;
      mutations?.observe(content, { childList: true });

      if (!stuck.current) baseCount.current = countItems(content);
      el.addEventListener("scroll", measure, { passive: true });
      el.addEventListener("wheel", onWheel, { passive: true });
      el.addEventListener("keydown", onKey);
      measure();
      return () => {
        stop();
        resize?.disconnect();
        mutations?.disconnect();
        el.removeEventListener("scroll", measure);
        el.removeEventListener("wheel", onWheel);
        el.removeEventListener("keydown", onKey);
      };
    }, [glide, setStuck, threshold]);

    // While following, a glide toward new content can be mid-flight; that isn't "away from the bottom".
    const showJump = !atBottom && !following && !isEmpty;

    return (
      <div
        ref={ref}
        style={neonVars(color, style)}
        className={cn("[--neon:var(--neon-accent,34_211_238)]", "relative flex min-h-0 flex-col", className)}
        {...props}
      >
        <div
          ref={scrollerRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions"
          aria-busy={streaming || undefined}
          tabIndex={0}
          data-scrolled={scrolled || undefined}
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none",
            "[scrollbar-color:rgb(255_255_255/0.12)_transparent] [scrollbar-width:thin]",
            "data-[scrolled]:[mask-image:linear-gradient(to_bottom,transparent,black_32px)]",
            "focus-visible:shadow-[inset_0_0_0_1px_rgb(var(--neon)/0.5)]",
          )}
        >
          <div
            ref={contentRef}
            className={cn(
              "mx-auto flex w-full min-w-0 flex-col gap-7 px-4 py-6",
              isEmpty && "h-full justify-center",
              contentClassName,
            )}
          >
            {isEmpty ? empty : children}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 flex justify-center">
          <button
            type="button"
            tabIndex={showJump ? 0 : -1}
            aria-hidden={!showJump || undefined}
            aria-label={unread > 0 ? `${jumpLabel}, ${unread} new` : jumpLabel}
            onClick={() => scrollToBottom()}
            className={cn(
              "inline-flex h-8 cursor-pointer items-center gap-2 rounded-full border bg-[#10131b]/90 pl-2.5 pr-3 text-[13px] font-medium text-white/85 outline-none backdrop-blur-md",
              "shadow-[0_10px_30px_-10px_rgb(0_0_0/0.9)] transition-[opacity,transform,translate,border-color,box-shadow] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
              "hover:bg-[#151924] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
              unread > 0
                ? "border-[rgb(var(--neon)/0.45)] shadow-[0_0_20px_-6px_rgb(var(--neon)/0.6),0_10px_30px_-10px_rgb(0_0_0/0.9)]"
                : "border-white/[0.12]",
              showJump ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-2 opacity-0",
            )}
          >
            <ArrowDown aria-hidden className="size-3.5 text-white/60" />
            {jumpLabel}
            {unread > 0 && (
              <span
                aria-hidden
                className="-mr-1 ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[rgb(var(--neon))] px-1.5 text-[11px] font-semibold tabular-nums text-[#05060a] shadow-[0_0_10px_rgb(var(--neon)/0.7)]"
              >
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
        </div>
      </div>
    );
  },
);
Conversation.displayName = "Conversation";

export interface ConversationDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible label. Defaults to the text content when it's a string. */
  label?: string;
}

const ConversationDivider = React.forwardRef<HTMLDivElement, ConversationDividerProps>(
  ({ label, className, children, ...props }, ref) => (
    <div
      ref={ref}
      role="separator"
      aria-label={label ?? (typeof children === "string" ? children : undefined)}
      data-conversation-divider=""
      className={cn("flex items-center gap-3 text-xs text-[#8a93a6]", className)}
      {...props}
    >
      <span aria-hidden className="h-px flex-1 bg-white/[0.07]" />
      <span aria-hidden className="shrink-0 tabular-nums">
        {children}
      </span>
      <span aria-hidden className="h-px flex-1 bg-white/[0.07]" />
    </div>
  ),
);
ConversationDivider.displayName = "ConversationDivider";

export { Conversation, ConversationDivider };
