"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NeonText } from "@/components/ui/neon-text";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { rgbToHue, setAccent, useAccent } from "@/components/site/accent-store";
import { neonColorNames, neonColors } from "@/lib/neon";
import { cn } from "@/lib/utils";
import { useNearViewport, useReducedMotionPreference } from "./use-near-viewport";

const link =
  "font-medium text-fg underline decoration-white/25 underline-offset-[5px] transition-colors hover:decoration-[rgb(var(--neon-accent))]";

/** The design language as a datasheet: four rows, each one a live specimen rather than a description. */
export function System() {
  return (
    <section aria-labelledby="system-title" className="relative py-28 sm:py-40">
      <div className="mx-auto max-w-[88rem] px-4 sm:px-6">
        <h2 id="system-title" className="type-display max-w-[14ch] text-balance text-[clamp(2.4rem,5vw,4.75rem)] text-fg">
          The rules fit on one page.
        </h2>
        <p className="mt-6 max-w-[34rem] text-[16.5px] leading-[1.6] text-muted">
          One variable for color, one for brightness, and a habit of treating glow as light. Everything on this
          site, and everything you install, follows them.{" "}
          <Link href="/docs/design" className={link}>
            Read the design language
          </Link>
        </p>

        <div className="mt-16 border-t border-line sm:mt-24">
          <Row title="One variable." note={<>
            <code className="font-mono text-[0.92em] text-fg">--neon</code> holds three RGB channels. Every component
            reads it, so a class or a style prop recolors anything and its children inherit it.
          </>}>
            <Gels />
          </Row>
          <Row title="A core and a halo." note={<>
            Lit things get a white-hot core, colored glass and a soft halo. Nothing glows at rest.{" "}
            <code className="font-mono text-[0.92em] text-fg">--neon-glow</code> scales every halo in the library.
          </>}>
            <Light />
          </Row>
          <Row title="Wide for signs, plain for reading." note="Mona Sans carries the hierarchy and widens on its own axis for headlines. Fragment Mono is for values that change. Tilt Neon only goes on actual signs.">
            <Type />
          </Row>
          <Row title="Ease out, strike on." note="Interface moves 150 to 300ms on an ease-out curve. Lights don't fade in: they strike, flicker twice and hold, like a tube warming up.">
            <Motion />
          </Row>
        </div>
      </div>
    </section>
  );
}

function Row({ title, note, children }: { title: string; note: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-8 border-b border-line py-12 sm:py-16 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-4 lg:pr-10">
        <h3 className="text-[clamp(1.3rem,1.8vw,1.6rem)] font-medium leading-[1.2] tracking-[-0.02em] text-fg">{title}</h3>
        <p className="mt-3 max-w-[30rem] text-[15.5px] leading-[1.6] text-muted">{note}</p>
      </div>
      <div className="min-w-0 lg:col-span-8">{children}</div>
    </div>
  );
}

// ── Color: the eleven gels, as tubes you can switch on ────────────────────────────────────────────

