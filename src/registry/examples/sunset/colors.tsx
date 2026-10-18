import { Sunset } from "@/components/ui/sunset";

const suns = [
  { color: "pink", label: "Pink" },
  { color: "amber", label: "Amber" },
  { color: "violet", label: "Violet" },
] as const;

export default function SunsetColors() {
  return (
    <div className="grid w-full gap-4 sm:grid-cols-3">
      {suns.map((sun, i) => (
        <div key={sun.color} className="flex flex-col gap-2">
          <div className="relative h-48 overflow-hidden rounded-xl border border-white/10 bg-[#05060a]">
            <Sunset color={sun.color} seed={i * 11 + 2} horizon={0.7} size={0.56} />
          </div>
          <p className="text-sm text-white/60">{sun.label}</p>
        </div>
      ))}
    </div>
  );
}
