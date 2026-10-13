"use client";

import * as React from "react";
import { Search } from "@/components/ui/icons";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";

const ISSUES = 1284;

export default function InputGroupSearch() {
  const [query, setQuery] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  React.useEffect(() => {
    if (!query) return;
    const timer = window.setTimeout(() => setBusy(false), 450);
    return () => window.clearTimeout(timer);
  }, [query]);

  const results = query ? Math.max(0, 37 - query.length * 6) : ISSUES;

  return (
    <div className="min-w-0 w-full max-w-md">
      <InputGroup>
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          ref={inputRef}
          type="search"
          aria-label="Search issues"
          placeholder="Search issues"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setBusy(Boolean(event.target.value));
          }}
        />
        <InputGroupAddon align="inline-end">
          {busy ? (
            <Spinner size="sm" label="Searching" />
          ) : query ? (
            <InputGroupText className="tabular-nums">{results} results</InputGroupText>
          ) : (
            <Kbd size="sm" listen="k">⌘K</Kbd>
          )}
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
