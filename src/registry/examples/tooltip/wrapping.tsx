import { Info } from "@/components/ui/icons";
import { Tooltip } from "@/components/ui/tooltip";

export default function TooltipWrapping() {
  return (
    <div className="flex items-center gap-1.5 text-sm text-white/70">
      Usage-based billing
      <Tooltip
        side="right"
        content="Billed per 1,000 requests at the end of each cycle. The first 50,000 requests every month are free."
        className="max-w-[240px] whitespace-normal leading-5"
      >
        <button
          type="button"
          aria-label="How usage-based billing works"
          className="flex size-6 items-center justify-center rounded-full text-white/40 outline-none transition-colors duration-150 hover:text-white/80 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
        >
          <Info className="size-4" aria-hidden />
        </button>
      </Tooltip>
    </div>
  );
}
