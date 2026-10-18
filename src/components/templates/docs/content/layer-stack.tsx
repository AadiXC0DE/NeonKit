"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

import { focusRing } from "../styles";

// Bottom of the image first. A change rebuilds its own layer and every layer above it.
const layers = [
  { name: "base", when: "The base image or system packages change.", size: [40, 120], change: "A system package" },
  { name: "deps", when: "The lockfile changes.", size: [80, 400], change: "The lockfile" },
  { name: "src", when: "Any file under the build context changes.", size: [1, 20], change: "A source file" },
  { name: "config", when: "Environment, command or ports change.", size: [0, 0], change: "An env var" },
] as const;

function sizeLabel([low, high]: readonly [number, number]) {
  return high === 0 ? "< 1 KB" : `${low}–${high} MB`;
}

export function LayerStack() {
  // Index of the layer whose input changed. Source edits are the everyday case.
  const [changed, setChanged] = React.useState(2);
  const rebuilt = layers.slice(changed);
  const low = rebuilt.reduce((sum, layer) => sum + layer.size[0], 0);
  const high = rebuilt.reduce((sum, layer) => sum + layer.size[1], 0);

  return (
    <figure aria-label="Which layers a change rebuilds" className="mt-8">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span id="layer-change-label" className="text-[13px] text-white/55">
          You changed
        </span>
        <div role="group" aria-labelledby="layer-change-label" className="flex flex-wrap gap-1.5">
          {layers.map((layer, index) => (
            <button
              key={layer.name}
              type="button"
              aria-pressed={changed === index}
              onClick={() => setChanged(index)}
              className={cn(
                "h-8 cursor-pointer rounded-full border px-3 text-[13px] transition-[background-color,border-color,color] duration-200",
                changed === index
                  ? "border-white/20 bg-white/[0.09] text-white"
                  : "border-white/10 text-white/60 hover:border-white/20 hover:text-white",
                focusRing,
              )}
            >
              {layer.change}
            </button>
          ))}
        </div>
      </div>

      {/* Drawn top-down, the way the layers sit on each other: config on top, base at the bottom. */}
      <ol className="mt-6 flex list-none flex-col-reverse gap-1.5 p-0">
        {layers.map((layer, index) => {
          const lit = index >= changed;
          return (
            <li
              key={layer.name}
              className={cn(
                "relative grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 overflow-hidden rounded-[10px] border py-3.5 pl-5 pr-4",
                "transition-[border-color,background-color] duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-none",
                "sm:grid-cols-[4.5rem_1fr_6rem_5.5rem]",
                lit ? "border-[rgb(var(--neon)/0.35)] bg-[rgb(var(--neon)/0.05)]" : "border-white/[0.07] bg-white/[0.015]",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute inset-y-2.5 left-0 w-[3px] rounded-full transition-[background-color,box-shadow] duration-300 motion-reduce:transition-none",
                  lit ? "bg-[rgb(var(--neon))] shadow-[0_0_10px_rgb(var(--neon)/0.85)]" : "bg-white/10",
                )}
              />
              <span className="font-mono text-[13px] text-white">{layer.name}</span>
              <span
                className={cn(
                  "text-right text-[13px] sm:order-last",
                  lit ? "text-[color-mix(in_srgb,rgb(var(--neon))_70%,white)]" : "text-white/50",
                )}
              >
                {lit ? "Rebuilt" : "Cached"}
              </span>
              <span className="text-[14px] leading-6 text-white/65">{layer.when}</span>
              <span className="text-[13px] tabular-nums text-white/55 sm:text-right">{sizeLabel(layer.size)}</span>
            </li>
          );
        })}
      </ol>

      <p aria-live="polite" className="mt-4 text-[14px] text-white/60">
        Rebuilds <span className="text-white">{rebuilt.length} of 4</span> layers,{" "}
        {high === 0 ? (
          <span className="text-white">under 1 KB</span>
        ) : (
          <span className="tabular-nums text-white">
            {low}–{high} MB
          </span>
        )}
        . {changed === 0 ? "Nothing comes from the cache." : "Everything below it comes from the cache."}
      </p>
    </figure>
  );
}
