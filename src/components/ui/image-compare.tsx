"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

const clamp = (value: number) => Math.min(100, Math.max(0, value));
const round = (value: number) => Math.round(value * 10) / 10;

const HANDLE = 40;
// The tube stops short of the handle on both sides, like blockout paint where a tube passes behind.
const BLOCKOUT = 6;

function textOf(node: React.ReactNode) {
  return typeof node === "string" || typeof node === "number" ? String(node) : undefined;
}

export interface ImageCompareProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "defaultValue" | "onChange"> {
  /** Shown on the left (or top), up to the divider. */
  before: React.ReactNode;
  /** Shown on the right (or bottom). It sets the frame's size unless you give the root one. */
  after: React.ReactNode;
  /** Caption pinned to the before side. Also used in the slider's value text. */
  beforeLabel?: React.ReactNode;
  afterLabel?: React.ReactNode;
  /** Where the divider sits, 0 to 100, from the left (or top). */
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  /** Fires once a drag or key press ends. */
  onValueCommit?: (value: number) => void;
  orientation?: "horizontal" | "vertical";
  /** Follow the pointer without pressing. Touch still drags. */
  hover?: boolean;
  /** Percent moved by an arrow key. Page Up and Page Down move ten times as far. */
  step?: number;
  disabled?: boolean;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
}

