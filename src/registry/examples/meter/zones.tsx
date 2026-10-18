import { Meter } from "@/components/ui/meter";

export default function MeterZones() {
  return (
    <div className="grid w-full max-w-sm gap-5">
      <div className="grid gap-2">
        <p className="text-xs text-white/50">Default: neon, then amber and red near the top</p>
        <Meter label="Mix" value={0.78} peak={0.92} className="w-full" />
      </div>
      <div className="grid gap-2">
        <p className="text-xs text-white/50">Classic broadcast green</p>
        <Meter label="Mix" color="green" value={0.66} peak={0.8} className="w-full" />
      </div>
      <div className="grid gap-2">
        <p className="text-xs text-white/50">One color all the way</p>
        <Meter label="Bus" color="violet" zones={[{ from: 0 }]} value={0.58} peak={0.71} className="w-full" />
      </div>
      <div className="grid gap-2">
        <p className="text-xs text-white/50">Your own bands</p>
        <Meter
          label="GPU"
          segments={20}
          value={0.83}
          peak={0.9}
          zones={[
            { from: 0, color: "blue" },
            { from: 0.5, color: "lime" },
            { from: 0.75, color: "orange" },
            { from: 0.9, color: "red" },
          ]}
          className="w-full"
        />
      </div>
    </div>
  );
}
