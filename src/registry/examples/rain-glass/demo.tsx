import { RainGlass } from "@/components/ui/rain-glass";

export default function RainGlassDemo() {
  return (
    <div className="relative flex h-[360px] w-full flex-col items-start justify-end overflow-hidden rounded-xl border border-white/10 bg-[#05060a] p-8 sm:p-10">
      <RainGlass />
      {/* A pool of shadow behind the type, like the dark side of the street, so it reads over any bokeh. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_70%_at_0%_100%,rgb(5_6_10/0.82),rgb(5_6_10/0.4)_45%,transparent_75%)]"
      />
      <h2 className="relative max-w-sm text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Nobody&apos;s in a hurry tonight
      </h2>
      <p className="relative mt-2 text-sm text-white/70 [text-shadow:0_1px_10px_rgb(0_0_0/0.9)]">
        Last train at <span className="tabular-nums">01:52</span>
      </p>
    </div>
  );
}
