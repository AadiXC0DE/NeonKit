"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { HardwareSwitch } from "@/components/ui/hardware-switch";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { parts, type PartKey } from "./parts";
import { useNearViewport, useReducedMotionPreference, useSize } from "./use-near-viewport";

// The screen is the heaviest part of the page; it loads only when the section comes near.
const DesktopScreen = dynamic(() => import("./nightshift-screen").then((m) => m.DesktopScreen), {
  ssr: false,
  loading: () => <div aria-hidden className="h-[590px] w-[980px] rounded-[14px] border border-line bg-[#090b10]" />,
});
const PhoneScreen = dynamic(() => import("./nightshift-screen").then((m) => m.PhoneScreen), {
  ssr: false,
  loading: () => <div aria-hidden className="mx-auto h-[760px] max-w-[380px] rounded-[26px] border border-line bg-[#090b10]" />,
});

const SCREEN_W = 980;
const SCREEN_H = 590;
const LABEL_W = 156;
const LABEL_GAP = 28;
/** Below this stage width the callouts move under the screen. */
const LEADER_MIN = SCREEN_W * 0.86 + 2 * (LABEL_W + LABEL_GAP);

const leftSide: PartKey[] = ["chart", "row", "live"];

type Line = { key: PartKey; side: "left" | "right"; y: number; x: number };

