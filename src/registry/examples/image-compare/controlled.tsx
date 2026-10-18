"use client";

/* eslint-disable @next/next/no-img-element -- examples are pasted into any React app, not only Next.js */
import * as React from "react";
import { ImageCompare } from "@/components/ui/image-compare";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const photo = (width: number) =>
  `https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&crop=entropy&w=${width}&h=${Math.round(width * 0.625)}&q=80`;

const stops = [0, 50, 100];

export default function ImageCompareControlled() {
  const [value, setValue] = React.useState(50);

  return (
    <div className="flex w-full max-w-[640px] flex-col gap-4">
      <ImageCompare
        value={value}
        onValueChange={setValue}
        className="aspect-[16/10] w-full"
        beforeLabel="Original, 240 px"
        afterLabel="Upscaled 4×"
        before={<img src={photo(240)} alt="" className="[image-rendering:pixelated]" />}
        after={<img src={photo(1280)} alt="A Tokyo street at night" />}
      />
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-[13px] tabular-nums text-white/60">{Math.round(value)}% original</span>
        <ToggleGroup
          type="single"
          size="sm"
          value={stops.includes(value) ? String(value) : ""}
          onValueChange={(next) => next && setValue(Number(next))}
          aria-label="Divider position"
        >
          <ToggleGroupItem value="100">Original</ToggleGroupItem>
          <ToggleGroupItem value="50">Split</ToggleGroupItem>
          <ToggleGroupItem value="0">Upscaled</ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}
