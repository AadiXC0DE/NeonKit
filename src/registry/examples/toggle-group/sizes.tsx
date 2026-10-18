import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const scales = ["1x", "2x", "3x"];

export default function ToggleGroupSizes() {
  return (
    <div className="grid justify-items-start gap-3">
      {(["sm", "md", "lg"] as const).map((size) => (
        <ToggleGroup key={size} size={size} aria-label="Export scale" defaultValue="2x">
          {scales.map((scale) => (
            <ToggleGroupItem key={scale} value={scale} className="tabular-nums">
              {scale}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ))}
    </div>
  );
}
