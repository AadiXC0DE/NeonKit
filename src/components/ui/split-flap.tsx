"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

// Every size derives from one variable, so a breakpoint class like
// `sm:[--flap-h:40px]` resizes the whole display.
const H = "var(--flap-h,40px)";
const W = `calc(${H} * 0.68)`;
const GAP = `calc(${H} * 0.07)`;

const sizes = {
  sm: "[--flap-h:28px]",
  md: "[--flap-h:40px]",
  lg: "[--flap-h:60px]",
} as const;

/** Drum orders. Flaps only travel forward, so order decides how far a change spins. */
const charsets = {
  alphanumeric: " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:-/&'!?",
  letters: " ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numeric: " 0123456789:.-",
} as const;

type Charset = keyof typeof charsets | (string & {});

const resolveCharset = (charset: Charset) =>
  charset in charsets ? charsets[charset as keyof typeof charsets] : charset;

function normalize(char: string, charset: string) {
  if (charset.includes(char)) return char;
  const upper = char.toUpperCase();
  return charset.includes(upper) ? upper : char;
}

// Pads or trims to a fixed number of cells, the way a board has a fixed width.
function toCells(value: string, length: number | undefined, align: "left" | "right") {
  const chars = Array.from(value);
  if (length === undefined) return chars;
  if (chars.length > length) return align === "right" ? chars.slice(-length) : chars.slice(0, length);
  const pad = Array.from({ length: length - chars.length }, () => " ");
  return align === "right" ? [...pad, ...chars] : [...chars, ...pad];
}

/* One rAF loop drives every flap on the page and stops when they all settle. */

type Animator = (dt: number) => boolean;
const animators = new Set<Animator>();
let frame = 0;
let last = 0;

function loop(now: number) {
  // Clamp the step so a backgrounded tab resumes mid-flip instead of skipping.
  const dt = Math.min(now - last, 48);
  last = now;
  animators.forEach((animator) => {
    if (!animator(dt)) animators.delete(animator);
  });
  frame = animators.size > 0 ? requestAnimationFrame(loop) : 0;
}

