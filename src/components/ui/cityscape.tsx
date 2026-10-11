"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb, type NeonColor } from "@/lib/neon";

// The skyline lives in a fixed 1600 x 400 world drawn with `xMidYMax slice`:
// the ground stays on the bottom edge, narrow boxes crop the sides, and the
// buildings scale with the height of the box.
const W = 1600;
const H = 400;

type Tone = "warm" | "white" | "cool" | "office" | "neon";
type Rect = { x: number; y: number; w: number; h: number };
type Live = Rect & { tone: Tone; on: boolean; tv: boolean };
type Sign = { text: string; color?: NeonColor };
type PlacedSign = Sign & { x: number; y: number; size: number; width: number; roof: number; alt: boolean; framed: boolean };

type LayerSpec = {
  pitch: [number, number];
  win: [number, number];
  width: [number, number];
  gap: number;
  base: number;
  peak: number;
  rooftops: boolean;
  live: number;
};

type Layer = {
  silhouette: string;
  facade: string;
  lit: Record<Tone, string>;
  live: Live[];
  beacons: { x: number; y: number }[];
  edges: string;
  /** Tops of the spired towers, for crown lighting. */
  crowns: Rect[];
};

const layerSpecs: Record<"far" | "mid" | "near", LayerSpec> = {
  far: { pitch: [4, 5], win: [2, 2.4], width: [16, 44], gap: 6, base: 110, peak: 262, rooftops: false, live: 8 },
  mid: { pitch: [6, 8], win: [3, 4.2], width: [30, 84], gap: 12, base: 70, peak: 218, rooftops: true, live: 22 },
  near: { pitch: [7, 10], win: [3.6, 5.2], width: [56, 128], gap: 18, base: 34, peak: 160, rooftops: true, live: 18 },
};

const tones: Record<Tone, string> = {
  warm: "rgb(255 196 112)",
  white: "rgb(255 236 204)",
  cool: "rgb(178 208 255)",
  office: "rgb(196 214 240 / 0.62)",
  // A bar or a gamer's room: the odd window lit in the city's own color.
  neon: "rgb(var(--neon))",
};

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const rect = (x: number, y: number, w: number, h: number) => `M${r1(x)} ${r1(y)}h${r1(w)}v${r1(h)}h${r1(-w)}z`;

