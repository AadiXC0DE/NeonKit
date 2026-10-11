"use client";

import * as React from "react";
import { Copy, Ellipsis, FolderInput, GitBranch, Pin, Plus, RotateCw, SquareArrowOutUpRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const teams = {
  northlight: "Northlight",
  acme: "Acme Labs",
  personal: "Personal",
};

export default function DropdownMenuDemo() {
  const [team, setTeam] = React.useState<keyof typeof teams>("northlight");
  const [pinned, setPinned] = React.useState(true);
  const [alerts, setAlerts] = React.useState(false);
  const [building, setBuilding] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((id) => window.clearTimeout(id));
  }, []);

  function later(callback: () => void, ms: number) {
    timers.current.push(window.setTimeout(callback, ms));
  }

  function redeploy() {
    setBuilding(true);
    later(() => setBuilding(false), 2400);
  }

  function copyUrl() {
    navigator.clipboard?.writeText("https://northlight.dev").catch(() => {});
    setCopied(true);
    later(() => setCopied(false), 1600);
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-[#0a0b11] text-xs font-semibold tracking-wide text-white/70">
          NW
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-medium text-white/90">
            <span className="text-white/40">{teams[team]} /</span> northlight-web
            {pinned && <Pin aria-label="Pinned" className="size-3 shrink-0 text-white/40" />}
          </p>
          <p className="truncate text-xs leading-5 text-white/45">{copied ? "Copied to clipboard" : "northlight.dev"}</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Project actions" className="-mr-1 -mt-1 size-8">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuGroup>
              <DropdownMenuItem icon={<SquareArrowOutUpRight />} shortcut="⌘O">
                Visit site
              </DropdownMenuItem>
              <DropdownMenuItem icon={<Copy />} shortcut="⌘C" onSelect={copyUrl}>
                Copy URL
              </DropdownMenuItem>
              <DropdownMenuItem icon={<RotateCw />} shortcut="⇧⌘R" disabled={building} onSelect={redeploy}>
                Redeploy
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger icon={<FolderInput />}>Move to team</DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-52">
                <DropdownMenuRadioGroup value={team} onValueChange={(value) => setTeam(value as keyof typeof teams)}>
                  <DropdownMenuLabel inset>Teams</DropdownMenuLabel>
                  {Object.entries(teams).map(([value, name]) => (
                    <DropdownMenuRadioItem key={value} value={value}>
                      {name}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem icon={<Plus />}>New team…</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={pinned}
              onCheckedChange={setPinned}
              onSelect={(event) => event.preventDefault()}
            >
              Pin to sidebar
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={alerts}
              onCheckedChange={setAlerts}
              onSelect={(event) => event.preventDefault()}
            >
              Email on failed deploys
            </DropdownMenuCheckboxItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem variant="danger" icon={<Trash2 />} shortcut="⌘⌫">
              Delete project
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-white/[0.06] pt-3 text-xs text-white/45">
        <span
          aria-hidden
          className={
            building
              ? "size-1.5 animate-pulse rounded-full bg-[rgb(251_191_36)] shadow-[0_0_8px_rgb(251_191_36/0.7)]"
              : "size-1.5 rounded-full bg-[rgb(52_211_153)] shadow-[0_0_8px_rgb(52_211_153/0.6)]"
          }
        />
        <span aria-live="polite" className="text-white/70">
          {building ? "Building" : "Ready"}
        </span>
        <span aria-hidden className="text-white/20">
          ·
        </span>
        <GitBranch aria-hidden className="size-3.5" />
        <span>main</span>
        <span className="ml-auto">{building ? "just now" : "12m ago"}</span>
      </div>
    </div>
  );
}
