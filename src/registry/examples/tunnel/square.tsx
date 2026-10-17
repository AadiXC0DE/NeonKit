import { Tunnel } from "@/components/ui/tunnel";

export default function TunnelSquare() {
  return (
    <div className="relative flex h-[320px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center">
      <Tunnel shape="square" curve={0.3} speed={1.6} rings={18} />
      <p className="relative text-2xl font-semibold tracking-[-0.02em] text-white/95 [text-shadow:0_2px_18px_rgb(5_6_10/0.95)]">
        Connecting to fra-2
      </p>
      <p className="relative mt-2 font-mono text-[13px] tabular-nums text-white/70 [text-shadow:0_1px_10px_rgb(5_6_10/0.95)]">
        WireGuard · 38 ms · 2 of 3 handshakes
      </p>
    </div>
  );
}