function run(animator: Animator) {
  animators.add(animator);
  if (!frame && typeof requestAnimationFrame === "function") {
    last = performance.now();
    frame = requestAnimationFrame(loop);
  }
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// A falling flap accelerates; the last one lands and bounces twice on the stack.
function flapAngle(p: number, final: boolean) {
  if (!final) return 180 * Math.pow(p, 1.4);
  const fall = 0.45;
  if (p < fall) return 180 * Math.pow(p / fall, 1.4);
  const q = (p - fall) / (1 - fall);
  return 180 - 14 * Math.abs(Math.sin(q * Math.PI * 2)) * Math.pow(1 - q, 2);
}

type Nodes = {
  top: HTMLElement;
  bottom: HTMLElement;
  front: HTMLElement;
  back: HTMLElement;
  flap: HTMLElement;
  frontShade: HTMLElement;
  backShade: HTMLElement;
  topShade: HTMLElement;
  bottomShade: HTMLElement;
};

type Settings = { charset: string; flipDuration: number; delay: number };

/** Steps one cell through its drum by writing to the DOM directly, never through React state. */
function createFlapEngine(nodes: Nodes, initial: string) {
  let shown = initial;
  let target = initial;
  let settings: Settings = { charset: charsets.alphanumeric, flipDuration: 90, delay: 0 };
  let running = false;
  let alive = true;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let step = { to: initial, elapsed: 0, duration: 90, final: true };

  const set = (node: HTMLElement, char: string) => {
    if (node.textContent !== char) node.textContent = char;
  };

  const pose = (angle: number) => {
    nodes.flap.style.transform = `rotateX(${-angle}deg)`;
    nodes.frontShade.style.opacity = String(angle < 90 ? (angle / 90) * 0.6 : 0);
    nodes.backShade.style.opacity = String(angle > 90 ? ((180 - angle) / 90) * 0.55 : 0);
    nodes.topShade.style.opacity = String(angle > 0 && angle < 90 ? (1 - angle / 90) * 0.5 : 0);
    nodes.bottomShade.style.opacity = String(angle > 0 && angle < 180 ? (angle / 180) * 0.45 : 0);
  };

  const rest = (char: string) => {
    shown = char;
    set(nodes.top, char);
    set(nodes.bottom, char);
    set(nodes.front, char);
    set(nodes.back, char);
    pose(0);
  };

  const next = () => {
    const { charset } = settings;
    const from = charset.indexOf(shown);
    // Characters missing from the drum arrive in a single flip.
    if (from === -1 || !charset.includes(target)) return target;
    return charset[(from + 1) % charset.length];
  };

  const begin = () => {
    const to = next();
    const final = to === target;
    step = { to, elapsed: 0, duration: settings.flipDuration * (final ? 2.4 : 1), final };
    set(nodes.top, to);
    set(nodes.back, to);
    set(nodes.front, shown);
    set(nodes.bottom, shown);
  };

  const tick: Animator = (dt) => {
    if (!alive) return false;
    step.elapsed += dt;
    const p = Math.min(step.elapsed / step.duration, 1);
    pose(flapAngle(p, step.final));
    if (p < 1) return true;
    rest(step.to);
    if (shown !== target) {
      begin();
      return true;
    }
    running = false;
    return false;
  };

  return {
    update(char: string, next: Settings) {
      settings = next;
      target = char;
      if (prefersReducedMotion() || typeof requestAnimationFrame !== "function") {
        clearTimeout(timer);
        timer = undefined;
        running = false;
        animators.delete(tick);
        rest(target);
        return;
      }
      if (running || timer || shown === target) return;
      timer = setTimeout(() => {
        timer = undefined;
        if (!alive || shown === target) return;
        running = true;
        begin();
        run(tick);
      }, settings.delay);
    },
    destroy() {
      alive = false;
      clearTimeout(timer);
      animators.delete(tick);
    },
  };
}

const glyph =
  "absolute inset-x-0 h-[200%] select-none text-center [color:color-mix(in_srgb,rgb(var(--neon))_62%,white)]";
const half = "absolute inset-x-0 h-1/2 overflow-hidden";
const upper = "top-0 rounded-t-[inherit] bg-[linear-gradient(to_bottom,#1d2029,#14161d)]";
const lower = "bottom-0 rounded-b-[inherit] bg-[linear-gradient(to_bottom,#121419,#0c0e12)]";
const shade = "pointer-events-none absolute inset-0 bg-black opacity-0";

interface FlapCellProps {
  char: string;
  charset: string;
  flipDuration: number;
  delay: number;
}

function FlapCell({ char, charset, flipDuration, delay }: FlapCellProps) {
  // React renders the first character only; after that the engine owns the text.
  const [initial] = React.useState(char);
  const top = React.useRef<HTMLSpanElement>(null);
  const bottom = React.useRef<HTMLSpanElement>(null);
  const front = React.useRef<HTMLSpanElement>(null);
  const back = React.useRef<HTMLSpanElement>(null);
  const flap = React.useRef<HTMLSpanElement>(null);
  const frontShade = React.useRef<HTMLSpanElement>(null);
  const backShade = React.useRef<HTMLSpanElement>(null);
  const topShade = React.useRef<HTMLSpanElement>(null);
  const bottomShade = React.useRef<HTMLSpanElement>(null);
  const engine = React.useRef<ReturnType<typeof createFlapEngine> | null>(null);

  React.useEffect(() => {
    const nodes = {
      top: top.current,
      bottom: bottom.current,
      front: front.current,
      back: back.current,
      flap: flap.current,
      frontShade: frontShade.current,
      backShade: backShade.current,
      topShade: topShade.current,
      bottomShade: bottomShade.current,
    };
    if (Object.values(nodes).some((node) => !node)) return;
    const instance = createFlapEngine(nodes as Nodes, initial);
    engine.current = instance;
    return () => {
      instance.destroy();
      engine.current = null;
    };
  }, [initial]);

  React.useEffect(() => {
    engine.current?.update(char, { charset, flipDuration, delay });
  }, [char, charset, flipDuration, delay]);

  const glyphStyle = { fontSize: `calc(${H} * 0.72)`, lineHeight: H } as React.CSSProperties;

  return (
    <span
      data-flap-cell=""
      className="relative inline-block shrink-0 rounded-[calc(var(--flap-h,40px)*0.08)] shadow-[0_1px_0_rgb(255_255_255/0.04),0_2px_4px_rgb(0_0_0/0.6)]"
      style={{ width: W, height: H, perspective: `calc(${H} * 5)` }}
    >
      <span className={cn(half, upper)}>
        <span ref={top} className={cn(glyph, "top-0")} style={glyphStyle}>
          {initial}
        </span>
        <span ref={topShade} className={shade} />
      </span>
      <span className={cn(half, lower, "shadow-[inset_0_2px_3px_-1px_rgb(0_0_0/0.7)]")}>
        <span ref={bottom} className={cn(glyph, "-top-full")} style={glyphStyle}>
          {initial}
        </span>
        <span ref={bottomShade} className={shade} />
      </span>
      <span
        ref={flap}
        className="absolute inset-x-0 top-0 h-1/2 origin-bottom rounded-t-[inherit] [transform-style:preserve-3d] [will-change:transform]"
      >
        <span className={cn(half, upper, "h-full [-webkit-backface-visibility:hidden] [backface-visibility:hidden]")}>
          <span ref={front} className={cn(glyph, "top-0")} style={glyphStyle}>
            {initial}
          </span>
          <span ref={frontShade} className={shade} />
        </span>
        <span
          className={cn(
            half,
            "top-0 h-full rounded-b-[calc(var(--flap-h,40px)*0.08)] bg-[linear-gradient(to_bottom,#121419,#0c0e12)] [-webkit-backface-visibility:hidden] [backface-visibility:hidden] [transform:rotateX(180deg)]",
          )}
        >
          <span ref={back} className={cn(glyph, "-top-full")} style={glyphStyle}>
            {initial}
          </span>
          <span ref={backShade} className={shade} />
        </span>
      </span>
      {/* The axle: a dark seam with a catch-light below and a pin at each end. */}
      <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/90 shadow-[0_1px_0_rgb(255_255_255/0.05)]" />
      <span className="pointer-events-none absolute -left-px top-1/2 h-[12%] w-[2px] -translate-y-1/2 rounded-full bg-[#2b2f3a]" />
      <span className="pointer-events-none absolute -right-px top-1/2 h-[12%] w-[2px] -translate-y-1/2 rounded-full bg-[#2b2f3a]" />
    </span>
  );
}

function setRefs<T>(...refs: (React.Ref<T> | undefined)[]) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.RefObject<T | null>).current = node;
    }
  };
}

