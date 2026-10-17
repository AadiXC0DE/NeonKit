import { PowerButton } from "@/components/ui/power-button";

const sizes = ["sm", "md", "lg", "xl"] as const;

export default function PowerButtonSizes() {
  return (
    <div className="flex items-end gap-8">
      {sizes.map((size) => (
        <div key={size} className="flex flex-col items-center gap-3">
          <PowerButton size={size} defaultPressed aria-label={`Power, ${size}`} />
          <span className="text-xs text-white/55">{size}</span>
        </div>
      ))}
    </div>
  );
}
