"use client";

import { neonColorNames, neonColors, type NeonColorName } from "@/lib/neon";
import { cn } from "@/lib/utils";

export function AccentPicker({
  value,
  onChange,
  className,
}: {
  value: NeonColorName;
  onChange: (color: NeonColorName) => void;
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label="Preview accent" className={cn("flex items-center gap-1", className)}>
      {neonColorNames.map((name) => {
        const active = name === value;
        return (
          <button
            key={name}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={name}
            title={name}
            onClick={() => onChange(name)}
            className="group grid size-5 cursor-pointer place-items-center rounded-full"
          >
            <span
              className={cn(
                "size-2.5 rounded-full transition-[transform,box-shadow] duration-150",
                active ? "scale-125" : "opacity-60 group-hover:scale-110 group-hover:opacity-100",
              )}
              style={{
                background: `rgb(${neonColors[name]})`,
                boxShadow: active ? `0 0 0 2px #05060a, 0 0 0 3px rgb(${neonColors[name]}), 0 0 10px rgb(${neonColors[name]})` : undefined,
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
