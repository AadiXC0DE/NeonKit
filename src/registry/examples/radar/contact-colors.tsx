import { Radar } from "@/components/ui/radar";

const contacts = [
  { angle: 24, distance: 0.48, label: "FRIEND 2", color: "green" },
  { angle: 74, distance: 0.82, label: "UNKNOWN", color: "amber" },
  { angle: 168, distance: 0.6, label: "FRIEND 1", color: "green" },
  { angle: 236, distance: 0.9, label: "HOSTILE", color: "red" },
  { angle: 312, distance: 0.36, label: "UNKNOWN", color: "amber" },
];

const legend = [
  { label: "Friendly", rgb: "52 211 153" },
  { label: "Unknown", rgb: "251 191 36" },
  { label: "Hostile", rgb: "255 77 94" },
];

export default function RadarContactColors() {
  return (
    <div className="flex flex-col items-center gap-5">
      <Radar color="cyan" blips={contacts} speed={3} label="Air picture" />
      <ul className="flex gap-5 text-xs text-white/60">
        {legend.map((item) => (
          <li key={item.label} className="flex items-center gap-2">
            <span
              aria-hidden
              className="size-2 rounded-full"
              style={{ background: `rgb(${item.rgb})`, boxShadow: `0 0 8px rgb(${item.rgb})` }}
            />
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
