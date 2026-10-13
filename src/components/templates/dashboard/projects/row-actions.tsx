"use client";

import { Copy, Ellipsis, ExternalLink, Pause, Play, RotateCw, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Project } from "../data";

export type RowAction = "visit" | "copy" | "redeploy" | "pause" | "resume" | "delete";

export function RowActions({ project, onAction }: { project: Project; onAction: (action: RowAction) => void }) {
  const paused = project.status === "paused";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Actions for ${project.name}`}
          className="inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-white/60 outline-none transition-colors duration-150 hover:bg-white/[0.06] hover:text-white focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] data-[state=open]:bg-white/[0.06] data-[state=open]:text-white"
        >
          <Ellipsis aria-hidden className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-mono text-xs">{project.name}</DropdownMenuLabel>
        <DropdownMenuItem icon={<ExternalLink />} onSelect={() => onAction("visit")} disabled={paused}>
          Visit {project.domain.length > 18 ? "site" : project.domain}
        </DropdownMenuItem>
        <DropdownMenuItem icon={<Copy />} onSelect={() => onAction("copy")}>
          Copy domain
        </DropdownMenuItem>
        <DropdownMenuItem icon={<RotateCw />} onSelect={() => onAction("redeploy")} disabled={paused || project.status === "building"}>
          Redeploy
        </DropdownMenuItem>
        {paused ? (
          <DropdownMenuItem icon={<Play />} onSelect={() => onAction("resume")}>
            Resume deploys
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem icon={<Pause />} onSelect={() => onAction("pause")}>
            Pause deploys
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Trash2 />} variant="danger" onSelect={() => onAction("delete")}>
          Delete project
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
