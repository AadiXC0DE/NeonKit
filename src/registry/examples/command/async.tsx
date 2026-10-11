"use client";

import * as React from "react";
import { Package } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
} from "@/components/ui/command";

const registry = [
  "motion",
  "motion-dom",
  "@floating-ui/react-dom",
  "@floating-ui/dom",
  "lucide-react",
  "tailwind-merge",
  "clsx",
  "zod",
  "react-hook-form",
  "@tanstack/react-query",
  "@tanstack/react-table",
  "date-fns",
  "nanoid",
  "shiki",
];

// Stands in for a registry search endpoint.
function searchPackages(query: string) {
  return new Promise<string[]>((resolve) => {
    const q = query.trim().toLowerCase();
    setTimeout(() => resolve(registry.filter((name) => name.includes(q)).slice(0, 6)), 450);
  });
}

export default function CommandAsync() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [added, setAdded] = React.useState<string[]>([]);
  const latest = React.useRef(0);

  function search(next: string) {
    setQuery(next);
    if (!next.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    const request = ++latest.current;
    setLoading(true);
    searchPackages(next).then((found) => {
      // Ignore answers to searches the user has already typed past.
      if (request !== latest.current) return;
      setResults(found);
      setLoading(false);
    });
  }

  return (
    <div className="grid w-full max-w-md gap-2">
      <Command label="Packages" shouldFilter={false}>
        <CommandInput value={query} onValueChange={search} placeholder="Add a dependency…" />
        <CommandList className="min-h-[148px]">
          {loading && <CommandLoading>Searching the registry…</CommandLoading>}
          <CommandEmpty>
            {query.trim() ? `No packages named “${query.trim()}”.` : "Search npm for a package to add."}
          </CommandEmpty>
          {results.length > 0 && (
            <CommandGroup heading="npm">
              {results.map((name) => (
                <CommandItem
                  key={name}
                  icon={<Package />}
                  onSelect={(value) => setAdded((current) => (current.includes(value) ? current : [...current, value]))}
                >
                  {name}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
      <p className="truncate px-1 font-mono text-[11px] text-white/40">
        {added.length ? `npm i ${added.join(" ")}` : "Nothing added yet."}
      </p>
    </div>
  );
}
