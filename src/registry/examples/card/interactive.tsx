import { ArrowUpRight, GitBranch } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const projects = [
  {
    name: "neonkit-docs",
    domain: "get-neonkit.vercel.app",
    commit: "Live previews on every docs page",
    branch: "main",
    age: "2m ago",
    state: "ready",
  },
  {
    name: "api-gateway",
    domain: "api.lumen.dev",
    commit: "Rate-limit by API key, not IP",
    branch: "feat/rate-limits",
    age: "Building 41s",
    state: "building",
  },
  {
    name: "billing-worker",
    domain: "billing.lumen.dev",
    commit: "Retry Stripe webhooks with backoff",
    branch: "main",
    age: "3h ago",
    state: "ready",
  },
  {
    name: "marketing-site",
    domain: "lumen.dev",
    commit: "Poster frame for the hero on slow networks",
    branch: "fix/hero-video",
    age: "Failed 14m ago",
    state: "failed",
  },
] as const;

const lights = {
  ready: "bg-[rgb(52_211_153)] shadow-[0_0_8px_rgb(52_211_153/0.6)]",
  building: "bg-[rgb(251_191_36)] shadow-[0_0_8px_rgb(251_191_36/0.6)] motion-safe:animate-pulse",
  failed: "bg-[rgb(255_77_94)] shadow-[0_0_8px_rgb(255_77_94/0.6)]",
} as const;

export default function CardInteractive() {
  return (
    <div className="grid w-full max-w-2xl gap-4 sm:grid-cols-2">
      {projects.map((project) => (
        <Card key={project.name} interactive className="group">
          <CardHeader className="gap-1 pb-4">
            <CardTitle className="flex items-center justify-between gap-3">
              {/* The link's ::after covers the card, so the whole surface is clickable. */}
              <a href={`#${project.name}`} className="truncate outline-none after:absolute after:inset-0 after:rounded-xl">
                {project.name}
              </a>
              <ArrowUpRight
                aria-hidden
                size={18}
                className="shrink-0 text-white/40 transition-[color,transform] duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[rgb(var(--neon))]"
              />
            </CardTitle>
            <p className="truncate text-sm text-white/55">{project.domain}</p>
          </CardHeader>
          <CardContent className="grid gap-2 border-t border-white/[0.06] pt-4">
            <p className="truncate text-sm text-white/80">{project.commit}</p>
            <div className="flex items-center gap-2 text-xs text-white/50">
              <GitBranch aria-hidden size={14} className="shrink-0" />
              <span className="min-w-0 truncate font-mono">{project.branch}</span>
              <span aria-hidden className={`ml-auto size-1.5 shrink-0 rounded-full ${lights[project.state]}`} />
              <span className="shrink-0 tabular-nums">{project.age}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
