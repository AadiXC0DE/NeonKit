import { CursorGlow } from "@/components/ui/cursor-glow";

const panels = [
  { label: "size 180 · trail 600ms", props: { size: 180, trail: true, trailLength: 600 } },
  { label: "size 560 · intensity 0.6", props: { size: 560, intensity: 0.6 } },
];

export default function CursorGlowSettings() {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2">
      {panels.map((panel) => (
        <div
          key={panel.label}
          className="relative h-56 overflow-hidden rounded-xl border border-white/10 bg-[#07080d] [background-image:linear-gradient(rgb(255_255_255/0.05)_1px,transparent_1px),linear-gradient(90deg,rgb(255_255_255/0.05)_1px,transparent_1px)] [background-size:28px_28px]"
        >
          <CursorGlow {...panel.props} />
          <p className="absolute left-4 top-4 font-mono text-xs text-white/50">{panel.label}</p>
        </div>
      ))}
    </div>
  );
}
