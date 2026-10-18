import { CopyButton } from "@/components/ui/copy-button";

const command = "npx shadcn@latest add @neonkit/copy-button";

export default function CopyButtonDemo() {
  return (
    <div className="flex w-full min-w-0 max-w-lg items-center gap-3 rounded-xl border border-white/10 bg-[#0a0b11] py-1.5 pl-4 pr-1.5 shadow-[inset_0_1px_0_rgb(255_255_255/0.04)]">
      <span aria-hidden className="select-none self-start py-1.5 font-mono text-[13px] leading-5 text-[rgb(var(--neon-accent,34_211_238))]">
        $
      </span>
      {/* Wraps at the spaces instead of truncating: a command you can't read shouldn't be pasted. */}
      <code className="min-w-0 flex-1 py-1.5 font-mono text-[13px] leading-5 text-white/80 [overflow-wrap:anywhere]">
        {command}
      </code>
      <CopyButton value={command} size="sm" aria-label="Copy install command" />
    </div>
  );
}