function generateLayer(
  spec: LayerSpec,
  random: () => number,
  height: (x: number) => number,
  lights: number,
  reserve: { x: number; width: number }[] = [],
): Layer & { anchors: number[] } {
  const [px, py] = spec.pitch;
  const [ww, wh] = spec.win;
  const snap = (n: number) => Math.round(n / px) * px;
  const silhouette: string[] = [];
  const facade: string[] = [];
  const lit: Record<Tone, string[]> = { warm: [], white: [], cool: [], office: [], neon: [] };
  const windows: (Rect & { tone: Tone; on: boolean })[] = [];
  const beacons: { x: number; y: number }[] = [];
  const edges: string[] = [];
  const anchors: number[] = [];
  const crowns: Rect[] = [];

  let x = -snap(random() * spec.width[1]);
  while (x < W) {
    const heldIndex = reserve.findIndex((spot, i) => anchors[i] === undefined && spot.x >= x - 4 && spot.x < x + spec.width[1]);
    const held = reserve[heldIndex];
    let w = snap(spec.width[0] + random() * (spec.width[1] - spec.width[0]));
    let h = Math.max(spec.base * 0.6, height(x + w / 2) * (0.62 + random() * 0.5));
    let kind = random();
    if (held) {
      // A sign needs a flat roof wide enough to stand on, low enough to read against the sky.
      w = Math.max(w, snap(held.width + px * 3));
      x = snap(held.x - w / 2);
      h = Math.min(Math.max(h, spec.base + 40), spec.peak * 0.72);
      kind = 0;
    }
    const top = H - h;
    const tiers: Rect[] = [{ x, y: top, w, h }];

    if (kind > 0.55 && w >= px * 5) {
      // Setbacks: one or two narrower tiers stacked on the base, art deco style.
      const steps = kind > 0.82 ? 2 : 1;
      let tier = tiers[0];
      tier.y = top + h * (steps === 2 ? 0.34 : 0.24);
      tier.h = H - tier.y;
      for (let s = 0; s < steps; s++) {
        const inset = snap(tier.w * (0.14 + random() * 0.1)) || px;
        const next: Rect = { x: tier.x + inset, w: tier.w - inset * 2, y: 0, h: 0 };
        next.y = s === steps - 1 ? top : tier.y - (tier.y - top) * 0.55;
        next.h = tier.y - next.y;
        if (next.w < px * 2) break;
        tiers.push(next);
        tier = next;
      }
    }

    // The base runs below the ground line so scroll parallax never lifts a building off the street.
    tiers.forEach((tier, i) => silhouette.push(rect(tier.x, tier.y, tier.w, tier.h + (i === 0 ? 48 : 0))));
    const crown = tiers[tiers.length - 1];
    if (held) anchors[heldIndex] = crown.y;
    edges.push(`M${r1(crown.x)} ${r1(crown.y + 0.5)}h${r1(crown.w)}`);

    // Rooftop gear and spires.
    if (!held) {
      if (kind > 0.88 || (h > spec.peak * 0.82 && random() > 0.35)) {
        const mast = 14 + random() * 26;
        const cx = crown.x + crown.w / 2;
        silhouette.push(rect(cx - 0.8, crown.y - mast, 1.6, mast));
        silhouette.push(rect(cx - 3, crown.y - mast * 0.35, 6, mast * 0.35));
        beacons.push({ x: cx, y: crown.y - mast - 1 });
        crowns.push({ ...crown, h: mast });
      } else if (spec.rooftops && kind < 0.55) {
        if (crown.w > 40 && random() > 0.45) {
          // Water tower: legs, a tank and a conical cap.
          const tx = crown.x + 6 + random() * (crown.w - 28);
          const ty = crown.y - 7;
          silhouette.push(rect(tx + 2, ty, 1.2, 7), rect(tx + 10.8, ty, 1.2, 7));
          silhouette.push(rect(tx, ty - 11, 14, 11));
          silhouette.push(`M${r1(tx - 1)} ${r1(ty - 11)}L${r1(tx + 7)} ${r1(ty - 16)}L${r1(tx + 15)} ${r1(ty - 11)}z`);
        }
        const boxes = Math.floor(random() * 3);
        for (let b = 0; b < boxes; b++) {
          const bw = 5 + random() * 9;
          const bx = crown.x + 3 + random() * Math.max(1, crown.w - bw - 6);
          const bh = 3 + random() * 4;
          silhouette.push(rect(bx, crown.y - bh, bw, bh));
        }
      }
    }

    // Windows sit on a grid shared by the whole layer, so the faint glass pattern lines up with the lit ones.
    const occupancy = random() < 0.28 ? 0.15 : 0.6 + random() * 0.8;
    for (const tier of tiers) {
      const left = tier.x + px;
      const right = tier.x + tier.w - px;
      const roof = tier.y + py * 1.2;
      const ground = H - py * 2;
      if (right - left < px || ground - roof < py) continue;
      facade.push(rect(left, roof, right - left, ground - roof));
      const first = Math.ceil(left / px) * px;
      const last = Math.floor(right / px) * px - px;
      for (let wy = Math.ceil(roof / py) * py; wy + py <= ground; wy += py) {
        const floor = random();
        if (floor < 0.03 * occupancy && last > first) {
          // Now and then a whole office floor is still on: a band of glass, broken by mullions up close.
          if (px < 5) lit.office.push(rect(first, wy + (py - wh) / 2, last - first + px, wh));
          else for (let wx = first; wx <= last; wx += px) lit.office.push(rect(wx + 0.6, wy + (py - wh) / 2, px - 1.2, wh));
          continue;
        }
        // Most floors are dark at 2am; a few apartments are up.
        const chance = floor < 0.2 ? lights * 2.2 : lights * 0.55;
        for (let wx = first; wx <= last; wx += px) {
          const on = random() < chance * occupancy;
          const pick = random();
          const tone: Tone = pick < 0.66 ? "warm" : pick < 0.84 ? "white" : pick < 0.96 ? "cool" : "neon";
          windows.push({ x: wx + (px - ww) / 2, y: wy + (py - wh) / 2, w: ww, h: wh, tone, on });
        }
      }
    }

    x += w + (random() < 0.4 ? 0 : snap(random() * spec.gap));
  }

  // A handful of windows stay addressable so they can switch on and off later.
  const live: Live[] = [];
  const candidates = windows.filter((win) => win.x > W * 0.18 && win.x < W * 0.82);
  for (let i = 0; i < spec.live && candidates.length > 0; i++) {
    const pick = candidates.splice(Math.floor(random() * candidates.length), 1)[0];
    live.push({ ...pick, tv: random() < 0.18 });
  }
  for (const win of windows) {
    if (win.on && !live.some((l) => l.x === win.x && l.y === win.y)) lit[win.tone].push(rect(win.x, win.y, win.w, win.h));
  }

  return {
    silhouette: silhouette.join(""),
    facade: facade.join(""),
    lit: Object.fromEntries(Object.entries(lit).map(([tone, list]) => [tone, list.join("")])) as Record<Tone, string>,
    live,
    beacons,
    edges: edges.join(""),
    crowns,
    anchors,
  };
}

