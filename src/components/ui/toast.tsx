"use client";

import * as React from "react";
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react";
import {
  CircleAlert,
  CircleCheck,
  Info,
  LoaderCircle,
  TriangleAlert,
  X,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

export type ToastStatus = "default" | "success" | "error" | "warning" | "info" | "loading";

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** Pass the id of a visible toast to update it in place. */
  id?: string;
  description?: React.ReactNode;
  status?: ToastStatus;
  /** Palette name or hex. Overrides the status color. */
  color?: NeonColor;
  /** Milliseconds on screen. `Infinity` keeps it until dismissed. */
  duration?: number;
  action?: ToastAction;
}

export interface ToastPromiseMessages<T> {
  loading: React.ReactNode;
  success: React.ReactNode | ((data: T) => React.ReactNode);
  error: React.ReactNode | ((error: unknown) => React.ReactNode);
}

interface ToastRecord {
  id: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  status: ToastStatus;
  color?: NeonColor;
  duration: number;
  action?: ToastAction;
  /** Bumped on every update so the timer restarts. */
  version: number;
}

const EASE = [0.23, 1, 0.32, 1] as const;
const DEFAULT_DURATION = 4000;
const STACK_OFFSET = 10;
const GAP = 8;
const ENTER_OFFSET = 16;
const SWIPE_DISTANCE = 72;

const statusColors: Partial<Record<ToastStatus, NeonColor>> = {
  success: "green",
  error: "red",
  warning: "amber",
  info: "cyan",
};

const statusIcons: Partial<Record<ToastStatus, LucideIcon>> = {
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
  loading: LoaderCircle,
};

let toasts: ToastRecord[] = [];
let toasters: string[] = [];
let count = 0;
const listeners = new Set<() => void>();
const noToasts: ToastRecord[] = [];

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const getToasts = () => toasts;
const getServerToasts = () => noToasts;
const getActiveToaster = () => toasters[toasters.length - 1] ?? null;
const getServerToaster = () => null;

// Only the most recently mounted Toaster renders, so a second one never doubles every toast.
function registerToaster(id: string) {
  toasters = [...toasters, id];
  emit();
  return () => {
    toasters = toasters.filter((toaster) => toaster !== id);
    emit();
  };
}

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

const getPageHidden = () => document.hidden;
const getServerPageHidden = () => false;

function show(title: React.ReactNode, options: ToastOptions = {}): string {
  const { id = `toast-${++count}`, status = "default", duration, ...rest } = options;
  const existing = toasts.find((item) => item.id === id);
  const record: ToastRecord = {
    ...rest,
    id,
    title,
    status,
    duration: duration ?? (status === "loading" ? Infinity : DEFAULT_DURATION),
    version: existing ? existing.version + 1 : 0,
  };

  toasts = existing
    ? toasts.map((item) => (item.id === id ? record : item))
    : [record, ...toasts];
  emit();
  return id;
}

function dismiss(id?: string) {
  toasts = id === undefined ? [] : toasts.filter((item) => item.id !== id);
  emit();
}

type StatusOptions = Omit<ToastOptions, "status">;

function withStatus(status: ToastStatus) {
  return (title: React.ReactNode, options?: StatusOptions) => show(title, { ...options, status });
}

function resolveMessage<A>(message: React.ReactNode | ((arg: A) => React.ReactNode), arg: A) {
  return typeof message === "function" ? message(arg) : message;
}

function promise<T>(
  task: Promise<T> | (() => Promise<T>),
  messages: ToastPromiseMessages<T>,
  options: StatusOptions = {},
): Promise<T> {
  const id = show(messages.loading, { ...options, status: "loading", duration: Infinity });
  const pending = typeof task === "function" ? task() : task;

  pending.then(
    (data) => {
      show(resolveMessage(messages.success, data), { ...options, id, status: "success" });
    },
    (error: unknown) => {
      show(resolveMessage(messages.error, error), { ...options, id, status: "error" });
    },
  );

  return pending;
}

const toast = Object.assign(show, {
  success: withStatus("success"),
  error: withStatus("error"),
  warning: withStatus("warning"),
  info: withStatus("info"),
  loading: withStatus("loading"),
  dismiss,
  promise,
});

const positions: Record<ToastPosition, string> = {
  "top-left": "left-4 top-4",
  "top-center": "inset-x-0 top-4 mx-auto",
  "top-right": "right-4 top-4",
  "bottom-left": "bottom-4 left-4",
  "bottom-center": "inset-x-0 bottom-4 mx-auto",
  "bottom-right": "bottom-4 right-4",
};

type StackTarget = {
  y: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
};