function Gels() {
  const accent = useAccent();
  return (
    <div>
      <div className="flex items-end justify-between gap-1 sm:gap-3">
        {neonColorNames.map((name) => {
          const rgb = neonColors[name];
          const active = accent.rgb === rgb;
          return (
            <button
              key={name}
              type="button"
              aria-pressed={active}
              aria-label={`Use ${name}`}
              onClick={() => setAccent({ hue: rgbToHue(rgb), rgb, name })}
              className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-3 rounded-lg py-1 outline-offset-4"
            >
              <span
                className={cn(
                  "relative h-28 w-2.5 rounded-full transition-[opacity,box-shadow] duration-200 sm:h-40 sm:w-3",
                  active ? "opacity-100" : "opacity-35 group-hover:opacity-80",
                )}
                style={{
                  background: `linear-gradient(90deg, rgb(${rgb}), color-mix(in srgb, rgb(${rgb}) 45%, white) 50%, rgb(${rgb}))`,
                  boxShadow: active ? `0 0 6px rgb(${rgb}), 0 0 28px rgb(${rgb} / 0.55), 0 0 64px rgb(${rgb} / 0.25)` : undefined,
                }}
              />
              <span className={cn("hidden text-[13px] sm:block", active ? "text-fg" : "text-muted")}>{name}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-2 text-[14px] text-muted">
        <code className="font-mono text-[14px] text-fg">
          --neon: <span className="text-[rgb(var(--neon-accent))]">{accent.rgb}</span>;
        </code>
        <span>Eleven gels by name, or any hex. The page follows whichever you pick.</span>
      </p>
    </div>
  );
}

// ── Light: one tube, drawn three times, with the glow fader ──────────────────────────────────────

const TUBE = "M24 118 C 96 118, 104 38, 176 38 S 256 118, 328 118 S 408 38, 480 38 L 560 38";

function Light() {
  const [glow, setGlow] = React.useState(1);
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-12">
      <div className="relative">
        <svg viewBox="0 0 584 156" className="w-full overflow-visible" aria-hidden fill="none" strokeLinecap="round">
          <path d={TUBE} stroke="rgb(var(--neon-accent))" strokeWidth={22} strokeOpacity={0.45 * glow} style={{ filter: "blur(18px)" }} />
          <path d={TUBE} stroke="rgb(var(--neon-accent))" strokeWidth={8} strokeOpacity={Math.min(1, 0.9 * glow)} style={{ filter: "blur(4px)" }} />
          <path d={TUBE} stroke="rgb(var(--neon-accent))" strokeWidth={5} />
          <path d={TUBE} stroke="white" strokeOpacity={0.92} strokeWidth={1.6} />
        </svg>
        {/* Callouts: what each pass is */}
        <dl className="mt-8 grid grid-cols-3 gap-4 text-[13.5px]">
          {[
            ["Core", "white at 92%, a third of the tube"],
            ["Glass", "the color, full strength"],
            ["Halo", `18px blur at ${Math.round(45 * glow)}%`],
          ].map(([term, detail]) => (
            <div key={term} className="border-t border-line pt-3">
              <dt className="text-fg">{term}</dt>
              <dd className="mt-1 text-muted">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div style={{ "--neon-glow": glow } as React.CSSProperties} className="flex flex-col justify-between gap-8">
        <div>
          <div className="flex items-baseline justify-between text-[14px]">
            <label id="glow-label" className="text-muted">
              Glow
            </label>
            <code className="font-mono text-[13.5px] tabular-nums text-fg">--neon-glow: {glow.toFixed(2)}</code>
          </div>
          <Slider
            aria-labelledby="glow-label"
            className="mt-4"
            min={0}
            max={1.5}
            step={0.05}
            value={[glow]}
            onValueChange={([value]) => setGlow(value)}
          />
          <p className="mt-3 text-[13.5px] leading-[1.55] text-muted">0 is a flat dark UI. 1.5 is a bar sign at 2am.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="solid" size="sm">
            Deploy
          </Button>
          <Switch defaultChecked aria-label="Sample switch" />
          <Badge dot pulse color="green">
            Live
          </Badge>
        </div>
      </div>
    </div>
  );
}

// ── Type: the width axis, live ───────────────────────────────────────────────────────────────────

function Type() {
  const [width, setWidth] = React.useState(112);
  return (
    <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_15rem] xl:gap-12">
      <div className="min-w-0">
        <p
          aria-hidden
          className="truncate text-[clamp(3.5rem,8vw,7.5rem)] font-[620] leading-[0.95] tracking-[-0.04em] text-fg transition-[font-stretch] duration-150"
          style={{ fontStretch: `${width}%` }}
        >
          Open late
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <div className="border-t border-line pt-3">
            <p className="text-[13.5px] text-muted">Body, Mona Sans 100%</p>
            <p className="mt-2 text-[16px] leading-[1.55] text-fg">Deploys that land at 2am.</p>
          </div>
          <div className="border-t border-line pt-3">
            <p className="text-[13.5px] text-muted">Values, Fragment Mono</p>
            <p className="mt-2 font-mono text-[15px] tabular-nums text-fg">−16.2 LUFS · 0.38 s</p>
          </div>
          <div className="border-t border-line pt-3">
            <p className="text-[13.5px] text-muted">Signs, Tilt Neon</p>
            <NeonText as="p" color="pink" className="mt-1 font-neon text-[26px] leading-none">
              open late
            </NeonText>
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-baseline justify-between text-[14px]">
          <label id="width-label" className="text-muted">
            Width axis
          </label>
          <code className="font-mono text-[13.5px] tabular-nums text-fg">wdth {width}</code>
        </div>
        <Slider
          aria-labelledby="width-label"
          className="mt-4"
          min={75}
          max={125}
          step={1}
          value={[width]}
          onValueChange={([value]) => setWidth(value)}
        />
        <p className="mt-3 text-[13.5px] leading-[1.55] text-muted">
          Headlines sit at 112 and weight 620. Body stays at 100 and 400.
        </p>
      </div>
    </div>
  );
}

// ── Motion: the curve, and the strike ────────────────────────────────────────────────────────────

/** nk-strike, as points: time (0–1) and brightness. */
const STRIKE: [number, number][] = [
  [0, 0],
  [0, 0.55],
  [0.08, 1],
  [0.16, 0.6],
  [0.3, 1],
  [0.38, 0.85],
  [1, 1],
];

function Motion() {
  const reduced = useReducedMotionPreference();
  const [ref, near, visible] = useNearViewport<HTMLDivElement>("0px");
  const [run, setRun] = React.useState(0);
  // Play once when it first comes into view.
  if (near && visible && run === 0 && !reduced) setRun(1);

  const W = 240;
  const H = 120;
  const strikePath = STRIKE.map(([t, v], i) => `${i ? "L" : "M"}${(t * W).toFixed(1)} ${(H - v * H).toFixed(1)}`).join("");

  return (
    <div ref={ref} className="grid gap-12 sm:grid-cols-2 sm:gap-8">
      <figure>
        <svg viewBox={`-8 -8 ${W + 16} ${H + 16}`} className="w-full max-w-[22rem] overflow-visible" aria-hidden fill="none">
          <path d={`M0 ${H}H${W}M0 0V${H}`} stroke="white" strokeOpacity={0.1} />
          <path d={`M0 ${H} L${W} 0`} stroke="white" strokeOpacity={0.08} strokeDasharray="3 4" />
          <path d={`M0 ${H} C ${0.23 * W} 0, ${0.32 * W} 0, ${W} 0`} stroke="rgb(var(--neon-accent))" strokeWidth={2} />
        </svg>
        <div className="relative mt-5 h-3 max-w-[22rem] rounded-full bg-white/[0.04]">
          <Ball key={run} play={run > 0} still={reduced} />
        </div>
        <figcaption className="mt-4 text-[14px] text-muted">
          <code className="font-mono text-[13.5px] text-fg">cubic-bezier(0.23, 1, 0.32, 1)</code>, 300ms
        </figcaption>
      </figure>

      <figure>
        <div className="flex items-end gap-6">
          <svg viewBox={`-8 -8 ${W + 16} ${H + 16}`} className="w-full max-w-[22rem] overflow-visible" aria-hidden fill="none">
            <path d={`M0 ${H}H${W}M0 0V${H}`} stroke="white" strokeOpacity={0.1} />
            <path d={strikePath} stroke="rgb(var(--neon-accent))" strokeWidth={2} strokeLinejoin="round" />
          </svg>
          <span
            key={run}
            aria-hidden
            className={cn(
              "mb-1 h-24 w-2.5 shrink-0 rounded-full bg-[rgb(var(--neon-accent))] shadow-[0_0_6px_rgb(var(--neon-accent)),0_0_24px_rgb(var(--neon-accent)/0.6)]",
              run > 0 && "nk-strike",
            )}
          />
        </div>
        <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-3 text-[14px] text-muted">
          <span>
            Brightness over <code className="font-mono text-[13.5px] text-fg">520ms</code> of ignition
          </span>
          <button
            type="button"
            onClick={() => setRun((n) => n + 1)}
            className="cursor-pointer rounded-md text-[14px] font-medium text-fg underline decoration-white/25 underline-offset-[5px] transition-colors hover:decoration-[rgb(var(--neon-accent))]"
          >
            Strike again
          </button>
        </figcaption>
      </figure>
    </div>
  );
}

/** Rides the curve once per mount; the parent remounts it (by key) to replay. */
function Ball({ play, still }: { play: boolean; still: boolean }) {
  const [moved, setMoved] = React.useState(false);
  React.useEffect(() => {
    if (!play) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => (inner = requestAnimationFrame(() => setMoved(true))));
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [play]);
  // The carrier is the track minus the ball, so translating it by its own width lands the ball at the end.
  return (
    <span
      aria-hidden
      className="absolute inset-y-0 left-0 w-[calc(100%-0.75rem)]"
      style={{
        transform: moved || still ? "translateX(100%)" : "none",
        transition: moved ? "transform 300ms cubic-bezier(0.23, 1, 0.32, 1)" : "none",
      }}
    >
      <span className="absolute left-0 top-0 size-3 rounded-full bg-[rgb(var(--neon-accent))] shadow-[0_0_10px_rgb(var(--neon-accent)/0.8)]" />
    </span>
  );
}
