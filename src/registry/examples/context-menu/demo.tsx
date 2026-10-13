"use client";

import * as React from "react";
import {
  CopyPlus,
  FileCode2,
  FileImage,
  FileText,
  Link,
  Mail,
  PencilLine,
  Share2,
  SquareArrowOutUpRight,
  Star,
  Trash2,
  type LucideIcon,
} from "@/components/ui/icons";
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

type FileEntry = { id: string; name: string; meta: string; icon: LucideIcon };

const library: FileEntry[] = [
  { id: "brief", name: "launch-brief.md", meta: "Edited 2h ago", icon: FileText },
  { id: "hero", name: "hero-v4.png", meta: "2.4 MB", icon: FileImage },
  { id: "worker", name: "edge-worker.ts", meta: "Edited yesterday", icon: FileCode2 },
  { id: "roadmap", name: "roadmap-q4.md", meta: "Edited Oct 2", icon: FileText },
  { id: "og", name: "og-image.png", meta: "312 KB", icon: FileImage },
  { id: "schema", name: "schema.sql", meta: "Edited Sep 28", icon: FileCode2 },
];

function copyName(name: string) {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? `${name.slice(0, dot)} copy${name.slice(dot)}` : `${name} copy`;
}

export default function ContextMenuDemo() {
  const [files, setFiles] = React.useState(library);
  const [starred, setStarred] = React.useState<string[]>(["roadmap"]);
  const [openId, setOpenId] = React.useState<string | null>(null);
  const [copies, setCopies] = React.useState(0);
  const trashed = library.filter((file) => !files.some((entry) => entry.id === file.id)).length;

  function duplicate(file: FileEntry) {
    const copy = { ...file, id: `${file.id}-copy-${copies + 1}`, name: copyName(file.name), meta: "Just now" };
    setCopies(copies + 1);
    setFiles((current) => {
      const index = current.findIndex((entry) => entry.id === file.id);
      return [...current.slice(0, index + 1), copy, ...current.slice(index + 1)];
    });
  }

  return (
    <div className="w-full max-w-md">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {files.map((file) => {
          const isStarred = starred.includes(file.id);
          const Icon = file.icon;
          return (
            <li key={file.id}>
              <ContextMenu onOpenChange={(open) => setOpenId(open ? file.id : null)}>
                <ContextMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full select-none flex-col gap-3 rounded-xl border p-3 text-left outline-none",
                      "transition-[border-color,background-color,box-shadow] duration-150 ease-out",
                      "focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]",
                      openId === file.id
                        ? "border-[rgb(var(--neon)/0.45)] bg-[rgb(var(--neon)/0.05)] shadow-[0_0_20px_-8px_rgb(var(--neon)/0.6)]"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20",
                    )}
                  >
                    <span className="flex items-center justify-between">
                      <Icon aria-hidden className="size-5 text-white/50" />
                      {isStarred && (
                        <Star aria-label="Starred" className="size-3.5 fill-current text-[rgb(var(--neon))]" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm text-white/85">{file.name}</span>
                      <span className="block truncate text-xs leading-5 text-white/40">{file.meta}</span>
                    </span>
                  </button>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-56" aria-label={`Actions for ${file.name}`}>
                  <ContextMenuItem icon={<SquareArrowOutUpRight />} shortcut="⌘O">
                    Open
                  </ContextMenuItem>
                  <ContextMenuItem icon={<PencilLine />} shortcut="F2">
                    Rename
                  </ContextMenuItem>
                  <ContextMenuItem icon={<CopyPlus />} shortcut="⌘D" onSelect={() => duplicate(file)}>
                    Duplicate
                  </ContextMenuItem>
                  <ContextMenuSub>
                    <ContextMenuSubTrigger icon={<Share2 />}>Share</ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-48">
                      <ContextMenuItem icon={<Link />} shortcut="⌘L">
                        Copy link
                      </ContextMenuItem>
                      <ContextMenuItem icon={<Mail />}>Email…</ContextMenuItem>
                    </ContextMenuSubContent>
                  </ContextMenuSub>
                  <ContextMenuSeparator />
                  <ContextMenuCheckboxItem
                    checked={isStarred}
                    onCheckedChange={(checked) =>
                      setStarred((current) =>
                        checked ? [...current, file.id] : current.filter((id) => id !== file.id),
                      )
                    }
                  >
                    Starred
                  </ContextMenuCheckboxItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem
                    variant="danger"
                    icon={<Trash2 />}
                    shortcut="⌘⌫"
                    onSelect={() => setFiles((current) => current.filter((entry) => entry.id !== file.id))}
                  >
                    Move to trash
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 flex h-5 items-center justify-between text-xs text-white/40">
        <span>Right-click a file, or long-press on touch.</span>
        {trashed > 0 && (
          <button
            type="button"
            onClick={() => setFiles(library)}
            className="rounded-md text-[rgb(var(--neon))] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)]"
          >
            Restore {trashed} from trash
          </button>
        )}
      </div>
    </div>
  );
}
