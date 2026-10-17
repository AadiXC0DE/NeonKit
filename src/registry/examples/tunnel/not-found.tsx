import { Button } from "@/components/ui/button";
import { Tunnel } from "@/components/ui/tunnel";

export default function TunnelNotFound() {
  return (
    <div className="relative flex h-[340px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center">
      <Tunnel curve={0} speed={0.35} rings={14} intensity={0.55} />
      <p className="relative font-mono text-sm tabular-nums text-white/70">404</p>
      <h3 className="relative mt-2 max-w-[20ch] text-3xl font-semibold tracking-[-0.03em] text-white/95 [text-shadow:0_2px_18px_rgb(5_6_10/0.95)]">
        Nothing down here at /pricing-old
      </h3>
      <p className="relative mt-2 text-[15px] text-white/65 [text-shadow:0_1px_10px_rgb(5_6_10/0.95)]">It moved to /pricing in March.</p>
      <Button variant="outline" className="relative mt-6">
        Take me to /pricing
      </Button>
    </div>
  );
}
