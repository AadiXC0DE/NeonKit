"use client";

import * as React from "react";
import { Minus, Plus, ShoppingBag, Truck, X } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { NumberInput } from "@/components/ui/number-input";
import { Progress } from "@/components/ui/progress";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { neonVars, toNeonRgb } from "@/lib/neon";

// Stem colors are the real product colors, so each swatch carries its own light.
const VARIANTS = [
  { id: "linear", name: "Linear", stem: "#a3e635", force: "45 g", feel: "Smooth, no bump", price: 38 },
  { id: "tactile", name: "Tactile", stem: "#fbbf24", force: "62 g", feel: "Rounded bump at 1.2 mm", price: 42 },
  { id: "silent", name: "Silent", stem: "#7dd3fc", force: "55 g", feel: "Dampened, 28 dB bottom-out", price: 44 },
] as const;

type VariantId = (typeof VARIANTS)[number]["id"];

type Line = { id: string; name: string; detail: string; price: number; qty: number; swatch: string };

const STARTING_CART: Line[] = [
  { id: "ridge-fog", name: "Ridge PBT keycaps", detail: "Fog · 142 keys", price: 74, qty: 1, swatch: "#9aa3b5" },
];

const ADD_ON: Line = { id: "lube-205", name: "Switch lube, 205g0", detail: "5 ml · brush included", price: 9, qty: 1, swatch: "#e6edf7" };

const FREE_SHIPPING = 100;

const money = (value: number) => `$${value.toFixed(2)}`;

// Eases the running total toward its new value by writing to the DOM, not state.
function AnimatedMoney({ value, className }: { value: number; className?: string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const shown = React.useRef(value);

  React.useEffect(() => {
    const node = ref.current;
    const from = shown.current;
    if (!node || from === value) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      shown.current = value;
      node.textContent = money(value);
      return;
    }
    const start = performance.now();
    let frame = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / 420);
      const eased = 1 - Math.pow(1 - t, 3);
      shown.current = from + (value - from) * eased;
      node.textContent = money(shown.current);
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {money(value)}
    </span>
  );
}

// Isometric projection, in millimetres. The viewer looks down at the +x and +y faces.
const SCALE = 10;
const COS = Math.cos(Math.PI / 6);
const iso = (x: number, y: number, z: number) =>
  `${(200 + (x - y) * COS * SCALE).toFixed(1)} ${(250 + (x + y) * 0.5 * SCALE - z * SCALE).toFixed(1)}`;

type Shade = { top: string; x: string; y: string; stroke: string };

// Extrudes a footprint from z0 to z1, optionally narrowing toward the top, and
// draws only the faces that point at the viewer, back to front.
function Solid({ points, z0, z1, taper = 1, shade }: { points: [number, number][]; z0: number; z1: number; taper?: number; shade: Shade }) {
  const sides = points
    .map((a, i) => {
      const b = points[(i + 1) % points.length];
      const nx = b[1] - a[1];
      const ny = a[0] - b[0];
      return { a, b, nx, ny, depth: a[0] + a[1] + b[0] + b[1] };
    })
    .filter(({ nx, ny }) => nx + ny > 0.001)
    .sort((p, q) => p.depth - q.depth);

  return (
    <g stroke={shade.stroke} strokeWidth={1}>
      {sides.map(({ a, b, nx, ny }, i) => (
        <path
          key={i}
          d={`M${iso(a[0], a[1], z0)}L${iso(b[0], b[1], z0)}L${iso(b[0] * taper, b[1] * taper, z1)}L${iso(a[0] * taper, a[1] * taper, z1)}Z`}
          fill={nx > ny ? shade.x : shade.y}
        />
      ))}
      <path d={`M${points.map(([x, y]) => iso(x * taper, y * taper, z1)).join("L")}Z`} fill={shade.top} />
    </g>
  );
}

