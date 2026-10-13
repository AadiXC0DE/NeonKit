"use client";

import * as React from "react";
import Link from "next/link";
import { Kbd } from "@/components/ui/kbd";
import { Switch } from "@/components/ui/switch";
import { useAccent } from "@/components/site/accent-store";
import { cn } from "@/lib/utils";
import { useMediaQuery, useReducedMotionPreference } from "./use-near-viewport";

/** WCAG contrast of `rgb` at `alpha` over the page background. */
function contrastOnPage(rgb: string, alpha: number) {
  const page = [5, 6, 10];
  const fg = rgb.split(" ").map(Number).map((c, i) => alpha * c + (1 - alpha) * page[i]);
  const lum = (c: number[]) => {
    const [r, g, b] = c.map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const a = lum(fg);
  const b = lum(page);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

type LayerKey = "button" | "track" | "halo" | "tube" | "thumb" | "focus";

/** Bottom to top, as the browser paints them. */
const layers: LayerKey[] = ["button", "track", "halo", "tube", "thumb", "focus"];

export function Anatomy() {
  const reduced = useReducedMotionPreference();
  const wide = useMediaQuery("(min-width: 1024px)");
  const accent = useAccent();
  const [checked, setChecked] = React.useState(true);

  const sectionRef = React.useRef<HTMLElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const frameRef = React.useRef<HTMLDivElement>(null);
  const layerRefs = React.useRef<Partial<Record<LayerKey, HTMLDivElement | null>>>({});
  const labelRefs = React.useRef<Partial<Record<LayerKey, HTMLLIElement | null>>>({});
  const lineRefs = React.useRef<Partial<Record<LayerKey, SVGPathElement | null>>>({});
  const svgRef = React.useRef<SVGSVGElement>(null);

  const S = wide ? 8 : 4.5; // drawing scale: one CSS pixel of the real switch
  const GAP = wide ? 78 : 42; // depth between layers when fully apart

  // Scroll drives the explode. Everything here writes styles directly, no re-render per frame.
  React.useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    let raf = 0;
    let running = false;

    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      let p = 1;
      if (!reduced) {
        if (wide) {
          const r = section.getBoundingClientRect();
          p = (-r.top + vh * 0.1) / Math.max(1, r.height - vh * 1.2);
        } else {
          const r = (stageRef.current ?? section).getBoundingClientRect();
          p = (vh * 0.95 - r.top) / (vh * 0.7);
        }
        p = Math.min(1, Math.max(0, p));
        p = 1 - (1 - p) ** 3;
      }
      layers.forEach((key, i) => {
        const node = layerRefs.current[key];
        if (node) node.style.transform = `translateZ(${(i - 2.5) * GAP * p}px)`;
      });

      // Leader lines from each layer's right corner to its label.
      const svg = svgRef.current;
      const frame = frameRef.current;
      if (!svg || !frame || !wide) return;
      const box = frame.getBoundingClientRect();
      layers.forEach((key, i) => {
        const layer = layerRefs.current[key]?.firstElementChild as HTMLElement | null;
        const label = labelRefs.current[key];
        const line = lineRefs.current[key];
        if (!layer || !label || !line) return;
        const a = layer.getBoundingClientRect();
        const b = label.getBoundingClientRect();
        const x1 = a.right - box.left - 4;
        const y1 = a.top - box.top + a.height * 0.5;
        const x2 = b.left - box.left - 14;
        const y2 = b.top - box.top + 11;
        const elbow = x2 - 28;
        line.setAttribute("d", `M${x1} ${y1}L${elbow} ${y2}L${x2} ${y2}`);
        const show = reduced ? 1 : Math.min(1, Math.max(0, (p - 0.15 - i * 0.04) * 3));
        line.style.opacity = String(show);
        label.style.opacity = String(0.25 + 0.75 * show);
      });
    };

    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        window.addEventListener("scroll", schedule, { passive: true });
        window.addEventListener("resize", schedule);
        schedule();
      } else if (!entry.isIntersecting && running) {
        running = false;
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      }
    });
    observer.observe(section);
    schedule();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(raf);
    };
  }, [reduced, wide, GAP]);

  const ring = contrastOnPage(accent.rgb, 0.6);
  const W = 44 * S;
  const H = 24 * S;
  const on = checked;

  const specs: Record<LayerKey, { name: string; body: React.ReactNode }> = {
    focus: {
      name: "Focus ring",
      body: (
        <>
          <Value>2px</Value> at 60%, <Value>2px</Value> out. <Value>{ring.toFixed(1)}:1</Value> on the page, in your
          current color.
        </>
      ),
    },
    thumb: {
      name: "Thumb",
      body: (
        <>
          <Value>20px</Value>, travels <Value>20px</Value> in <Value>180ms</Value> on an ease-out curve.
        </>
      ),
    },
    tube: {
      name: "Tube",
      body: (
        <>
          A <Value>1px</Value> border at 75% over a 20% fill. Strikes twice when it turns on, then holds.
        </>
      ),
    },
    halo: {
      name: "Halo",
      body: (
        <>
          <Value>14px</Value> at 45%, <Value>20px</Value> under the pointer. Light, never a border.
        </>
      ),
    },
    track: {
      name: "Track",
      body: (
        <>
          <Value>44 × 24</Value>, fully round, a white <Value>1px</Value> border at 10%.
        </>
      ),
    },
    button: {
      name: "The element",
      body: (
        <>
          A real <Value>{"<button role=\"switch\">"}</Value> with <Value>aria-checked</Value>.{" "}
          <Kbd size="sm">Space</Kbd> and <Kbd size="sm">Enter</Kbd> toggle it.
        </>
      ),
    },
  };

  const drawing = (
    <div
      ref={stageRef}
      aria-hidden
      className="relative grid place-items-center [perspective:2400px]"
      style={{ height: wide ? 640 : 420 }}
    >
      <div className="nk-iso relative" style={{ width: W, height: H }}>
        {layers.map((key) => (
          <div key={key} ref={(node) => void (layerRefs.current[key] = node)} className="absolute inset-0 will-change-transform">
            <Layer kind={key} on={on} S={S} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section
      ref={sectionRef}
      aria-labelledby="anatomy-title"
      className="relative px-4 sm:px-6 lg:h-[260vh]"
    >
      <div className="mx-auto max-w-[88rem] lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center">
        <div className="grid gap-8 pt-24 lg:grid-cols-12 lg:gap-6 lg:pt-14">
          <div className="lg:col-span-4 lg:self-center">
            <h2 id="anatomy-title" className="type-display text-balance text-[clamp(2.4rem,4.6vw,4.5rem)] text-fg">
              Six layers in a 44 by 24 switch.
            </h2>
            <p className="mt-6 max-w-[30rem] text-[16.5px] leading-[1.6] text-muted">
              A native button carries the role, the keyboard and the form value. What you see is five spans on top of it,
              each one a class you can change in your copy.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Switch size="lg" checked={checked} onCheckedChange={setChecked} aria-label="Try the switch" />
              <span className="text-[14px] text-muted">
                The real one. The drawing follows it.{" "}
                <Link href="/components/switch" className="text-fg underline decoration-white/25 underline-offset-4 hover:decoration-[rgb(var(--neon-accent))]">
                  Docs
                </Link>
              </span>
            </div>
          </div>

          <div ref={frameRef} className="relative lg:col-span-8">
            {wide && (
              <svg ref={svgRef} aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
                {layers.map((key) => (
                  <path
                    key={key}
                    ref={(node) => void (lineRefs.current[key] = node)}
                    fill="none"
                    stroke="rgb(255 255 255 / 0.22)"
                    strokeWidth={1}
                    style={{ opacity: 0 }}
                  />
                ))}
              </svg>
            )}
            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-center lg:gap-6">
              {drawing}
              <ol className="mt-4 flex flex-col-reverse gap-6 lg:mt-0 lg:gap-7">
                {layers.map((key) => (
                  <li key={key} ref={(node) => void (labelRefs.current[key] = node)} className="transition-opacity">
                    <p className="text-[15px] font-medium text-fg">{specs[key].name}</p>
                    <p className="mt-1 text-[14px] leading-[1.55] text-muted">{specs[key].body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return <span className="font-mono text-[12.5px] text-fg">{children}</span>;
}

/** One layer of the drawing, at S times real size. */
function Layer({ kind, on, S }: { kind: LayerKey; on: boolean; S: number }) {
  const neon = "rgb(var(--neon-accent)";
  const thumbX = on ? 21 * S : 1 * S;
  switch (kind) {
    case "button":
      return (
        <div className="absolute inset-0 rounded-[6px] border border-dashed border-white/25 bg-white/[0.015]">
          <span className="absolute bottom-2 right-4 font-mono text-[12px] text-white/50">{"<button>"}</span>
        </div>
      );
    case "track":
      return <div className="absolute inset-0 rounded-full border border-white/20 bg-[#141720]" />;
    case "halo":
      return (
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-300"
          style={{ boxShadow: `0 0 ${14 * S * 0.6}px ${neon} / 0.45)`, background: `${neon} / 0.05)`, opacity: on ? 1 : 0.08 }}
        />
      );
    case "tube":
      return (
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-300"
          style={{
            border: `${Math.max(1, S / 3)}px solid ${neon} / 0.75)`,
            background: `${neon} / 0.2)`,
            boxShadow: `inset 0 0 ${8 * S * 0.6}px ${neon} / 0.3)`,
            opacity: on ? 1 : 0.12,
          }}
        />
      );
    case "thumb":
      return (
        <div
          className={cn("absolute rounded-full transition-[left,background-color,box-shadow] duration-[180ms] ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none")}
          style={{
            width: 20 * S,
            height: 20 * S,
            top: 2 * S,
            left: thumbX + S,
            background: on ? `${neon})` : "rgb(255 255 255 / 0.6)",
            boxShadow: on ? `0 0 ${10 * S * 0.5}px ${neon} / 0.9), inset 0 ${S}px 0 rgb(255 255 255 / 0.5)` : "0 4px 10px rgb(0 0 0 / 0.5)",
          }}
        />
      );
    case "focus":
      return (
        <div
          className="absolute rounded-full"
          style={{ inset: -4 * S, border: `${Math.max(1.5, S / 2.5)}px solid ${neon} / 0.6)` }}
        />
      );
  }
}
