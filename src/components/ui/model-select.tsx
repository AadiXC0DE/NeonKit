"use client";

import * as React from "react";
import { Check, ChevronDown } from "@/components/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/lib/utils";
import { neonVars, type NeonColor } from "@/lib/neon";

export interface ModelOption {
  value: string;
  name: string;
  /** One dry line: what it's for. */
  description?: string;
  /** Context window in tokens. */
  context: number;
  /** Output speed in tokens per second. */
  speed?: number;
  /** US dollars per million tokens. */
  price?: { input: number; output: number };
  disabled?: boolean;
  /** Why it's disabled, or a short note such as "Preview". */
  note?: string;
}

const CELLS = 5;

function compactTokens(tokens: number) {
  if (tokens >= 1_000_000) return `${Number((tokens / 1_000_000).toFixed(1))}M`;
  if (tokens >= 1000) return `${Math.round(tokens / 1000)}k`;
  return String(tokens);
}

function dollars(amount: number) {
  return `$${Number.isInteger(amount) ? amount : amount.toFixed(2)}`;
}

/** Where `value` sits between the smallest and largest, as lit cells from 1 to 5. */
function cellsFor(value: number, min: number, max: number, log = false) {
  if (!(max > min)) return CELLS;
  const f = log ? Math.log(value / min) / Math.log(max / min) : (value - min) / (max - min);
  return Math.max(1, Math.min(CELLS, 1 + Math.round(f * (CELLS - 1))));
}

/** Blended price weights output as three parts in four, which is roughly how chat traffic splits. */
const blended = (price: { input: number; output: number }) => price.input * 0.25 + price.output * 0.75;

function Leds({ lit }: { lit: number }) {
  return (
    <span aria-hidden className="flex shrink-0 gap-[2px]">
      {Array.from({ length: CELLS }, (_, i) => (
        <span
          key={i}
          data-on={i < lit ? "" : undefined}
          className={cn(
            "h-2.5 w-[4px] rounded-[1px] bg-white/[0.08]",
            "transition-[background-color,box-shadow] duration-200 ease-out",
            "data-[on]:bg-white/45",
            "group-data-[lit]/model:data-[on]:bg-[color-mix(in_srgb,rgb(var(--neon))_80%,white)] group-data-[lit]/model:data-[on]:shadow-[0_0_5px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1)))] group-data-[lit]/model:data-[on]:duration-75",
          )}
        />
      ))}
    </span>
  );
}

export interface ModelSelectProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "value" | "defaultValue"> {
  models: ModelOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Accessible name of the trigger and the list. */
  label?: string;
  /** `ghost` sits in a toolbar; `outline` reads as a form field. */
  variant?: "ghost" | "outline";
  /** Columns to show. Leave one out when your models don't have it. */
  readouts?: ("context" | "speed" | "price")[];
  /** Where the list opens. Use top in a composer at the bottom of the screen. */
  side?: "top" | "bottom";
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  color?: NeonColor;
}