const ImageCompare = React.forwardRef<HTMLDivElement, ImageCompareProps>(
  (
    {
      className,
      style,
      before,
      after,
      beforeLabel,
      afterLabel,
      value: valueProp,
      defaultValue = 50,
      onValueChange,
      onValueCommit,
      orientation = "horizontal",
      hover = false,
      step = 1,
      disabled = false,
      color,
      "aria-label": ariaLabel,
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
      ...props
    },
    ref,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(ref, () => rootRef.current as HTMLDivElement);
    const handleRef = React.useRef<HTMLDivElement>(null);
    const [uncontrolled, setUncontrolled] = React.useState(() => clamp(defaultValue));
    const value = clamp(valueProp ?? uncontrolled);
    const [dragging, setDragging] = React.useState(false);
    // A press away from the divider glides it over; dragging after that tracks 1:1.
    const [gliding, setGliding] = React.useState(false);
    const drag = React.useRef<{ id: number; start: number } | null>(null);
    const keyStart = React.useRef<number | null>(null);
    const vertical = orientation === "vertical";

    const setValue = (next: number) => {
      const v = round(clamp(next));
      if (v === value) return;
      if (valueProp === undefined) setUncontrolled(v);
      onValueChange?.(v);
    };

    const valueAt = (event: React.PointerEvent) => {
      const box = rootRef.current?.getBoundingClientRect();
      if (!box) return value;
      return vertical
        ? ((event.clientY - box.top) / box.height) * 100
        : ((event.clientX - box.left) / box.width) * 100;
    };

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerDown?.(event);
      if (disabled || event.defaultPrevented || event.button !== 0) return;
      event.preventDefault();
      handleRef.current?.focus({ preventScroll: true });
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id: event.pointerId, start: value };
      setDragging(true);
      const next = valueAt(event);
      const far = Math.abs(next - value) > 4;
      setGliding(far);
      setValue(next);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      onPointerMove?.(event);
      if (disabled) return;
      if (drag.current?.id === event.pointerId) {
        setGliding(false);
        setValue(valueAt(event));
        return;
      }
      if (hover && event.pointerType === "mouse" && !drag.current) {
        setGliding(false);
        setValue(valueAt(event));
      }
    };

    const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
      const d = drag.current;
      if (!d || d.id !== event.pointerId) return;
      drag.current = null;
      setDragging(false);
      if (value !== d.start) onValueCommit?.(value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      const big = step * 10;
      const delta: Record<string, number> = {
        ArrowLeft: -step,
        ArrowUp: -step,
        ArrowRight: step,
        ArrowDown: step,
        PageUp: -big,
        PageDown: big,
        Home: -Infinity,
        End: Infinity,
      };
      if (!(event.key in delta)) return;
      event.preventDefault();
      if (keyStart.current === null) keyStart.current = value;
      setGliding(event.key === "Home" || event.key === "End" || event.key.startsWith("Page"));
      setValue(value + delta[event.key]);
    };

    const handleKeyUp = () => {
      if (keyStart.current === null) return;
      if (value !== keyStart.current) onValueCommit?.(value);
      keyStart.current = null;
    };

    const beforeText = textOf(beforeLabel) ?? "Before";
    const afterText = textOf(afterLabel) ?? "After";
    const shown = Math.round(value);
    const ease = gliding
      ? "duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:duration-0"
      : "duration-0";
    const position = `${value}%`;
    // Clip is what shows the before layer: everything up to the divider.
    const clip = vertical ? `inset(0 0 ${100 - value}% 0)` : `inset(0 ${100 - value}% 0 0)`;
    const gapFromCenter = `calc(50% - ${HANDLE / 2 + BLOCKOUT}px)`;
    const label = "pointer-events-none absolute z-10 rounded-md bg-black/55 px-2 py-1 text-[12px] font-medium leading-4 text-white/90 backdrop-blur-md transition-opacity duration-200";

    return (
      <div
        ref={rootRef}
        data-orientation={orientation}
        data-state={dragging ? "dragging" : undefined}
        data-disabled={disabled ? "" : undefined}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "group/compare relative isolate select-none overflow-hidden rounded-xl bg-[#0a0b10]",
          "[&_img]:pointer-events-none [&_img]:select-none",
          vertical ? "touch-pan-x" : "touch-pan-y",
          disabled ? "cursor-default" : vertical ? "cursor-row-resize" : "cursor-col-resize",
          className,
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => {
          onPointerUp?.(event);
          endDrag(event);
        }}
        onPointerCancel={(event) => {
          onPointerCancel?.(event);
          endDrag(event);
        }}
        onPointerLeave={onPointerLeave}
        onDragStart={(event) => event.preventDefault()}
        {...props}
      >
        <div className="relative h-full w-full [&>img]:block [&>img]:h-full [&>img]:w-full [&>img]:object-cover">{after}</div>
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 transition-[clip-path] [&>img]:block [&>img]:h-full [&>img]:w-full [&>img]:object-cover",
            ease,
          )}
          style={{ clipPath: clip }}
        >
          {before}
        </div>

        {beforeLabel != null && (
          <span
            aria-hidden
            className={cn(label, "left-3 top-3")}
            style={{ opacity: value > (vertical ? 14 : 18) ? 1 : 0 }}
          >
            {beforeLabel}
          </span>
        )}
        {afterLabel != null && (
          <span
            aria-hidden
            className={cn(label, vertical ? "bottom-3 left-3" : "right-3 top-3")}
            style={{ opacity: value < (vertical ? 86 : 82) ? 1 : 0 }}
          >
            {afterLabel}
          </span>
        )}

        {/* The divider: a lit tube, end to end, with the handle riding on it */}
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute z-20 transition-[left,top]",
            vertical ? "inset-x-0 h-0" : "inset-y-0 w-0",
            ease,
          )}
          style={vertical ? { top: position } : { left: position }}
        >
          {[0, 1].map((side) => (
            <span
              key={side}
              className={cn(
                "absolute rounded-full transition-[box-shadow] duration-200",
                "[background:color-mix(in_srgb,rgb(var(--neon))_35%,white)]",
                "shadow-[0_0_2px_rgb(var(--neon)),0_0_8px_rgb(var(--neon)/0.8),0_0_22px_rgb(var(--neon)/0.4)]",
                "group-data-[state=dragging]/compare:shadow-[0_0_2px_rgb(var(--neon)),0_0_10px_rgb(var(--neon)),0_0_32px_rgb(var(--neon)/0.6)]",
                "group-data-[disabled]/compare:shadow-none group-data-[disabled]/compare:opacity-40",
                vertical ? "-top-px h-0.5" : "-left-px w-0.5",
              )}
              style={
                vertical
                  ? side === 0
                    ? { left: 0, right: `calc(100% - ${gapFromCenter})` }
                    : { right: 0, left: `calc(100% - ${gapFromCenter})` }
                  : side === 0
                    ? { top: 0, bottom: `calc(100% - ${gapFromCenter})` }
                    : { bottom: 0, top: `calc(100% - ${gapFromCenter})` }
              }
            />
          ))}
        </div>

        <div
          ref={handleRef}
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-label={ariaLabel ?? `${beforeText} and ${afterText}`}
          aria-orientation={orientation}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={shown}
          aria-valuetext={`${shown}% ${beforeText}, ${100 - shown}% ${afterText}`}
          aria-disabled={disabled || undefined}
          onKeyDown={handleKeyDown}
          onKeyUp={handleKeyUp}
          onBlur={() => setGliding(false)}
          className={cn(
            "absolute z-30 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full outline-none transition-[left,top,box-shadow,transform]",
            "border border-white/15 bg-[#0b0c11]/80 backdrop-blur-md",
            "shadow-[0_6px_20px_-6px_rgb(0_0_0/0.9),inset_0_1px_0_rgb(255_255_255/0.08)]",
            "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
            "group-data-[state=dragging]/compare:scale-[0.94]",
            ease,
          )}
          style={{ width: HANDLE, height: HANDLE, ...(vertical ? { top: position, left: "50%" } : { left: position, top: "50%" }) }}
        >
          {/* A ring of tube inside the puck, and two grip arrows */}
          <span
            aria-hidden
            className={cn(
              "absolute inset-[5px] rounded-full border-[1.5px] border-[color-mix(in_srgb,rgb(var(--neon))_40%,white)] transition-[box-shadow,opacity] duration-200",
              "shadow-[0_0_6px_rgb(var(--neon)/0.8),inset_0_0_6px_rgb(var(--neon)/0.5)]",
              "group-data-[disabled]/compare:opacity-30 group-data-[disabled]/compare:shadow-none",
            )}
          />
          <svg aria-hidden viewBox="0 0 24 24" className={cn("size-[18px] text-white/90", vertical && "rotate-90")}>
            <path d="M9.5 8 5.5 12l4 4M14.5 8l4 4-4 4" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    );
  },
);
ImageCompare.displayName = "ImageCompare";

export { ImageCompare };
