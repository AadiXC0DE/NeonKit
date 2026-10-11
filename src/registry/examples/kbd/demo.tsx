import { Search } from "lucide-react";
import { KbdCombo } from "@/components/ui/kbd";

export default function KbdDemo() {
  return (
    <div className="flex w-full max-w-xs flex-col items-center gap-4">
      <button
        type="button"
        className="flex h-10 w-full cursor-pointer items-center gap-2.5 rounded-lg border border-white/10 bg-white/[0.03] pl-3 pr-2 text-sm text-white/40 outline-none transition-colors duration-150 hover:border-white/15 hover:text-white/60 focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon-accent,34_211_238)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
      >
        <Search aria-hidden className="size-4" />
        <span className="flex-1 text-left">Search components…</span>
        <KbdCombo keys={["⌘", "K"]} listen separator={null} />
      </button>
      <p className="text-xs text-white/40">Hold ⌘ and press K. The keys light up as you type.</p>
    </div>
  );
}