const square = (h: number): [number, number][] => [[-h, -h], [h, -h], [h, h], [-h, h]];
const CROSS: [number, number][] = [
  [-0.65, -2.1], [0.65, -2.1], [0.65, -0.65], [2.1, -0.65], [2.1, 0.65], [0.65, 0.65],
  [0.65, 2.1], [-0.65, 2.1], [-0.65, 0.65], [-2.1, 0.65], [-2.1, -0.65], [-0.65, -0.65],
];

const css = `
.nk-marketing-product-card-part { transition: transform 560ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms ease-out; }
@media (prefers-reduced-motion: reduce) { .nk-marketing-product-card-part { transition: none; } }
`;

function SwitchArt({ exploded }: { exploded: boolean }) {
  const part = (y: number, extra?: React.CSSProperties) => ({
    className: "nk-marketing-product-card-part",
    style: { transform: `translateY(${exploded ? y : 0}px)`, ...extra },
  });
  const coil = Array.from({ length: 97 }, (_, i) => {
    const t = i / 96;
    const angle = t * Math.PI * 2 * 7;
    return iso(Math.cos(angle) * 2.3, Math.sin(angle) * 2.3, 1 + t * 9);
  }).join("L");
  // The LED window sits on the front-right face of the top housing.
  const face = (z: number) => 7.8 - 2.3 * ((z - 5) / 6.5);
  const led = [[-1.6, 8.6], [1.6, 8.6], [1.6, 9.8], [-1.6, 9.8]].map(([y, z]) => iso(face(z), y, z)).join("L");

  return (
    <svg aria-hidden viewBox="40 -40 320 440" className="h-full w-full overflow-visible" fill="none" strokeLinejoin="round">
      <ellipse cx={200} cy={322} rx={120} ry={22} fill="rgb(var(--neon) / 0.14)" className="[filter:blur(14px)]" />

      <g {...part(30)}>
        <Solid points={square(7.8)} z0={0} z1={5} shade={{ top: "#1a1b23", x: "#121319", y: "#0d0e13", stroke: "rgb(255 255 255 / 0.12)" }} />
      </g>

      <g {...part(-12, { opacity: exploded ? 1 : 0 })}>
        <path d={`M${coil}`} stroke="rgb(255 255 255 / 0.5)" strokeWidth={1.4} />
      </g>

      <g {...part(-40)}>
        <Solid points={square(7.8)} z0={5} z1={11.5} taper={5.5 / 7.8} shade={{ top: "rgb(255 255 255 / 0.07)", x: "rgb(255 255 255 / 0.045)", y: "rgb(255 255 255 / 0.025)", stroke: "rgb(255 255 255 / 0.2)" }} />
        <path d={`M${led}Z`} fill="rgb(var(--neon))" className="opacity-70 [filter:blur(5px)]" />
        <path d={`M${led}Z`} fill="color-mix(in srgb, rgb(var(--neon)) 50%, white)" />
      </g>

      {/* The stem: the part you choose, and the one thing lit */}
      <g {...part(-82)} >
        <g className="[filter:drop-shadow(0_0_6px_rgb(var(--neon)/0.7))_drop-shadow(0_0_20px_rgb(var(--neon)/0.4))]">
          <Solid points={square(2.9)} z0={11.5} z1={14} shade={{ top: "rgb(var(--neon))", x: "rgb(var(--neon) / 0.8)", y: "rgb(var(--neon) / 0.6)", stroke: "rgb(var(--neon) / 0.9)" }} />
          <Solid points={CROSS} z0={14} z1={17.5} shade={{ top: "color-mix(in srgb, rgb(var(--neon)) 45%, white)", x: "rgb(var(--neon) / 0.9)", y: "rgb(var(--neon) / 0.7)", stroke: "color-mix(in srgb, rgb(var(--neon)) 60%, white)" }} />
        </g>
      </g>
    </svg>
  );
}

