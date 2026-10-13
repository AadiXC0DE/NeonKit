import { LightRays } from "@/components/ui/light-rays";

export default function LightRaysDemo() {
  return (
    <div className="relative flex h-[360px] w-full flex-col items-center justify-end overflow-hidden rounded-xl border border-white/10 bg-[#05060a] px-6 pb-14 text-center">
      <LightRays />
      <h2 className="relative max-w-md text-3xl font-semibold tracking-tight text-white/90 sm:text-4xl">
        Lights up at nine
      </h2>
      <p className="relative mt-2 text-sm text-white/60">Hall B. Doors open at 21:00, no re-entry after 23:30.</p>
    </div>
  );
}
