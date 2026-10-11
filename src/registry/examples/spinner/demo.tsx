import { Spinner } from "@/components/ui/spinner";

const variants = ["ring", "dots", "bars", "orbit"] as const;

export default function SpinnerDemo() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {variants.map((variant) => (
        <div
          key={variant}
          className="flex w-28 flex-col items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] pt-7 pb-4"
        >
          <Spinner variant={variant} size="lg" />
          <span className="font-mono text-xs text-white/45">{variant}</span>
        </div>
      ))}
    </div>
  );
}
