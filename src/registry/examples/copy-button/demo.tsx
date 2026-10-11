import { CopyButton } from "@/components/ui/copy-button";

const command = "npx shadcn@latest add https://get-neonkit.vercel.app/r/copy-button.json";

export default function CopyButtonDemo() {
  return (
    <div className="flex w-full min-w-0 max-w-lg items-center gap-3 rounded-xl border border-white/10 bg-[#0a0b11] py-1.5 pl-4 pr-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
      <span aria-hidden className="select-none font-mono text-[13px] text-[rgb(var(--neon-accent,34_211_238))]">
        $
      </span>
      <code className="min-w-0 flex-1 truncate font-mono text-[13px] text-white/80">{command}</code>
      <CopyButton value={command} size="sm" aria-label="Copy install command" />
    </div>
  );
}
