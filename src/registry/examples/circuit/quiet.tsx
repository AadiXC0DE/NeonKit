import { Button } from "@/components/ui/button";
import { Circuit } from "@/components/ui/circuit";

export default function CircuitQuiet() {
  return (
    <div className="relative flex h-[300px] w-full flex-col items-start justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-7 sm:px-10">
      <Circuit pulses={0.35} speed={0.6} intensity={0.6} density={0.3} />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_0%_50%,rgb(5_6_10/0.9),transparent)]" />
      <h3 className="relative max-w-[18ch] text-3xl font-semibold tracking-[-0.03em] text-white/95">Firmware 2.4 is ready for your K1</h3>
      <p className="relative mt-2 max-w-[42ch] text-[15px] leading-relaxed text-white/60">
        Fixes the 2.5 GbE link drop under load and cuts idle draw to 3.1&nbsp;W. Takes about four minutes.
      </p>
      <Button variant="outline" className="relative mt-6">
        Update over USB-C
      </Button>
    </div>
  );
}