// Holds a fresh display blank until it scrolls into view, then lets it flip in.
function useArmed(enabled: boolean, ref: React.RefObject<HTMLElement | null>) {
  const [armed, setArmed] = React.useState(!enabled);
  React.useEffect(() => {
    if (armed) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const arm = (wait: number) => {
      timer = setTimeout(() => setArmed(true), wait);
    };
    const node = ref.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      arm(0);
      return () => clearTimeout(timer);
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        arm(220);
      },
      { threshold: 0.3 },
    );
    observer.observe(node);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [armed, ref]);
  return armed;
}

export interface SplitFlapProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color" | "children"> {
  /** The text to show. Changes spin each cell forward through the charset. */
  value: string;
  /** Fixed number of cells. Shorter values are padded with blank flaps; longer ones are cut. */
  length?: number;
  /** Which side short values hug when `length` pads them. */
  align?: "left" | "right";
  /** Drum order: `"alphanumeric"`, `"letters"`, `"numeric"`, or your own string (start it with a space). */
  charset?: Charset;
  /** Milliseconds for one flap to fall. */
  flipDuration?: number;
  /** Milliseconds between neighbouring cells starting. */
  stagger?: number;
  /** Milliseconds before the first cell starts. */
  delay?: number;
  /** Start blank and flip in once the display scrolls into view. */
  flipOnMount?: boolean;
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Cell height preset. Leave unset to inherit `--flap-h` from a parent, or 40px. */
  size?: keyof typeof sizes;
}

const SplitFlap = React.forwardRef<HTMLSpanElement, SplitFlapProps>(
  (
    {
      className,
      style,
      value,
      length,
      align = "left",
      charset = "alphanumeric",
      flipDuration = 90,
      stagger = 30,
      delay = 0,
      flipOnMount = false,
      color,
      size,
      ...props
    },
    ref,
  ) => {
    const local = React.useRef<HTMLSpanElement>(null);
    const armed = useArmed(flipOnMount, local);
    const drum = resolveCharset(charset);
    const cells = toCells(armed ? value : "", length ?? Array.from(value).length, align);

    return (
      <span
        ref={setRefs(ref, local)}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "inline-flex max-w-full align-middle font-semibold",
          size && sizes[size],
          className,
        )}
        {...props}
      >
        <span className="sr-only">{value}</span>
        <span aria-hidden className="inline-flex" style={{ gap: GAP }}>
          {cells.map((char, index) => (
            <FlapCell
              key={index}
              char={normalize(char, drum)}
              charset={drum}
              flipDuration={flipDuration}
              delay={delay + index * stagger}
            />
          ))}
        </span>
      </span>
    );
  },
);
SplitFlap.displayName = "SplitFlap";

