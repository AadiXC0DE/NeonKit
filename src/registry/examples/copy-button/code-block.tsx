import { CopyButton } from "@/components/ui/copy-button";

const code = `import { CopyButton } from "@/components/ui/copy-button"

export function ApiKey({ value }: { value: string }) {
  return <CopyButton value={value} aria-label="Copy API key" />
}`;

export default function CopyButtonCodeBlock() {
  return (
    <div className="relative w-full min-w-0 max-w-lg rounded-xl border border-white/10 bg-[#0a0b11]">
      <div className="flex h-10 items-center justify-between border-b border-white/[0.06] pl-4 pr-1">
        <span className="font-mono text-xs text-white/50">api-key.tsx</span>
        <CopyButton value={code} size="sm" side="left" aria-label="Copy code" />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[12.5px] leading-5 text-white/75">
        <code>{code}</code>
      </pre>
    </div>
  );
}
