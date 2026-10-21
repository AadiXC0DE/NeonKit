"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Fader } from "@/components/ui/fader";
import { HardwareSwitch } from "@/components/ui/hardware-switch";
import { Plus } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Knob } from "@/components/ui/knob";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import {
  GLOW,
  MAX_TUBES,
  RADIUS,
  TINT,
  cleanName,
  hexToRgb,
  rgbToHex,
  solidTextContrast,
  surfaceRgb,
  uniqueName,
  type Motion,
  type Theme,
  type Tube,
} from "./state";

type Update = (fn: (theme: Theme) => Theme) => void;

// ── Palette channels ──────────────────────────────────────────────────────

function ChannelEditor({
  tube,
  index,
  theme,
  update,
  onDone,
}: {
  tube: Tube;
  index: number;
  theme: Theme;
  update: Update;
  onDone: () => void;
}) {
  const [draft, setDraft] = React.useState(tube.name);
  const isAccent = theme.accent === tube.name;
  const ratio = solidTextContrast(tube.rgb);
  const taken = theme.palette.filter((_, i) => i !== index).map((t) => t.name);
  const cleaned = cleanName(draft);
  const clash = cleaned !== "" && taken.includes(cleaned);

  const rename = () => {
    const next = cleaned && !clash ? cleaned : tube.name;
    setDraft(next);
    if (next === tube.name) return;
    update((t) => ({
      ...t,
      accent: t.accent === tube.name ? next : t.accent,
      palette: t.palette.map((x, i) => (i === index ? { ...x, name: next } : x)),
    }));
  };

  return (
    <div className="grid w-[288px] max-w-full gap-4">
      <Input
        label="Name"
        size="sm"
        value={draft}
        maxLength={16}
        spellCheck={false}
        autoComplete="off"
        onChange={(e) => setDraft(e.target.value)}
        onBlur={rename}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            rename();
          }
        }}
        error={clash ? `Another color is already called ${cleaned}.` : undefined}
        description={
          !clash ? (
            <span>
              Used as <span className="font-mono text-white/75">color=&quot;{cleaned || tube.name}&quot;</span>
            </span>
          ) : undefined
        }
      />
      <ColorPicker
        size="sm"
        aria-label={`${tube.name} color`}
        value={rgbToHex(tube.rgb)}
        onValueChange={(hex) => {
          const rgb = hexToRgb(hex);
          if (!rgb) return;
          update((t) => ({ ...t, palette: t.palette.map((x, i) => (i === index ? { ...x, rgb } : x)) }));
        }}
      />
      <p className="text-[13px] leading-5 text-white/55">
        Dark text on a solid fill:{" "}
        <span className={cn("font-mono tabular-nums", ratio < 4.5 ? "text-[#ff8a3d]" : "text-white/85")}>
          {ratio.toFixed(1)}:1
        </span>
        {ratio < 4.5 ? ". Below 4.5:1, solid buttons in this color fail AA." : "."}
      </p>
      <div className="flex items-center justify-between gap-2 border-t border-white/[0.07] pt-3">
        <Button
          size="sm"
          variant={isAccent ? "soft" : "outline"}
          disabled={isAccent}
          onClick={() => update((t) => ({ ...t, accent: tube.name }))}
        >
          {isAccent ? "Default accent" : "Make default"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={theme.palette.length <= 1}
          onClick={() => {
            update((t) => {
              const palette = t.palette.filter((_, i) => i !== index);
              return { ...t, palette, accent: t.accent === tube.name ? palette[0].name : t.accent };
            });
            onDone();
          }}
        >
          Remove
        </Button>
      </div>
    </div>
  );
}

