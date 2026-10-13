"use client";

import * as React from "react";
import { BatteryLow, Plane, Wifi, type LucideIcon } from "@/components/ui/icons";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

type Setting = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export default function SwitchDemo() {
  const [airplane, setAirplane] = React.useState(false);
  const [wifi, setWifi] = React.useState(true);
  const [lowPower, setLowPower] = React.useState(false);

  const settings: Setting[] = [
    {
      id: "setting-airplane",
      icon: Plane,
      title: "Airplane mode",
      description: "Turns off cellular, Wi-Fi and Bluetooth.",
      checked: airplane,
      onCheckedChange: (on) => {
        setAirplane(on);
        if (on) setWifi(false);
      },
    },
    {
      id: "setting-wifi",
      icon: Wifi,
      title: "Wi-Fi",
      description: wifi ? "Connected to Studio 5G" : "Not connected",
      checked: wifi,
      onCheckedChange: setWifi,
    },
    {
      id: "setting-low-power",
      icon: BatteryLow,
      title: "Low power mode",
      description: "Pauses downloads and background refresh until you charge.",
      checked: lowPower,
      onCheckedChange: setLowPower,
    },
  ];

  return (
    <div className="w-full max-w-sm divide-y divide-white/[0.06] rounded-xl border border-white/10 bg-white/[0.03]">
      {settings.map(({ id, icon: Icon, title, description, checked, onCheckedChange }) => (
        <div key={id} className="flex items-center gap-3.5 px-4 py-3.5">
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] transition-colors duration-150",
              checked ? "text-white/90" : "text-white/50",
            )}
          >
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <label htmlFor={id} className="block text-sm font-medium text-white/90">
              {title}
            </label>
            <p id={`${id}-description`} className="text-[13px] leading-[18px] text-white/55">
              {description}
            </p>
          </div>
          <Switch
            id={id}
            checked={checked}
            onCheckedChange={onCheckedChange}
            aria-describedby={`${id}-description`}
          />
        </div>
      ))}
    </div>
  );
}
