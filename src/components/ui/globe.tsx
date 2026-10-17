"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

// Land on a 1° grid, 180 rows from 89.5°N down, 360 columns from 179.5°W east. Each row is run lengths
// alternating sea and land, starting with sea: one base-62 digit, or "-" and two digits for runs of 62+.
// Rasterised from Natural Earth 1:110m land (public domain).
const LAND = "-5O,-5O,-5O,-5O,-5O,-5O,-2hc-3l,-1w21lfp-3g,-1rp4D29-36,-1m76d3Pz213m4F6-1k,-1nl8Lu824-167-1i,-1535513341d2Rw7-1j5-1d,Z341g16a9Ox441-1i2-1d,W48273252a9N-1o4wb-16,-1171353221615mD-1f6ron8z,-142m611pB-1e3ro-18,U8924415232213mz-1d3ow1544d3B,T6191335124931mx-1c4d48Ma6z,01T41e53133g11hx-1c4c4121R31221dt,jaBb743ket21L7A61-1ok,ho4f3e3414545ad21rGfr4361-1w282,01cR6371362567goIme23a251-1H,04c-1e164229alLr322p2-1H,0513612-1h9c9iMk263s1-1J,174-1j11b632adh9qa3a5-2g,61813-1b244318ebj7qa3b2-2h2,829-18522197eaOb2-2x1,f-1b824173h7Nc3-2w111,e-1ag6n6Mc4-2c23297,fh2Qg8o3Md4-29799,i822aJh932-17d721-1X2453h,n3gJfa14W293267-1Ti3i,m213iFgfU4c115511-1Sh6h,k2qIbfU3b3145-1Ti7h,h2tK8iS4a2137-1Rj7i,f1xN2nM323a1631-1Tj5j,L13L3nL3337-2a11d4k,QK3nL2362-2d11d2m,QM1m11P53-2d11e1m,Q11-1431P24-2g12A,R21V324211Q-2i22A,VS1366M-2l21B,U11V9111O-2i31B,UX1121Wx133-1C42A,U-11Ye1g322-1CH,UU22-11d3e9-1A61B,US-10339342cc-1x64z,UR-10c834ae-1r94A,UR-10ba439454-1rO,UO-13a725315212-1u17b2C,UO-1398261333-1v3123c2C,VM-149l33-1t73c1D,VL-158e2624-1u124393D,WK-1816ab162122-1n5375D,XJ-1813dp-1m7248D,YH-18hq-1m614312H,-10D-19jo-1o94K,-11B-19o62c-1o92M,-1121x-19q47314-1p81N,-1212w-19t1-1DX,-1312h4262-19G1f2-1aW,-1411gd2-18J1d3-19W,-1331ee3-15K3d4-16X,-1513cf211-12M2e7-11Y,-1612cg1-13O2d117YZ,-1613a-1lO2e33aQ21W,-1b9-1kQ3k9N31X,-1c8e113-11Q3lal1n51X,-1d8i2YS2kbh5g12-17,-1c973a2XR3jee6e-1b,o1O954e3SR4hfc9c32-17,-1e925e611OS3ggbac31-18,-1hd-1aT3diabdd2W,-1jb-19U4ak9cec2W,-1p9-15V39m6ibb2W,-1q9-14W26p6ibb2W,-1s6-15X14s5ibd2U,-1v4-14Yw5i227f1T,-1w2b1UX62p4j136d121S,-1w3741523KX16p4i153c1Y,-1y221341aL-13p311h161c161S,-1y42iL-11r121h2n111S,-1B12jK-11u2h1m113R,-1FjLYv2i2e261T,-1EpHa5IP3d3Z,-1FpI1dGM232b5Z,-1FqZBO222a4-11,-1DsZAQ22277-10,-1DtXAS31159a1P,-1CuXyU4692441P,-1CvWxW459e1L,-1BASxX3672393K,-1BA11RvY54723b124E,-1CFOt-10482311141312aB,-1BHNs-123g1d9z,-1BKLr-132g1b1382112s,-1BKLr-153p13a71o,-1CJMq-166p9b1l,-1DIMq-1d122111131d332w,-1DHNr-1h141m2b2i,-1EGNr-1M1t,-1FEPq-1u191B,-1FDPs81-1j651B,-1GBQs81-1i662A,-1GBPt72-1e21763z,-1HAPs73-1cc63z,-1JyPs46-1ce35l1b1,-1LwPq65-1bi15w11,-1MuQo85-1boy,-1MuRm95-1aqx,-1MuRm95-17vf1f,-1MtTl85-15yg1e,-1MsUm75-14Au,-1MpXl94-14Bt,-1Lo-10k93-14Ds,-1Ln-11ic1-16Dr,-1Lm-12i-1iEr,-1Lm-12i-1jDr,-1Lm-13g-1lDq,-1Ll-15e-1mCr,-1Km-15e-1mCr,-1Kl-17c-1oBr,-1Lj-18b-1pa8is,-1Kj-199-1q9b21dt,-1Ke13-1b2-1x3g11et,-1Jg-39cn16,-1Jg-3bao15,-1Ih-3bap14,-1Je-3g112s32,-1Jb-3O33,-1Ic-3P23,-1I9-3o3o2114,-1Ib-3m3n36,-1J8-3p1n37,-1I9-3L39,-1H8-3M49,-1H8-3N2a,-1H9-3Y,-1G9-3Z,-1G8-2d1-1M,-1H6-41,-1H683-3Q,-1I4-42,-1I6-40,-1K6-3Y,-1N1-40,-5O,-5O,-5O,-5O,-5O,-5O,-5O,-1X2-3P,-1U1-3T,-1S1-3c1I,-1P3-1R6I464f6I,-1O3-1Pcm-12y,-1O3-1Kqa-19u,-1K225-1x62u7-1jm,-1K316-1642a2I5-1qj,-1H716O22-1d4-1B9,-1P6M-2Y9,R222i53a435cJ-2Zb,Ia132711aCL-2We,y-1jK-2Xg,y-1eG-36g,m-1lH-3ag,g34-1ht58-3hd,i3a-1aq8d-35j,x-1c7668g-34k,p-1so-3gj,r-1w4-3xg,q-5db,0517k-4CF,v1-5i,-5O,-5O,-5O,-5O";

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const RAD = Math.PI / 180;