export function Channels({ theme, update }: { theme: Theme; update: Update }) {
  const [open, setOpen] = React.useState<number | null>(null);
  const refs = React.useRef<(HTMLButtonElement | null)[]>([]);
  const count = theme.palette.length;

  const add = () => {
    // A new tube starts as the hue halfway round from the accent, so it's visibly new.
    const names = theme.palette.map((t) => t.name);
    const name = uniqueName("tube", names);
    update((t) => ({ ...t, palette: [...t.palette, { name, rgb: "255 106 0" }] }));
    setOpen(count);
  };

  return (
    <div className="min-w-0">
      <div
        role="toolbar"
        aria-label="Palette"
        className="flex items-end gap-0.5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onKeyDown={(e) => {
          const i = refs.current.findIndex((node) => node === document.activeElement);
          if (i === -1) return;
          const last = refs.current.length - 1;
          const next =
            e.key === "ArrowRight" ? Math.min(last, i + 1) : e.key === "ArrowLeft" ? Math.max(0, i - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
          if (next === null) return;
          e.preventDefault();
          refs.current[next]?.focus();
        }}
      >
        {theme.palette.map((tube, i) => {
          const isAccent = tube.name === theme.accent;
          return (
            <Popover key={`${i}-${tube.name}`} open={open === i} onOpenChange={(o) => setOpen(o ? i : null)}>
              <PopoverTrigger asChild>
                <button
                  ref={(node) => {
                    refs.current[i] = node;
                  }}
                  type="button"
                  tabIndex={i === 0 ? 0 : -1}
                  aria-label={`${tube.name}, ${rgbToHex(tube.rgb)}${isAccent ? ", default accent" : ""}`}
                  style={{ "--neon": tube.rgb, "--neon-accent": tube.rgb } as React.CSSProperties}
                  className={cn(
                    "group flex w-[58px] shrink-0 cursor-pointer flex-col items-center gap-2.5 rounded-lg pb-1.5 pt-2 outline-none transition-colors duration-150",
                    "hover:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]",
                    open === i && "bg-white/[0.05]",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "h-14 w-[7px] rounded-full transition-[box-shadow,opacity,transform] duration-200 ease-out-quint",
                      isAccent ? "opacity-100" : "opacity-60 group-hover:opacity-100",
                    )}
                    style={{
                      background: isAccent
                        ? `linear-gradient(to right, rgb(${tube.rgb}), #fff 45%, rgb(${tube.rgb}))`
                        : `rgb(${tube.rgb})`,
                      boxShadow: isAccent
                        ? `0 0 4px rgb(${tube.rgb}), 0 0 14px rgb(${tube.rgb} / 0.75), 0 0 30px rgb(${tube.rgb} / 0.35)`
                        : "inset 0 0 0 1px rgb(255 255 255 / 0.1)",
                    }}
                  />
                  <span
                    className={cn(
                      "max-w-full truncate px-0.5 text-[12px] leading-none",
                      isAccent ? "text-white/90" : "text-white/55 group-hover:text-white/80",
                    )}
                  >
                    {tube.name}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent side="top" sideOffset={12} className="w-auto p-4">
                <ChannelEditor tube={tube} index={i} theme={theme} update={update} onDone={() => setOpen(null)} />
              </PopoverContent>
            </Popover>
          );
        })}
        {count < MAX_TUBES && (
          <button
            ref={(node) => {
              refs.current[count] = node;
            }}
            type="button"
            tabIndex={-1}
            onClick={add}
            aria-label="Add a color"
            className="group flex w-[58px] shrink-0 cursor-pointer flex-col items-center gap-2.5 rounded-lg pb-1.5 pt-2 text-white/40 outline-none transition-colors duration-150 hover:bg-white/[0.04] hover:text-white/80 focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <span aria-hidden className="grid h-14 w-[7px] place-items-center rounded-full border border-dashed border-white/20" />
            <Plus aria-hidden size={13} className="-mt-0.5" />
          </button>
        )}
      </div>
      <p className="mt-2 px-1 text-[13px] text-white/55">
        <span className="text-white/80">{count} colors.</span> The lit tube is the default accent; click any to retune it.
      </p>
    </div>
  );
}

// ── Master section ────────────────────────────────────────────────────────

const glowTicks = [
  { value: 150, label: "150" },
  { value: 100, label: "100" },
  { value: 50, label: "50" },
  { value: 0, label: "0" },
];

const corners = (r: number) => `${Math.round((8 * r) / 100)}px`;
const tintName = (t: number) =>
  t === 0 ? "blue-black, stock" : t < 0 ? `${-t}% toward pure black` : `${t}% toward purple-black`;

function Unit({ label, value, children, className }: { label: string; value?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {children}
      <div className="flex flex-col items-center gap-1 text-center">
        <span className="text-[13px] leading-none text-white/60">{label}</span>
        {value !== undefined && <span className="font-mono text-[12px] leading-none tabular-nums text-white/85">{value}</span>}
      </div>
    </div>
  );
}