export function Lights() {
  const reduced = useReducedMotionPreference();
  // The visitor's own choice wins; until then the lights come on by themselves (or start on, with reduced motion).
  const [choice, setChoice] = React.useState<boolean | null>(null);
  const [auto, setAuto] = React.useState(false);
  const on = choice ?? (reduced || auto);
  const [strike, setStrike] = React.useState(0);
  const touched = React.useRef(false);
  const [hover, setHover] = React.useState<PartKey | null>(null);

  const [sectionRef, near] = useNearViewport<HTMLElement>("800px");
  const [stageRef, stage] = useSize<HTMLDivElement>();

  const width = stage.width;
  const phone = width > 0 && width < 640;
  const leaders = width >= LEADER_MIN;
  const room = leaders ? width - 2 * (LABEL_W + LABEL_GAP) : width;
  const scale = width ? Math.min(1, room / SCREEN_W) : 1;

  const flip = React.useCallback((next: boolean) => {
    touched.current = true;
    setChoice(next);
    if (next) setStrike((n) => n + 1);
  }, []);

  const screenBox = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    const node = screenBox.current;
    if (!node || reduced) return;
    let timer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || touched.current) return;
        timer = window.setTimeout(() => {
          if (touched.current) return;
          touched.current = true;
          setAuto(true);
          setStrike((n) => n + 1);
        }, 650);
        observer.disconnect();
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [reduced, near, phone]);

  // Anchors for the leader lines, registered by each part of the screen.
  const anchors = React.useRef<Partial<Record<PartKey, HTMLElement | null>>>({});
  const callbacks = React.useRef<Partial<Record<PartKey, (node: HTMLElement | null) => void>>>({});
  const [lines, setLines] = React.useState<Line[]>([]);
  const frame = React.useRef(0);

  const measure = React.useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const root = stageRef.current;
      if (!root) return;
      const box = root.getBoundingClientRect();
      const next: Line[] = [];
      for (const part of parts) {
        const node = anchors.current[part.key];
        if (!node) continue;
        const r = node.getBoundingClientRect();
        const side = leftSide.includes(part.key) ? "left" : "right";
        const y = r.top - box.top + r.height * (part.key === "chart" ? 0.72 : 0.5);
        const x = side === "left" ? r.left - box.left : r.right - box.left;
        next.push({ key: part.key, side, x: Math.round(x), y: Math.round(y) });
      }
      setLines(next);
    });
  }, [stageRef]);

  const register = React.useCallback(
    (key: PartKey) =>
      (callbacks.current[key] ??= (node: HTMLElement | null) => {
        anchors.current[key] = node;
        if (node) measure();
      }),
    [measure],
  );

  React.useEffect(() => {
    if (leaders) measure();
  }, [leaders, scale, width, measure, near]);

  React.useEffect(() => {
    document.fonts?.ready.then(measure);
    return () => cancelAnimationFrame(frame.current);
  }, [measure]);

  const lit = React.useCallback((key: PartKey) => on || hover === key, [on, hover]);
  const screenProps = { lit, strike, register };

  return (
    <section ref={sectionRef} aria-labelledby="lights-title" className="relative px-4 pb-28 pt-32 sm:px-6 sm:pb-40 sm:pt-48">
      <Toaster position="bottom-right" />
      <div className="mx-auto max-w-[88rem]">
        <div className="grid grid-cols-1 items-end gap-10 md:grid-cols-[minmax(0,1fr)_auto] md:gap-16">
          <h2
            id="lights-title"
            className="type-display text-balance text-[clamp(2.6rem,6.6vw,6.5rem)] text-fg"
          >
            Nothing glows until it means something.
          </h2>
          <div className="flex items-center gap-6 md:mb-3 md:flex-col md:items-end md:gap-5">
            <HardwareSwitch
              size="lg"
              className="[&>button]:text-[26px] md:[&>button]:text-[34px]"
              checked={on}
              onCheckedChange={flip}
              aria-labelledby="lights-switch-label"
              aria-describedby="lights-switch-state"
            />
            <div className="md:text-right">
              <p id="lights-switch-label" className="text-[15px] font-medium text-fg">
                Lights
              </p>
              <p id="lights-switch-state" aria-live="polite" className="mt-0.5 text-[14px] text-muted">
                {on ? "On. Five things lit, nothing else." : "Off. Every part at rest."}
              </p>
            </div>
          </div>
        </div>

        <div ref={stageRef} className="relative mt-16 sm:mt-24">
          {/* Leader lines */}
          {leaders && near && (
            <svg aria-hidden className="pointer-events-none absolute inset-0 z-10 size-full overflow-visible">
              {lines.map((line) => {
                const active = hover === line.key;
                const x1 = line.side === "left" ? LABEL_W + 10 : width - LABEL_W - 10;
                return (
                  <g
                    key={line.key}
                    className="transition-[stroke,opacity] duration-200"
                    style={{
                      stroke: active ? "rgb(var(--neon-accent))" : "rgb(255 255 255 / 0.22)",
                      filter: active ? "drop-shadow(0 0 3px rgb(var(--neon-accent) / 0.8))" : undefined,
                    }}
                  >
                    <line x1={x1} y1={line.y} x2={line.x} y2={line.y} strokeWidth={1} />
                    <circle cx={line.x} cy={line.y} r={2.5} fill={active ? "rgb(var(--neon-accent))" : "#8a93a6"} stroke="none" />
                  </g>
                );
              })}
            </svg>
          )}

          {/* Callouts in the margins */}
          {leaders && near && (
            <ul className="contents">
              {lines.map((line) => {
                const part = parts.find((p) => p.key === line.key)!;
                return (
                  <li
                    key={line.key}
                    className={cn("absolute z-20 -translate-y-1/2", line.side === "left" ? "left-0 text-right" : "right-0 text-left")}
                    style={{ top: line.y, width: LABEL_W }}
                  >
                    <Callout part={part} active={hover === part.key} onHover={setHover} />
                  </li>
                );
              })}
            </ul>
          )}

          <div
            ref={screenBox}
            className="relative mx-auto"
            style={
              phone
                ? undefined
                : { width: SCREEN_W * scale, height: SCREEN_H * scale }
            }
          >
            {!near || !width ? (
              <div aria-hidden className={cn("rounded-[14px] border border-line bg-[#090b10]", phone ? "h-[760px]" : "size-full")} />
            ) : phone ? (
              <PhoneScreen {...screenProps} />
            ) : (
              <div style={{ transform: `scale(${scale})`, transformOrigin: "0 0", width: SCREEN_W }}>
                <DesktopScreen {...screenProps} />
              </div>
            )}
          </div>

          {!leaders && (
            <ul className="mx-auto mt-10 grid max-w-[980px] grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
              {parts.map((part) => (
                <li key={part.key}>
                  <Callout part={part} active={hover === part.key} onHover={setHover} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

function Callout({
  part,
  active,
  onHover,
}: {
  part: (typeof parts)[number];
  active: boolean;
  onHover: (key: PartKey | null) => void;
}) {
  return (
    <Link
      href={`/components/${part.slug}`}
      onPointerEnter={() => onHover(part.key)}
      onPointerLeave={() => onHover(null)}
      onFocus={() => onHover(part.key)}
      onBlur={() => onHover(null)}
      className="group block rounded-md outline-offset-4"
    >
      <span
        className={cn(
          "block text-[14.5px] font-medium transition-colors duration-200",
          active ? "text-[rgb(var(--neon-accent))]" : "text-fg",
        )}
      >
        {part.name}
      </span>
      <span className="mt-0.5 block text-[13px] leading-snug text-muted">{part.why}</span>
    </Link>
  );
}
