import { DotGrid } from "@/components/ui/dot-grid";

const panels = [
  { title: "Coarse", props: { spacing: 32, size: 2, radius: 220 } },
  { title: "Fine", props: { spacing: 12, size: 1, radius: 140 } },
  { title: "Amber, no fade", props: { spacing: 20, color: "amber", fade: false } },
] as const;

export default function DotGridSettings() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {panels.map((panel) => (
        <div key={panel.title} className="flex flex-col gap-2">
          <div className="relative h-44 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
            <DotGrid {...panel.props} />
          </div>
          <p className="text-sm text-white/60">{panel.title}</p>
        </div>
      ))}
    </div>
  );
}
