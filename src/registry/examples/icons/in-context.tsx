"use client";

import * as React from "react";
import {
  Bold,
  Copy,
  Download,
  GitBranch,
  Italic,
  Link,
  Plus,
  RotateCcw,
  Rocket,
  Search,
  Settings,
  Strikethrough,
  Trash2,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Command, CommandGroup, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function IconsInContext() {
  const [marks, setMarks] = React.useState<string[]>(["bold"]);
  const [last, setLast] = React.useState("Nothing run yet");

  return (
    <div className="@container w-full max-w-[42rem]">
      <div className="grid w-full items-start gap-8 @xl:grid-cols-[minmax(0,1fr)_18.5rem]">
        <div className="grid gap-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button>
              <Plus />
              New project
            </Button>
            <Button variant="outline">
              <Download />
              Export CSV
            </Button>
          </div>

          <Input
            aria-label="Search deployments"
            placeholder="Search deployments"
            leading={<Search />}
            trailing={<Kbd size="sm">/</Kbd>}
          />

          <div className="flex flex-wrap items-center gap-3">
            <ToggleGroup type="multiple" aria-label="Text style" value={marks} onValueChange={setMarks} size="sm">
              <ToggleGroupItem value="bold" aria-label="Bold">
                <Bold />
              </ToggleGroupItem>
              <ToggleGroupItem value="italic" aria-label="Italic">
                <Italic />
              </ToggleGroupItem>
              <ToggleGroupItem value="strike" aria-label="Strikethrough">
                <Strikethrough />
              </ToggleGroupItem>
              <ToggleGroupItem value="link" aria-label="Link">
                <Link />
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Copy link" onClick={() => setLast("Link copied")}>
                <Copy />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Project settings">
                <Settings />
              </Button>
            </div>
          </div>

          <p aria-live="polite" className="text-[13px] text-white/55">
            {last}
          </p>
        </div>

        <Command label="Deployment actions" className="w-full">
          <CommandList>
            <CommandGroup heading="dpl_8kq2 on main">
              <CommandItem icon={<Rocket />} shortcut="⌘P" onSelect={() => setLast("Promoted dpl_8kq2 to production")}>
                Promote to production
              </CommandItem>
              <CommandItem icon={<GitBranch />} onSelect={() => setLast("Opened a preview from main")}>
                Preview from branch
              </CommandItem>
              <CommandItem icon={<RotateCcw />} onSelect={() => setLast("Rolled back to dpl_7wd1")}>
                Roll back
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandItem
              icon={<Trash2 />}
              shortcut="⌫"
              onSelect={() => setLast("dpl_8kq2 deleted")}
              className="text-[rgb(251_113_133)]"
            >
              Delete deployment
            </CommandItem>
          </CommandList>
        </Command>
      </div>
    </div>
  );
}