export default function MarketingProductCard() {
  const [variantId, setVariantId] = React.useState<VariantId>("linear");
  const [qty, setQty] = React.useState<number | null>(1);
  const [exploded, setExploded] = React.useState(false);
  const [cart, setCart] = React.useState<Line[]>(STARTING_CART);
  const [flash, setFlash] = React.useState<string | null>(null);
  const flashTimer = React.useRef<number | undefined>(undefined);
  const cartRef = React.useRef<HTMLElement>(null);
  // Removing a line (or the add-on row) unmounts the focused button, so pick where focus lands next.
  const focusNext = React.useRef<((cart: HTMLElement) => HTMLElement | null | undefined) | null>(null);
  React.useEffect(() => () => window.clearTimeout(flashTimer.current), []);
  React.useEffect(() => {
    const pick = focusNext.current;
    focusNext.current = null;
    if (pick && cartRef.current) (pick(cartRef.current) ?? cartRef.current.querySelector<HTMLElement>("h3"))?.focus();
  }, [cart]);

  const variant = VARIANTS.find((v) => v.id === variantId)!;
  const count = qty ?? 1;
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.qty, 0);
  const items = cart.reduce((sum, line) => sum + line.qty, 0);
  const toGo = Math.max(0, FREE_SHIPPING - subtotal);

  function addToCart() {
    const id = `halyard-${variant.id}`;
    setCart((lines) => {
      const existing = lines.find((line) => line.id === id);
      if (existing) return lines.map((line) => (line.id === id ? { ...line, qty: Math.min(10, line.qty + count) } : line));
      return [...lines, { id, name: "Halyard switches", detail: `${variant.name} ${variant.force} · 70 pack`, price: variant.price, qty: count, swatch: variant.stem }];
    });
    setFlash(id);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 900);
  }

  function addOn() {
    focusNext.current = (root) => root.querySelector<HTMLElement>(`[data-line="${ADD_ON.id}"] button`);
    setCart((lines) => (lines.some((line) => line.id === ADD_ON.id) ? lines : [...lines, ADD_ON]));
    setFlash(ADD_ON.id);
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 900);
  }

  function changeQty(id: string, delta: number) {
    const index = cart.findIndex((line) => line.id === id);
    if (index !== -1 && cart[index].qty + delta <= 0) {
      focusNext.current = (root) => {
        const rows = root.querySelectorAll<HTMLElement>("[data-line]");
        return rows[Math.min(index, rows.length - 1)]?.querySelector<HTMLElement>("button[aria-label^='Remove']");
      };
    }
    setCart((lines) =>
      lines.flatMap((line) => {
        if (line.id !== id) return [line];
        const next = line.qty + delta;
        return next <= 0 ? [] : [{ ...line, qty: Math.min(10, next) }];
      }),
    );
  }

  return (
    <section
      aria-labelledby="volt-product-title"
      // Change the color here; everything inside follows it.
      style={neonVars("lime")}
      className="relative isolate bg-[#05060a] px-6 py-16 text-white/90 sm:px-10 sm:py-24"
    >
      <style>{css}</style>
      <div className="mx-auto grid max-w-[1200px] items-start gap-6 lg:grid-cols-12">
        <article className="lg:col-span-8">
          <div className="grid gap-8 md:grid-cols-2 md:gap-10">
            <div
              // The art follows the chosen stem color.
              style={{ "--neon": toNeonRgb(variant.stem) } as React.CSSProperties}
              className="relative flex min-h-[320px] flex-col rounded-[20px] bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,rgb(var(--neon)/0.1),transparent_70%)] md:min-h-[520px]"
            >
              <div className="flex items-center justify-between gap-3 py-1">
                <span className="font-mono text-[12px] text-white/50">VS-HAL-{variant.id.slice(0, 3).toUpperCase()}</span>
                <ToggleGroup aria-label="View" size="sm" variant="segmented" value={exploded ? "exploded" : "assembled"} onValueChange={(value) => setExploded(value === "exploded")}>
                  <ToggleGroupItem value="assembled" className="h-8 sm:h-6">Assembled</ToggleGroupItem>
                  <ToggleGroupItem value="exploded" className="h-8 sm:h-6">Exploded</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="relative flex flex-1 items-center px-2 pb-2 pt-6">
                <div className="absolute inset-0 bg-[linear-gradient(rgb(255_255_255/0.025)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.025)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,#000,transparent_75%)]" />
                <div className="relative mx-auto aspect-[320/440] w-full max-w-[250px] md:max-w-[320px]">
                  <SwitchArt exploded={exploded} />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:py-1">
              <h2 id="volt-product-title" className="text-[clamp(2.25rem,4vw,3rem)] font-[620] leading-[0.96] tracking-[-0.045em] text-white [font-stretch:112%]">
                Halyard switches
              </h2>
              <p className="mt-4 text-[15.5px] leading-[1.6] text-white/60">
                <span className="text-white/90">Factory-lubed, five-pin, with a north-facing LED window.</span> Seventy per
                pack: a full-size board and four spares.
              </p>

              <div className="mt-7 flex items-baseline gap-2">
                <AnimatedMoney value={variant.price} className="text-[36px] font-[620] leading-none tracking-[-0.04em] text-white [font-stretch:112%]" />
                <span className="text-sm text-white/60">per 70 pack</span>
              </div>

              <fieldset className="mt-6">
                <legend className="text-sm font-medium text-white/80">
                  Stem <span className="font-normal text-white/60">{variant.name}, {variant.force}</span>
                </legend>
                <div className="mt-3 flex gap-2.5">
                  {VARIANTS.map((option) => {
                    const selected = option.id === variantId;
                    return (
                      <label
                        key={option.id}
                        style={{ "--swatch": toNeonRgb(option.stem) } as React.CSSProperties}
                        className={cn(
                          "relative grid size-11 cursor-pointer place-items-center rounded-full border transition-[border-color,box-shadow] duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[rgb(var(--neon)/0.6)] has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-[#05060a]",
                          selected
                            ? "border-[rgb(var(--swatch)/0.8)] shadow-[0_0_14px_rgb(var(--swatch)/0.45)]"
                            : "border-white/10 hover:border-white/25",
                        )}
                      >
                        <input
                          type="radio"
                          name="volt-stem"
                          value={option.id}
                          checked={selected}
                          onChange={() => setVariantId(option.id)}
                          className="sr-only"
                          aria-label={`${option.name}, ${option.force}, ${money(option.price)}`}
                        />
                        <span
                          aria-hidden
                          className={cn(
                            "size-6 rounded-full bg-[rgb(var(--swatch))]",
                            selected ? "shadow-[inset_0_-3px_6px_rgb(0_0_0/0.3)]" : "opacity-70",
                          )}
                        />
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <dl className="mt-6 grid grid-cols-3 border-y border-white/[0.06] py-4 text-[13px]">
                {[
                  ["Actuation", variant.force],
                  ["Travel", "4.0 mm"],
                  ["Pins", "5-pin"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[12px] text-white/55">{label}</dt>
                    <dd className="mt-1 text-white/85">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-3 text-[13px] text-white/60">{variant.feel}</p>

              <div className="mt-6 flex items-end gap-3 md:mt-auto md:pt-6">
                <NumberInput
                  label="Packs"
                  min={1}
                  max={10}
                  locale="en-US"
                  value={qty}
                  onValueChange={setQty}
                  containerClassName="w-[120px] shrink-0"
                />
                <Button variant="solid" onClick={addToCart} className="flex-1">
                  <ShoppingBag aria-hidden /> Add to cart, <span className="tabular-nums">{money(variant.price * count)}</span>
                </Button>
              </div>
            </div>
          </div>
        </article>

        <aside ref={cartRef} aria-labelledby="volt-cart-title" className="rounded-[20px] border border-white/10 bg-[#0a0b11] lg:col-span-4">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
            <h3 id="volt-cart-title" tabIndex={-1} className="text-sm font-medium text-white/90 outline-none">
              Cart
            </h3>
            <span aria-live="polite" className="text-[13px] tabular-nums text-white/55">
              {items} {items === 1 ? "item" : "items"}
            </span>
          </div>

          {cart.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-white/60">Empty. The switches are right there.</p>
          ) : (
            <ul className="divide-y divide-white/[0.06]">
              {cart.map((line) => (
                <li
                  key={line.id}
                  data-line={line.id}
                  className={cn(
                    "flex gap-3.5 px-5 py-4 transition-colors duration-700",
                    flash === line.id && "bg-[rgb(var(--neon)/0.07)] duration-150",
                  )}
                >
                  <span
                    aria-hidden
                    className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#07080c]"
                  >
                    <span className="size-3.5 rounded-[3px]" style={{ backgroundColor: line.swatch, boxShadow: `0 0 10px ${line.swatch}66` }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="truncate text-sm text-white/90">{line.name}</p>
                      <p className="text-sm tabular-nums text-white/90">{money(line.price * line.qty)}</p>
                    </div>
                    <p className="mt-0.5 truncate text-[12px] text-white/60">{line.detail}</p>
                    <div className="mt-2.5 flex items-center justify-between">
                      <div className="flex items-center rounded-md border border-white/10">
                        <button
                          type="button"
                          aria-label={`One fewer ${line.name}`}
                          onClick={() => changeQty(line.id, -1)}
                          className="grid size-9 place-items-center rounded-l-md sm:size-7 text-white/55 outline-none hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]"
                        >
                          <Minus aria-hidden className="size-3.5" />
                        </button>
                        <span className="w-7 text-center font-mono text-[12px] tabular-nums text-white/85">{line.qty}</span>
                        <button
                          type="button"
                          aria-label={`One more ${line.name}`}
                          onClick={() => changeQty(line.id, 1)}
                          className="grid size-9 place-items-center rounded-r-md sm:size-7 text-white/55 outline-none hover:bg-white/[0.05] hover:text-white focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[rgb(var(--neon)/0.6)]"
                        >
                          <Plus aria-hidden className="size-3.5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remove ${line.name}`}
                        onClick={() => changeQty(line.id, -line.qty)}
                        className="-mr-1 grid size-9 place-items-center rounded-md text-white/55 sm:mr-0 sm:size-7 outline-none hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                      >
                        <X aria-hidden className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!cart.some((line) => line.id === ADD_ON.id) && (
            <div className="flex items-center gap-3 border-t border-dashed border-white/[0.08] px-5 py-3.5">
              <p className="min-w-0 flex-1 text-[12px] leading-snug text-white/60">
                <span className="block text-white/55">Pairs well with</span>
                {ADD_ON.name} · {money(ADD_ON.price)}
              </p>
              <Button variant="ghost" size="sm" onClick={addOn}>
                <Plus aria-hidden /> Add
              </Button>
            </div>
          )}

          <div className="border-t border-white/[0.06] px-5 py-5">
            <Progress size="sm" value={Math.min(subtotal, FREE_SHIPPING)} max={FREE_SHIPPING} aria-label="Progress to free shipping" />
            <p className="mt-2.5 flex items-center gap-2 text-[12px] text-white/55">
              <Truck aria-hidden className="size-3.5 shrink-0" />
              {toGo > 0 ? (
                <span>
                  {money(toGo)} more for free shipping
                </span>
              ) : (
                <span className="text-[rgb(var(--neon))]">Free shipping. Leaves Leeds tomorrow.</span>
              )}
            </p>

            <div className="mt-5 flex items-baseline justify-between">
              <span className="text-sm text-white/55">Subtotal</span>
              <AnimatedMoney value={subtotal} className="text-[24px] font-[620] tracking-[-0.035em] text-white [font-stretch:112%]" />
            </div>
            {cart.length > 0 && (
              <Button variant="outline" className="mt-4 w-full" asChild>
                <a href="#">Checkout</a>
              </Button>
            )}
            <p className="mt-3 text-center text-[11px] text-white/60">Taxes calculated at checkout. 30-day returns, unopened.</p>
          </div>
        </aside>
      </div>
    </section>
  );
}
