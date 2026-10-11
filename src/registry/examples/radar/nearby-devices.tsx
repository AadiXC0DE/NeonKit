import { Headphones, Monitor, Smartphone, Watch } from "lucide-react";
import { Radar } from "@/components/ui/radar";

// Signal strength stands in for distance: a weaker signal plots further out.
const devices = [
  { name: "Ines's AirPods", kind: "Headphones", rssi: -48, angle: 64, icon: Headphones },
  { name: "Studio display", kind: "Monitor", rssi: -61, angle: 152, icon: Monitor },
  { name: "Pixel 9", kind: "Phone", rssi: -70, angle: 248, icon: Smartphone },
  { name: "Run watch", kind: "Watch", rssi: -79, angle: 318, icon: Watch },
];

const distance = (rssi: number) => Math.min(0.92, Math.max(0.2, (-rssi - 40) / 45));

export default function RadarNearbyDevices() {
  return (
    <div className="grid w-full max-w-lg gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:grid-cols-[auto_1fr] sm:items-center">
      <Radar size="sm" speed={2.5} rings={3} label="Nearby devices" blips={devices.map((d) => ({ angle: d.angle, distance: distance(d.rssi) }))} />
      <div>
        <p className="text-sm font-medium text-white/90">Scanning for devices</p>
        <p className="mt-0.5 text-xs text-white/45">Keep your phone close to the one you want to pair.</p>
        <ul className="mt-3 grid gap-1">
          {devices.map((device) => (
            <li key={device.name} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-white/80 hover:bg-white/[0.04]">
              <device.icon aria-hidden className="size-4 text-white/45" />
              <span className="min-w-0 flex-1 truncate">{device.name}</span>
              <span className="font-mono text-[11px] tabular-nums text-white/40">{device.rssi} dBm</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
