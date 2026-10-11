"use client";

import * as React from "react";
import { Check, Copy, Link2, Share2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";

const LINK = "https://acme.dev/d/q4-launch-plan";

const people = [
  { name: "Ana Lima", email: "ana@acme.dev", access: "Owner" },
  { name: "Kenji Watanabe", email: "kenji@acme.dev", access: "Can edit" },
  { name: "Priya Raman", email: "priya@acme.dev", access: "Can comment" },
];

export default function PopoverDemo() {
  const [copied, setCopied] = React.useState(false);
  const [linkAccess, setLinkAccess] = React.useState(true);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(LINK);
    } catch {
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button>
          <Share2 /> Share
        </Button>
      </PopoverTrigger>
      <PopoverContent arrow className="w-[340px] p-0">
        <div className="px-4 pb-3 pt-4">
          <p className="text-sm font-medium text-white/90">Share “Q4 launch plan”</p>
          <p className="mt-0.5 text-xs leading-5 text-white/50">
            {linkAccess ? "Anyone at Acme with the link can view." : "Only people below can open it."}
          </p>
        </div>

        <div className="px-4">
          <Input
            readOnly
            aria-label="Share link"
            value={LINK}
            onFocus={(event) => event.currentTarget.select()}
            leading={<Link2 />}
            disabled={!linkAccess}
            className="font-mono text-xs"
            trailing={
              <Button
                size="sm"
                variant="soft"
                onClick={copy}
                disabled={!linkAccess}
                className="-mr-[9px] w-[84px]"
              >
                {copied ? <Check /> : <Copy />}
                {copied ? "Copied" : "Copy"}
              </Button>
            }
          />
        </div>

        <ul className="mt-3 grid gap-0.5 px-2">
          {people.map((person) => (
            <li key={person.email} className="flex items-center gap-3 rounded-lg px-2 py-1.5">
              <Avatar size="sm" alt={person.name} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-white/85">{person.name}</p>
                <p className="truncate text-xs text-white/40">{person.email}</p>
              </div>
              <span className="shrink-0 text-xs text-white/45">{person.access}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2 flex items-center justify-between gap-4 border-t border-white/[0.08] px-4 py-3">
          <span id="link-access" className="text-[13px] text-white/70">
            Link sharing
          </span>
          <Switch
            size="sm"
            aria-labelledby="link-access"
            checked={linkAccess}
            onCheckedChange={setLinkAccess}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
