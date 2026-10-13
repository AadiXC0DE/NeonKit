"use client";

import * as React from "react";
import Link from "next/link";
import { componentCategoryId } from "@/components/site/category-id";
import { cn } from "@/lib/utils";
import { demoLoaders } from "./catalog-demos";
import { useMediaQuery } from "./use-near-viewport";

type Group = { category: string; items: { slug: string; name: string }[] };

const PREVIEW_W = 340;
const PREVIEW_H = 232;

const cache = new Map<string, React.ComponentType>();

class Quiet extends React.Component<{ children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** A running demo shrunk to fit the preview card. */
function Fitted({ Demo }: { Demo: React.ComponentType }) {
  const inner = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(0);
  React.useLayoutEffect(() => {
    const node = inner.current;
    if (!node) return;
    const fit = () => {
      const w = Math.max(node.offsetWidth, node.scrollWidth, 1);
      const h = Math.max(node.offsetHeight, node.scrollHeight, 1);
      setScale(Math.min(1, (PREVIEW_W - 28) / w, (PREVIEW_H - 28) / h));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(node);
    return () => observer.disconnect();
  }, [Demo]);
  return (
    <div
      ref={inner}
      className="absolute left-1/2 top-1/2 flex w-[520px] items-center justify-center transition-opacity duration-150"
      style={{ transform: `translate(-50%, -50%) scale(${scale})`, opacity: scale ? 1 : 0 }}
    >
      <Quiet>
        <Demo />
      </Quiet>
    </div>
  );
}

export function Catalog({ groups, total }: { groups: Group[]; total: number }) {
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)", false);
  const [active, setActive] = React.useState<string | null>(null);
  const activeRef = React.useRef<string | null>(null);
  const [Demo, setDemo] = React.useState<React.ComponentType | null>(null);
  const card = React.useRef<HTMLDivElement>(null);
  const pointer = React.useRef({ x: 0, y: 0 });
  const raf = React.useRef(0);

  const place = React.useCallback(() => {
    raf.current = 0;
    const node = card.current;
    if (!node) return;
    const { x, y } = pointer.current;
    const left = Math.min(window.innerWidth - PREVIEW_W - 16, x + 22);
    const top = Math.min(window.innerHeight - PREVIEW_H - 16, Math.max(16, y + 22));
    node.style.transform = `translate3d(${left}px, ${top}px, 0)`;
  }, []);

  const show = React.useCallback(
    (slug: string, at?: { x: number; y: number }) => {
      if (!fine) return;
      if (at) pointer.current = at;
      activeRef.current = slug;
      setActive(slug);
      const hit = cache.get(slug);
      if (hit) {
        setDemo(() => hit);
      } else {
        setDemo(null);
        demoLoaders[slug]?.().then((mod) => {
          cache.set(slug, mod.default);
          if (activeRef.current === slug) setDemo(() => mod.default);
        });
      }
      if (!raf.current) raf.current = requestAnimationFrame(place);
    },
    [fine, place],
  );

  const hide = React.useCallback(() => {
    activeRef.current = null;
    setActive(null);
  }, []);

  React.useEffect(() => () => cancelAnimationFrame(raf.current), []);

  return (
    <div
      onPointerMove={(event) => {
        if (!active || event.pointerType !== "mouse") return;
        pointer.current = { x: event.clientX, y: event.clientY };
        if (!raf.current) raf.current = requestAnimationFrame(place);
      }}
    >
      <div className="flex flex-col gap-y-9 sm:gap-y-11">
        {groups.map((group) => (
          <div key={group.category} className="grid gap-3 lg:grid-cols-12 lg:gap-6">
            <h3 className="flex items-baseline gap-2 text-[14px] text-muted lg:col-span-2 lg:pt-[0.6rem]">
              <Link
                href={`/components#${componentCategoryId(group.category)}`}
                className="rounded-sm transition-colors hover:text-fg focus-visible:text-fg"
              >
                {group.category}
              </Link>
              <span className="tabular-nums text-[13px] text-[#6f7789]">{group.items.length}</span>
            </h3>
            <ul className="text-[clamp(1.45rem,2.35vw,2.15rem)] leading-[1.28] tracking-[-0.022em] [font-stretch:104%] lg:col-span-10">
              {group.items.map((item, i) => (
                <li key={item.slug} className="inline">
                  <Link
                    href={`/components/${item.slug}`}
                    onPointerEnter={(event) => event.pointerType === "mouse" && show(item.slug, { x: event.clientX, y: event.clientY })}
                    onPointerLeave={hide}
                    onFocus={(event) => {
                      const r = event.currentTarget.getBoundingClientRect();
                      show(item.slug, { x: r.right - 10, y: r.bottom - 10 });
                    }}
                    onBlur={hide}
                    className={cn(
                      "whitespace-nowrap rounded-[4px] text-[#d5dae3] transition-[color,text-shadow] duration-150 ease-out",
                      "hover:text-[rgb(var(--neon-accent))] hover:[text-shadow:0_0_2px_rgb(var(--neon-accent)/0.6),0_0_18px_rgb(var(--neon-accent)/0.45)]",
                      "focus-visible:text-[rgb(var(--neon-accent))]",
                    )}
                  >
                    {item.name}
                  </Link>
                  {i < group.items.length - 1 && (
                    <span aria-hidden className="mx-[0.32em] font-light text-white/[0.18]">
                      /
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="sr-only">{total} components in all. Each name links to its page.</p>

      {fine && (
        <div
          ref={card}
          aria-hidden
          inert
          className={cn(
            "pointer-events-none fixed left-0 top-0 z-[60] grid place-items-center overflow-hidden [contain:strict] rounded-xl border border-white/10 bg-[#0a0c12]/95 shadow-[0_24px_60px_-12px_rgb(0_0_0/0.85)] backdrop-blur-md transition-opacity duration-150",
            active ? "opacity-100" : "opacity-0",
          )}
          style={{ width: PREVIEW_W, height: PREVIEW_H }}
        >
          {active && Demo ? <Fitted key={active} Demo={Demo} /> : active ? <span className="size-1.5 animate-pulse rounded-full bg-white/30" /> : null}
        </div>
      )}
    </div>
  );
}
