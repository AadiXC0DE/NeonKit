import { ArrowUpRight, Link, Lock, Search } from "@/components/ui/icons";

const sizes = [16, 20, 24, 32, 48];

export default function IconsSizes() {
  return (
    <div className="grid w-full max-w-xl gap-6">
      {[false, true].map((absolute) => (
        <div key={String(absolute)} className="flex flex-wrap items-end gap-x-7 gap-y-4">
          <p className="w-full text-xs text-white/55">
            {absolute ? "absoluteStrokeWidth: the tube stays 1.75px at every size" : "Default: the tube scales with the icon"}
          </p>
          {sizes.map((size) => (
            <div key={size} className="flex flex-col items-center gap-2 text-white/85">
              <div className="flex items-end gap-1.5">
                <Link size={size} absoluteStrokeWidth={absolute} aria-hidden />
                <Lock size={size} absoluteStrokeWidth={absolute} aria-hidden />
              </div>
              <span className="text-[11px] tabular-nums text-white/55">{size}</span>
            </div>
          ))}
        </div>
      ))}
      <p className="flex items-center gap-2 text-sm text-white/70">
        <Search aria-hidden className="size-4" /> Inline at 16px, next to text
        <ArrowUpRight aria-hidden className="size-3.5" />
      </p>
    </div>
  );
}
