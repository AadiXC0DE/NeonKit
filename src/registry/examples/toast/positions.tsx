"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Toaster, toast, type ToastPosition } from "@/components/ui/toast";

const positions: { value: ToastPosition; label: string }[] = [
  { value: "top-left", label: "Top left" },
  { value: "top-center", label: "Top center" },
  { value: "top-right", label: "Top right" },
  { value: "bottom-left", label: "Bottom left" },
  { value: "bottom-center", label: "Bottom center" },
  { value: "bottom-right", label: "Bottom right" },
];

export default function ToastPositions() {
  const [position, setPosition] = React.useState<ToastPosition>("bottom-right");

  function show(next: ToastPosition) {
    toast.dismiss();
    setPosition(next);
    toast("Reminder set", { description: "Design review · Thursday at 10:00" });
  }

  return (
    <div className="grid w-full max-w-sm grid-cols-3 gap-1.5 rounded-xl border border-white/10 bg-white/[0.02] p-1.5">
      {positions.map(({ value, label }) => (
        <Button
          key={value}
          size="sm"
          variant={value === position ? "soft" : "ghost"}
          aria-pressed={value === position}
          onClick={() => show(value)}
          className="w-full"
        >
          {label}
        </Button>
      ))}
      <Toaster position={position} />
    </div>
  );
}
