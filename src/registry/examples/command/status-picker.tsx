"use client";

import * as React from "react";
import { Circle, CircleCheck, CircleDashed, CircleDot, CircleDotDashed, CircleX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const statuses = [
  { value: "Backlog", icon: CircleDashed },
  { value: "Todo", icon: Circle },
  { value: "In progress", icon: CircleDotDashed },
  { value: "In review", icon: CircleDot },
  { value: "Done", icon: CircleCheck },
  { value: "Canceled", icon: CircleX },
];

export default function CommandStatusPicker() {
  const [open, setOpen] = React.useState(false);
  const [status, setStatus] = React.useState("In progress");
  const current = statuses.find((item) => item.value === status)!;

  function choose(value: string) {
    setStatus(value);
    setOpen(false);
  }

  return (
    <div className="flex w-full max-w-md items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] py-2 pl-4 pr-2">
      <span className="shrink-0 font-mono text-xs text-white/40">ACME-142</span>
      <span className="min-w-0 flex-1 truncate text-sm text-white/85">Popover loses focus inside a sheet</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" variant="ghost" aria-label={`Status: ${status}`} className="shrink-0">
            <current.icon />
            <span className="hidden sm:inline">{status}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-56 p-0">
          <Command
            label="Change status"
            className="rounded-[11px] border-0 bg-transparent shadow-none"
            onKeyDown={(event) => {
              // Number keys pick a status, as long as nothing has been typed.
              const index = Number(event.key) - 1;
              const input = event.target as HTMLInputElement;
              if (input.value || !statuses[index] || event.metaKey || event.ctrlKey) return;
              event.preventDefault();
              choose(statuses[index].value);
            }}
          >
            <CommandInput placeholder="Change status…" />
            <CommandList>
              <CommandEmpty>No status like that.</CommandEmpty>
              {statuses.map((item, index) => (
                <CommandItem
                  key={item.value}
                  icon={<item.icon />}
                  shortcut={String(index + 1)}
                  aria-current={item.value === status || undefined}
                  onSelect={choose}
                  className={item.value === status ? "text-[rgb(var(--neon))]" : undefined}
                >
                  {item.value}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
