"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

type Rgb = [number, number, number];

type Light = {
  x: number;
  y: number;
  r: number;
  alpha: number;
  /** 0 neon, 1 sodium amber, 2 tail-light red, 3 cool white. */
  kind: number;
  vx: number;
  phase: number;
  /** Cars pass and are gone; city lights stay. */
  transient: boolean;
};

type Drop = {
  x: number;
  y: number;
  r: number;
  vy: number;
  /** Seconds left caught on the glass before it moves again. */
  hold: number;
  /** Size at which gravity beats surface tension and it starts to run. */
  heavy: number;
  /** Growth from the rain still landing on it, px per second. */
  grow: number;
  /** Sideways creep while running; changes each time it snags. */
  drift: number;
  travelled: number;
  phase: number;
};

// The street behind the glass is out of focus, so it renders small and the browser's upscale blurs it for free.
const BOKEH_SCALE = 0.5;
const MAX_DROPS = 160;

const warm: Rgb = [255, 176, 84];
const tail: Rgb = [255, 70, 84];
const cool: Rgb = [214, 228, 255];

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

function layer(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return { canvas, ctx: canvas.getContext("2d") };
}

export interface RainGlassProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color" | "children"> {
  /** Main color of the lights behind the glass. Inherits `--neon-accent` when omitted. */
  color?: NeonColor;
  /** How hard it's raining, 0 to 1. */
  intensity?: number;
  /** Out-of-focus city lights behind the glass. Turn off to lay the rain over your own background. */
  bokeh?: boolean;
  /** Speed multiplier for the drops and the traffic. */
  speed?: number;
  /** Dragging the pointer across the glass wipes the droplets away. */
  wipe?: boolean;
}

/**
 * A background layer. Place it inside a `relative` parent; it fills it.
 */
