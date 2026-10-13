"use client";

import * as React from "react";
import { neonColorNames, neonColors, type NeonColorName } from "@/lib/neon";
import { cn } from "@/lib/utils";

/** A row of gels, one short tube per palette color, as on the landing page's control panel. */
export function AccentPicker({
  value,
  onChange,
  className,
  label = "Preview color",
}: {
  value: NeonColorName | null;
  onChange: (color: NeonColorName) => void;
  className?: string;
  label?: string;
}) {
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  // Roving focus: one tab stop for the group, arrows move between colors.
  const focusIndex = value ? neonColorNames.indexOf(value) : 0;

  const move = (from: number, delta: number) => {
    const next = (from + delta + neonColorNames.length) % neonColorNames.length;
    onChange(neonColorNames[next]);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} className={cn("flex items-center", className)}>
      {neonColorNames.map((name, i) => {
        const active = name === value;
        const rgb = neonColors[name];
        return (
          <button
            key={name}
            ref={(node) => {
              refs.current[i] = node;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={name}
            title={name}
            tabIndex={i === focusIndex ? 0 : -1}
            onClick={() => onChange(name)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                move(i, 1);
              } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                move(i, -1);
              }
            }}
            className="group grid h-7 w-[15px] cursor-pointer place-items-center rounded-md"
          >
            <span
              className={cn(
                "h-4 w-[5px] rounded-full transition-[transform,box-shadow,opacity] duration-200 ease-out-quint",
                active ? "scale-y-[1.2] opacity-100" : "opacity-45 group-hover:opacity-100",
              )}
              style={{
                background: `rgb(${rgb})`,
                boxShadow: active ? `0 0 0 1px rgb(255 255 255 / 0.5) inset, 0 0 6px rgb(${rgb}), 0 0 14px rgb(${rgb} / 0.6)` : undefined,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
