import { Separator } from "@/components/ui/separator";

const variants = [
  { variant: "hairline", note: "Quiet structure between sections." },
  { variant: "dashed", note: "Softer, for optional or draft content." },
  { variant: "tube", note: "A mounted neon tube. Save it for one place." },
] as const;

export default function SeparatorVariants() {
  return (
    <div className="grid w-full max-w-md gap-8">
      {variants.map(({ variant, note }) => (
        <div key={variant} className="grid gap-3">
          <div className="flex items-baseline justify-between gap-4">
            <span className="font-mono text-xs text-white/70">{variant}</span>
            <span className="text-xs text-white/40">{note}</span>
          </div>
          <Separator variant={variant} />
        </div>
      ))}
    </div>
  );
}