const ModelSelect = React.forwardRef<HTMLButtonElement, ModelSelectProps>(
  (
    {
      models,
      value: valueProp,
      defaultValue,
      onValueChange,
      label = "Model",
      variant = "ghost",
      readouts = ["context", "speed", "price"],
      side = "bottom",
      open: openProp,
      defaultOpen = false,
      onOpenChange,
      color,
      className,
      style,
      disabled,
      ...props
    },
    ref,
  ) => {
    const id = React.useId();
    const [innerValue, setInnerValue] = React.useState(defaultValue ?? models.find((m) => !m.disabled)?.value);
    const value = valueProp ?? innerValue;
    const [innerOpen, setInnerOpen] = React.useState(defaultOpen);
    const open = openProp ?? innerOpen;
    const selectedIndex = models.findIndex((m) => m.value === value);
    const selected = models[selectedIndex];
    const [active, setActive] = React.useState(Math.max(0, selectedIndex));
    const typeahead = React.useRef({ query: "", at: 0 });

    const setOpen = (next: boolean) => {
      if (next) setActive(Math.max(0, selectedIndex));
      if (openProp === undefined) setInnerOpen(next);
      onOpenChange?.(next);
    };

    const choose = (index: number) => {
      const model = models[index];
      if (!model || model.disabled) return;
      if (valueProp === undefined) setInnerValue(model.value);
      onValueChange?.(model.value);
      setOpen(false);
    };

    const move = (from: number, step: number) => {
      for (let i = 1; i <= models.length; i++) {
        const next = (from + step * i + models.length * 2) % models.length;
        if (!models[next].disabled) return next;
      }
      return from;
    };

    const ranges = React.useMemo(() => {
      const contexts = models.map((m) => m.context);
      const speeds = models.map((m) => m.speed).filter((n): n is number => n !== undefined);
      const prices = models.map((m) => (m.price ? blended(m.price) : undefined)).filter((n): n is number => n !== undefined);
      return {
        context: [Math.min(...contexts), Math.max(...contexts)] as const,
        speed: [Math.min(...speeds), Math.max(...speeds)] as const,
        price: [Math.min(...prices), Math.max(...prices)] as const,
      };
    }, [models]);

    const optionId = (index: number) => `${id}-option-${index}`;

    const onListKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      const { key } = event;
      let next: number | null = null;
      if (key === "ArrowDown") next = move(active, 1);
      else if (key === "ArrowUp") next = move(active, -1);
      else if (key === "Home") next = move(-1, 1);
      else if (key === "End") next = move(models.length, -1);
      else if (key === "Enter" || key === " ") {
        event.preventDefault();
        choose(active);
        return;
      } else if (key.length === 1 && /\S/.test(key)) {
        const now = event.timeStamp;
        const state = typeahead.current;
        state.query = now - state.at > 600 ? key.toLowerCase() : state.query + key.toLowerCase();
        state.at = now;
        const start = state.query.length === 1 ? active + 1 : active;
        for (let i = 0; i < models.length; i++) {
          const index = (start + i) % models.length;
          if (!models[index].disabled && models[index].name.toLowerCase().startsWith(state.query)) {
            next = index;
            break;
          }
        }
      }
      if (next === null) return;
      event.preventDefault();
      setActive(next);
      document.getElementById(optionId(next))?.scrollIntoView({ block: "nearest" });
    };

    const show = {
      context: readouts.includes("context"),
      speed: readouts.includes("speed") && models.some((m) => m.speed !== undefined),
      price: readouts.includes("price") && models.some((m) => m.price),
    };
    const columns = [show.context, show.speed, show.price].filter(Boolean).length;
    const grid = cn(
      "grid items-center gap-x-4",
      columns === 3
        ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)]"
        : columns === 2
          ? "grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
          : "grid-cols-[minmax(0,1fr)]",
    );

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          ref={ref}
          aria-label={selected ? `${label}: ${selected.name}` : label}
          disabled={disabled}
          style={neonVars(color, style)}
          className={cn(
            "[--neon:var(--neon-accent,34_211_238)]",
            "inline-flex h-8 max-w-full cursor-pointer items-center gap-1.5 rounded-lg px-2 text-[13px] outline-none",
            "transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.97]",
            "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-1 focus-visible:ring-offset-[#0a0c12]",
            "disabled:pointer-events-none disabled:opacity-40",
            variant === "ghost"
              ? "text-white/65 hover:bg-white/[0.06] hover:text-white/90 data-[state=open]:bg-white/[0.06] data-[state=open]:text-white/90"
              : "h-10 border border-white/10 bg-white/[0.03] px-3 text-[14px] text-white/90 hover:border-white/20 data-[state=open]:border-[rgb(var(--neon)/0.5)]",
            className,
          )}
          {...props}
        >
          <span className="truncate">{selected?.name ?? label}</span>
          <ChevronDown
            aria-hidden
            className="size-3.5 shrink-0 text-white/45 transition-transform duration-200 ease-out [[data-state=open]>&]:rotate-180"
          />
        </PopoverTrigger>
        <PopoverContent
          side={side}
          align="start"
          aria-label={label}
          color={color}
          className={cn(
            "w-[min(25rem,calc(100vw-24px))] p-1.5",
            variant === "outline" && "min-w-[min(var(--popover-trigger-width,0px),calc(100vw-24px))]",
          )}
        >
          <div className={cn(grid, "px-3 pb-1.5 pt-2 text-[12px] text-white/45")} aria-hidden>
            {show.context && <span>Context</span>}
            {show.speed && <span>Speed</span>}
            {show.price && <span>Per 1M, in / out</span>}
          </div>
          <div
            role="listbox"
            aria-label={label}
            tabIndex={0}
            data-autofocus=""
            aria-activedescendant={optionId(active)}
            onKeyDown={onListKeyDown}
            className="grid max-h-[min(24rem,var(--popover-available-height,24rem))] gap-0.5 overflow-y-auto outline-none [scrollbar-width:thin]"
          >
            {models.map((model, index) => {
              const isSelected = model.value === value;
              const isActive = index === active;
              const facts = [
                `${compactTokens(model.context)} token context`,
                model.speed !== undefined ? `${model.speed} tokens per second` : "",
                model.price ? `${dollars(model.price.input)} in, ${dollars(model.price.output)} out per million tokens` : "",
              ]
                .filter(Boolean)
                .join(", ");
              return (
                <div
                  key={model.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={model.disabled || undefined}
                  aria-labelledby={`${optionId(index)}-name`}
                  aria-describedby={`${optionId(index)}-facts`}
                  data-active={isActive ? "" : undefined}
                  data-lit={isSelected || isActive ? "" : undefined}
                  onPointerMove={() => !model.disabled && index !== active && setActive(index)}
                  onClick={() => choose(index)}
                  className={cn(
                    "group/model relative grid gap-2 rounded-[9px] px-3 py-2.5",
                    model.disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer",
                    "transition-[background-color] duration-150 data-[active]:bg-white/[0.05]",
                  )}
                >
                  <span className="flex min-w-0 items-baseline gap-2">
                    <span id={`${optionId(index)}-name`} className="truncate text-[14px] font-medium text-white/90">
                      {model.name}
                    </span>
                    {model.note && <span className="shrink-0 text-[12px] text-white/45">{model.note}</span>}
                    {isSelected && (
                      <Check
                        aria-hidden
                        strokeWidth={2.25}
                        className="ml-auto size-3.5 shrink-0 self-center text-[color-mix(in_srgb,rgb(var(--neon))_70%,white)] [filter:drop-shadow(0_0_4px_rgb(var(--neon)/CALC(0.8*var(--neon-glow,1))))]"
                      />
                    )}
                  </span>
                  {model.description && (
                    <span className="-mt-1 text-[12.5px] leading-snug text-white/50">{model.description}</span>
                  )}
                  <span className={grid} aria-hidden>
                    {show.context && (
                      <span className="flex items-center gap-2">
                        <Leds lit={cellsFor(model.context, ranges.context[0], ranges.context[1], true)} />
                        <span className="font-mono text-[11.5px] tabular-nums text-white/70">
                          {compactTokens(model.context)}
                        </span>
                      </span>
                    )}
                    {show.speed && (
                      <span className="flex items-center gap-2">
                        {model.speed !== undefined ? (
                          <>
                            <Leds lit={cellsFor(model.speed, ranges.speed[0], ranges.speed[1])} />
                            <span className="whitespace-nowrap font-mono text-[11.5px] tabular-nums text-white/70">
                              {model.speed}
                              <span className="text-white/40"> t/s</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-white/35">–</span>
                        )}
                      </span>
                    )}
                    {show.price && (
                      <span className="flex items-center gap-2">
                        {model.price ? (
                          <>
                            <Leds lit={cellsFor(blended(model.price), ranges.price[0], ranges.price[1])} />
                            <span className="whitespace-nowrap font-mono text-[11.5px] tabular-nums text-white/70">
                              {dollars(model.price.input)}
                              <span className="text-white/40"> / </span>
                              {dollars(model.price.output)}
                            </span>
                          </>
                        ) : (
                          <span className="text-white/35">–</span>
                        )}
                      </span>
                    )}
                  </span>
                  <span id={`${optionId(index)}-facts`} className="sr-only">
                    {facts}
                    {model.description ? `. ${model.description}` : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);
ModelSelect.displayName = "ModelSelect";

export { ModelSelect };
