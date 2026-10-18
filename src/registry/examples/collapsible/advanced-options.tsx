"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";

export default function CollapsibleAdvancedOptions() {
  const [saved, setSaved] = React.useState("");

  return (
    <form
      className="grid w-full max-w-sm gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        setSaved(`Building with “${data.get("command")}” into ${data.get("output")}/`);
      }}
    >
      <Input name="repository" label="Repository" defaultValue="acme/web" spellCheck={false} />

      {/* forceMount keeps the fields mounted while closed, so edits survive and still submit. */}
      <Collapsible>
        <CollapsibleTrigger>Build and output settings</CollapsibleTrigger>
        <CollapsibleContent forceMount>
          <div className="grid gap-3 pt-3">
            <Input
              name="command"
              size="sm"
              label="Build command"
              defaultValue="next build"
              spellCheck={false}
              className="font-mono"
            />
            <Input
              name="output"
              size="sm"
              label="Output directory"
              defaultValue=".next"
              description="Relative to the repository root."
              spellCheck={false}
              className="font-mono"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className="min-w-0 truncate text-xs text-white/50">
          {saved}
        </p>
        <Button type="submit" variant="solid" size="sm">
          Deploy
        </Button>
      </div>
    </form>
  );
}