export interface SplitFlapColumn {
  /** Small caption above the column. */
  label?: React.ReactNode;
  /** Cells in this column. Defaults to the longest value in it. */
  length?: number;
  align?: "left" | "right";
  /** Per-column drum, e.g. `"numeric"` for times so they spin quickly. */
  charset?: Charset;
  /** Classes for the column's cells and caption, e.g. `max-sm:hidden`. */
  className?: string;
}

export interface SplitFlapRow {
  cells: string[];
  /** Per-cell colors, by column index. Unset cells use the board color. */
  colors?: (NeonColor | undefined)[];
}

export interface SplitFlapBoardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
  rows: SplitFlapRow[];
  /** Column captions, widths and drums. */
  columns?: SplitFlapColumn[];
  /** Title bar above the board, e.g. "Departures" and a clock. */
  header?: React.ReactNode;
  charset?: Charset;
  flipDuration?: number;
  /** Milliseconds between cells; the update ripples diagonally down the board. */
  stagger?: number;
  flipOnMount?: boolean;
  color?: NeonColor;
  size?: keyof typeof sizes;
}

const SplitFlapBoard = React.forwardRef<HTMLDivElement, SplitFlapBoardProps>(
  (
    {
      className,
      style,
      rows,
      columns,
      header,
      charset = "alphanumeric",
      flipDuration = 90,
      stagger = 24,
      flipOnMount = false,
      color,
      size = "md",
      ...props
    },
    ref,
  ) => {
    const local = React.useRef<HTMLDivElement>(null);
    const armed = useArmed(flipOnMount, local);
    const count = Math.max(columns?.length ?? 0, ...rows.map((row) => row.cells.length));
    const layout = Array.from({ length: count }, (_, index) => {
      const column = columns?.[index];
      const longest = Math.max(1, ...rows.map((row) => Array.from(row.cells[index] ?? "").length));
      return { ...column, length: column?.length ?? longest, align: column?.align ?? "left" };
    });
    const offsets = layout.map((_, index) =>
      layout.slice(0, index).reduce((sum, column) => sum + column.length, 0),
    );
    const width = (cells: number) => `calc(${cells} * ${W} + ${cells - 1} * ${GAP})`;
    const columnGap = `calc(${H} * 0.4)`;
    const hasLabels = layout.some((column) => column.label);

    return (
      <div
        ref={setRefs(ref, local)}
        role="table"
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative isolate inline-block max-w-full overflow-x-auto rounded-xl border border-white/10 bg-[linear-gradient(to_bottom,#0d0f14,#08090c)] p-[calc(var(--flap-h,40px)*0.45)]",
          "shadow-[inset_0_1px_0_rgb(255_255_255/0.05),inset_0_0_0_1px_rgb(0_0_0/0.6),0_24px_60px_-28px_rgb(0_0_0/0.9)]",
          sizes[size],
          className,
        )}
        {...props}
      >
        {/* Light from the characters washing over the housing */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-[inherit] bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgb(var(--neon)/0.07),transparent_75%)]"
        />
        {header && (
          <div className="mb-[calc(var(--flap-h,40px)*0.35)] flex items-center justify-between gap-4 border-b border-white/[0.06] pb-[calc(var(--flap-h,40px)*0.3)]">
            {header}
          </div>
        )}
        <div role="rowgroup" className="flex flex-col" style={{ gap: `calc(${H} * 0.14)` }}>
          {hasLabels && (
            <div role="row" className="flex" style={{ gap: columnGap }}>
              {layout.map((column, index) => (
                <div
                  key={index}
                  role="columnheader"
                  className={cn(
                    "shrink-0 truncate font-mono text-[10px] font-medium uppercase leading-4 tracking-[0.16em] text-white/45",
                    column.align === "right" && "text-right",
                    column.className,
                  )}
                  style={{ width: width(column.length) }}
                >
                  {column.label}
                </div>
              ))}
            </div>
          )}
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} role="row" className="flex" style={{ gap: columnGap }}>
              {layout.map((column, index) => {
                const text = row.cells[index] ?? "";
                return (
                  <div key={index} role="cell" className={cn("shrink-0", column.className)}>
                    <span className="sr-only">{text}</span>
                    <SplitFlap
                      aria-hidden
                      value={armed ? text : ""}
                      length={column.length}
                      align={column.align}
                      charset={column.charset ?? charset}
                      color={row.colors?.[index]}
                      flipDuration={flipDuration}
                      stagger={stagger}
                      delay={(rowIndex * 3 + offsets[index]) * stagger}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  },
);
SplitFlapBoard.displayName = "SplitFlapBoard";

export { SplitFlap, SplitFlapBoard };
