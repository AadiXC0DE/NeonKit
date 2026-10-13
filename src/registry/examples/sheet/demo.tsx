"use client";

import * as React from "react";
import { KeyRound, Plus, Trash2 } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type Variable = { id: number; key: string; value: string };

const initial: Variable[] = [
  { id: 1, key: "DATABASE_URL", value: "postgres://acme@db.acme.dev:5432/main" },
  { id: 2, key: "REDIS_URL", value: "rediss://cache.acme.dev:6380" },
  { id: 3, key: "STRIPE_SECRET_KEY", value: "sk_live_51Hx…3f9a" },
];

const environments = ["Production", "Preview", "Development"];

export default function SheetDemo() {
  const [open, setOpen] = React.useState(false);
  const [variables, setVariables] = React.useState(initial);
  const [targets, setTargets] = React.useState(["Production", "Preview"]);
  const nextId = React.useRef(initial.length + 1);

  function update(id: number, patch: Partial<Variable>) {
    setVariables((current) => current.map((variable) => (variable.id === id ? { ...variable, ...patch } : variable)));
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <KeyRound /> Environment variables
        </Button>
      </SheetTrigger>
      <SheetContent>
        <form
          className="flex min-h-full flex-col"
          onSubmit={(event) => {
            event.preventDefault();
            setOpen(false);
          }}
        >
          <SheetHeader>
            <SheetTitle>Environment variables</SheetTitle>
            <SheetDescription>
              Encrypted at rest for <span className="text-white/80">acme-web</span>. Changes apply to the next
              deployment.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 grid gap-2">
            <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_32px] gap-2 px-0.5 text-xs font-medium text-white/50">
              <span>Key</span>
              <span>Value</span>
            </div>
            {variables.map((variable, index) => (
              <div key={variable.id} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_32px] items-center gap-2">
                <Input
                  size="sm"
                  aria-label={`Key ${index + 1}`}
                  value={variable.key}
                  onChange={(event) => update(variable.id, { key: event.target.value.toUpperCase().replace(/\s/g, "_") })}
                  spellCheck={false}
                  className="font-mono"
                />
                <Input
                  size="sm"
                  aria-label={`Value ${index + 1}`}
                  value={variable.value}
                  onChange={(event) => update(variable.id, { value: event.target.value })}
                  spellCheck={false}
                  className="font-mono"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  aria-label={`Remove ${variable.key || "variable"}`}
                  onClick={() => setVariables((current) => current.filter((item) => item.id !== variable.id))}
                  className="size-8 rounded-md hover:text-[#ff4d5e]"
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="mt-1 w-fit"
              onClick={() => setVariables((current) => [...current, { id: nextId.current++, key: "", value: "" }])}
            >
              <Plus /> Add variable
            </Button>
          </div>

          <fieldset className="mt-6 border-t border-white/[0.08] pt-5">
            <legend className="float-left mb-3 w-full text-sm font-medium text-white/80">Apply to</legend>
            <div className="clear-left grid gap-2.5">
              {environments.map((environment) => (
                <Checkbox
                  key={environment}
                  size="sm"
                  label={environment}
                  checked={targets.includes(environment)}
                  onCheckedChange={(checked) =>
                    setTargets((current) =>
                      checked ? [...current, environment] : current.filter((item) => item !== environment),
                    )
                  }
                />
              ))}
            </div>
          </fieldset>

          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" variant="solid" disabled={targets.length === 0}>
              Save {variables.length} variable{variables.length === 1 ? "" : "s"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
