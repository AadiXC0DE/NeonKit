"use client";

import { useRouter } from "next/navigation";
import { Command as CommandIcon, LogOut, Settings, UsersRound } from "@/components/ui/icons";
import { Avatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/toast";
import { basePath, viewer } from "../config";

export function AccountMenu({ onOpenPalette }: { onOpenPalette: () => void }) {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu for ${viewer.name}`}
          className="ml-1 shrink-0 cursor-pointer rounded-full outline-none transition-transform duration-150 active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[rgb(var(--neon)/0.6)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05060a]"
        >
          <Avatar alt="" fallback="RC" size="sm" status="online" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <span className="block text-sm font-medium text-white/90">{viewer.name}</span>
          <span className="block text-xs font-normal text-white/60">{viewer.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem icon={<Settings />} onSelect={() => router.push(`${basePath}/settings`)}>
          Team settings
        </DropdownMenuItem>
        <DropdownMenuItem icon={<UsersRound />} onSelect={() => router.push(`${basePath}/settings?tab=members`)}>
          Members
        </DropdownMenuItem>
        <DropdownMenuItem icon={<CommandIcon />} shortcut="⌘K" onSelect={onOpenPalette}>
          Command menu
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          icon={<LogOut />}
          variant="danger"
          onSelect={() => toast("Signed out", { description: "Not really. This is a preview, so you're still in." })}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
