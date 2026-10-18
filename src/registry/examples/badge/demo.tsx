import { Badge } from "@/components/ui/badge";

const deployments = [
  { project: "neonkit-docs", branch: "main", commit: "a41f9c2", age: "2m ago", status: "live" },
  { project: "api-gateway", branch: "feat/rate-limits", commit: "7be0d13", age: "just now", status: "building" },
  { project: "marketing-site", branch: "fix/hero-video", commit: "c93e4a8", age: "14m ago", status: "failed" },
  { project: "billing-worker", branch: "main", commit: "5d2f61b", age: "40s ago", status: "queued" },
] as const;

const statuses = {
  live: { label: "Live", color: "green", pulse: true },
  building: { label: "Building", color: "amber", pulse: false },
  failed: { label: "Failed", color: "red", pulse: false },
  queued: { label: "Queued", color: "white", pulse: false },
} as const;

export default function BadgeDemo() {
  return (
    <ul className="w-full max-w-md divide-y divide-white/[0.06] rounded-xl border border-white/10 bg-white/[0.02]">
      {deployments.map((deployment) => {
        const status = statuses[deployment.status];
        return (
          <li key={deployment.project} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/90">{deployment.project}</p>
              {/* The branch gives way first, so the commit and age never get cut. */}
              <p className="flex min-w-0 whitespace-nowrap font-mono text-xs text-white/50">
                <span className="truncate">{deployment.branch}</span>
                <span className="shrink-0">
                  &nbsp;· {deployment.commit} · {deployment.age}
                </span>
              </p>
            </div>
            <Badge color={status.color} dot pulse={status.pulse}>
              {status.label}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