export interface ToasterProps extends Omit<React.HTMLAttributes<HTMLElement>, "color"> {
  position?: ToastPosition;
  /** Toasts visible at once. Older ones keep their timers but stay hidden. */
  max?: number;
  /** Color of default and loading toasts. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const Toaster = React.forwardRef<HTMLElement, ToasterProps>(
  ({ position = "bottom-right", max = 3, color, className, style, ...props }, ref) => {
    const id = React.useId();
    const items = React.useSyncExternalStore(subscribe, getToasts, getServerToasts);
    const activeId = React.useSyncExternalStore(subscribe, getActiveToaster, getServerToaster);
    const pageHidden = React.useSyncExternalStore(
      subscribeVisibility,
      getPageHidden,
      getServerPageHidden,
    );
    const reduceMotion = useReducedMotion() ?? false;
    const sectionRef = React.useRef<HTMLElement>(null);
    const returnFocus = React.useRef<HTMLElement | null>(null);
    const [heights, setHeights] = React.useState<Record<string, number>>({});
    const [hovered, setHovered] = React.useState(false);
    const [focused, setFocused] = React.useState(false);

    React.useImperativeHandle(ref, () => sectionRef.current as HTMLElement);
    React.useEffect(() => registerToaster(id), [id]);

    const measure = React.useCallback((toastId: string, height: number) => {
      setHeights((prev) => (prev[toastId] === height ? prev : { ...prev, [toastId]: height }));
    }, []);

    const releaseFocus = React.useCallback(() => {
      const target = returnFocus.current;
      returnFocus.current = null;
      setFocused(false);
      if (target?.isConnected) target.focus({ preventScroll: true });
    }, []);

    if (activeId !== id) return null;

    // A removed toast never fires pointerleave or blur, so re-check once exits settle.
    const syncInteraction = () => {
      const node = sectionRef.current;
      if (!node) return;
      setHovered(node.matches(":hover"));
      if (!node.contains(document.activeElement)) setFocused(false);
    };

    const fromTop = position.startsWith("top");
    const dir = fromTop ? 1 : -1;
    const limit = Math.max(1, max);
    const expanded = (hovered || focused) && items.length > 0;
    const frontHeight = items.length > 0 ? (heights[items[0].id] ?? 0) : 0;

    const targets: StackTarget[] = [];
    let offset = 0;

    for (let index = 0; index < items.length; index++) {
      const height = heights[items[index].id] ?? 0;
      const visible = index < limit;
      const slot = Math.min(index, limit);

      if (expanded && visible) {
        targets.push({ y: dir * offset, scaleX: 1, scaleY: 1, opacity: 1 });
      } else if (slot === 0) {
        targets.push({ y: 0, scaleX: 1, scaleY: 1, opacity: 1 });
      } else {
        const edge = frontHeight + STACK_OFFSET * slot;
        const scale = 1 - 0.05 * slot;
        targets.push({
          y: dir * (edge - height),
          scaleX: scale,
          // Squash taller toasts so they never poke out past the front one.
          scaleY: height > 0 ? Math.min(scale, edge / height) : scale,
          opacity: visible ? 1 - 0.18 * slot : 0,
        });
      }

      offset += height + GAP;
    }

    return (
      <section
        ref={sectionRef}
        aria-label="Notifications"
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "fixed z-[100] w-[min(356px,calc(100vw_-_32px))]",
          positions[position],
          className,
        )}
        {...props}
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch") setHovered(true);
        }}
        onPointerLeave={() => setHovered(false)}
        onFocus={(event) => {
          if (focused || !(event.target as HTMLElement).matches(":focus-visible")) return;
          const from = event.relatedTarget;
          returnFocus.current =
            from instanceof HTMLElement && !event.currentTarget.contains(from) ? from : null;
          setFocused(true);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        <ol className="relative m-0 list-none p-0">
          <AnimatePresence onExitComplete={syncInteraction}>
            {items.map((item, index) => (
              <ToastItem
                key={item.id}
                toast={item}
                target={targets[index]}
                active={index === 0 || (expanded && index < limit)}
                paused={expanded || pageHidden}
                dir={dir}
                closeSide={position.endsWith("left") ? "left" : "right"}
                zIndex={items.length - index}
                reduceMotion={reduceMotion}
                onMeasure={measure}
                onReleaseFocus={releaseFocus}
              />
            ))}
          </AnimatePresence>
        </ol>
      </section>
    );
  },
);
Toaster.displayName = "Toaster";

interface ToastItemProps {
  toast: ToastRecord;
  target: StackTarget;
  /** Content is readable and the toast can be swiped. */
  active: boolean;
  paused: boolean;
  dir: 1 | -1;
  closeSide: "left" | "right";
  zIndex: number;
  reduceMotion: boolean;
  onMeasure: (id: string, height: number) => void;
  onReleaseFocus: () => void;
}

