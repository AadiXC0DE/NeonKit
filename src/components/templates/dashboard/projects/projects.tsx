"use client";

import * as React from "react";
import { Plus, Search, X } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/toast";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import { team } from "../config";
import { FRAMEWORKS, PROJECTS, REGIONS, type Project, type ProjectStatus } from "../data";
import { ago, compact } from "../parts/format";
import { PageHeader } from "../parts/page-header";
import { SearchParams } from "../parts/search-params";
import { StatusBadge } from "../parts/status-badge";
import { NewProjectDialog } from "./new-project-dialog";
import { RowActions, type RowAction } from "./row-actions";

type SortKey = "name" | "requests" | "deployedAgo";
type StatusFilter = "all" | ProjectStatus;

const STATUSES: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "ready", label: "Ready" },
  { value: "building", label: "Building" },
  { value: "failed", label: "Failed" },
  { value: "paused", label: "Paused" },
];

const CITY = Object.fromEntries(REGIONS.map((r) => [r.code, r.city]));

export function Projects() {
  const [projects, setProjects] = React.useState<Project[]>(PROJECTS);
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [framework, setFramework] = React.useState("all");
  const [sort, setSort] = React.useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "requests", dir: "desc" });
  const [creating, setCreating] = React.useState(false);
  const [fresh, setFresh] = React.useState<string | null>(null);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => {
    const list = timers.current;
    return () => list.forEach((id) => window.clearTimeout(id));
  }, []);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  const onParams = React.useCallback((params: URLSearchParams) => {
    const q = params.get("q");
    if (q !== null) {
      setQuery(q);
      setStatus("all");
      setFramework("all");
    }
    if (params.get("new") === "1") setCreating(true);
  }, []);

  const update = (id: string, patch: Partial<Project>) =>
    setProjects((list) => list.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  function act(project: Project, action: RowAction) {
    if (action === "visit") toast(`Opening ${project.domain}`, { description: "Links are stubbed in this preview." });
    if (action === "copy") {
      void navigator.clipboard?.writeText(`https://${project.domain}`).catch(() => {});
      toast.success("Domain copied", { description: `https://${project.domain}` });
    }
    if (action === "redeploy") {
      update(project.id, { status: "building" });
      later(() => {
        update(project.id, { status: "ready", deployedAgo: 0 });
        toast.success(`${project.name} is live`, { description: `Built from ${project.branch} and promoted to production.` });
      }, 3200);
    }
    if (action === "pause") {
      update(project.id, { status: "paused" });
      toast(`Deploys paused for ${project.name}`, { description: "Pushes still build previews. Production stays put." });
    }
    if (action === "resume") {
      update(project.id, { status: "ready" });
      toast(`Deploys resumed for ${project.name}`);
    }
    if (action === "delete") {
      const index = projects.findIndex((p) => p.id === project.id);
      setProjects((list) => list.filter((p) => p.id !== project.id));
      toast(`Deleted ${project.name}`, {
        description: "Domains are released in 24 hours.",
        action: {
          label: "Undo",
          onClick: () =>
            setProjects((list) => (list.some((p) => p.id === project.id) ? list : [...list.slice(0, index), project, ...list.slice(index)])),
        },
      });
    }
  }

  function create(project: Project) {
    setProjects((list) => [project, ...list]);
    setQuery("");
    setStatus("all");
    setFramework("all");
    setSort({ key: "deployedAgo", dir: "asc" });
    setFresh(project.id);
    toast.success(`Created ${project.name}`, { description: `First build from ${project.repo} is running.` });
    later(() => update(project.id, { status: "ready" }), 4200);
    later(() => setFresh((id) => (id === project.id ? null : id)), 5200);
  }

  const counts = React.useMemo(() => {
    const byStatus: Record<string, number> = { all: projects.length };
    for (const p of projects) byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    return byStatus;
  }, [projects]);

  const rows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => status === "all" || p.status === status)
      .filter((p) => framework === "all" || p.framework === framework)
      .filter((p) => !q || `${p.name} ${p.domain} ${p.repo} ${p.framework}`.toLowerCase().includes(q))
      .sort((a, b) => {
        const dir = sort.dir === "asc" ? 1 : -1;
        if (sort.key === "name") return a.name.localeCompare(b.name) * dir;
        return (a[sort.key] - b[sort.key]) * dir;
      });
  }, [projects, query, status, framework, sort]);

  const busiest = Math.max(1, ...projects.map((p) => p.requests));
  const failing = counts.failed ?? 0;
  const filtered = query.trim() !== "" || status !== "all" || framework !== "all";
  const clear = () => {
    setQuery("");
    setStatus("all");
    setFramework("all");
  };
  const toggleSort = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key ? (s.dir === "asc" ? "desc" : "asc") : key === "name" || key === "deployedAgo" ? "asc" : "desc" }));
  const sortProps = (key: SortKey) => ({ sortDirection: sort.key === key && sort.dir, onSort: () => toggleSort(key) });

  return (
    <>
      <SearchParams onChange={onParams} />
      <PageHeader
        title={
          <>
            {projects.length} projects,{" "}
            {failing ? (
              <span className="text-[rgb(255_107_120)] [text-shadow:0_0_18px_rgb(255_77_94/0.4)]">{failing} failing.</span>
            ) : (
              <span className="text-white/50">none failing.</span>
            )}
          </>
        }
        actions={
          <Button variant="solid" size="sm" onClick={() => setCreating(true)}>
            <Plus aria-hidden />
            New project
          </Button>
        }
      >
        Everything {team.name} ships, from the storefront to the cron that bills it.
      </PageHeader>

      <section aria-labelledby="projects-title" className="mt-8">
        <h2 id="projects-title" className="sr-only">
          Project list
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Input
            size="sm"
            type="search"
            aria-label="Search projects"
            placeholder="Search name, domain or repo"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            leading={<Search />}
            containerClassName="w-full sm:w-64 lg:w-72"
          />
          <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
            <ToggleGroup size="sm" aria-label="Status" value={status} onValueChange={(v) => v && setStatus(v as StatusFilter)}>
              {STATUSES.map((s) => (
                <ToggleGroupItem key={s.value} value={s.value} className="max-sm:px-2">
                  {s.label}
                  <span className={cn("font-mono text-[11px] tabular-nums", s.value === "failed" && counts.failed ? "text-[rgb(255_107_120)]" : "text-white/55")}>{counts[s.value] ?? 0}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <Select
            size="sm"
            aria-label="Framework"
            options={[{ value: "all", label: "All frameworks" }, ...FRAMEWORKS.map((f) => ({ value: f, label: f }))]}
            value={framework}
            onValueChange={setFramework}
            containerClassName="w-[160px]"
          />
          <p aria-live="polite" className="ml-auto flex items-center text-[13px] text-white/60">
            {filtered ? (
              <>
                {rows.length} of {projects.length}
                <button
                  type="button"
                  onClick={clear}
                  className="ml-3 inline-flex cursor-pointer items-center gap-1 rounded-md text-white/70 underline-offset-4 outline-none hover:text-white hover:underline focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
                >
                  <X aria-hidden className="size-3.5" />
                  Clear filters
                </button>
              </>
            ) : null}
          </p>
        </div>

        <Table containerClassName="mt-6 rounded-none border-0 border-t border-white/[0.08] bg-transparent">
          <TableHeader>
            <TableRow>
              <TableHead className="pl-0" {...sortProps("name")}>Project</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Framework</TableHead>
              <TableHead className="hidden xl:table-cell">Region</TableHead>
              <TableHead align="right" className="hidden sm:table-cell" {...sortProps("requests")}>
                Requests 24h
              </TableHead>
              <TableHead align="right" className="hidden lg:table-cell" {...sortProps("deployedAgo")}>
                Last deploy
              </TableHead>
              <TableHead align="right" className="w-11 px-0">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((p) => (
              <TableRow
                key={p.id}
                className={cn(fresh === p.id && "bg-[rgb(var(--neon)/0.07)] shadow-[inset_2px_0_0_rgb(var(--neon))]")}
              >
                <TableCell className="pl-0">
                  <div className="min-w-0">
                    <p className="truncate font-mono text-[13px] text-white/90">{p.name}</p>
                    <p className="mt-0.5 max-w-[160px] truncate text-xs text-white/55 lg:max-w-none">{p.domain}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={p.status} />
                </TableCell>
                <TableCell className="hidden text-white/75 lg:table-cell">{p.framework}</TableCell>
                <TableCell className="hidden text-white/65 xl:table-cell">
                  <span className="mr-1.5 font-mono text-xs text-white/55">{p.region.toUpperCase()}</span>
                  {CITY[p.region]}
                </TableCell>
                <TableCell align="right" className="hidden font-mono text-[13px] text-white/80 sm:table-cell">
                  <span className="inline-flex items-center gap-3">
                    {p.requests ? compact(p.requests) : "—"}
                    <span aria-hidden className="hidden h-1 w-14 overflow-hidden rounded-full bg-white/[0.06] lg:block">
                      <span
                        className="block h-full rounded-full bg-white/40"
                        style={{ width: `${Math.max(2, (p.requests / busiest) * 100)}%`, opacity: p.requests ? 1 : 0 }}
                      />
                    </span>
                  </span>
                </TableCell>
                <TableCell align="right" className="hidden whitespace-nowrap text-[13px] text-white/60 lg:table-cell">
                  {p.status === "building" ? "deploying…" : ago(p.deployedAgo)}
                </TableCell>
                <TableCell align="right" className="px-0 py-2">
                  <RowActions project={p} onAction={(action) => act(p, action)} />
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="py-16">
                  <EmptyState query={query} onClear={clear} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </section>

      <NewProjectDialog open={creating} onOpenChange={setCreating} taken={projects.map((p) => p.name)} onCreate={create} />
    </>
  );
}

function EmptyState({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
      <svg aria-hidden viewBox="0 0 120 48" className="h-12 w-[120px]">
        <path d="M10 12h70a12 12 0 0 1 0 24H40" fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="5" strokeLinecap="round" />
        <path d="M10 12h70a12 12 0 0 1 0 24H40" fill="none" stroke="rgb(255 255 255 / 0.05)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="40" cy="36" r="3" fill="rgb(var(--neon) / 0.35)" />
      </svg>
      <p className="mt-5 text-[15px] font-medium text-white/90">No projects down this road</p>
      <p className="mt-1.5 text-[13px] leading-5 text-white/60">
        {query.trim() ? `Nothing matches “${query.trim()}” with these filters.` : "Nothing matches these filters."} Try a shorter search or
        clear them.
      </p>
      <Button variant="ghost" size="sm" onClick={onClear} className="mt-5 border border-white/10">
        Clear filters
      </Button>
    </div>
  );
}