let landGrid: Uint8Array | null = null;
function land() {
  if (landGrid) return landGrid;
  const grid = new Uint8Array(360 * 180);
  LAND.split(",").forEach((row, j) => {
    let i = 0;
    let col = 0;
    let fill = 0;
    while (i < row.length) {
      let run: number;
      if (row[i] === "-") {
        run = DIGITS.indexOf(row[i + 1]) * 62 + DIGITS.indexOf(row[i + 2]);
        i += 3;
      } else {
        run = DIGITS.indexOf(row[i]);
        i += 1;
      }
      if (fill) grid.fill(1, j * 360 + col, j * 360 + col + run);
      col += run;
      fill ^= 1;
    }
  });
  landGrid = grid;
  return grid;
}

function isLand(lat: number, lng: number) {
  const row = Math.min(179, Math.max(0, Math.floor(90 - lat)));
  const col = (((Math.floor(lng + 180) % 360) + 360) % 360);
  return land()[row * 360 + col] === 1;
}

/** Unit vectors of land dots spaced `step` degrees apart, equal-area, packed x, y, z. */
function landDots(step: number) {
  const out: number[] = [];
  for (let lat = -90 + step / 2; lat < 90; lat += step) {
    const ring = Math.max(1, Math.round((360 * Math.cos(lat * RAD)) / step));
    // Alternate rows start half a step over, so the dots sit in a hex pattern instead of columns.
    const shift = (Math.round((lat + 90) / step) % 2) * 0.5;
    for (let k = 0; k < ring; k++) {
      const lng = -180 + ((k + shift) * 360) / ring;
      if (!isLand(lat, lng)) continue;
      const c = Math.cos(lat * RAD);
      out.push(c * Math.sin(lng * RAD), Math.sin(lat * RAD), c * Math.cos(lng * RAD));
    }
  }
  return new Float32Array(out);
}

function toVector(lat: number, lng: number): [number, number, number] {
  const c = Math.cos(lat * RAD);
  return [c * Math.sin(lng * RAD), Math.sin(lat * RAD), c * Math.cos(lng * RAD)];
}

