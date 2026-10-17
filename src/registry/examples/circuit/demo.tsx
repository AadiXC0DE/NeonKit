import { Button } from "@/components/ui/button";
import { Circuit } from "@/components/ui/circuit";

export default function CircuitDemo() {
  return (
    <div className="relative flex h-[520px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 text-center sm:h-[480px]">
      <Circuit />
      {/* A pool of shadow under the type, so pulses never cross a letter at full brightness. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_42%_36%_at_50%_50%,rgb(5_6_10/0.85),rgb(5_6_10/0.5)_55%,transparent)]"
      />
      <h2 className="relative max-w-[14ch] text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] text-white/95 sm:text-[52px]">
        Boots Linux in 1.8 seconds
      </h2>
      <p className="relative mt-4 max-w-[44ch] text-[15px] leading-relaxed text-white/60">
        Kestrel K1 is a four-core RISC-V board with 8&nbsp;GB of LPDDR5 and two 2.5&nbsp;GbE ports. $149, shipping in March.
      </p>
      <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
        <Button variant="solid">Preorder K1</Button>
        <Button variant="ghost">Read the datasheet</Button>
      </div>
    </div>
  );
}