export function Master({
  theme,
  update,
  stock,
  onStockChange,
  layout = "row",
}: {
  theme: Theme;
  update: Update;
  stock: boolean;
  onStockChange: (stock: boolean) => void;
  layout?: "row" | "grid";
}) {
  return (
    <div
      className={cn(
        "items-end",
        layout === "row" ? "flex gap-7 xl:gap-9" : "grid grid-cols-4 gap-x-3 gap-y-8 sm:gap-x-6",
      )}
    >
      <Unit label="Glow" value={`${theme.glow}%`}>
        <Fader
          aria-label="Glow intensity"
          size="sm"
          min={GLOW.min}
          max={GLOW.max}
          step={5}
          ticks={glowTicks}
          defaultValue={100}
          value={theme.glow}
          onValueChange={(glow) => update((t) => ({ ...t, glow }))}
          formatValue={(v) => `${v}%`}
          className="h-[112px]"
        />
      </Unit>
      <Unit label="Corners" value={`lg ${corners(theme.radius)}`}>
        <Knob
          size="sm"
          aria-label="Corner radius"
          min={RADIUS.min}
          max={RADIUS.max}
          step={5}
          detents={[100]}
          defaultValue={100}
          value={theme.radius}
          onValueChange={(radius) => update((t) => ({ ...t, radius }))}
          formatValue={(v) => `${v}% radius, rounded-lg ${corners(v)}`}
        />
      </Unit>
      <Unit label="Surface" value={rgbToHex(surfaceRgb(theme.tint))}>
        <Knob
          size="sm"
          aria-label="Surface tint"
          min={TINT.min}
          max={TINT.max}
          step={5}
          detents={[0]}
          defaultValue={0}
          value={theme.tint}
          onValueChange={(tint) => update((t) => ({ ...t, tint }))}
          formatValue={tintName}
        />
      </Unit>
      <Unit label="Motion" className={layout === "row" ? "" : "order-last col-span-4"}>
        <ToggleGroup
          aria-label="Motion"
          orientation={layout === "row" ? "vertical" : "horizontal"}
          variant="segmented"
          size="sm"
          value={theme.motion}
          onValueChange={(motion) => motion && update((t) => ({ ...t, motion: motion as Motion }))}
        >
          <ToggleGroupItem value="full">Full</ToggleGroupItem>
          <ToggleGroupItem value="reduced">Reduced</ToggleGroupItem>
          <ToggleGroupItem value="off">Off</ToggleGroupItem>
        </ToggleGroup>
      </Unit>
      <span aria-hidden className={cn("w-px self-stretch bg-white/[0.07]", layout === "grid" && "hidden")} />
      <Unit label="Stock" value={stock ? "on" : "off"}>
        <HardwareSwitch
          size="sm"
          aria-label="Show stock NeonKit"
          checked={stock}
          onCheckedChange={onStockChange}
        />
      </Unit>
    </div>
  );
}

/** The accent's numbers, on a small dark screen in the middle of the desk. */
export function Readout({ theme }: { theme: Theme }) {
  const accent = theme.palette.find((t) => t.name === theme.accent) ?? theme.palette[0];
  const ratio = solidTextContrast(accent.rgb);
  return (
    <div
      aria-live="polite"
      className="hidden w-[188px] self-center rounded-[10px] border border-black/70 bg-[#05070a] px-3.5 py-3 shadow-[inset_0_1px_4px_rgb(0_0_0/0.9),0_1px_0_rgb(255_255_255/0.05)] min-[1536px]:block"
    >
      <p className="text-[12.5px] text-white/50">Default accent</p>
      <p
        className="mt-1.5 font-mono text-[15px] leading-5"
        style={{ color: `color-mix(in srgb, rgb(${accent.rgb}) 55%, white)`, textShadow: `0 0 8px rgb(${accent.rgb} / 0.6)` }}
      >
        {accent.name}
      </p>
      <p className="mt-1 flex justify-between font-mono text-[12px] tabular-nums text-white/60">
        <span>{rgbToHex(accent.rgb)}</span>
        <span className={ratio < 4.5 ? "text-[#ff8a3d]" : undefined}>{ratio.toFixed(1)}:1</span>
      </p>
    </div>
  );
}