/** Points along the great circle from a to b, lifted off the surface by up to `lift` radii mid-way. */
function arcPoints(a: [number, number, number], b: [number, number, number], count: number) {
  const dot = Math.min(1, Math.max(-1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
  const angle = Math.acos(dot);
  const sin = Math.sin(angle) || 1;
  const lift = 0.04 + 0.16 * (angle / Math.PI);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const wa = angle < 1e-4 ? 1 - t : Math.sin((1 - t) * angle) / sin;
    const wb = angle < 1e-4 ? t : Math.sin(t * angle) / sin;
    const r = 1 + lift * Math.sin(Math.PI * t);
    out[i * 3] = (a[0] * wa + b[0] * wb) * r;
    out[i * 3 + 1] = (a[1] * wa + b[1] * wb) * r;
    out[i * 3 + 2] = (a[2] * wa + b[2] * wb) * r;
  }
  return out;
}

function readGlow(node: Element) {
  const value = parseFloat(getComputedStyle(node).getPropertyValue("--neon-glow"));
  return Number.isFinite(value) ? Math.max(0, value) : 1;
}

function readRgb(node: HTMLElement): Rgb {
  const parts = getComputedStyle(node).color.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return [34, 211, 238];
  return [Number(parts[0]), Number(parts[1]), Number(parts[2])];
}

function glowSprite(rgb: Rgb) {
  const size = 64;
  const sprite = document.createElement("canvas");
  sprite.width = sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (!ctx) return sprite;
  const r = size / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  gradient.addColorStop(0, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.9)`);
  gradient.addColorStop(0.18, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.35)`);
  gradient.addColorStop(0.5, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.08)`);
  gradient.addColorStop(1, `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return sprite;
}

const mix = (rgb: Rgb, amount: number) =>
  `${Math.round(rgb[0] + (255 - rgb[0]) * amount)} ${Math.round(rgb[1] + (255 - rgb[1]) * amount)} ${Math.round(rgb[2] + (255 - rgb[2]) * amount)}`;

type GlobeApi = {
  redraw: () => void;
  recolor: () => void;
  rebuild: () => void;
  nudge: (lng: number, lat: number) => void;
  reset: () => void;
};
const noop = () => {};
const idle: GlobeApi = { redraw: noop, recolor: noop, rebuild: noop, nudge: noop, reset: noop };

const ARC_POINTS = 64;
const LEVELS = 6;

export type GlobeMarker = {
  /** Lets arcs refer to the marker by name. */
  id?: string;
  lat: number;
  lng: number;
  /** Drawn next to the marker and read to screen readers. */
  label?: string;
  /** Dark markers draw as a dim point with no pulse. */
  live?: boolean;
};

export type GlobeArc = {
  /** A marker id, or `[lat, lng]`. */
  from: string | [number, number];
  to: string | [number, number];
};

export interface GlobeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Palette name or any hex color. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  markers?: GlobeMarker[];
  /** Great-circle arcs between markers, each with a pulse of light running from `from` to `to`. */
  arcs?: GlobeArc[];
  /** Auto-rotation in degrees per second. 0 holds it still. */
  speed?: number;
  /** Longitude facing the viewer at the start. */
  longitude?: number;
  /** Latitude at the centre of the view: positive looks down on the north. */
  tilt?: number;
  /** Drag to spin (with inertia) and rotate with the arrow keys. */
  interactive?: boolean;
  /** Seconds for a pulse to cross an arc. */
  arcDuration?: number;
  /** Draw parallels and meridians every 15°. */
  graticule?: boolean;
}

