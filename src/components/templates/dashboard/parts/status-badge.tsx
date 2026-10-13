import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "../data";

const LABELS: Record<ProjectStatus, string> = {
  ready: "Ready",
  building: "Building",
  failed: "Failed",
  paused: "Paused",
};

/** Ready and Building use the brand color; Failed is red and Paused is unlit, because those carry meaning. */
export function StatusBadge({ status, className }: { status: ProjectStatus; className?: string }) {
  return (
    <Badge
      size="sm"
      dot
      pulse={status === "building"}
      color={status === "failed" ? "red" : status === "paused" ? "white" : undefined}
      className={status === "paused" ? `opacity-70 ${className ?? ""}` : className}
    >
      {LABELS[status]}
    </Badge>
  );
}
