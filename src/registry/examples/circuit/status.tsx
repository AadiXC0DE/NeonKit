import { Circuit } from "@/components/ui/circuit";

export default function CircuitStatus() {
  return (
    <div className="relative flex h-[300px] w-full flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-[#05060a] p-7">
      <Circuit color="green" seed={12} density={0.6} pulses={2.5} />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgb(5_6_10/0.92)_20%,rgb(5_6_10/0.4)_60%,transparent)]" />
      <div className="relative">
        <p className="text-sm text-white/60">Build farm, eu-west</p>
        <p className="mt-1 text-4xl font-semibold tabular-nums tracking-[-0.03em] text-white/95">38 of 40 busy</p>
      </div>
      <dl className="relative grid max-w-sm grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-white/55">Queue</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-white/90">7 jobs</dd>
        </div>
        <div>
          <dt className="text-white/55">Median wait</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-white/90">42 s</dd>
        </div>
        <div>
          <dt className="text-white/55">Power</dt>
          <dd className="mt-0.5 font-mono tabular-nums text-white/90">11.2 kW</dd>
        </div>
      </dl>
    </div>
  );
}
