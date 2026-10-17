"use client";

import * as React from "react";
import { ListFilter } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverClose, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const statuses = [
  { value: "ready", label: "Ready", count: 128 },
  { value: "building", label: "Building", count: 3 },
  { value: "error", label: "Error", count: 7 },
  { value: "canceled", label: "Canceled", count: 12 },
];

const environments = [
  { value: "production", label: "Production" },
  { value: "preview", label: "Preview" },
];

// Floated so the legend sits inside the fieldset's padding like any other block.
const legend = "float-left mb-2.5 w-full text-xs font-medium text-white/50";

const DEFAULTS = { status: ["ready", "building", "error"], env: ["production", "preview"] };

export default function PopoverFilters() {
  const [open, setOpen] = React.useState(false);
  const [applied, setApplied] = React.useState(DEFAULTS);
  const [draft, setDraft] = React.useState(DEFAULTS);
  const hidden = statuses.length - applied.status.length + environments.length - applied.env.length;

  function toggle(group: "status" | "env", value: string, checked: boolean) {
    setDraft((current) => ({
      ...current,
      [group]: checked ? [...current[group], value] : current[group].filter((item) => item !== value),
    }));
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        // Reopening starts from what's applied, not an abandoned draft.
        if (next) setDraft(applied);
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="ghost" className="border border-white/10">
          <ListFilter /> Filters
          {hidden > 0 && (
            <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-[rgb(var(--neon)/0.15)] px-1.5 text-[11px] tabular-nums text-[rgb(var(--neon))]">
              <span aria-hidden>{hidden}</span>
              <span className="sr-only">, {hidden} active</span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setApplied(draft);
            setOpen(false);
          }}
        >
          <fieldset className="px-4 pt-4">
            <legend className={legend}>Status</legend>
            <div className="clear-left grid gap-2.5">
              {statuses.map((status) => (
                <div key={status.value} className="flex items-center justify-between gap-3">
                  <Checkbox
                    size="sm"
                    label={status.label}
                    checked={draft.status.includes(status.value)}
                    onCheckedChange={(checked) => toggle("status", status.value, checked)}
                  />
                  <span className="font-mono text-[11px] tabular-nums text-white/35">{status.count}</span>
                </div>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-4 border-t border-white/[0.08] px-4 pt-4">
            <legend className={legend}>Environment</legend>
            <div className="clear-left grid gap-2.5">
              {environments.map((env) => (
                <Checkbox
                  key={env.value}
                  size="sm"
                  label={env.label}
                  checked={draft.env.includes(env.value)}
                  onCheckedChange={(checked) => toggle("env", env.value, checked)}
                />
              ))}
            </div>
          </fieldset>

          <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/[0.08] px-3 py-3">
            <Button type="button" size="sm" variant="ghost" onClick={() => setDraft(DEFAULTS)}>
              Reset
            </Button>
            <div className="flex gap-2">
              <PopoverClose asChild>
                <Button size="sm" variant="ghost">
                  Cancel
                </Button>
              </PopoverClose>
              <Button type="submit" size="sm" variant="solid">
                Apply
              </Button>
            </div>
          </div>
        </form>
      </PopoverContent>
    </Popover>
  );
}