function ToastItem({
  toast: item,
  target,
  active,
  paused,
  dir,
  closeSide,
  zIndex,
  reduceMotion,
  onMeasure,
  onReleaseFocus,
}: ToastItemProps) {
  const { id, status, duration, version } = item;
  const ref = React.useRef<HTMLLIElement>(null);
  const remaining = React.useRef(duration);
  const [dragging, setDragging] = React.useState(false);
  const x = useMotionValue(0);
  const swipeOpacity = useTransform(x, [-220, 0, 220], [0, 1, 0]);
  const Icon = statusIcons[status];
  const isError = status === "error";
  const hidden = target.opacity === 0;

  React.useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const report = () => onMeasure(id, node.offsetHeight);
    report();
    const observer = new ResizeObserver(report);
    observer.observe(node);
    return () => observer.disconnect();
  }, [id, onMeasure]);

  React.useEffect(() => {
    remaining.current = duration;
  }, [duration, version]);

  React.useEffect(() => {
    if (paused || dragging || !Number.isFinite(duration)) return;
    const startedAt = Date.now();
    const timer = window.setTimeout(() => dismiss(id), Math.max(0, remaining.current));
    return () => {
      window.clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [id, duration, version, paused, dragging]);

  function remove() {
    if (ref.current?.contains(document.activeElement)) onReleaseFocus();
    dismiss(id);
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    setDragging(false);
    const flick = Math.abs(info.velocity.x) > 500 && Math.abs(info.offset.x) > 16;
    if (!flick && Math.abs(info.offset.x) < SWIPE_DISTANCE) return;

    const direction = flick ? Math.sign(info.velocity.x) : Math.sign(info.offset.x);
    const width = ref.current?.offsetWidth ?? 356;
    animate(x, direction * (width + 32), { duration: 0.2, ease: EASE });
    remove();
  }

  return (
    <motion.li
      ref={ref}
      role={isError ? "alert" : "status"}
      aria-live={isError ? undefined : "polite"}
      aria-atomic="true"
      aria-hidden={hidden || undefined}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -dir * ENTER_OFFSET }}
      animate={target}
      exit={{
        opacity: 0,
        scale: reduceMotion ? 1 : 0.96,
        transition: { duration: 0.2, ease: EASE },
      }}
      transition={
        reduceMotion ? { duration: 0, opacity: { duration: 0.15 } } : { duration: 0.26, ease: EASE }
      }
      style={{
        ...neonVars(item.color ?? statusColors[status]),
        zIndex,
        transformOrigin: dir === -1 ? "50% 0%" : "50% 100%",
      }}
      className={cn(
        "absolute inset-x-0",
        dir === -1 ? "bottom-0" : "top-0",
        hidden && "pointer-events-none",
      )}
    >
      {/* Bridges the gap between expanded toasts so the stack doesn't collapse mid-move. */}
      <div aria-hidden className={cn("absolute inset-x-0 h-2", dir === -1 ? "bottom-full" : "top-full")} />

      <motion.div
        drag={active && !hidden ? "x" : false}
        dragSnapToOrigin
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ x, opacity: swipeOpacity }}
        className={cn(
          "group relative rounded-xl border border-white/10 bg-[#0a0b11] text-white/90",
          "shadow-[0_18px_40px_-14px_rgb(0_0_0/0.9),0_4px_12px_-6px_rgb(0_0_0/0.7),inset_0_1px_0_rgb(255_255_255/0.04)]",
        )}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -left-px bottom-3.5 top-3.5 w-px rounded-full bg-[rgb(var(--neon))] shadow-[0_0_8px_rgb(var(--neon)/0.7)]"
        />

        <motion.div
          initial={false}
          animate={{ opacity: active ? 1 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: EASE }}
          className="relative flex items-start gap-3 p-4"
        >
          {Icon && (
            <motion.span
              key={status}
              initial={version > 0 && !reduceMotion ? { opacity: 0, scale: 0.9 } : false}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, ease: EASE }}
              className="mt-0.5 flex shrink-0 text-[rgb(var(--neon))] [filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.6))]"
            >
              <Icon className={cn("size-4", status === "loading" && "animate-spin")} aria-hidden />
            </motion.span>
          )}

          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium leading-5 text-white/90">{item.title}</div>
            {item.description && (
              <div className="mt-0.5 text-[13px] leading-5 text-white/55">{item.description}</div>
            )}
          </div>

          {item.action && (
            <button
              type="button"
              tabIndex={hidden ? -1 : undefined}
              onClick={() => {
                item.action?.onClick();
                remove();
              }}
              className={cn(
                "h-7 shrink-0 self-center rounded-md bg-[rgb(var(--neon)/0.12)] px-2.5 text-xs font-medium text-[rgb(var(--neon))] outline-none",
                "transition-[background-color,transform] duration-150 ease-out hover:bg-[rgb(var(--neon)/0.2)] active:scale-[0.97]",
                "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0b11]",
              )}
            >
              {item.action.label}
            </button>
          )}

          <button
            type="button"
            aria-label="Close"
            tabIndex={hidden ? -1 : undefined}
            onClick={remove}
            className={cn(
              "absolute -top-2 flex size-5 items-center justify-center rounded-full border border-white/15 bg-[#0a0b11] text-white/55 outline-none",
              "shadow-[0_2px_6px_rgb(0_0_0/0.5)] transition-[opacity,color,background-color] duration-150 ease-out",
              "opacity-0 hover:bg-[#151722] hover:text-white/90 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100",
              "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
              "after:absolute after:-inset-2 after:content-['']",
              closeSide === "left" ? "-left-2" : "-right-2",
              !active && "pointer-events-none",
            )}
          >
            <X className="size-3" strokeWidth={2.5} aria-hidden />
          </button>
        </motion.div>
      </motion.div>
    </motion.li>
  );
}

export { Toaster, toast };
