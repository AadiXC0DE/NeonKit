"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const TICKS = 36;

/**
 * A rotary hue control. Drag around it, scroll on it, or use the arrow keys.
 */
export function HueKnob({
  hue,
  onChange,
  disabled = false,
  className,
}: {
  hue: number;
  onChange: (hue: number) => void;
  disabled?: boolean;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const angleFromPointer = (event: React.PointerEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    const x = event.clientX - (rect.left + rect.width / 2);
    const y = event.clientY - (rect.top + rect.height / 2);
    const angle = (Math.atan2(y, x) * 180) / Math.PI + 90;
    return Math.round((angle + 360) % 360);
  };

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      if (disabled) return;
      event.preventDefault();
      onChange((hue + Math.sign(event.deltaY) * 4 + 360) % 360);
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => node.removeEventListener("wheel", onWheel);
  }, [hue, onChange, disabled]);

  return (
    <div
      ref={ref}
      role="slider"
      tabIndex={disabled ? -1 : 0}
      aria-label="Accent hue"
      aria-valuemin={0}
      aria-valuemax={359}
      aria-valuenow={hue}
      aria-valuetext={`${hue} degrees`}
      aria-disabled={disabled || undefined}
      onPointerDown={(event) => {
        if (disabled) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
        onChange(angleFromPointer(event));
      }}
      onPointerMove={(event) => dragging && onChange(angleFromPointer(event))}
      onPointerUp={() => setDragging(false)}
      onPointerCancel={() => setDragging(false)}
      onKeyDown={(event) => {
        const step = event.shiftKey ? 15 : 5;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") onChange((hue + step) % 360);
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown") onChange((hue - step + 360) % 360);
        else return;
        event.preventDefault();
      }}
      className={cn(
        "relative size-[72px] shrink-0 touch-none select-none rounded-full outline-none",
        disabled ? "cursor-not-allowed opacity-50" : dragging ? "cursor-grabbing" : "cursor-grab",
        "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent)/0.6)] focus-visible:ring-offset-4 focus-visible:ring-offset-background",
        className,
      )}
    >
      {/* Scale ticks, each one tinted with the hue it stands for */}
      <svg viewBox="0 0 72 72" className="absolute inset-0" aria-hidden>
        {Array.from({ length: TICKS }, (_, i) => {
          const a = (i / TICKS) * Math.PI * 2;
          const tickHue = (i / TICKS) * 360;
          const near = Math.abs(((tickHue - hue + 540) % 360) - 180) < 360 / TICKS;
          return (
            <line
              key={i}
              x1={36 + Math.sin(a) * 31}
              y1={36 - Math.cos(a) * 31}
              x2={36 + Math.sin(a) * (i % 3 === 0 ? 35 : 33.5)}
              y2={36 - Math.cos(a) * (i % 3 === 0 ? 35 : 33.5)}
              stroke={`hsl(${tickHue} 95% 62%)`}
              strokeOpacity={near && !disabled ? 1 : 0.35}
              strokeWidth={1.2}
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      {/* The cap */}
      <div
        className="absolute inset-[9px] rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_30%,#262a36,#0c0e14_70%)] shadow-[0_6px_14px_rgb(0_0_0/0.6),inset_0_1px_0_rgb(255_255_255/0.08)]"
        style={{ transform: `rotate(${hue}deg)` }}
      >
        <span
          className="absolute left-1/2 top-[5px] h-3 w-[2px] -translate-x-1/2 rounded-full bg-[rgb(var(--neon-accent))] shadow-[0_0_6px_rgb(var(--neon-accent)),0_0_12px_rgb(var(--neon-accent)/0.8)]"
        />
        {/* Grip ridges */}
        <span className="absolute inset-[9px] rounded-full border border-dashed border-white/[0.05]" />
      </div>
    </div>
  );
}
