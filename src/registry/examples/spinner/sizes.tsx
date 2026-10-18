import { Spinner } from "@/components/ui/spinner";

const variants = ["ring", "dots", "bars", "orbit"] as const;
const sizes = ["sm", "md", "lg"] as const;

export default function SpinnerSizes() {
  return (
    <div className="grid grid-cols-[auto_repeat(3,3rem)] items-center gap-x-4 gap-y-5">
      <span />
      {sizes.map((size) => (
        <span key={size} className="text-center font-mono text-xs text-white/50">
          {size}
        </span>
      ))}
      {variants.map((variant) => (
        <div key={variant} className="contents">
          <span className="pr-2 font-mono text-xs text-white/50">{variant}</span>
          {sizes.map((size) => (
            <div key={size} className="flex justify-center">
              <Spinner variant={variant} size={size} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
