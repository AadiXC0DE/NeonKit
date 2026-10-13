"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Frame = { href: string; src: string; name: string; meta: string };

/** A horizontal strip of screenshots: scroll, swipe, or drag with a mouse. */
export function Filmstrip({
  frames,
  label,
  color,
  size = "md",
}: {
  frames: Frame[];
  label: string;
  /** "r g b" channels for the hover light of this strip. */
  color: string;
  size?: "md" | "lg";
}) {
  const ref = React.useRef<HTMLUListElement>(null);
  const drag = React.useRef({ down: false, x: 0, left: 0, moved: false });

  return (
    <ul
      ref={ref}
      aria-label={label}
      style={{ "--strip": color } as React.CSSProperties}
      onPointerDown={(event) => {
        if (event.pointerType !== "mouse" || !ref.current) return;
        drag.current = { down: true, x: event.clientX, left: ref.current.scrollLeft, moved: false };
      }}
      onPointerMove={(event) => {
        const d = drag.current;
        if (!d.down || !ref.current) return;
        const dx = event.clientX - d.x;
        if (Math.abs(dx) > 4) d.moved = true;
        if (d.moved) ref.current.scrollLeft = d.left - dx;
      }}
      onPointerUp={() => (drag.current.down = false)}
      onPointerLeave={() => (drag.current.down = false)}
      onClickCapture={(event) => {
        if (drag.current.moved) {
          event.preventDefault();
          event.stopPropagation();
          drag.current.moved = false;
        }
      }}
      onDragStart={(event) => event.preventDefault()}
      className={cn(
        "nk-strip flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 active:cursor-grabbing sm:gap-5",
        "scroll-px-4 px-4 sm:scroll-px-6 sm:px-6 2xl:scroll-px-[calc((100vw-88rem)/2+1.5rem)] 2xl:px-[calc((100vw-88rem)/2+1.5rem)]",
      )}
    >
      {frames.map((frame) => (
        <li key={frame.href} className={cn("shrink-0 snap-start", size === "lg" ? "w-[78vw] max-w-[560px]" : "w-[68vw] max-w-[352px]")}>
          <Link href={frame.href} draggable={false} className="group block rounded-[12px] outline-offset-4">
            <span className="relative block overflow-hidden rounded-[12px] border border-white/[0.08] bg-surface transition-[border-color,box-shadow] duration-200 group-hover:border-[rgb(var(--strip)/0.7)] group-hover:shadow-[0_0_0_1px_rgb(var(--strip)/0.35),0_0_28px_-4px_rgb(var(--strip)/0.45)]">
              <Image
                src={frame.src}
                alt=""
                width={960}
                height={600}
                sizes={size === "lg" ? "(min-width: 768px) 560px, 78vw" : "(min-width: 768px) 352px, 68vw"}
                draggable={false}
                className="aspect-[8/5] w-full select-none object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.015]"
              />
            </span>
            <span className="mt-3 flex items-baseline justify-between gap-3 px-0.5">
              <span className="truncate text-[14.5px] font-medium text-fg">{frame.name}</span>
              <span className="shrink-0 text-[13px] text-muted">{frame.meta}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