function generateCity(seed: number, lights: number, signs: Sign[]) {
  const random = mulberry32(seed * 7919 + 17);
  // Two downtown clusters and a gentle roll between them.
  const c1 = W * (0.3 + random() * 0.1);
  const c2 = W * (0.62 + random() * 0.12);
  const roll = random() * Math.PI * 2;
  const shape = (spec: LayerSpec) => (x: number) => {
    const cluster = Math.max(
      Math.exp(-(((x - c1) / 170) ** 2)),
      0.85 * Math.exp(-(((x - c2) / 210) ** 2)),
    );
    const wave = 0.18 * (Math.sin(x / 97 + roll) + 1) / 2;
    return spec.base + (spec.peak - spec.base) * Math.min(1, cluster + wave);
  };

  const far = generateLayer(layerSpecs.far, random, shape(layerSpecs.far), lights * 0.5);
  const mid = generateLayer(layerSpecs.mid, random, shape(layerSpecs.mid), lights);

  // Signs go near the middle so they survive narrow crops: the first within a phone's view.
  const spots = signs.slice(0, 3).map((sign, i) => {
    const size = i === 0 ? 17 : 13;
    const width = Math.max(26, sign.text.length * size * 0.66 + 12);
    const x = W / 2 + [-96, 228, -300][i];
    return { ...sign, x, size, width };
  });
  const near = generateLayer(layerSpecs.near, random, shape(layerSpecs.near), lights * 0.9, spots);
  const placed: PlacedSign[] = spots.map((spot, i) => {
    const roofY = near.anchors[i] ?? H - 120;
    // Secondary signs sit in a tube frame, which also lifts them a little higher off the roof.
    const framed = i > 0;
    return { ...spot, y: roofY - (framed ? 12 : 9), roof: roofY, alt: i % 2 === 1, framed };
  });

  const stars = Array.from({ length: 46 }, () => ({
    x: r1(random() * W),
    y: r1(random() * H * 0.42),
    r: r1(0.4 + random() * 0.7),
    a: r1(0.15 + random() * 0.45),
  }));

  // The tallest spired tower near the middle gets a floodlit crown.
  const crown = mid.crowns
    .filter((c) => c.x > W * 0.25 && c.x + c.w < W * 0.75)
    .sort((a, b) => a.y - b.y)[0];

  return { far, mid, near, signs: placed, stars, crown: crown ?? null };
}

// Unlit windows: a faint glass grid that lines up with the lit ones.
function Glass({ id, spec, alpha }: { id: string; spec: LayerSpec; alpha: number }) {
  const [px, py] = spec.pitch;
  const [ww, wh] = spec.win;
  return (
    <pattern id={id} width={px} height={py} patternUnits="userSpaceOnUse">
      <rect x={(px - ww) / 2} y={(py - wh) / 2} width={ww} height={wh} fill={`rgb(255 255 255 / ${alpha})`} />
    </pattern>
  );
}

const subscribeNothing = () => () => {};

