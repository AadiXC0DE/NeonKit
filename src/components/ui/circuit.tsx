"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

type Chip = { x: number; y: number; w: number; h: number; heat: number };

type Trace = {
  /** Flat x,y pairs, starting at the chip pin. */
  pts: number[];
  /** Cumulative length at each point. */
  len: number[];
  total: number;
  chip: number;
  bus: number;
  /** Ends on a via inside the board rather than running off the edge. */
  via: boolean;
  flash: number;
};

type Board = {
  chips: Chip[];
  traces: Trace[];
  buses: number[][];
  /** Second-layer traces: dimmer, allowed to pass under the top layer. */
  under: number[][];
  vias: number[];
  parts: number[];
};

type Pulse = { trace: number; s: number; speed: number; tail: number };

const PITCH = 8;
const CELL = 4;
const DEG45 = Math.PI / 4;
const SPRITE = 48;

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

/** The theme's glow multiplier. A finite check, not `|| 1`, so 0 stays 0. */
function readGlow(node: Element) {
  const value = parseFloat(getComputedStyle(node).getPropertyValue("--neon-glow"));
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

// The canvas carries `color: rgb(var(--neon))`, so the resolved channels are one read away.
function readRgb(node: HTMLElement): Rgb {
  const parts = getComputedStyle(node).color.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return [34, 211, 238];
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

const mix = (a: Rgb, b: Rgb, t: number) => a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(" ");

function haloSprite(rgb: Rgb) {
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = SPRITE;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const c = SPRITE / 2;
  const gradient = ctx.createRadialGradient(c, c, 0, c, c, c);
  gradient.addColorStop(0, `rgb(${rgb.join(" ")} / 0.6)`);
  gradient.addColorStop(0.2, `rgb(${rgb.join(" ")} / 0.22)`);
  gradient.addColorStop(1, `rgb(${rgb.join(" ")} / 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SPRITE, SPRITE);
  return sprite;
}

// Offsets a polyline sideways with mitered corners. At 45° bends this is exactly how a bus of
// parallel traces keeps its spacing: the outer traces bend a little later than the inner ones.
function offsetLine(pts: number[], offset: number) {
  const n = pts.length / 2;
  const out: number[] = [];
  const normal = (i: number) => {
    const dx = pts[i * 2 + 2] - pts[i * 2];
    const dy = pts[i * 2 + 3] - pts[i * 2 + 1];
    const l = Math.hypot(dx, dy) || 1;
    return [-dy / l, dx / l];
  };
  for (let i = 0; i < n; i++) {
    let nx: number;
    let ny: number;
    if (i === 0) [nx, ny] = normal(0);
    else if (i === n - 1) [nx, ny] = normal(n - 2);
    else {
      const [ax, ay] = normal(i - 1);
      const [bx, by] = normal(i);
      const mx = ax + bx;
      const my = ay + by;
      const ml = Math.hypot(mx, my) || 1;
      const scale = 1 / Math.max(0.5, (mx / ml) * ax + (my / ml) * ay);
      nx = (mx / ml) * scale;
      ny = (my / ml) * scale;
    }
    out.push(pts[i * 2] + nx * offset, pts[i * 2 + 1] + ny * offset);
  }
  return out;
}

function lengths(pts: number[]) {
  const len = [0];
  for (let i = 2; i < pts.length; i += 2) {
    len.push(len[len.length - 1] + Math.hypot(pts[i] - pts[i - 2], pts[i + 1] - pts[i - 1]));
  }
  return len;
}

/** Shortens a polyline from its far end. */
function trimEnd(pts: number[], by: number) {
  const out = pts.slice();
  let left = by;
  while (out.length > 4 && left > 0) {
    const n = out.length;
    const dx = out[n - 2] - out[n - 4];
    const dy = out[n - 1] - out[n - 3];
    const l = Math.hypot(dx, dy);
    if (l > left) {
      out[n - 2] -= (dx / l) * left;
      out[n - 1] -= (dy / l) * left;
      return out;
    }
    left -= l;
    out.length = n - 2;
  }
  return out;
}

function generate(width: number, height: number, seed: number, density: number): Board {
  const random = mulberry32(seed * 2654435761 + 11);
  const pick = (min: number, max: number) => min + random() * (max - min);
  const snap = (v: number) => Math.round(v / PITCH) * PITCH;
  const cols = Math.ceil(width / CELL) + 1;
  const rows = Math.ceil(height / CELL) + 1;
  const grid = new Uint8Array(cols * rows);
  const cellAt = (x: number, y: number) => {
    const i = Math.floor(x / CELL);
    const j = Math.floor(y / CELL);
    if (i < 0 || j < 0 || i >= cols || j >= rows) return -1;
    return j * cols + i;
  };
  const block = (x: number, y: number, w: number, h: number) => {
    for (let yy = y; yy < y + h; yy += CELL / 2) {
      for (let xx = x; xx < x + w; xx += CELL / 2) {
        const c = cellAt(xx, yy);
        if (c >= 0) grid[c] = 1;
      }
    }
  };
  const free = (x: number, y: number, w: number, h: number) => {
    for (let yy = y; yy < y + h; yy += CELL / 2) {
      for (let xx = x; xx < x + w; xx += CELL / 2) {
        if (grid[cellAt(xx, yy)] === 1) return false;
      }
    }
    return true;
  };

  // Chips sit away from the middle, where a headline usually goes.
  const chips: Chip[] = [];
  // By area, with a floor by width so short, wide strips still get a row of chips.
  const wanted = Math.max(
    1,
    Math.round(((width * height) / 220000) * (0.6 + density)),
    Math.round((width / 300) * (0.4 + density * 0.6)),
  );
  for (let attempt = 0; attempt < 240 && chips.length < wanted; attempt++) {
    const w = snap(pick(56, 132));
    const h = snap(pick(48, 112));
    // Alternate halves so the board balances instead of clumping on one side.
    const half = chips.length % 2 === 0 ? 0 : 1;
    const lo = half === 0 ? 24 : width / 2;
    const hi = half === 0 ? width / 2 - w : width - w - 24;
    const x = snap(pick(lo, Math.max(lo, hi)));
    const y = snap(pick(24, height - h - 24));
    // On narrow boards the clear zone spans the full width, so chips go above and below the copy.
    const cx = (x + w / 2 - width / 2) / Math.max(width * 0.34, Math.min(width * 0.5, 300));
    const cy = (y + h / 2 - height / 2) / (height * (width < 560 ? 0.36 : 0.3));
    if (cx * cx + cy * cy < 1 && attempt < 180) continue;
    if (!free(x - 72, y - 72, w + 144, h + 144)) continue;
    chips.push({ x, y, w, h, heat: 0 });
    block(x - 6, y - 6, w + 12, h + 12);
  }

  const traces: Trace[] = [];
  const buses: number[][] = [];
  const vias: number[] = [];
  const inBounds = (x: number, y: number, pad: number) => x > -pad && y > -pad && x < width + pad && y < height + pad;

  chips.forEach((chip, chipIndex) => {
    const sides = [0, 1, 2, 3];
    for (let i = 3; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [sides[i], sides[j]] = [sides[j], sides[i]];
    }
    sides.length = 2 + Math.floor(random() * 2.2);
    for (const side of sides) {
      const along = side % 2 === 0 ? chip.h : chip.w;
      const maxPins = Math.max(2, Math.floor((along - 12) / PITCH));
      const pins = Math.max(2, Math.min(maxPins, Math.round(pick(3, 8))));
      // Outward direction: right, down, left, up.
      let angle = (side * Math.PI) / 2;
      const ex = side === 0 ? chip.x + chip.w : side === 2 ? chip.x : chip.x + chip.w / 2;
      const ey = side === 1 ? chip.y + chip.h : side === 3 ? chip.y : chip.y + chip.h / 2;
      const shift = snap(pick(-1, 1) * Math.max(0, (along - pins * PITCH) / 2 - 8));
      const startX = ex + (side % 2 === 1 ? shift : 0);
      const startY = ey + (side % 2 === 0 ? shift : 0);
      const offsets = Array.from({ length: pins }, (_, i) => (i - (pins - 1) / 2) * PITCH);
      const guard = [offsets[0] - PITCH, ...offsets, offsets[pins - 1] + PITCH];

      const line = [startX, startY];
      let x = startX;
      let y = startY;
      let ended = false;
      let offEdge = false;
      let travelled = 0;
      // Walks one segment, stopping early on a collision or at the board edge.
      const walk = (length: number) => {
        const dx = Math.cos(angle);
        const dy = Math.sin(angle);
        const nx = -dy;
        const ny = dx;
        let done = 0;
        for (let s = 2; s <= length; s += 2) {
          const px = x + dx * s;
          const py = y + dy * s;
          if (!inBounds(px, py, 6)) {
            offEdge = true;
            done = s + 24;
            break;
          }
          if (travelled + s > 10) {
            let hit = false;
            for (const o of guard) {
              const c = cellAt(px + nx * o, py + ny * o);
              if (c >= 0 && grid[c] === 1) {
                hit = true;
                break;
              }
            }
            if (hit) {
              done = Math.max(0, s - 10);
              ended = true;
              break;
            }
          }
          done = s;
        }
        if (done > 0) {
          x += dx * done;
          y += dy * done;
          travelled += done;
          line.push(x, y);
        }
        return done;
      };

      walk(snap(pick(16, 72)) + 8);
      const turns = 1 + Math.floor(random() * 3);
      for (let t = 0; t < turns && !ended && !offEdge; t++) {
        const roll = random();
        const sign = random() < 0.5 ? -1 : 1;
        if (roll < 0.6) {
          // A jog: 45° off, then back to the same heading.
          angle += sign * DEG45;
          if (walk(snap(pick(16, 72))) === 0 || ended || offEdge) break;
          angle -= sign * DEG45;
        } else if (roll < 0.85) {
          // A chamfered right angle.
          angle += sign * DEG45;
          if (walk(PITCH * (pins + 1)) === 0 || ended || offEdge) break;
          angle += sign * DEG45;
        }
        walk(snap(pick(40, 260)));
      }
      if (!ended && !offEdge) walk(snap(pick(24, 120)));

      if (travelled < 28) continue;
      // Claim the bus's footprint so later buses route around it.
      const centre = lengths(line);
      const total = centre[centre.length - 1];
      for (const o of offsets) {
        const path = offsetLine(line, o);
        const len = lengths(path);
        for (let k = 1; k < len.length; k++) {
          const ax = path[k * 2 - 2];
          const ay = path[k * 2 - 1];
          const seg = len[k] - len[k - 1];
          for (let s = 0; s <= seg; s += 2) {
            const c = cellAt(ax + ((path[k * 2] - ax) * s) / seg, ay + ((path[k * 2 + 1] - ay) * s) / seg);
            if (c >= 0) grid[c] = 1;
          }
        }
      }
      const busIndex = buses.length;
      const members: number[] = [];
      offsets.forEach((o, i) => {
        // Every other trace stops a little short, so the vias at the end stagger instead of touching.
        let path = offsetLine(line, o);
        if (!offEdge && i % 2 === 1) path = trimEnd(path, 9);
        const len = lengths(path);
        const end = path.length;
        const via = !offEdge && total > 0;
        if (via) vias.push(path[end - 2], path[end - 1]);
        members.push(traces.length);
        traces.push({ pts: path, len, total: len[len.length - 1], chip: chipIndex, bus: busIndex, via, flash: 0 });
      });
      buses.push(members);
    }
  });

  // The bottom layer: single traces that pass under everything, each ending on two vias.
  const under: number[][] = [];
  const lone = Math.round(((width * height) / 26000) * density);
  for (let n = 0; n < lone; n++) {
    let x = snap(pick(0, width));
    let y = snap(pick(0, height));
    let angle = Math.floor(random() * 8) * DEG45;
    const path = [x, y];
    const segments = 2 + Math.floor(random() * 2);
    for (let s = 0; s < segments; s++) {
      const length = snap(pick(24, 140));
      x += Math.cos(angle) * length;
      y += Math.sin(angle) * length;
      path.push(x, y);
      angle += (random() < 0.5 ? -1 : 1) * DEG45;
    }
    if (chips.some((c) => path.some((v, i) => i % 2 === 0 && v > c.x - 8 && v < c.x + c.w + 8 && path[i + 1] > c.y - 8 && path[i + 1] < c.y + c.h + 8))) continue;
    under.push(path);
  }

  // Small two-pad parts (resistors, capacitors) wherever there's room.
  const parts: number[] = [];
  const partCount = Math.round(((width * height) / 70000) * density);
  for (let n = 0, tries = 0; n < partCount && tries < partCount * 8; tries++) {
    const vertical = random() < 0.5;
    const w = vertical ? 6 : 14;
    const h = vertical ? 14 : 6;
    const x = snap(pick(8, width - 24));
    const y = snap(pick(8, height - 24));
    if (!free(x - 6, y - 6, w + 12, h + 12)) continue;
    block(x - 4, y - 4, w + 8, h + 8);
    parts.push(x, y, w, h);
    n++;
  }

  return { chips, traces, buses, under, vias, parts };
}

export interface CircuitProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Color of the pulses and lit pins. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** Same seed and size, same board. */
  seed?: number;
  /** How busy the board is, 0 to 1: chips, under-layer traces and small parts. */
  density?: number;
  /** How often pulses set off, as a multiplier. 0 sends none. */
  pulses?: number;
  /** Speed multiplier for the pulses. 0 holds still. */
  speed?: number;
  /** Brightness of the pulses and the board, 0 to 1. */
  intensity?: number;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const Circuit = React.forwardRef<HTMLDivElement, CircuitProps>(
  (
    { className, style, color, seed = 7, density = 0.6, pulses = 1, speed = 1, intensity = 0.85, ...props },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const boardRef = React.useRef<HTMLCanvasElement>(null);
    const lightRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);

    const live = React.useRef({ seed, density, pulses, speed, intensity });
    const recolor = React.useRef<() => void>(() => {});
    const refresh = React.useRef<(rebuild: boolean) => void>(() => {});

    React.useEffect(() => {
      const rebuild = live.current.seed !== seed || live.current.density !== density;
      live.current = { seed, density, pulses, speed, intensity };
      refresh.current(rebuild);
    }, [seed, density, pulses, speed, intensity]);

    React.useEffect(() => {
      recolor.current();
    }, [color]);

    React.useEffect(() => {
      const root = rootRef.current;
      const boardCanvas = boardRef.current;
      const lightCanvas = lightRef.current;
      if (!root || !boardCanvas || !lightCanvas || typeof ResizeObserver === "undefined") return;
      const paint = boardCanvas.getContext("2d");
      const light = lightCanvas.getContext("2d");
      if (!paint || !light) return;

      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let random = mulberry32(live.current.seed);
      let board: Board = { chips: [], traces: [], buses: [], under: [], vias: [], parts: [] };
      let width = 0;
      let height = 0;
      let rgb = readRgb(lightCanvas);
      let glow = readGlow(lightCanvas);
      let halo = haloSprite(rgb);
      let raf = 0;
      let last = 0;
      let inView = true;
      let nextPulse = 0.2;
      let pulseList: Pulse[] = [];

      const build = () => {
        board = generate(width, height, live.current.seed, Math.max(0, Math.min(1, live.current.density)));
        random = mulberry32(live.current.seed + 1);
        pulseList = [];
      };

      const pointAt = (trace: Trace, s: number) => {
        const { pts, len } = trace;
        let k = 1;
        while (k < len.length - 1 && len[k] < s) k++;
        const seg = len[k] - len[k - 1] || 1;
        const t = Math.max(0, Math.min(1, (s - len[k - 1]) / seg));
        return [pts[k * 2 - 2] + (pts[k * 2] - pts[k * 2 - 2]) * t, pts[k * 2 - 1] + (pts[k * 2 + 1] - pts[k * 2 - 1]) * t];
      };

      const polyline = (ctx: CanvasRenderingContext2D, pts: number[]) => {
        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
      };

      const drawBoard = () => {
        const dpr = boardCanvas.width / Math.max(width, 1);
        paint.setTransform(dpr, 0, 0, dpr, 0, 0);
        paint.clearRect(0, 0, width, height);
        const level = Math.max(0, Math.min(1, live.current.intensity));
        // Copper under solder mask: a cool grey that leans toward the color.
        const copper = mix([120, 132, 150], rgb, 0.3);
        paint.lineCap = "round";
        paint.lineJoin = "round";

        paint.strokeStyle = `rgb(${copper} / ${0.07 * (0.5 + level * 0.5)})`;
        paint.lineWidth = 1;
        paint.beginPath();
        for (const path of board.under) polyline(paint, path);
        paint.stroke();
        paint.fillStyle = `rgb(${copper} / ${0.1 * (0.5 + level * 0.5)})`;
        for (const path of board.under) {
          for (const i of [0, path.length - 2]) {
            paint.beginPath();
            paint.arc(path[i], path[i + 1], 2, 0, Math.PI * 2);
            paint.fill();
          }
        }

        paint.strokeStyle = `rgb(${copper} / ${0.2 * (0.5 + level * 0.5)})`;
        paint.lineWidth = 1.25;
        paint.beginPath();
        for (const trace of board.traces) polyline(paint, trace.pts);
        paint.stroke();

        // Vias: a plated ring around a drilled hole.
        paint.lineWidth = 1.2;
        paint.strokeStyle = `rgb(${copper} / ${0.36 * (0.5 + level * 0.5)})`;
        paint.fillStyle = "#05060a";
        for (let i = 0; i < board.vias.length; i += 2) {
          paint.beginPath();
          paint.arc(board.vias[i], board.vias[i + 1], 2.8, 0, Math.PI * 2);
          paint.fill();
          paint.stroke();
        }

        paint.fillStyle = `rgb(${copper} / ${0.22 * (0.5 + level * 0.5)})`;
        for (let i = 0; i < board.parts.length; i += 4) {
          const [x, y, w, h] = board.parts.slice(i, i + 4);
          if (w > h) {
            paint.fillRect(x, y, 4, h);
            paint.fillRect(x + w - 4, y, 4, h);
          } else {
            paint.fillRect(x, y, w, 4);
            paint.fillRect(x, y + h - 4, w, 4);
          }
        }

        for (const chip of board.chips) {
          const { x, y, w, h } = chip;
          // Silkscreen corner marks around the footprint.
          paint.strokeStyle = "rgb(255 255 255 / 0.1)";
          paint.lineWidth = 1;
          paint.beginPath();
          const m = 10;
          const k = 7;
          for (const [cx, cy, sx, sy] of [
            [x - m, y - m, 1, 1],
            [x + w + m, y - m, -1, 1],
            [x - m, y + h + m, 1, -1],
            [x + w + m, y + h + m, -1, -1],
          ]) {
            paint.moveTo(cx + sx * k, cy);
            paint.lineTo(cx, cy);
            paint.lineTo(cx, cy + sy * k);
          }
          paint.stroke();
          paint.fillStyle = "#0a0c12";
          paint.strokeStyle = "rgb(255 255 255 / 0.14)";
          paint.beginPath();
          paint.roundRect?.(x + 0.5, y + 0.5, w - 1, h - 1, 3);
          paint.fill();
          paint.stroke();
          // Pin 1.
          paint.fillStyle = "rgb(255 255 255 / 0.16)";
          paint.beginPath();
          paint.arc(x + 8, y + 8, 2, 0, Math.PI * 2);
          paint.fill();
        }

        // Pins: a short pad where each trace leaves its chip.
        paint.fillStyle = `rgb(${mix([150, 160, 178], rgb, 0.25)} / 0.32)`;
        for (const trace of board.traces) {
          const [x, y] = trace.pts;
          paint.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
      };

      const drawLight = () => {
        light.clearRect(0, 0, width, height);
        const level = Math.max(0, Math.min(1, live.current.intensity));
        if (level === 0) return;
        const hot = mix(rgb, [255, 255, 255], 0.55);
        light.lineCap = "round";
        light.lineJoin = "round";

        for (const pulse of pulseList) {
          const trace = board.traces[pulse.trace];
          const head = Math.max(0, pulse.s);
          const tailEnd = Math.min(trace.total, pulse.s + pulse.tail);
          if (tailEnd <= head) continue;
          const [hx, hy] = pointAt(trace, head);
          const [tx, ty] = pointAt(trace, tailEnd);
          const path = () => {
            light.beginPath();
            light.moveTo(tx, ty);
            for (let k = trace.len.length - 1; k > 0; k--) {
              if (trace.len[k] < tailEnd && trace.len[k] > head) light.lineTo(trace.pts[k * 2], trace.pts[k * 2 + 1]);
            }
            light.lineTo(hx, hy);
          };
          const gradient = (core: string, alpha: number) => {
            const g = light.createLinearGradient(tx, ty, hx, hy);
            g.addColorStop(0, `rgb(${core} / 0)`);
            g.addColorStop(1, `rgb(${core} / ${alpha})`);
            return g;
          };
          if (glow > 0) {
            light.lineWidth = 5;
            light.strokeStyle = gradient(rgb.join(" "), Math.min(1, 0.3 * level * glow));
            path();
            light.stroke();
          }
          light.lineWidth = 1.5;
          light.strokeStyle = gradient(hot, level);
          path();
          light.stroke();
          if (pulse.s > 0 && glow > 0) {
            const s = 30;
            light.globalAlpha = Math.min(1, level * glow);
            light.drawImage(halo, hx - s / 2, hy - s / 2, s, s);
            light.globalAlpha = 1;
          }
        }

        // Pins that just took a pulse, and chips warmed by the traffic.
        for (const trace of board.traces) {
          if (trace.flash < 0.02) continue;
          const [x, y] = trace.pts;
          if (glow > 0) {
            const s = 22;
            light.globalAlpha = Math.min(1, trace.flash * level * glow);
            light.drawImage(halo, x - s / 2, y - s / 2, s, s);
            light.globalAlpha = 1;
          }
          light.fillStyle = `rgb(${hot} / ${trace.flash * level})`;
          light.fillRect(x - 1.5, y - 1.5, 3, 3);
        }
        for (const chip of board.chips) {
          if (chip.heat < 0.02) continue;
          light.strokeStyle = `rgb(${rgb.join(" ")} / ${Math.min(0.7, chip.heat * 0.55) * level})`;
          light.lineWidth = 1;
          light.beginPath();
          light.roundRect?.(chip.x + 0.5, chip.y + 0.5, chip.w - 1, chip.h - 1, 3);
          light.stroke();
          if (glow > 0) {
            // The die under the lid, glowing faintly while it works.
            const cx = chip.x + chip.w / 2;
            const cy = chip.y + chip.h / 2;
            const r = Math.min(chip.w, chip.h) * 0.42;
            const g = light.createRadialGradient(cx, cy, 0, cx, cy, r);
            g.addColorStop(0, `rgb(${rgb.join(" ")} / ${Math.min(0.22, chip.heat * 0.2) * level * glow})`);
            g.addColorStop(1, `rgb(${rgb.join(" ")} / 0)`);
            light.fillStyle = g;
            light.fillRect(cx - r, cy - r, r * 2, r * 2);
          }
        }
      };

      const launch = (trace: number, delay = 0) => {
        const t = board.traces[trace];
        const pace = 150 + random() * 110;
        pulseList.push({ trace, s: t.total + delay * pace, speed: pace, tail: 46 + random() * 40 });
      };

      const advance = (dt: number) => {
        const pace = Math.max(0, live.current.speed);
        const rate = Math.max(0, live.current.pulses);
        if (rate > 0 && board.traces.length > 0) {
          nextPulse -= dt * pace;
          if (nextPulse <= 0) {
            const bus = board.buses[Math.floor(random() * board.buses.length)];
            if (random() < 0.45) {
              // A whole bus fires: a word of data crossing in parallel, slightly skewed.
              const speedShared = 150 + random() * 110;
              const tail = 46 + random() * 30;
              bus.forEach((trace) => {
                const t = board.traces[trace];
                pulseList.push({ trace, s: t.total + random() * 18, speed: speedShared, tail });
              });
            } else {
              launch(bus[Math.floor(random() * bus.length)]);
            }
            nextPulse = (0.25 + random() * 0.7) / rate;
          }
        }
        for (const pulse of pulseList) {
          const before = pulse.s;
          pulse.s -= pulse.speed * pace * dt;
          if (before > 0 && pulse.s <= 0) {
            const trace = board.traces[pulse.trace];
            trace.flash = 1;
            const chip = board.chips[trace.chip];
            chip.heat = Math.min(1, chip.heat + 0.22);
          }
        }
        pulseList = pulseList.filter((pulse) => pulse.s + pulse.tail > 0);
        const fade = Math.exp(-dt * 3.2);
        for (const trace of board.traces) trace.flash *= fade;
        const cool = Math.exp(-dt * 0.9);
        for (const chip of board.chips) chip.heat *= cool;
      };

      // A still frame still shows the board at work: a few pulses mid-flight, one chip warm.
      const still = () => {
        random = mulberry32(live.current.seed + 1);
        pulseList = [];
        for (const chip of board.chips) chip.heat = 0;
        for (const trace of board.traces) trace.flash = 0;
        const count = Math.min(board.buses.length, 5);
        for (let i = 0; i < count; i++) {
          const bus = board.buses[Math.floor((i / count) * board.buses.length)];
          const trace = board.traces[bus[Math.floor(random() * bus.length)]];
          pulseList.push({ trace: board.traces.indexOf(trace), s: trace.total * (0.25 + random() * 0.5), speed: 0, tail: 70 });
        }
        if (board.chips[0]) board.chips[0].heat = 0.8;
      };

      const running = () =>
        inView && !document.hidden && !motion.matches && width > 0 && live.current.speed > 0;

      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        advance(dt);
        drawLight();
        schedule();
      };

      const schedule = () => {
        if (!raf && running()) raf = requestAnimationFrame(frame);
      };

      const sync = () => {
        if (running()) schedule();
        else {
          cancelAnimationFrame(raf);
          raf = 0;
          last = 0;
          if (width === 0) return;
          if (motion.matches || live.current.speed <= 0) still();
          drawLight();
        }
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const nextWidth = root.clientWidth;
        const nextHeight = root.clientHeight;
        const changed = nextWidth !== width || nextHeight !== height;
        width = nextWidth;
        height = nextHeight;
        for (const canvas of [boardCanvas, lightCanvas]) {
          canvas.width = Math.round(width * dpr);
          canvas.height = Math.round(height * dpr);
        }
        light.setTransform(dpr, 0, 0, dpr, 0, 0);
        if (changed || board.traces.length === 0) build();
        drawBoard();
        sync();
      };

      recolor.current = () => {
        rgb = readRgb(lightCanvas);
        glow = readGlow(lightCanvas);
        halo = haloSprite(rgb);
        if (width > 0) {
          drawBoard();
          if (!raf) drawLight();
        }
      };
      refresh.current = (rebuild) => {
        if (width === 0) return;
        if (rebuild) build();
        drawBoard();
        sync();
      };
      const onTransition = (event: TransitionEvent) => {
        if (event.target === lightCanvas) recolor.current();
      };

      const resizeObserver = new ResizeObserver(resize);
      let dprQuery: MediaQueryList | undefined;
      const onDpr = () => {
        resize();
        watchDpr();
      };
      const watchDpr = () => {
        dprQuery?.removeEventListener?.("change", onDpr);
        dprQuery = window.matchMedia?.(`(resolution: ${window.devicePixelRatio || 1}dppx)`);
        dprQuery?.addEventListener?.("change", onDpr);
      };
      watchDpr();
      resizeObserver.observe(root);
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
      lightCanvas.addEventListener("transitionend", onTransition);

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        dprQuery?.removeEventListener?.("change", onDpr);
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
        lightCanvas.removeEventListener("transitionend", onTransition);
        recolor.current = () => {};
        refresh.current = () => {};
      };
    }, []);

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
        <canvas ref={boardRef} className="absolute inset-0 size-full" />
        {/* The color and letter-spacing transitions are change detectors: when --neon or --neon-glow changes upstream, transitionend fires. */}
        <canvas
          ref={lightRef}
          className="absolute inset-0 size-full"
          style={{
            color: "rgb(var(--neon))",
            letterSpacing: "calc(var(--neon-glow, 1) * 1px)",
            transition: "color 1ms linear, letter-spacing 1ms linear",
          }}
        />
      </div>
    );
  },
);
Circuit.displayName = "Circuit";

export { Circuit };
