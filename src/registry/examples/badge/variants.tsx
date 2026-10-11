import { Badge } from "@/components/ui/badge";

const variants = ["soft", "outline", "solid"] as const;
const colors = ["cyan", "violet", "magenta", "amber", "lime"] as const;

export default function BadgeVariants() {
  return (
    <div className="grid w-full max-w-lg gap-4">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-wrap items-center gap-2">
          <span className="w-16 font-mono text-xs text-white/40">{variant}</span>
          {colors.map((color) => (
            <Badge key={color} variant={variant} color={color} className="capitalize">
              {color}
            </Badge>
          ))}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 font-mono text-xs text-white/40">sizes</span>
        <Badge size="sm" dot>
          v2.0.0
        </Badge>
        <Badge size="md" dot>
          v2.0.0
        </Badge>
      </div>
    </div>
  );
}
