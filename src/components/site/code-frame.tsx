import { cn } from "@/lib/utils";
import { CopyButton } from "./copy-button";

export function CodeFrame({
  html,
  code,
  title,
  className,
  maxHeight,
}: {
  html: string;
  code: string;
  title?: string;
  className?: string;
  maxHeight?: number;
}) {
  return (
    <div className={cn("group relative overflow-hidden rounded-xl border border-line bg-surface", className)}>
      {title ? (
        <div className="flex h-10 items-center justify-between border-b border-line pl-4 pr-1">
          <span className="font-mono text-xs text-muted">{title}</span>
          <CopyButton value={code} />
        </div>
      ) : (
        <CopyButton value={code} className="absolute right-2 top-2 z-10 bg-surface/80 backdrop-blur-md" />
      )}
      <div
        className="overflow-auto py-4 [&_pre]:outline-none"
        style={maxHeight ? { maxHeight } : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
