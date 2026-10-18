import { TubeDivider } from "@/components/ui/tube-divider";

const shapes = [
  { shape: "straight", note: "A single run between two electrodes." },
  { shape: "wave", note: "Eases out of the lead so the bend has no kink." },
  { shape: "zigzag", note: "Straight runs with heat-bent corners." },
  { shape: "loop", note: "One flourish; the tube passes in front of itself." },
] as const;

export default function TubeDividerShapes() {
  return (
    <div className="grid w-full max-w-lg gap-9">
      {shapes.map(({ shape, note }) => (
        <div key={shape} className="grid gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-xs text-white/70">{shape}</span>
            <span className="text-xs text-white/55">{note}</span>
          </div>
          <TubeDivider shape={shape} />
        </div>
      ))}
    </div>
  );
}
