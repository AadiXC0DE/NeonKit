"use client";

import { HardwareSwitch } from "@/components/ui/hardware-switch";

const variants = [
  { variant: "rocker", label: "Mains", note: "Lit I/O rocker" },
  { variant: "flip", label: "Arm", note: "Guard opens, then the toggle" },
  { variant: "key", label: "Deploy", note: "Turns 90° into a detent" },
] as const;

export default function HardwareSwitchVariants() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-x-14 gap-y-10">
      {variants.map((v, i) => (
        <div key={v.variant} className="flex flex-col items-center gap-3">
          <HardwareSwitch variant={v.variant} label={v.label} defaultChecked={i === 0} />
          <span className="text-[13px] text-white/55">{v.note}</span>
        </div>
      ))}
    </div>
  );
}
