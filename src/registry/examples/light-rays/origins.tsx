import { LightRays } from "@/components/ui/light-rays";

const origins = ["top-left", "top-right", "left", "bottom"] as const;

export default function LightRaysOrigins() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {origins.map((origin) => (
        <div key={origin} className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
          <LightRays origin={origin} rays={5} />
          <p className="absolute bottom-3 right-4 font-mono text-xs text-white/50">origin=&quot;{origin}&quot;</p>
        </div>
      ))}
    </div>
  );
}
