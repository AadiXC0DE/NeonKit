"use client";

import { useRouter } from "next/navigation";
import { BellOff, Copy, FolderGit2, PanelLeft, Plus, RotateCw, UserPlus } from "@/components/ui/icons";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { toast } from "@/components/ui/toast";
import { basePath } from "../config";
import { PROJECTS } from "../data";
import { NAV_ITEMS, StatusLamp } from "./nav-items";

export function CommandPalette({
  open,
  onOpenChange,
  onToggleSidebar,
  onReadAll,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleSidebar: () => void;
  onReadAll: () => void;
}) {
  const router = useRouter();

  const run = (action: () => void) => () => {
    onOpenChange(false);
    action();
  };
  const go = (url: string) => run(() => router.push(url));

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange} label="Command menu">
      <CommandInput placeholder="Jump to a page or project, or run an action…" />
      <CommandList>
        <CommandEmpty>Nothing matches. Try a project name like “storefront”.</CommandEmpty>
        <CommandGroup heading="Go to">
          {NAV_ITEMS.map(({ url, label, Icon, keys }) => (
            <CommandItem key={url} value={`go-${label}`} keywords={[label, "page"]} icon={<Icon />} shortcut={keys} onSelect={go(url)}>
              {label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem value="new-project" keywords={["create", "add", "import", "repository"]} icon={<Plus />} onSelect={go(`${basePath}/projects?new=1`)}>
            Create a project
          </CommandItem>
          <CommandItem
            value="redeploy-storefront"
            keywords={["deploy", "production", "rebuild"]}
            icon={<RotateCw />}
            onSelect={run(() =>
              toast.promise(new Promise((resolve) => window.setTimeout(resolve, 1600)), {
                loading: "Redeploying storefront to production…",
                success: "storefront redeployed in 1m 36s",
                error: "Redeploy failed",
              }),
            )}
          >
            Redeploy storefront to production
          </CommandItem>
          <CommandItem value="invite" keywords={["member", "teammate", "add user"]} icon={<UserPlus />} onSelect={go(`${basePath}/settings?tab=members`)}>
            Invite a teammate
          </CommandItem>
          <CommandItem
            value="copy-hook"
            keywords={["webhook", "deploy hook", "url"]}
            icon={<Copy />}
            onSelect={run(() => {
              void navigator.clipboard?.writeText("https://api.switchback.dev/hooks/deploy/mrl_7f3k2q9x").catch(() => {});
              toast.success("Deploy hook copied", { description: "POST to it from CI to ship main." });
            })}
          >
            Copy the deploy hook URL
          </CommandItem>
          <CommandItem value="toggle-sidebar" keywords={["collapse", "rail", "menu"]} icon={<PanelLeft />} shortcut="⌘B" onSelect={run(onToggleSidebar)}>
            Toggle the sidebar
          </CommandItem>
          <CommandItem value="read-all" keywords={["notifications", "clear", "inbox"]} icon={<BellOff />} onSelect={run(onReadAll)}>
            Mark all notifications read
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Projects">
          {PROJECTS.map((project) => (
            <CommandItem
              key={project.id}
              value={`project-${project.name}`}
              keywords={[project.name, project.domain, project.framework]}
              icon={<FolderGit2 />}
              onSelect={go(`${basePath}/projects?q=${project.name}`)}
            >
              <span className="flex min-w-0 items-center gap-2.5">
                <span className="truncate font-mono text-[13px]">{project.name}</span>
                <StatusLamp status={project.status} />
                <span className="hidden truncate text-xs text-white/55 sm:inline">{project.domain}</span>
              </span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
