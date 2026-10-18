import { Tunnel } from "@/components/ui/tunnel";

const tunnels = [
  { color: "magenta", shape: "circle", label: "Magenta, round" },
  { color: "amber", shape: "square", label: "Amber, square" },
  { color: "white", shape: "circle", label: "White, straight", curve: 0 },
] as const;

export default function TunnelColors() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {tunnels.map((tunnel) => (
        <div key={tunnel.label} className="flex flex-col gap-2">
          <div className="relative h-44 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
            <Tunnel color={tunnel.color} shape={tunnel.shape} curve={"curve" in tunnel ? tunnel.curve : 0.5} />
          </div>
          <p className="text-sm text-white/60">{tunnel.label}</p>
        </div>
      ))}
    </div>
  );
}
