import { NeonIcon } from "@/components/ui/neon-icon";

const cells = [
  { label: "Full", value: 1 },
  { label: "Charging", value: 0.58, animated: true },
  { label: "Half", value: 0.5 },
  { label: "Low", value: 0.14 },
  { label: "Empty", value: 0 },
];

export default function NeonIconBattery() {
  return (
    <div className="flex flex-wrap justify-center gap-8">
      {cells.map((cell) => (
        <div key={cell.label} className="flex flex-col items-center gap-2">
          <NeonIcon icon="battery" size={40} value={cell.value} animated={cell.animated} />
          <span className="text-xs text-white/55">
            {cell.label} <span className="tabular-nums text-white/35">{Math.round(cell.value * 100)}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}