const Globe = React.forwardRef<HTMLDivElement, GlobeProps>(
  (
    {
      className,
      style,
      color,
      markers = [],
      arcs = [],
      speed = 6,
      longitude = 10,
      tilt = 20,
      interactive = true,
      arcDuration = 2.6,
      graticule = false,
      onKeyDown,
      "aria-label": ariaLabel,
      ...props
    },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);
    const hintId = React.useId();

    const live = React.useRef({ markers, arcs, speed, interactive, arcDuration, graticule });
    const api = React.useRef<GlobeApi>(idle);

    React.useEffect(() => {
      live.current = { markers, arcs, speed, interactive, arcDuration, graticule };
      api.current.rebuild();
    }, [markers, arcs, speed, interactive, arcDuration, graticule]);

    React.useEffect(() => {
      api.current.recolor();
    }, [color]);

    React.useEffect(() => {
      const root = rootRef.current;
      const canvas = canvasRef.current;
      if (!root || !canvas || typeof ResizeObserver === "undefined") return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let size = 0;
      let radius = 0;
      let step = 0;
      let dots = new Float32Array(0);
      let rgb = readRgb(canvas);
      let glow = readGlow(canvas);
      let sprite = glowSprite(rgb);
      let font = "";
      let fontSize = 11;
      let raf = 0;
      let last = 0;
      let time = 0;
      let inView = true;

      // View: longitude facing us and latitude tilt, both in degrees, plus spin velocity for inertia.
      const view = { lng: longitude, lat: tilt, vLng: 0, vLat: 0 };
      const drag = { active: false, id: -1, x: 0, y: 0, t: 0 };
      const buckets: number[][] = Array.from({ length: LEVELS }, () => []);

      let points: { v: [number, number, number]; m: GlobeMarker; phase: number }[] = [];
      let paths: { pts: Float32Array; phase: number }[] = [];

      const rebuildData = () => {
        const byId = new Map<string, GlobeMarker>();
        live.current.markers.forEach((m) => m.id && byId.set(m.id, m));
        points = live.current.markers.map((m, i) => ({ v: toVector(m.lat, m.lng), m, phase: (i * 0.37) % 1 }));
        const resolve = (end: string | [number, number]) => {
          if (Array.isArray(end)) return toVector(end[0], end[1]);
          const m = byId.get(end);
          return m ? toVector(m.lat, m.lng) : null;
        };
        paths = [];
        live.current.arcs.forEach((arc, i) => {
          const a = resolve(arc.from);
          const b = resolve(arc.to);
          if (a && b) paths.push({ pts: arcPoints(a, b, ARC_POINTS), phase: (i * 0.61) % 1 });
        });
      };
      rebuildData();

      // Rotation into view space: x right, y up, z toward the viewer.
      let cl = 1, sl = 0, ct = 1, st = 0;
      const orient = () => {
        cl = Math.cos(view.lng * RAD);
        sl = Math.sin(view.lng * RAD);
        ct = Math.cos(view.lat * RAD);
        st = Math.sin(view.lat * RAD);
      };
      const out = [0, 0, 0];
      const project = (x: number, y: number, z: number) => {
        const a = x * cl - z * sl;
        const c = z * cl + x * sl;
        out[0] = a;
        out[1] = ct * y - st * c;
        out[2] = st * y + ct * c;
        return out;
      };
      // A lifted point is in sight in front of the globe, or beyond its rim.
      const visible = (p: number[]) => p[2] > 0 || p[0] * p[0] + p[1] * p[1] > 1;

      const drawGraticule = (cx: number, cy: number) => {
        ctx.strokeStyle = `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]} / 0.09)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const line = (fn: (t: number) => [number, number, number], n: number) => {
          let pen = false;
          for (let i = 0; i <= n; i++) {
            const v = fn(i / n);
            const p = project(v[0], v[1], v[2]);
            if (p[2] <= 0) {
              pen = false;
              continue;
            }
            const x = cx + p[0] * radius;
            const y = cy - p[1] * radius;
            if (pen) ctx.lineTo(x, y);
            else ctx.moveTo(x, y);
            pen = true;
          }
        };
        for (let lat = -75; lat <= 75; lat += 15) line((t) => toVector(lat, -180 + t * 360), 96);
        for (let lng = -180; lng < 180; lng += 15) line((t) => toVector(-90 + t * 180, lng), 48);
        ctx.stroke();
      };

      const draw = () => {
        if (size === 0) return;
        const { arcDuration: arcTime, graticule: grid } = live.current;
        ctx.clearRect(0, 0, size, size);
        orient();
        const cx = size / 2;
        const cy = size / 2;
        const [r, g, b] = rgb;

        // The glass: a faint fill and a lit rim. The atmosphere halo is CSS behind the canvas.
        ctx.fillStyle = "rgb(8 10 16 / 0.55)";
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();

        if (grid) drawGraticule(cx, cy);

        // Land dots, bucketed by how squarely they face us so the limb falls off into the dark.
        for (const bucket of buckets) bucket.length = 0;
        const back: number[] = [];
        for (let i = 0; i < dots.length; i += 3) {
          const p = project(dots[i], dots[i + 1], dots[i + 2]);
          const x = cx + p[0] * radius;
          const y = cy - p[1] * radius;
          if (p[2] > 0) {
            const level = Math.min(LEVELS - 1, Math.floor(Math.pow(p[2], 0.6) * LEVELS));
            buckets[level].push(x, y);
          } else if (i % 2 === 0) {
            back.push(x, y);
          }
        }
        const dot = Math.max(1, radius / 165);
        // The far side shows through the glass, mirrored and faint.
        ctx.fillStyle = `rgb(${r} ${g} ${b} / 0.07)`;
        ctx.beginPath();
        for (let k = 0; k < back.length; k += 2) ctx.rect(back[k] - dot * 0.4, back[k + 1] - dot * 0.4, dot * 0.8, dot * 0.8);
        ctx.fill();
        buckets.forEach((bucket, level) => {
          if (!bucket.length) return;
          const t = (level + 1) / LEVELS;
          ctx.fillStyle = `rgb(${mix(rgb, 0.3 * t)} / ${0.16 + t * 0.74})`;
          ctx.beginPath();
          for (let k = 0; k < bucket.length; k += 2) ctx.rect(bucket[k] - dot / 2, bucket[k + 1] - dot / 2, dot, dot);
          ctx.fill();
        });

        ctx.strokeStyle = `rgb(${r} ${g} ${b} / 0.32)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();

        // Arcs: a dim strand with a pulse running along it, white-hot at the head.
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const tail = 0.32;
        for (const path of paths) {
          const xs: number[] = [];
          const ys: number[] = [];
          const seen: boolean[] = [];
          for (let i = 0; i < ARC_POINTS; i++) {
            const p = project(path.pts[i * 3], path.pts[i * 3 + 1], path.pts[i * 3 + 2]);
            xs.push(cx + p[0] * radius);
            ys.push(cy - p[1] * radius);
            seen.push(visible(p));
          }
          ctx.strokeStyle = `rgb(${r} ${g} ${b} / 0.22)`;
          ctx.lineWidth = Math.max(1, radius / 300);
          ctx.beginPath();
          for (let i = 1; i < ARC_POINTS; i++) {
            if (!seen[i] || !seen[i - 1]) continue;
            ctx.moveTo(xs[i - 1], ys[i - 1]);
            ctx.lineTo(xs[i], ys[i]);
          }
          ctx.stroke();

          const cycle = arcTime * (1 + tail) + 1.2;
          const head = (((time / cycle + path.phase) % 1) * cycle) / arcTime;
          if (head <= 0 || head - tail >= 1) continue;
          const steps = 10;
          ctx.globalCompositeOperation = "lighter";
          for (let s = 0; s < steps; s++) {
            const t0 = head - tail + (tail * s) / steps;
            const t1 = head - tail + (tail * (s + 1)) / steps;
            const i0 = Math.max(0, Math.floor(t0 * (ARC_POINTS - 1)));
            const i1 = Math.min(ARC_POINTS - 1, Math.ceil(t1 * (ARC_POINTS - 1)));
            if (i1 <= i0) continue;
            const heat = (s + 1) / steps;
            ctx.beginPath();
            let pen = false;
            for (let i = i0; i <= i1; i++) {
              if (!seen[i]) {
                pen = false;
                continue;
              }
              if (pen) ctx.lineTo(xs[i], ys[i]);
              else ctx.moveTo(xs[i], ys[i]);
              pen = true;
            }
            if (glow > 0) {
              ctx.strokeStyle = `rgb(${r} ${g} ${b} / ${0.16 * heat * glow})`;
              ctx.lineWidth = Math.max(4, radius / 60);
              ctx.stroke();
            }
            ctx.strokeStyle = `rgb(${mix(rgb, heat * heat * 0.75)} / ${heat * 0.95})`;
            ctx.lineWidth = Math.max(1.25, radius / 200);
            ctx.stroke();
          }
          const hi = Math.min(ARC_POINTS - 1, Math.round(Math.min(head, 1) * (ARC_POINTS - 1)));
          if (head < 1 && seen[hi] && glow > 0) {
            const s = radius / 9;
            ctx.globalAlpha = Math.min(1, 0.9 * glow);
            ctx.drawImage(sprite, xs[hi] - s / 2, ys[hi] - s / 2, s, s);
            ctx.globalAlpha = 1;
          }
          ctx.globalCompositeOperation = "source-over";
        }

        // Markers: a white core, a halo and a ring that pings outward.
        ctx.textBaseline = "middle";
        ctx.font = font;
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
        // Labels are placed greedily in marker order and skipped where they would overlap one already drawn.
        const placed: number[] = [];
        for (const point of points) {
          const p = project(point.v[0], point.v[1], point.v[2]);
          if (p[2] <= 0.02) continue;
          const fade = Math.min(1, p[2] / 0.25);
          const x = cx + p[0] * radius;
          const y = cy - p[1] * radius;
          const on = point.m.live !== false;
          const core = Math.max(1.75, radius / 130);
          if (on) {
            const ping = (time / 2.4 + point.phase) % 1;
            ctx.strokeStyle = `rgb(${r} ${g} ${b} / ${(1 - ping) * 0.6 * fade})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(x, y, core + ping * radius * 0.07, 0, Math.PI * 2);
            ctx.stroke();
            if (glow > 0) {
              const s = core * 9;
              ctx.globalAlpha = Math.min(1, 0.75 * fade * glow);
              ctx.drawImage(sprite, x - s / 2, y - s / 2, s, s);
              ctx.globalAlpha = 1;
            }
          }
          ctx.fillStyle = on ? `rgb(${mix(rgb, 0.7)} / ${fade})` : `rgb(${r} ${g} ${b} / ${0.35 * fade})`;
          ctx.beginPath();
          ctx.arc(x, y, on ? core : core * 0.8, 0, Math.PI * 2);
          ctx.fill();
          if (point.m.label && radius > 90) {
            const lx = x + core + 6;
            const w = ctx.measureText(point.m.label).width;
            const h = fontSize;
            const clear = placed.every((_, k) =>
              k % 4 !== 0 || lx > placed[k + 2] || lx + w < placed[k] || y - h / 2 > placed[k + 3] || y + h / 2 < placed[k + 1],
            );
            if (clear) {
              placed.push(lx - 2, y - h / 2, lx + w + 2, y + h / 2);
              ctx.fillStyle = on ? `rgb(255 255 255 / ${0.82 * fade})` : `rgb(255 255 255 / ${0.4 * fade})`;
              ctx.fillText(point.m.label, lx, y);
            }
          }
        }
      };

      const running = () => inView && !document.hidden && !motion.matches && size > 0;

      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        time += dt;
        if (!drag.active) {
          // Inertia hands back to the steady spin as it decays.
          const decay = Math.exp(-dt * 2.2);
          view.vLng *= decay;
          view.vLat *= decay;
          view.lng += (live.current.speed + view.vLng) * dt;
          view.lat = Math.max(-60, Math.min(60, view.lat + view.vLat * dt));
        }
        draw();
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
          draw();
        }
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        size = Math.min(root.clientWidth, root.clientHeight || root.clientWidth);
        radius = size * 0.41;
        canvas.width = Math.round(size * dpr);
        canvas.height = Math.round(size * dpr);
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        // About 5.5px between dots at the equator, whatever the size.
        const next = Math.round(Math.min(4, Math.max(1.2, (5.5 * 360) / (2 * Math.PI * Math.max(radius, 1)))) * 5) / 5;
        if (next !== step) {
          step = next;
          dots = landDots(step);
        }
        const family = getComputedStyle(root).fontFamily || "sans-serif";
        fontSize = Math.max(10, Math.min(12, radius / 22));
        font = `500 ${fontSize}px ${family}`;
        draw();
        sync();
      };

      const onDown = (event: PointerEvent) => {
        if (!live.current.interactive || event.button > 0) return;
        drag.active = true;
        drag.id = event.pointerId;
        drag.x = event.clientX;
        drag.y = event.clientY;
        drag.t = performance.now();
        view.vLng = 0;
        view.vLat = 0;
        canvas.setPointerCapture?.(event.pointerId);
        root.dataset.dragging = "";
      };
      const onMove = (event: PointerEvent) => {
        if (!drag.active || event.pointerId !== drag.id) return;
        const now = performance.now();
        const dt = Math.max(1, now - drag.t) / 1000;
        // The surface under the pointer follows it: one radius of drag is one radian of turn.
        const k = 180 / (Math.PI * Math.max(radius, 1));
        const dLng = -(event.clientX - drag.x) * k;
        const dLat = (event.clientY - drag.y) * k;
        view.lng += dLng;
        view.lat = Math.max(-60, Math.min(60, view.lat + dLat));
        // Smoothed release velocity, minus the auto-spin it'll be added to.
        view.vLng = view.vLng * 0.6 + (dLng / dt - live.current.speed) * 0.4;
        view.vLat = view.vLat * 0.6 + (dLat / dt) * 0.4;
        drag.x = event.clientX;
        drag.y = event.clientY;
        drag.t = now;
        if (!raf) draw();
      };
      const onUp = (event: PointerEvent) => {
        if (!drag.active || event.pointerId !== drag.id) return;
        drag.active = false;
        delete root.dataset.dragging;
        // A drag that stopped before release doesn't fling.
        if (performance.now() - drag.t > 80) {
          view.vLng = -live.current.speed;
          view.vLat = 0;
        }
        if (motion.matches) {
          view.vLng = 0;
          view.vLat = 0;
        }
      };

      api.current = {
        redraw: () => {
          if (!raf) draw();
        },
        recolor: () => {
          rgb = readRgb(canvas);
          glow = readGlow(canvas);
          sprite = glowSprite(rgb);
          if (!raf) draw();
        },
        rebuild: () => {
          rebuildData();
          if (!raf) draw();
        },
        nudge: (dLng: number, dLat: number) => {
          if (running()) {
            // A push that coasts out, like a flick.
            view.vLng += dLng * 3;
            view.vLat += dLat * 3;
          } else {
            view.lng += dLng;
            view.lat = Math.max(-60, Math.min(60, view.lat + dLat));
            draw();
          }
        },
        reset: () => {
          view.lng = longitude;
          view.lat = tilt;
          view.vLng = 0;
          view.vLat = 0;
          if (!raf) draw();
        },
      };

      const onTransition = (event: TransitionEvent) => {
        if (event.target === canvas) api.current.recolor();
      };

      const resizeObserver = new ResizeObserver(resize);
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
      canvas.addEventListener("pointerdown", onDown);
      canvas.addEventListener("pointermove", onMove);
      canvas.addEventListener("pointerup", onUp);
      canvas.addEventListener("pointercancel", onUp);
      canvas.addEventListener("transitionend", onTransition);

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
        canvas.removeEventListener("pointerdown", onDown);
        canvas.removeEventListener("pointermove", onMove);
        canvas.removeEventListener("pointerup", onUp);
        canvas.removeEventListener("pointercancel", onUp);
        canvas.removeEventListener("transitionend", onTransition);
        api.current = idle;
      };
      // The start view only applies on mount; later changes would yank the globe around.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(event);
      if (event.defaultPrevented || !interactive) return;
      const stepBy = event.shiftKey ? 45 : 15;
      const moves: Record<string, [number, number]> = {
        ArrowLeft: [-stepBy, 0],
        ArrowRight: [stepBy, 0],
        ArrowUp: [0, 10],
        ArrowDown: [0, -10],
      };
      if (event.key in moves) {
        event.preventDefault();
        api.current.nudge(...moves[event.key]);
      } else if (event.key === "Home") {
        event.preventDefault();
        api.current.reset();
      }
    };

    const labels = markers.filter((m) => m.label).map((m) => m.label as string);
    const name = ariaLabel ?? (labels.length ? `Globe with ${labels.length} locations: ${labels.join(", ")}` : "Globe");

    return (
      <div
        ref={rootRef}
        role={interactive ? "group" : "img"}
        aria-roledescription={interactive ? "globe" : undefined}
        aria-label={name}
        aria-describedby={interactive ? hintId : undefined}
        tabIndex={interactive ? 0 : undefined}
        onKeyDown={handleKeyDown}
        style={neonVars(color, style)}
        className={cn(
          "[--neon:var(--neon-accent,34_211_238)]",
          "relative isolate grid aspect-square w-full max-w-[640px] place-items-center rounded-full outline-none",
          "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
          interactive && "cursor-grab touch-pan-y select-none data-[dragging]:cursor-grabbing",
          className,
        )}
        {...props}
      >
        {/* Atmosphere: light scattered off the rim. Static CSS, so it costs nothing per frame. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-[radial-gradient(circle_closest-side,transparent_76%,rgb(var(--neon)/CALC(0.16*var(--neon-glow,1)))_81.5%,rgb(var(--neon)/CALC(0.05*var(--neon-glow,1)))_88%,transparent_100%)]"
        />
        <canvas
          ref={canvasRef}
          aria-hidden
          className="block size-full"
          style={{
            color: "rgb(var(--neon))",
            letterSpacing: "calc(var(--neon-glow, 1) * 1px)",
            transition: "color 1ms linear, letter-spacing 1ms linear",
          }}
        />
        {interactive && (
          <span id={hintId} className="sr-only">
            Drag or use the arrow keys to rotate. Home resets the view.
          </span>
        )}
      </div>
    );
  },
);
Globe.displayName = "Globe";

export { Globe };
