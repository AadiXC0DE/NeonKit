"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { NeonText } from "@/components/ui/neon-text";

export default function ColorPickerDemo() {
  const [brand, setBrand] = React.useState("#ff5fa2");

  return (
    <div className="grid w-full max-w-2xl items-end gap-6 sm:grid-cols-[18rem_minmax(0,1fr)]">
      <ColorPicker label="Brand neon" value={brand} onValueChange={setBrand} />

      <div className="grid gap-1.5">
        <span className="text-sm font-medium text-white/80">Storefront sign</span>
        <div className="relative isolate flex min-h-64 flex-col items-center justify-center gap-6 overflow-hidden rounded-xl border border-white/10 bg-[#07080d] px-6 py-10">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 transition-[background-color] duration-200"
            style={{ background: `radial-gradient(70% 60% at 50% 42%, ${brand}2e, transparent 75%)` }}
          />
          <div className="grid justify-items-center gap-2">
            <NeonText as="p" color={brand} className="text-5xl font-semibold tracking-[-0.03em]">
              nightjar
            </NeonText>
            <p className="text-[13px] text-white/55">
              Records · Coffee · Open late
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="solid" color={brand}>
              Order ahead
            </Button>
            <Button size="sm" variant="ghost" color={brand}>
              Tonight&apos;s set
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