const css = `
.nk-cityscape-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.nk-cityscape-sign { transition: opacity 60ms linear; }
@keyframes nk-cityscape-on { from { opacity: 0; } to { opacity: 1; } }
.nk-cityscape-city { animation: nk-cityscape-on 700ms cubic-bezier(0.23, 1, 0.32, 1) both; }
.nk-cityscape-lights { animation: nk-cityscape-on 1.4s cubic-bezier(0.23, 1, 0.32, 1) 250ms both; }
.nk-cityscape-alt { --nk-sign: rgb(255 77 109); }
@supports (color: oklch(from red l c h)) {
  .nk-cityscape-alt { --nk-sign: oklch(from rgb(var(--neon)) clamp(0.62, l, 0.8) max(c, 0.16) calc(h + 150)); }
}
@media (prefers-reduced-motion: reduce) { .nk-cityscape-city, .nk-cityscape-lights { animation: none; } }
`;

export interface CityscapeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Sky glow, haze, the floodlit crown and the first sign. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Same seed, same skyline. */
  seed?: number;
  /** Share of windows lit, 0 to 1. The default is two in the morning. */
  lights?: number;
  /** Up to three rooftop signs. Strings take the neon color, then a contrasting hue. */
  signs?: (string | Sign)[];
  /** Windows switch on and off, a TV glows here and there, and signs stutter. */
  flicker?: boolean;
  /** Faint stars above the skyline. */
  stars?: boolean;
  /** Layers drift apart as the page scrolls. A number sets the far layer's travel in pixels. */
  parallax?: boolean | number;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const Cityscape = React.forwardRef<HTMLDivElement, CityscapeProps>(
  (
    {
      className,
      style,
      color,
      seed = 7,
      lights = 0.16,
      signs = ["HOTEL", "24H"],
      flicker = true,
      stars = true,
      parallax = false,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const farRef = React.useRef<SVGSVGElement>(null);
    const midRef = React.useRef<SVGSVGElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);
    const uid = React.useId().replace(/[^a-zA-Z0-9_-]/g, "");

    const signList = signs.map((sign) => (typeof sign === "string" ? { text: sign } : sign));
    const signKey = JSON.stringify(signList);
    // The skyline is a few dozen kilobytes of path data, so it's built in the browser rather than shipped in the HTML.
    const mounted = React.useSyncExternalStore(subscribeNothing, () => true, () => false);
    const city = React.useMemo(
      () => (mounted ? generateCity(seed, Math.max(0, Math.min(1, lights)), JSON.parse(signKey) as Sign[]) : null),
      [mounted, seed, lights, signKey],
    );

    // Flicker runs on a slow timer with direct attribute writes: no per-frame work, no re-renders.
    React.useEffect(() => {
      const root = rootRef.current;
      if (!root || !flicker || !city) return;
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const random = mulberry32(seed + 101);
      let timer: ReturnType<typeof setTimeout> | undefined;
      let inView = true;
      let tick = 0;
      const windows = Array.from(root.querySelectorAll<SVGRectElement>("[data-live]"));
      const tvs = windows.filter((node) => node.dataset.tv !== undefined);
      const plain = windows.filter((node) => node.dataset.tv === undefined);
      const beacons = Array.from(root.querySelectorAll<SVGGElement>("[data-beacon]"));
      const signNodes = Array.from(root.querySelectorAll<SVGGElement>("[data-sign]"));
      const stutters: { node: SVGGElement; steps: number[] }[] = [];

      const run = () => {
        tick++;
        // Somebody goes to bed, somebody gets up for water.
        if (plain.length && random() < 0.12) {
          const node = plain[Math.floor(random() * plain.length)];
          node.style.opacity = node.style.opacity === "0" ? "1" : "0";
        }
        for (const node of tvs) {
          if (random() < 0.45) node.style.opacity = (0.35 + random() * 0.65).toFixed(2);
        }
        beacons.forEach((node, i) => {
          node.style.opacity = (tick + i * 7) % 20 < 3 ? "1" : "0.12";
        });
        if (signNodes.length && stutters.length === 0 && random() < 0.018) {
          const node = signNodes[Math.floor(random() * signNodes.length)];
          stutters.push({ node, steps: [0.15, 1, 0.3, 0.85, 0.1, 1] });
        }
        for (let i = stutters.length - 1; i >= 0; i--) {
          const stutter = stutters[i];
          const next = stutter.steps.shift();
          if (next === undefined) stutters.splice(i, 1);
          else stutter.node.style.opacity = String(next);
        }
        timer = setTimeout(run, 110);
      };

      const sync = () => {
        clearTimeout(timer);
        timer = undefined;
        if (inView && !document.hidden && !motion.matches) timer = setTimeout(run, 110);
        else for (const { node } of stutters.splice(0)) node.style.opacity = "1";
      };

      const intersection =
        typeof IntersectionObserver === "undefined"
          ? null
          : new IntersectionObserver(([entry]) => {
              inView = entry.isIntersecting;
              sync();
            });
      intersection?.observe(root);
      document.addEventListener("visibilitychange", sync);
      motion.addEventListener("change", sync);
      sync();

      return () => {
        clearTimeout(timer);
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
        for (const node of windows) node.style.opacity = "";
        for (const node of [...beacons, ...signNodes]) node.style.opacity = "";
      };
    }, [flicker, seed, city]);

    // Scroll parallax: back layers lag behind the page. Transform-only writes, once per scrolled frame.
    React.useEffect(() => {
      const root = rootRef.current;
      const layers = [farRef.current, midRef.current];
      const travel = parallax === true ? 28 : typeof parallax === "number" ? parallax : 0;
      if (!root || !travel || !city) return;
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let raf = 0;
      const update = () => {
        raf = 0;
        if (motion.matches) {
          for (const layer of layers) if (layer) layer.style.transform = "";
          return;
        }
        const rect = root.getBoundingClientRect();
        const viewport = window.innerHeight || 1;
        // -1 when the box sits below the viewport, 1 when it has scrolled above it.
        const progress = Math.max(-1, Math.min(1, (viewport / 2 - (rect.top + rect.height / 2)) / viewport));
        layers.forEach((layer, i) => {
          if (layer) layer.style.transform = `translate3d(0, ${(progress * travel * (i === 0 ? 1 : 0.45)).toFixed(2)}px, 0)`;
        });
      };
      const onScroll = () => {
        if (!raf) raf = requestAnimationFrame(update);
      };
      update();
      // Capture catches scrolling in any container, not just the window.
      document.addEventListener("scroll", onScroll, { passive: true, capture: true });
      window.addEventListener("resize", onScroll, { passive: true });
      motion.addEventListener("change", onScroll);
      return () => {
        cancelAnimationFrame(raf);
        document.removeEventListener("scroll", onScroll, { capture: true });
        window.removeEventListener("resize", onScroll);
        motion.removeEventListener("change", onScroll);
        for (const layer of layers) if (layer) layer.style.transform = "";
      };
    }, [parallax, city]);

    const id = (name: string) => `${uid}-${name}`;
    const scaffold = "color-mix(in srgb, var(--nk-sign) 22%, #0b0d16)";
    // One tube drawing, rendered twice: blurred in the sign's color for the halo, then crisp and whitened for the core.
    const glyphs = (sign: PlacedSign, paint: string, stroke: number) => {
      const spacing = sign.size * 0.12;
      const box = { w: sign.width - 2, h: sign.size * 1.4 };
      const middle = sign.y - 3 - sign.size * 0.36;
      return (
        <>
          <text
            x={sign.x + spacing / 2}
            y={sign.y - 3}
            textAnchor="middle"
            fontSize={sign.size}
            letterSpacing={spacing}
            style={{ fill: paint, fontFamily: "inherit", fontWeight: 500 }}
          >
            {sign.text}
          </text>
          {sign.framed && (
            <rect
              x={sign.x - box.w / 2}
              y={middle - box.h / 2}
              width={box.w}
              height={box.h}
              rx={2.5}
              style={{ fill: "none", stroke: paint, strokeWidth: stroke }}
            />
          )}
        </>
      );
    };
    const svgProps = {
      viewBox: `0 0 ${W} ${H}`,
      preserveAspectRatio: "xMidYMax slice",
      className: "nk-cityscape-svg",
    } as const;

    // Static lights share one path per tone (and one filter pass); only the few live windows are separate nodes,
    // kept outside the filter so toggling them never re-blurs the whole layer.
    const windows = (layer: Layer, opacity: number, glow?: string) => (
      <g className="nk-cityscape-lights" opacity={opacity}>
        <g filter={glow}>
          {(Object.keys(tones) as Tone[]).map((tone) => (
            <path key={tone} d={layer.lit[tone]} style={{ fill: tones[tone] }} />
          ))}
        </g>
        {layer.live.map((win, i) => (
          <rect
            key={i}
            data-live=""
            data-tv={win.tv ? "" : undefined}
            x={win.x}
            y={win.y}
            width={win.w}
            height={win.h}
            opacity={win.on || win.tv ? 1 : 0}
            style={{ fill: win.tv ? "rgb(150 190 255)" : tones[win.tone] }}
          />
        ))}
      </g>
    );

    return (
      <div
        ref={rootRef}
        aria-hidden
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        {...props}
      >
        <style>{css}</style>
        {/* Light pollution: the city's own glow on low cloud, tinted by the neon and sodium streetlights. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_100%,rgb(var(--neon)/0.16),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_35%_at_50%_100%,rgb(255_150_70/0.1),transparent_75%)]" />

        {city && (
          <div className="nk-cityscape-city absolute inset-0">
            {stars && (
              <svg {...svgProps}>
                {city.stars.map((star, i) => (
                  <circle key={i} cx={star.x} cy={star.y} r={star.r} fill="white" opacity={star.a} />
                ))}
              </svg>
            )}

            <svg ref={farRef} {...svgProps}>
              <defs>
                <linearGradient id={id("far")} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0.3" style={{ stopColor: "color-mix(in srgb, rgb(var(--neon)) 4%, #0b0d19)" }} />
                  <stop offset="1" style={{ stopColor: "color-mix(in srgb, rgb(var(--neon)) 10%, #0f1222)" }} />
                </linearGradient>
              </defs>
              <path d={city.far.silhouette} fill={`url(#${id("far")})`} />
              {windows(city.far, 0.45)}
              {city.far.beacons.map((beacon, i) => (
                <g key={i} data-beacon="">
                  <circle cx={beacon.x} cy={beacon.y} r={5} fill="rgb(255 60 60 / 0.18)" />
                  <circle cx={beacon.x} cy={beacon.y} r={1.3} fill="rgb(255 90 80)" />
                </g>
              ))}
            </svg>

            <svg ref={midRef} {...svgProps}>
              <defs>
                <linearGradient id={id("mid")} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0.4" style={{ stopColor: "#080912" }} />
                  <stop offset="1" style={{ stopColor: "color-mix(in srgb, rgb(var(--neon)) 5%, #0a0c17)" }} />
                </linearGradient>
                <Glass id={id("glass-mid")} spec={layerSpecs.mid} alpha={0.035} />
                <linearGradient id={id("haze")} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" style={{ stopColor: "rgb(var(--neon))", stopOpacity: 0 }} />
                  <stop offset="1" style={{ stopColor: "rgb(var(--neon))", stopOpacity: 0.07 }} />
                </linearGradient>
              </defs>
              {/* Haze between the far and middle rows. */}
              <rect x={-W} y={H * 0.55} width={W * 3} height={H * 0.45} fill={`url(#${id("haze")})`} />
              <path d={city.mid.silhouette} fill={`url(#${id("mid")})`} />
              <path d={city.mid.facade} fill={`url(#${id("glass-mid")})`} />
              <path d={city.mid.edges} style={{ stroke: "rgb(var(--neon) / 0.12)" }} strokeWidth={0.6} fill="none" />
              {windows(city.mid, 0.78)}
              {city.crown && (
                // Floodlit crown: light washing up the top floors, with a lit parapet and a glowing mast.
                <g data-sign="" className="nk-cityscape-sign">
                  <linearGradient id={id("flood")} x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" style={{ stopColor: "rgb(var(--neon))", stopOpacity: 0 }} />
                    <stop offset="1" style={{ stopColor: "rgb(var(--neon))", stopOpacity: 0.32 }} />
                  </linearGradient>
                  <rect x={city.crown.x} y={city.crown.y} width={city.crown.w} height={22} fill={`url(#${id("flood")})`} />
                  <path
                    d={`M${city.crown.x} ${city.crown.y + 0.4}h${city.crown.w}M${city.crown.x + city.crown.w / 2} ${city.crown.y}v${-city.crown.h * 0.62}`}
                    filter={`url(#${id("tube")})`}
                    style={{ fill: "none", stroke: "rgb(var(--neon))", strokeWidth: 1.4 }}
                  />
                  <path
                    d={`M${city.crown.x} ${city.crown.y + 0.4}h${city.crown.w}`}
                    style={{ fill: "none", stroke: "color-mix(in srgb, rgb(var(--neon)) 35%, white)", strokeWidth: 0.6 }}
                  />
                </g>
              )}
              {city.mid.beacons.map((beacon, i) => (
                <g key={i} data-beacon="">
                  <circle cx={beacon.x} cy={beacon.y} r={6} fill="rgb(255 60 60 / 0.2)" />
                  <circle cx={beacon.x} cy={beacon.y} r={1.5} fill="rgb(255 90 80)" />
                </g>
              ))}
            </svg>

            <svg {...svgProps}>
              <defs>
                <linearGradient id={id("near")} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" style={{ stopColor: "#07080f" }} />
                  <stop offset="1" style={{ stopColor: "#05060a" }} />
                </linearGradient>
                <Glass id={id("glass-near")} spec={layerSpecs.near} alpha={0.03} />
                <linearGradient id={id("haze-near")} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" style={{ stopColor: "rgb(var(--neon))", stopOpacity: 0 }} />
                  <stop offset="1" style={{ stopColor: "rgb(var(--neon))", stopOpacity: 0.06 }} />
                </linearGradient>
                <filter id={id("bloom")} x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <filter id={id("tube")} x="-40%" y="-80%" width="180%" height="260%">
                  <feGaussianBlur stdDeviation="1.4" result="tight" />
                  <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="wide" />
                  <feMerge>
                    <feMergeNode in="wide" />
                    <feMergeNode in="tight" />
                  </feMerge>
                </filter>
              </defs>
              <rect x={-W} y={H * 0.62} width={W * 3} height={H * 0.38} fill={`url(#${id("haze-near")})`} />
              <path d={city.near.silhouette} fill={`url(#${id("near")})`} />
              <path d={city.near.facade} fill={`url(#${id("glass-near")})`} />
              <path d={city.near.edges} style={{ stroke: "rgb(var(--neon) / 0.16)" }} strokeWidth={0.6} fill="none" />
              {windows(city.near, 0.95, `url(#${id("bloom")})`)}

              {city.signs.map((sign, i) => {
                const legs = [sign.x - sign.width / 2 + 4, sign.x + sign.width / 2 - 4];
                return (
                  <g
                    key={i}
                    className={sign.color ? undefined : sign.alt ? "nk-cityscape-alt" : undefined}
                    style={{ "--nk-sign": sign.color ? `rgb(${toNeonRgb(sign.color)})` : sign.alt ? undefined : "rgb(var(--neon))" } as React.CSSProperties}
                  >
                    <radialGradient id={id(`spill-${i}`)}>
                      <stop offset="0" style={{ stopColor: "var(--nk-sign)", stopOpacity: 0.35 }} />
                      <stop offset="1" style={{ stopColor: "var(--nk-sign)", stopOpacity: 0 }} />
                    </radialGradient>
                    {/* Scaffold the letters stand on, catching a little of their light. */}
                    {legs.map((lx) => (
                      <rect key={lx} x={lx - 0.6} y={sign.y - 1} width={1.2} height={sign.roof - sign.y + 1} style={{ fill: scaffold }} />
                    ))}
                    <rect x={sign.x - sign.width / 2 + 2} y={sign.y - 1.4} width={sign.width - 4} height={1.4} style={{ fill: scaffold }} />
                    <g data-sign="" className="nk-cityscape-sign">
                      {/* Light spilling onto the roof and the facade just below it. */}
                      <ellipse cx={sign.x} cy={sign.roof + 4} rx={sign.width * 0.9} ry={sign.size * 1.4} fill={`url(#${id(`spill-${i}`)})`} />
                      <g filter={`url(#${id("tube")})`}>{glyphs(sign, "var(--nk-sign)", 1.6)}</g>
                      {glyphs(sign, "color-mix(in srgb, var(--nk-sign) 30%, white)", 0.8)}
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        )}
        {/* Streetlight bouncing up onto the lowest floors. */}
        <div className="absolute inset-x-0 bottom-0 h-[14%] bg-[linear-gradient(to_top,rgb(255_160_80/0.09),transparent)]" />
      </div>
    );
  },
);
Cityscape.displayName = "Cityscape";

export { Cityscape };
