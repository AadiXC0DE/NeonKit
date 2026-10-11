"use client";

import { HardwareSwitch } from "@/components/ui/hardware-switch";

export default function HardwareSwitchSizes() {
  return (
    <div className="flex flex-wrap items-end justify-center gap-10">
      <HardwareSwitch size="sm" label="Aux" color="amber" defaultChecked />
      <HardwareSwitch size="md" label="Heater" color="red" defaultChecked />
      <HardwareSwitch size="lg" label="Pump" color="green" defaultChecked />
      <HardwareSwitch size="md" variant="key" label="Service" color="violet" defaultChecked />
      <HardwareSwitch size="md" label="Locked out" disabled />
    </div>
  );
}
