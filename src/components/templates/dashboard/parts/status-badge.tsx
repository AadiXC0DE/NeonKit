import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProjectStatus } from "../data";

const LABELS: Record<ProjectStatus, string> = {
  ready: "Ready",
  building: "Building",
  failed: "Failed",
  paused: "Paused",
};

/**
 * Ready is the normal state, so it stays quiet: a grey dot and plain text. Only the states that
 * ask for attention light up: Building in the brand color while it runs, Failed in red.
 */
export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  if (status === "building" || status === "failed") {
    return (
      <Badge size="sm" dot pulse={status === "building"} color={status === "failed" ? "red" : undefined} className={className}>
        {LABELS[status]}
      </Badge>
    );
  }
  return (
    <span className={cn("inline-flex h-5 items-center gap-2 whitespace-nowrap text-[13px]", status === "paused" ? "text-white/55" : "text-white/70", className)}>
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", status === "paused" ? "shadow-[inset_0_0_0_1px_rgb(255_255_255/0.35)]" : "bg-white/45")}
      />
      {LABELS[status]}
    </span>
  );
}