const RainGlass = React.forwardRef<HTMLDivElement, RainGlassProps>(
  (
    { className, style, color, intensity = 0.5, bokeh = true, speed = 1, wipe = false, ...props },
    forwardedRef,
  ) => {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const backRef = React.useRef<HTMLCanvasElement>(null);
    const glassRef = React.useRef<HTMLCanvasElement>(null);
    React.useImperativeHandle(forwardedRef, () => rootRef.current as HTMLDivElement);

    const live = React.useRef({ intensity, bokeh, speed, wipe });
    const recolor = React.useRef<() => void>(() => {});
    const refresh = React.useRef<() => void>(() => {});

    React.useEffect(() => {
      live.current = { intensity, bokeh, speed, wipe };
      refresh.current();
    }, [intensity, bokeh, speed, wipe]);

    React.useEffect(() => {
      recolor.current();
    }, [color]);

    React.useEffect(() => {
      const root = rootRef.current;
      const back = backRef.current;
      const glass = glassRef.current;
      if (!root || !back || !glass || typeof ResizeObserver === "undefined") return;
      const backCtx = back.getContext("2d");
      const ctx = glass.getContext("2d");
      if (!backCtx || !ctx) return;

      const random = Math.random;
      const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
      let width = 0;
      let height = 0;
      let dpr = 1;
      let rgb = readRgb(glass);
      let glow = readGlow(glass);
      let lights: Light[] = [];
      let drops: Drop[] = [];
      // Beads: thousands of tiny droplets live in two bitmaps instead of objects.
      // Bodies pick up the color of the lights behind them; glints sit on top.
      let bodies = layer(1, 1);
      let glints = layer(1, 1);
      // The lights behind, doubled in brightness: what a bead focuses onto the glass.
      let focused = layer(1, 1);
      let raf = 0;
      let last = 0;
      let time = 0;
      let inView = true;
      let nextCar = 2;
      let evaporate = 0;
      const pointer = { x: 0, y: 0, active: false };

      const amount = () => Math.max(0, Math.min(1, live.current.intensity));

      const paint = (kind: number, alpha: number) => {
        const [r, g, b] = kind === 0 ? rgb : kind === 1 ? warm : kind === 2 ? tail : cool;
        return `rgb(${r} ${g} ${b} / ${alpha})`;
      };

      const seedLights = () => {
        lights = [];
        const count = Math.round(14 + (width * height) / 16000);
        for (let i = 0; i < count; i++) {
          const roll = random();
          const kind = roll < 0.54 ? 0 : roll < 0.8 ? 1 : roll < 0.9 ? 2 : 3;
          // Most lights hang around street level; a few are windows high up.
          const y = height * (random() < 0.7 ? 0.45 + random() * 0.6 : random() * 0.5);
          lights.push({
            x: random() * width,
            y,
            r: 10 + random() ** 1.5 * 50,
            alpha: 0.12 + random() * 0.28,
            kind,
            vx: (random() - 0.5) * 3,
            phase: random() * Math.PI * 2,
            transient: false,
          });
        }
      };

      const addBead = (x: number, y: number, r: number) => {
        const b = bodies.ctx;
        const g = glints.ctx;
        if (!b || !g) return;
        b.fillStyle = "#fff";
        b.beginPath();
        b.ellipse(x, y, r, r * 1.08, 0, 0, Math.PI * 2);
        b.fill();
        // A dark lower rim and a bright upper glint read as a lens at any size.
        g.fillStyle = "rgb(0 0 0 / 0.28)";
        g.beginPath();
        g.ellipse(x, y + r * 0.25, r * 0.95, r * 0.8, 0, 0, Math.PI);
        g.fill();
        g.fillStyle = "rgb(255 255 255 / 0.75)";
        g.beginPath();
        g.arc(x - r * 0.3, y - r * 0.35, Math.max(0.35, r * 0.28), 0, Math.PI * 2);
        g.fill();
      };

      const wipeAt = (x: number, y: number, r: number) => {
        for (const target of [bodies.ctx, glints.ctx]) {
          if (!target) continue;
          target.globalCompositeOperation = "destination-out";
          target.beginPath();
          target.arc(x, y, r, 0, Math.PI * 2);
          target.fill();
          target.globalCompositeOperation = "source-over";
        }
      };

      const spawnDrop = (y?: number): Drop => ({
        x: random() * width,
        y: y ?? random() * height * 0.85,
        r: 1.8 + random() ** 2.2 * 4.6,
        vy: 0,
        hold: 0,
        heavy: 4.8 + random() * 2.6,
        grow: 0.06 + random() * 0.4,
        drift: 0,
        travelled: 0,
        phase: random() * Math.PI * 2,
      });

      const drawBack = () => {
        backCtx.setTransform(1, 0, 0, 1, 0, 0);
        backCtx.clearRect(0, 0, back.width, back.height);
        if (!live.current.bokeh) return;
        backCtx.setTransform(BOKEH_SCALE, 0, 0, BOKEH_SCALE, 0, 0);
        // Wet street glow along the bottom.
        const street = backCtx.createLinearGradient(0, height, 0, height * 0.35);
        street.addColorStop(0, paint(0, 0.14 * glow));
        street.addColorStop(1, paint(0, 0));
        backCtx.fillStyle = street;
        backCtx.fillRect(0, 0, width, height);
        backCtx.globalCompositeOperation = "lighter";
        for (const light of lights) {
          const breathe = 0.85 + 0.15 * Math.sin(time * 0.6 + light.phase);
          // The lights behind the glass are glow: --neon-glow dims them, 0 leaves dark glass.
          const a = Math.min(1, light.alpha * breathe * glow);
          // Out-of-focus highlights are discs with a slightly brighter rim, not soft blobs.
          const disc = backCtx.createRadialGradient(light.x, light.y, 0, light.x, light.y, light.r);
          disc.addColorStop(0, paint(light.kind, a * 0.6));
          disc.addColorStop(0.6, paint(light.kind, a * 0.68));
          disc.addColorStop(0.82, paint(light.kind, a * 0.8));
          disc.addColorStop(0.93, paint(light.kind, a * 0.3));
          disc.addColorStop(1, paint(light.kind, 0));
          backCtx.fillStyle = disc;
          backCtx.fillRect(light.x - light.r, light.y - light.r, light.r * 2, light.r * 2);
        }
        backCtx.globalCompositeOperation = "source-over";
        const f = focused.ctx;
        if (f) {
          f.clearRect(0, 0, focused.canvas.width, focused.canvas.height);
          f.globalCompositeOperation = "lighter";
          f.drawImage(back, 0, 0);
          f.drawImage(back, 0, 0);
          f.globalCompositeOperation = "source-over";
        }
      };

      // Everything about a drop except what it refracts, drawn once per color and stamped per drop.
      const SPRITE = 64;
      const SPRITE_R = 28;
      let shading = layer(SPRITE, SPRITE);
      const paintShading = () => {
        shading = layer(SPRITE, SPRITE);
        const g = shading.ctx;
        if (!g) return;
        const c = SPRITE / 2;
        const r = SPRITE_R;
        g.save();
        g.beginPath();
        g.ellipse(c, c, r, r, 0, 0, Math.PI * 2);
        g.clip();
        g.fillStyle = "rgb(255 255 255 / 0.06)";
        g.fillRect(0, 0, SPRITE, SPRITE);
        // Edge falloff: the curved rim bends light away, so it reads darker.
        const rim = g.createRadialGradient(c - r * 0.15, c - r * 0.2, r * 0.2, c, c, r * 1.1);
        rim.addColorStop(0, "rgb(0 0 0 / 0)");
        rim.addColorStop(0.7, "rgb(0 0 0 / 0.08)");
        rim.addColorStop(1, "rgb(0 0 0 / 0.5)");
        g.fillStyle = rim;
        g.fillRect(0, 0, SPRITE, SPRITE);
        g.restore();
        // The fake refraction highlight: light focused into a crescent along the bottom edge.
        const [cr, cg, cb] = rgb;
        g.strokeStyle = `rgb(${cr + (255 - cr) * 0.5} ${cg + (255 - cg) * 0.5} ${cb + (255 - cb) * 0.5} / 0.55)`;
        g.lineWidth = r * 0.16;
        g.lineCap = "round";
        g.beginPath();
        g.ellipse(c, c, r * 0.78, r * 0.8, 0, Math.PI * 0.18, Math.PI * 0.82);
        g.stroke();
        // Specular glint from a light behind the viewer.
        g.fillStyle = "rgb(255 255 255 / 0.85)";
        g.beginPath();
        g.ellipse(c - r * 0.34, c - r * 0.42, r * 0.2, r * 0.13, -0.6, 0, Math.PI * 2);
        g.fill();
      };

      const drawDrop = (drop: Drop) => {
        const { x, y, r } = drop;
        // Stretch a little when it's moving fast.
        const rx = r;
        const ry = r * (1.08 + Math.min(0.35, drop.vy / 400));
        if (live.current.bokeh && r > 2.4) {
          // The drop is a lens: it shows a wide patch of the street behind it, upside down.
          const field = r * 16 * BOKEH_SCALE;
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
          ctx.clip();
          ctx.translate(x, y);
          ctx.scale(-1, -1);
          ctx.drawImage(focused.canvas, x * BOKEH_SCALE - field / 2, y * BOKEH_SCALE - field / 2, field, field, -rx, -ry, rx * 2, ry * 2);
          ctx.restore();
        }
        const scale = SPRITE / 2 / SPRITE_R;
        ctx.drawImage(shading.canvas, x - rx * scale, y - ry * scale, rx * scale * 2, ry * scale * 2);
      };

      const draw = () => {
        drawBack();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, glass.width, glass.height);
        // Beads: each one focuses the light behind it, so it takes that light's color, brighter.
        if (live.current.bokeh) {
          ctx.drawImage(bodies.canvas, 0, 0, glass.width, glass.height);
          ctx.globalCompositeOperation = "source-in";
          ctx.drawImage(focused.canvas, 0, 0, glass.width, glass.height);
          ctx.globalCompositeOperation = "source-over";
        }
        // A faint body everywhere, so beads in front of darkness still read as water.
        ctx.globalAlpha = 0.13;
        ctx.drawImage(bodies.canvas, 0, 0, glass.width, glass.height);
        ctx.globalAlpha = live.current.bokeh ? 1 : 0.6;
        ctx.drawImage(glints.canvas, 0, 0, glass.width, glass.height);
        ctx.globalAlpha = 1;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        for (const drop of drops) drawDrop(drop);
      };

      const step = (dt: number, pace = Math.max(0, live.current.speed)) => {
        const rain = amount();
        time += dt * pace;
        dt *= pace;

        // Lights drift; now and then a car slides past at street level.
        for (const light of lights) light.x += light.vx * dt;
        lights = lights.filter((light) => !light.transient || (light.x > -80 && light.x < width + 80));
        nextCar -= dt;
        if (nextCar <= 0 && live.current.bokeh) {
          nextCar = 3 + random() * 6;
          const leftward = random() < 0.5;
          const y = height * (0.72 + random() * 0.2);
          const v = (60 + random() * 50) * (leftward ? -1 : 1);
          const kind = leftward ? 1 : 2;
          for (const offset of [0, 26]) {
            lights.push({
              x: (leftward ? width + 60 : -60) + (leftward ? offset : -offset),
              y,
              r: 16 + random() * 8,
              alpha: 0.4,
              kind,
              vx: v,
              phase: 0,
              transient: true,
            });
          }
        }
        for (const light of lights) {
          if (light.transient) continue;
          if (light.x < -light.r) light.x += width + light.r * 2;
          else if (light.x > width + light.r) light.x -= width + light.r * 2;
        }

        // Fresh rain lands as beads.
        const beads = rain * (width * height) * 0.00017 * dt;
        let whole = Math.floor(beads) + (random() < beads % 1 ? 1 : 0);
        while (whole-- > 0) addBead(random() * width, random() * height, 0.6 + random() ** 2.5 * 2.2);

        // Old beads slowly merge and fade so the glass never silts up.
        evaporate += dt;
        if (evaporate > 1) {
          evaporate = 0;
          for (const target of [bodies.ctx, glints.ctx]) {
            if (!target) continue;
            target.globalCompositeOperation = "destination-out";
            target.fillStyle = "rgb(0 0 0 / 0.1)";
            target.fillRect(0, 0, width, height);
            target.globalCompositeOperation = "source-over";
          }
        }

        const births = rain * 10 * dt;
        if (drops.length < MAX_DROPS * rain && random() < births) drops.push(spawnDrop());

        for (const drop of drops) {
          // Sitting drops fatten up in the rain until they're heavy enough to run.
          if (drop.vy === 0 && drop.r < drop.heavy) {
            drop.r += drop.grow * dt * (0.4 + rain);
            continue;
          }
          if (drop.hold > 0) {
            drop.hold -= dt;
            continue;
          }
          // Big drops run, small ones creep, and every drop catches on the glass now and then.
          const terminal = 10 + drop.r * drop.r * 7;
          drop.vy += (terminal - drop.vy) * Math.min(1, dt * 2.5);
          if (random() < dt * 0.8 && drop.r < 6.5) {
            drop.vy = 0.01;
            drop.hold = 0.15 + random() * 0.9;
            drop.drift = (random() - 0.5) * 14;
          }
          const dy = drop.vy * dt;
          const fromX = drop.x;
          const fromY = drop.y;
          drop.y += dy;
          drop.x += (drop.drift + Math.sin(time * 3 + drop.phase) * 5) * dt;
          drop.travelled += dy;
          wipeAt(drop.x, drop.y - drop.r * 0.4, drop.r * 0.95);
          // The wet streak it leaves behind: a thin film that catches the light, drying slowly.
          const film = bodies.ctx;
          if (film && dy > 0) {
            film.globalAlpha = 0.2;
            film.strokeStyle = "#fff";
            film.lineCap = "round";
            film.lineWidth = drop.r * 0.36;
            film.beginPath();
            film.moveTo(fromX, fromY - drop.r * 1.4);
            film.lineTo(drop.x, drop.y - drop.r * 1.4);
            film.stroke();
            film.globalAlpha = 1;
          }
          // A runner leaves a dotted trail of tiny beads and shrinks a little each time.
          if (drop.travelled > 7 + random() * 16) {
            drop.travelled = 0;
            if (random() < 0.75) addBead(drop.x + (random() - 0.5) * drop.r * 0.6, drop.y - drop.r * 2.2, 0.5 + random() * drop.r * 0.3);
            drop.r = Math.max(3, drop.r - 0.08);
          }
        }

        // Runners swallow whatever they touch.
        for (let i = 0; i < drops.length; i++) {
          const a = drops[i];
          if (a.r === 0 || a.vy === 0) continue;
          for (let j = 0; j < drops.length; j++) {
            const b = drops[j];
            if (i === j || b.r === 0) continue;
            const dx = a.x - b.x;
            const dy = a.y - b.y;
            if (dx * dx + dy * dy < (a.r + b.r) * (a.r + b.r) * 0.6) {
              a.r = Math.min(9, Math.sqrt(a.r * a.r + b.r * b.r));
              b.r = 0;
            }
          }
        }
        drops = drops.filter((drop) => drop.r > 0 && drop.y - drop.r * 2 < height);

        if (pointer.active && live.current.wipe) {
          wipeAt(pointer.x, pointer.y, 18);
          drops = drops.filter((drop) => Math.hypot(drop.x - pointer.x, drop.y - pointer.y) > 18 + drop.r);
        }
      };

      const settle = () => {
        // Run the weather for a few simulated seconds so the first frame already has runs and trails.
        bodies = layer(width, height);
        glints = layer(width, height);
        drops = [];
        const rain = amount();
        const beads = Math.round(rain * width * height * 0.003);
        for (let i = 0; i < beads; i++) addBead(random() * width, random() * height, 0.6 + random() ** 2.5 * 2.2);
        for (let i = 0; i < MAX_DROPS * rain * 0.6; i++) drops.push(spawnDrop(random() * height));
        for (let i = 0; i < 240; i++) step(1 / 30, 1);
      };

      const running = () =>
        inView && !document.hidden && !motion.matches && width > 0 && live.current.speed > 0;

      const frame = (now: number) => {
        raf = 0;
        const dt = last ? Math.min((now - last) / 1000, 0.05) : 0;
        last = now;
        step(dt);
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
          if (width > 0) draw();
        }
      };

      const resize = () => {
        const nextWidth = root.clientWidth;
        const nextHeight = root.clientHeight;
        if (nextWidth === width && nextHeight === height) return;
        const first = width === 0 || height === 0;
        width = nextWidth;
        height = nextHeight;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        back.width = Math.max(1, Math.round(width * BOKEH_SCALE));
        back.height = Math.max(1, Math.round(height * BOKEH_SCALE));
        focused = layer(back.width, back.height);
        glass.width = Math.round(width * dpr);
        glass.height = Math.round(height * dpr);
        seedLights();
        if (first) settle();
        else {
          // Live resizes keep the water where it is instead of re-running the weather every frame.
          for (const old of [bodies, glints]) {
            const next = layer(width, height);
            next.ctx?.drawImage(old.canvas, 0, 0);
            if (old === bodies) bodies = next;
            else glints = next;
          }
          drops = drops.filter((drop) => drop.x < width && drop.y < height);
        }
        draw();
        sync();
      };

      const onPointer = (event: PointerEvent) => {
        if (!live.current.wipe || !inView) return;
        const rect = root.getBoundingClientRect();
        pointer.x = event.clientX - rect.left;
        pointer.y = event.clientY - rect.top;
        pointer.active = pointer.x >= 0 && pointer.x <= rect.width && pointer.y >= 0 && pointer.y <= rect.height;
        // Still frames (reduced motion, paused) can be wiped too.
        if (pointer.active && !raf) {
          wipeAt(pointer.x, pointer.y, 18);
          drops = drops.filter((drop) => Math.hypot(drop.x - pointer.x, drop.y - pointer.y) > 18 + drop.r);
          draw();
        }
      };
      const onRelease = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") pointer.active = false;
      };
      const onLeave = () => {
        pointer.active = false;
      };

      recolor.current = () => {
        rgb = readRgb(glass);
        glow = readGlow(glass);
        paintShading();
        if (!raf && width > 0) draw();
      };
      refresh.current = () => {
        if (!raf && width > 0) draw();
        sync();
      };
      const onTransition = (event: TransitionEvent) => {
        if (event.target === glass) recolor.current();
      };

      paintShading();
      const resizeObserver = new ResizeObserver(resize);
      // A move to a screen with another pixel ratio needs a fresh backing store.
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
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerup", onRelease, { passive: true });
      window.addEventListener("pointercancel", onRelease, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      glass.addEventListener("transitionend", onTransition);

      return () => {
        cancelAnimationFrame(raf);
        resizeObserver.disconnect();
        dprQuery?.removeEventListener?.("change", onDpr);
        intersection?.disconnect();
        document.removeEventListener("visibilitychange", sync);
        motion.removeEventListener("change", sync);
        window.removeEventListener("pointermove", onPointer);
        window.removeEventListener("pointerup", onRelease);
        window.removeEventListener("pointercancel", onRelease);
        document.documentElement.removeEventListener("pointerleave", onLeave);
        glass.removeEventListener("transitionend", onTransition);
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
        <canvas ref={backRef} className="absolute inset-0 size-full" />
        {/* The color and letter-spacing transitions are change detectors: when --neon or --neon-glow changes upstream, transitionend fires. */}
        <canvas
          ref={glassRef}
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
RainGlass.displayName = "RainGlass";

export { RainGlass };
